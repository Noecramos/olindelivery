import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';

export async function GET() {
    try {
        const sheet = await getSheetByTitle('Restaurants');
        await sheet.setHeaderRow(['id', 'slug', 'name', 'password', 'isOpen', 'image', 'banner', 'approved', 'phone', 'address']);
        return NextResponse.json({ success: true, message: 'Headers updated' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
