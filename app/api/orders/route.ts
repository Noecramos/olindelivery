import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Helper to check if a string is a valid UUID
const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

// Helper to get next ticket number
async function getNextTicketNumber(restaurantId: string) {
    if (!isValidUUID(restaurantId)) return 1;
    try {
        const { rows } = await sql`
            SELECT MAX(ticket_number) as max_ticket 
            FROM orders 
            WHERE restaurant_id = ${restaurantId}
        `;
        return (rows[0]?.max_ticket || 0) + 1;
    } catch (e) {
        return 1;
    }
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const restaurantId = searchParams.get('restaurantId');
        const clearHistory = searchParams.get('clearHistory');

        if (!restaurantId || !isValidUUID(restaurantId)) {
            return NextResponse.json({ error: "Restaurant ID required and must be a valid UUID" }, { status: 400 });
        }

        if (clearHistory === 'true') {
            await sql`
                DELETE FROM orders 
                WHERE restaurant_id = ${restaurantId} 
                AND status IN ('delivered', 'cancelled', 'sent')
            `;
            return NextResponse.json({ success: true });
        }

        const { rows } = await sql`
            SELECT 
                id, restaurant_id as "restaurantId", ticket_number as "ticketNumber",
                customer_name as "customerName", customer_phone as "customerPhone", 
                customer_address as "customerAddress", customer_zip_code as "customerZipCode",
                items, subtotal, delivery_fee as "deliveryFee", total, 
                payment_method as "paymentMethod", change_for as "changeFor", observations,
                status, created_at as "createdAt"
            FROM orders 
            WHERE restaurant_id = ${restaurantId} 
            ORDER BY created_at DESC 
            LIMIT 100
        `;

        // Transform to nested structure expected by frontend
        const orders = rows.map(order => ({
            id: order.id,
            restaurantId: order.restaurantId,
            ticketNumber: order.ticketNumber,
            customer: {
                name: order.customerName,
                phone: order.customerPhone,
                address: order.customerAddress,
                zipCode: order.customerZipCode
            },
            items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
            subtotal: Number(order.subtotal),
            deliveryFee: Number(order.deliveryFee),
            total: Number(order.total),
            paymentMethod: order.paymentMethod,
            changeFor: order.changeFor ? Number(order.changeFor) : null,
            observations: order.observations,
            status: order.status,
            createdAt: order.createdAt
        }));

        return NextResponse.json(orders);

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            restaurantId, customerName, customerPhone, customerAddress, customerZipCode,
            items, subtotal, deliveryFee, total, paymentMethod, changeFor, observations
        } = body;

        // Validations
        if (!restaurantId || !isValidUUID(restaurantId)) {
            return NextResponse.json({ error: "ID do restaurante inválido ou ausente." }, { status: 400 });
        }
        if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Dados do pedido incompletos." }, { status: 400 });
        }

        const ticketNumber = await getNextTicketNumber(restaurantId);

        // Ensure numbers are numbers
        const nSubtotal = parseFloat(subtotal) || 0;
        const nDeliveryFee = parseFloat(deliveryFee) || 0;
        const nTotal = parseFloat(total) || 0;
        const nChangeFor = changeFor ? parseFloat(changeFor) : null;

        const { rows } = await sql`
            INSERT INTO orders (
                restaurant_id, ticket_number, customer_name, customer_phone, 
                customer_address, customer_zip_code, items, subtotal, 
                delivery_fee, total, payment_method, change_for, observations, 
                status
            ) VALUES (
                ${restaurantId}, ${ticketNumber}, ${customerName}, ${customerPhone},
                ${customerAddress}, ${customerZipCode}, ${JSON.stringify(items)}, 
                ${nSubtotal}, ${nDeliveryFee}, ${nTotal}, ${paymentMethod}, 
                ${nChangeFor}, ${observations}, 'pending'
            ) RETURNING 
                id, restaurant_id as "restaurantId", ticket_number as "ticketNumber",
                customer_name as "customerName", customer_phone as "customerPhone",
                customer_address as "customerAddress", customer_zip_code as "customerZipCode",
                items, subtotal, delivery_fee as "deliveryFee", total,
                payment_method as "paymentMethod", change_for as "changeFor",
                observations, status, created_at as "createdAt"
        `;

        const order = rows[0];
        // Mirror the structure expected by frontend (nested customer)
        return NextResponse.json({
            ...order,
            customer: {
                name: order.customerName,
                phone: order.customerPhone,
                address: order.customerAddress,
                zipCode: order.customerZipCode
            },
            items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
            subtotal: Number(order.subtotal),
            deliveryFee: Number(order.deliveryFee),
            total: Number(order.total),
            changeFor: order.changeFor ? Number(order.changeFor) : null
        });

    } catch (error: any) {
        console.error("Database Error:", error);
        return NextResponse.json({
            error: "Falha ao criar pedido no banco de dados.",
            details: error.message
        }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "ID and status required" }, { status: 400 });
        }

        const { rows } = await sql`
            UPDATE orders 
            SET status = ${status}, updated_at = NOW() 
            WHERE id = ${id} 
            RETURNING id, status, updated_at as "updatedAt"
        `;

        if (rows.length === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
