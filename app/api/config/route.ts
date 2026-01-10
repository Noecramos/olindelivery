import { getSheetByTitle } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const sheet = await getSheetByTitle('GlobalConfig');
        if (!sheet) return NextResponse.json({});

        const rows = await sheet.getRows();
        const config: any = {};

        rows.forEach((row: any) => {
            config[row.get('key')] = row.get('value');
        });

        return NextResponse.json(config);
    } catch (error: any) {
        console.error('Config Fetch Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch config',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const sheet = await getSheetByTitle('GlobalConfig');

        if (!sheet) return NextResponse.json({ error: 'Sheet not found' }, { status: 500 });

        // Ensure headers exist if it was auto-created without them
        try {
            await sheet.loadHeaderRow();
        } catch (e) {
            // If headers load fail (empty sheet), set them
            await sheet.setHeaderRow(['key', 'value']);
        }

        const rows = await sheet.getRows();

        // Update or Add
        for (const [key, value] of Object.entries(body)) {
            const row = rows.find((r: any) => r.get('key') === key);
            if (row) {
                row.assign({ value: String(value) });
                await row.save();
            } else {
                await sheet.addRow({ key, value: String(value) });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Config Save Error:', error);
        return NextResponse.json({
            error: 'Failed to save config',
            details: error.message
        }, { status: 500 });
    }
}
