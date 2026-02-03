// Update global settings footer in database
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        await sql`
            INSERT INTO global_settings (key, value)
            VALUES ('footerText', '© 2026 Noviapp Mobile Apps • ZAPPY®')
            ON CONFLICT (key) 
            DO UPDATE SET value = '© 2026 Noviapp Mobile Apps • ZAPPY®'
        `;

        return NextResponse.json({
            success: true,
            message: 'Footer updated successfully!'
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}
