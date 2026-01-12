import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Helper to get next ticket number
async function getNextTicketNumber(restaurantId: string) {
    const { rows } = await sql`
        SELECT MAX(ticket_number) as max_ticket 
        FROM orders 
        WHERE restaurant_id = ${restaurantId}
    `;
    return (rows[0].max_ticket || 0) + 1;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const restaurantId = searchParams.get('restaurantId');
        const clearHistory = searchParams.get('clearHistory');

        if (!restaurantId) {
            return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 });
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
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            total: order.total,
            paymentMethod: order.paymentMethod,
            changeFor: order.changeFor,
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

        if (!restaurantId || !customerName || !items) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const ticketNumber = await getNextTicketNumber(restaurantId);

        const { rows } = await sql`
            INSERT INTO orders (
                restaurant_id, ticket_number, customer_name, customer_phone, 
                customer_address, customer_zip_code, items, subtotal, 
                delivery_fee, total, payment_method, change_for, observations, 
                status
            ) VALUES (
                ${restaurantId}, ${ticketNumber}, ${customerName}, ${customerPhone},
                ${customerAddress}, ${customerZipCode}, ${JSON.stringify(items)}, 
                ${subtotal}, ${deliveryFee}, ${total}, ${paymentMethod}, 
                ${changeFor}, ${observations}, 'pending'
            ) RETURNING 
                id, restaurant_id as "restaurantId", ticket_number as "ticketNumber",
                customer_name as "customerName", customer_phone as "customerPhone",
                customer_address as "customerAddress", customer_zip_code as "customerZipCode",
                items, subtotal, delivery_fee as "deliveryFee", total,
                payment_method as "paymentMethod", change_for as "changeFor",
                observations, status, created_at as "createdAt"
        `;

        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
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

        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
