
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { verifyPassword, setSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
        }

        const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;

        if (rows.length === 0) {
            return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 });
        }

        const user = rows[0];
        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 });
        }

        await setSession({ id: user.id, email: user.email, name: user.name });

        // Return user data (excluding password)
        const { password: _, ...userData } = user;
        console.log(userData)

        return NextResponse.json({ success: true, user: userData });

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 });
    }
}
