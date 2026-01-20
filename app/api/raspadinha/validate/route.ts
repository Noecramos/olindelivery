import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
    try {
        const { code } = await req.json();

        // 1. Get the current valid code
        const { rows } = await sql`SELECT value FROM global_settings WHERE key = 'raspadinha_code'`;
        const activeCode = rows[0]?.value;
        const MASTER_CODE = '9999';

        const inputCode = String(code).trim();
        const dbCode = String(activeCode).trim();

        // 2. Validate
        if (inputCode === dbCode || inputCode === MASTER_CODE) { // Keep Master Code for emergencies

            // 3. If it was the dynamic code (not master), rotate it IMMEDIATELY
            if (inputCode !== MASTER_CODE) {
                const newCode = Math.floor(1000 + Math.random() * 9000).toString();
                await sql`
                    UPDATE global_settings 
                    SET value = ${newCode} 
                    WHERE key = 'raspadinha_code'
                `;
            }

            return NextResponse.json({ success: true, rotated: inputCode !== MASTER_CODE });
        } else {
            return NextResponse.json({ success: false }, { status: 400 });
        }
    } catch (error) {
        console.error('Raspadinha Validate API Error:', error);
        return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
    }
}
