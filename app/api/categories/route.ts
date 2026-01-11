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
            SELECT id, restaurant_id as "restaurantId", name, created_at as "createdAt"
            FROM categories 
            WHERE restaurant_id = ${restaurantId} 
            ORDER BY name
        `;

        return NextResponse.json(rows);

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { restaurantId, name } = body;

        if (!restaurantId || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check duplicates
        const { rows: existing } = await sql`
            SELECT id FROM categories 
            WHERE restaurant_id = ${restaurantId} AND name = ${name}
        `;

        if (existing.length > 0) {
            return NextResponse.json({ error: "Category already exists" }, { status: 400 });
        }

        const { rows } = await sql`
            INSERT INTO categories (restaurant_id, name)
            VALUES (${restaurantId}, ${name})
            RETURNING id, restaurant_id as "restaurantId", name
        `;

        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const { id, restaurantId, name } = Object.fromEntries(searchParams);

        if (id) {
            await sql`DELETE FROM categories WHERE id = ${id}`;
        } else if (restaurantId && name) {
            await sql`DELETE FROM categories WHERE restaurant_id = ${restaurantId} AND name = ${name}`;
        } else {
            return NextResponse.json({ error: "ID or (restaurantId + name) required" }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
