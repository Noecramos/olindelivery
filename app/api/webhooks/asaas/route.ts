
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Types for Asaas Webhook
type Asaasevent =
    | "PAYMENT_CREATED"
    | "PAYMENT_RECEIVED"
    | "PAYMENT_CONFIRMED"
    | "PAYMENT_OVERDUE"
    | "PAYMENT_REFUNDED"
    | "SUBSCRIPTION_CREATED"
    | "SUBSCRIPTION_UPDATED"
    | "SUBSCRIPTION_DELETED";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const event: Asaasevent = body.event;
        const payment = body.payment;

        console.log(`Received Asaas Webhook: ${event}`, payment.id);

        // Verify token if needed
        const token = req.headers.get("asaas-access-token");
        // Using environment variable for secret, falling back to none for dev
        if (process.env.ASAAS_WEBHOOK_SECRET && token !== process.env.ASAAS_WEBHOOK_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
            // payment.subscription is the subscription ID
            const subscriptionId = payment.subscription;

            if (subscriptionId) {
                // Update restaurant status
                // We default to 30 days extension for now (assuming monthly)
                await sql`
                  UPDATE restaurants 
                  SET 
                    subscription_status = 'active',
                    subscription_expires_at = NOW() + INTERVAL '1 month' 
                  WHERE asaas_subscription_id = ${subscriptionId}
                `;

                // Log payment to payments table
                // We need to find the restaurant_id first to insert into payments
                const { rows: restaurants } = await sql`SELECT id FROM restaurants WHERE asaas_subscription_id = ${subscriptionId}`;

                if (restaurants.length > 0) {
                    const restaurantId = restaurants[0].id;

                    await sql`
                        INSERT INTO payments (
                          restaurant_id, 
                          asaas_payment_id, 
                          amount, 
                          status, 
                          payment_method,
                          created_at
                        )
                        VALUES (${restaurantId}, ${payment.id}, ${payment.value}, ${event}, ${payment.billingType}, NOW())
                    `;
                }
            }
        }

        if (event === "PAYMENT_OVERDUE") {
            const subscriptionId = payment.subscription;
            if (subscriptionId) {
                await sql`
                  UPDATE restaurants 
                  SET subscription_status = 'overdue'
                  WHERE asaas_subscription_id = ${subscriptionId}
                `;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Webhook Failed" }, { status: 500 });
    }
}
