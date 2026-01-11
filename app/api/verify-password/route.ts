import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { restaurantId, slug, password } = body;
        const identifier = restaurantId || slug;

        console.log(`🔐 Verifying password for: ${identifier}`);

        if (!identifier || !password) {
            return NextResponse.json({
                success: false,
                message: "Missing ID or password"
            }, { status: 400 });
        }

        // Fetch restaurant directly from Postgres
        const { rows } = await sql`
            SELECT id, password, name, slug 
            FROM restaurants 
            WHERE id = ${identifier} OR slug = ${identifier}
            LIMIT 1
        `;

        if (rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Restaurant not found"
            }, { status: 404 });
        }

        const restaurant = rows[0];

        // Check password matching
        // Note: In production you should hash passwords. For now comparing plaintext as per original implementation.
        if (String(restaurant.password) === String(password)) {
            console.log('✅ Password matched!');
            return NextResponse.json({
                success: true,
                restaurant: {
                    id: restaurant.id,
                    name: restaurant.name,
                    slug: restaurant.slug
                }
            });
        } else {
            console.log('❌ Password mismatch');
            return NextResponse.json({
                success: false,
                message: "Incorrect password"
            }, { status: 401 });
        }

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({
            success: false,
            message: "System error",
            error: String(error)
        }, { status: 500 });
    }
}
