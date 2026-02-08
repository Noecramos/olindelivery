
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { rows } = await sql`SELECT * FROM saas_plans ORDER BY duration_months ASC`;
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('SaaS Plans GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { plans } = body;

        if (!Array.isArray(plans)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        for (const plan of plans) {
            await sql`
                UPDATE saas_plans SET
                    name = ${plan.name},
                    discount_percent = ${plan.discount_percent},
                    active = ${plan.active}
                WHERE id = ${plan.id}
            `;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('SaaS Plans POST Error:', error);
        return NextResponse.json({ error: 'Failed to update plans' }, { status: 500 });
    }
}
