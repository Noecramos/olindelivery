import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        console.log('🔄 Updating header image to ZAPPY logo...');

        // Update the headerImage setting to use local ZAPPY logo
        await sql`
            INSERT INTO global_settings (key, value)
            VALUES ('headerImage', '/logo.jpg')
            ON CONFLICT (key) DO UPDATE SET value = '/logo.jpg'
        `;

        // Also update headerBackgroundImage if it exists
        await sql`
            INSERT INTO global_settings (key, value)
            VALUES ('headerBackgroundImage', '/logo.jpg')
            ON CONFLICT (key) DO UPDATE SET value = '/logo.jpg'
        `;

        // Verify the changes
        const { rows } = await sql`
            SELECT key, value FROM global_settings 
            WHERE key IN ('headerImage', 'headerBackgroundImage', 'headerBackgroundType')
        `;

        console.log('✅ Header updated to ZAPPY logo!');
        console.log('Current settings:', rows);

        return NextResponse.json({
            success: true,
            message: 'Header updated to ZAPPY logo',
            settings: rows
        });
    } catch (error) {
        console.error('❌ Error updating header:', error);
        return NextResponse.json({
            error: 'Failed to update header',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
