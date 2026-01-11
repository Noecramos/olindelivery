import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const restaurantId = searchParams.get('restaurantId');

        if (!restaurantId) {
            return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 });
        }

        const { rows } = await sql`
            SELECT 
                id, restaurant_id as "restaurantId", name, price, category, 
                image, description, created_at as "createdAt"
            FROM products 
            WHERE restaurant_id = ${restaurantId} 
            ORDER BY category, name
        `;

        return NextResponse.json(rows);

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { restaurantId, name, price, category, image, description } = body;

        if (!restaurantId || !name || !price) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { rows } = await sql`
            INSERT INTO products (restaurant_id, name, price, category, image, description)
            VALUES (${restaurantId}, ${name}, ${price}, ${category}, ${image}, ${description})
            RETURNING id, restaurant_id as "restaurantId", name, price, category, image, description
        `;

        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, name, price, category, image, description } = body;

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        const { rows } = await sql`
            UPDATE products 
            SET name = ${name}, price = ${price}, category = ${category}, 
                image = ${image}, description = ${description}, updated_at = NOW()
            WHERE id = ${id}
            RETURNING id, restaurant_id as "restaurantId", name, price, category, image, description
        `;

        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await sql`DELETE FROM products WHERE id = ${id}`;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
