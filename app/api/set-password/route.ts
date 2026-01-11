import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { restaurantId, password } = body;

        if (!restaurantId || !password) {
            return NextResponse.json({ error: "Missing ID or password" }, { status: 400 });
        }

        const { rowCount } = await sql`
            UPDATE restaurants 
            SET password = ${password}, updated_at = NOW()
            WHERE id = ${restaurantId} OR slug = ${restaurantId}
        `;

        if (rowCount === 0) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to set password" }, { status: 500 });
    }
}
