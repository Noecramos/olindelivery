import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { rows } = await sql`SELECT key, value FROM global_settings`;

        const config: any = {};
        rows.forEach(row => {
            config[row.key] = row.value;
        });

        return NextResponse.json(config);
    } catch (error) {
        console.error('Config GET Error:', error);
        return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Use a transaction or Promise.all for speed, but sequential is safer for now
        for (const [key, value] of Object.entries(body)) {
            const val = typeof value === 'object' ? JSON.stringify(value) : String(value);

            await sql`
                INSERT INTO global_settings (key, value)
                VALUES (${key}, ${val})
                ON CONFLICT (key) DO UPDATE SET value = ${val}
            `;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Config POST Error:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
