import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { code } = await req.json();

        console.log(`[Validation Attempt] Raw Input: "${code}"`);

        // 1. Get the current valid code
        const { rows } = await sql`SELECT value FROM global_settings WHERE key = 'raspadinha_code'`;
        const activeCode = rows[0]?.value;
        const MASTER_CODE = '9999';

        const inputCode = String(code).trim();
        const dbCode = String(activeCode).trim();

        console.log(`[Validation Debug] Input: "${inputCode}" | DB: "${dbCode}" | Match: ${inputCode === dbCode}`);

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
                console.log(`[Validation Success] Code rotated to: ${newCode}`);
            }

            return NextResponse.json({ success: true, rotated: inputCode !== MASTER_CODE });
        } else {
            console.warn(`[Validation Failed] Mismatch.`);
            return NextResponse.json({ success: false, debug_input: inputCode }, { status: 400 });
        }
    } catch (error) {
        console.error('Raspadinha Validate API Error:', error);
        return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
    }
}
