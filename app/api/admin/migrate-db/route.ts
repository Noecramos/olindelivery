import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('secret');

        if (secret !== 'migrate-2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Add rating columns if they don't exist
        await sql`
            ALTER TABLE restaurants 
            ADD COLUMN IF NOT EXISTS rating_sum INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
        `;

        return NextResponse.json({
            message: 'Migration completed successfully',
            details: 'Added rating_sum and rating_count columns to restaurants table'
        });

    } catch (error: any) {
        console.error('Migration Error:', error);
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
