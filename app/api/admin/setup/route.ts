import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('secret');

        if (secret !== 'olin-magic-123') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log('Running migration: Add customer_email to orders');
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT`;

        console.log('Running migration: Create index for email');
        await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email)`;

        return NextResponse.json({ success: true, message: "Migration completed successfully" });

    } catch (error: any) {
        console.error("Migration Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
