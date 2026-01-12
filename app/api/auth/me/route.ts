
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ user: null });
        }

        // Fetch fresh data
        const { rows } = await sql`
            SELECT id, name, email, phone, whatsapp, zip_code as "zipCode", address, cpf 
            FROM users WHERE id = ${session.id as string}
        `;

        if (rows.length === 0) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({ user: rows[0] });

    } catch (error) {
        console.error("Auth Me Error:", error);
        return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
    }
}
