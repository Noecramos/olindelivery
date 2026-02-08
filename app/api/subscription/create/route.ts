
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { asaas } from "@/lib/asaas";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { restaurantId, planId, billingType } = body;

        if (!restaurantId || !planId) {
            return NextResponse.json({ error: "Missing restaurantId or planId" }, { status: 400 });
        }

        // 1. Get Restaurant Details
        const { rows: restaurants } = await sql`
      SELECT * FROM restaurants WHERE id = ${restaurantId} LIMIT 1
    `;

        if (restaurants.length === 0) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
        }
        const restaurant = restaurants[0];

        // 2. Get Plan Details
        const { rows: plans } = await sql`
      SELECT * FROM saas_plans WHERE id = ${planId} LIMIT 1
    `;

        if (plans.length === 0) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }
        const plan = plans[0];

        // 3. Ensure Asaas Customer Exists
        let customerId = restaurant.asaas_customer_id;

        if (!customerId) {
            console.log("Creating new Asaas customer for", restaurant.name);

            // Use CPF/CNPJ if available, otherwise try to extract from Pix Key or fallback
            // Note: Asaas requires valid CPF/CNPJ in production. 
            // In Sandbox, it accepts anything formatted like one.
            let cpfCnpj = restaurant.cpf_cnpj || restaurant.cpf;

            // Try to use Pix Key if it looks like CPF/CNPJ (digits only, 11 or 14 chars)
            if (!cpfCnpj && restaurant.pix_key && /^\d+$/.test(restaurant.pix_key) && (restaurant.pix_key.length === 11 || restaurant.pix_key.length === 14)) {
                cpfCnpj = restaurant.pix_key;
            }

            if (!cpfCnpj) {
                // If really missing, create a placeholder for testing (will fail in prod strict validation)
                cpfCnpj = "00000000000";
            }

            const customerData = {
                name: restaurant.name,
                email: restaurant.email || `contact@${restaurant.slug}.com`,
                cpfCnpj: cpfCnpj,
                mobilePhone: restaurant.whatsapp || restaurant.phone,
                externalReference: restaurant.id,
                notificationDisabled: false,
            };

            try {
                const newCustomer = await asaas.createCustomer(customerData);
                customerId = newCustomer.id;

                // Save to DB
                await sql`
          UPDATE restaurants 
          SET asaas_customer_id = ${customerId}
          WHERE id = ${restaurantId}
        `;
            } catch (err: any) {
                console.error("Failed to create Asaas customer:", err);
                return NextResponse.json({ error: "Failed to create customer in payment provider", details: err.message }, { status: 500 });
            }
        }

        // 4. Create Subscription
        // Calculate price from Global Settings
        const { rows: settings } = await sql`SELECT value FROM global_settings WHERE key = 'saasMonthlyPrice'`;
        const basePrice = settings.length > 0 ? parseFloat(settings[0].value) : 49.90;

        const price = isNaN(basePrice) ? 49.90 : basePrice;

        // Determine cycle based on plan duration
        let cycle: "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY" = "MONTHLY";
        if (plan.duration_months === 3) cycle = "QUARTERLY";
        if (plan.duration_months === 6) cycle = "SEMIANNUALLY";
        if (plan.duration_months === 12) cycle = "YEARLY";

        // Calculate value based on Asaas rules: value per charge cycle
        const value = price * plan.duration_months * (1 - (plan.discount_percent / 100));

        const subscriptionData = {
            customer: customerId,
            billingType: billingType || "BOLETO", // Default to Boleto or PIX
            value: value,
            nextDueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
            cycle: cycle,
            description: `Assinatura Plano ${plan.name} - ${restaurant.name}`,
        };

        console.log("Creating subscription:", subscriptionData);

        const subscription = await asaas.createSubscription(subscriptionData);

        // 5. Update Restaurant with Subscription ID
        await sql`
      UPDATE restaurants 
      SET 
        asaas_subscription_id = ${subscription.id},
        subscription_status = 'pending'
      WHERE id = ${restaurantId}
    `;

        // Fetch the first payment helper to get the payment link immediately
        const firstPayment = await asaas.getFirstPayment(subscription.id);
        let pixData = null;

        if (firstPayment) {
            // If request was for PIX, try to generate QR Code
            if (billingType === 'PIX') {
                try {
                    const pixInfo = await asaas.getPixQrCode(firstPayment.id);
                    console.log('Pix Info Retrieved:', pixInfo);

                    if (pixInfo && pixInfo.encodedImage && pixInfo.payload) {
                        pixData = {
                            encodedImage: pixInfo.encodedImage,
                            payload: pixInfo.payload,
                            expirationDate: pixInfo.expirationDate
                        };
                    } else {
                        console.error("Invalid Pix Info received:", pixInfo);
                    }
                } catch (e) {
                    console.error("Failed to get Pix QR Code", e);
                }
            }

            return NextResponse.json({
                success: true,
                subscriptionId: subscription.id,
                invoiceUrl: firstPayment.invoiceUrl || firstPayment.bankSlipUrl || null,
                paymentId: firstPayment.id,
                pix: pixData
            });
        }

        return NextResponse.json({
            success: true,
            subscriptionId: subscription.id,
            message: "Subscription created but no payment/charge generated yet."
        });

    } catch (error: any) {
        console.error("Subscription creation failed:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
