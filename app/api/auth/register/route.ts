
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { hashPassword, setSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, password, phone, whatsapp, zipCode, address, cpf } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 });
        }

        // Check if user exists
        const { rows: existing } = await sql`SELECT id FROM users WHERE email = ${email}`;
        if (existing.length > 0) {
            return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        // Use whatsapp field if phone not provided, or vice versa
        const finalPhone = phone || whatsapp;

        const { rows } = await sql`
            INSERT INTO users (name, email, password, phone, whatsapp, zip_code, address, cpf)
            VALUES (${name}, ${email}, ${hashedPassword}, ${finalPhone}, ${whatsapp}, ${zipCode}, ${address}, ${cpf})
            RETURNING id, name, email, phone, whatsapp, zip_code, address, cpf
        `;

        const user = rows[0];

        // Login immediately
        await setSession({ id: user.id, email: user.email, name: user.name });

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error("Register Error:", error);
        return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
    }
}
