import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';

export async function GET() {
    try {
        const sheet = await getSheetByTitle('Restaurants');
        const rows = await sheet.getRows();

        const restaurants = rows.map((r: any) => ({
            id: r.get('id'),
            name: r.get('name'),
            phone: r.get('phone'),
            whatsapp: r.get('whatsapp'),
            approved: r.get('approved')
        }));

        return NextResponse.json({
            headers: sheet.headerValues,
            restaurants,
            count: rows.length
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
