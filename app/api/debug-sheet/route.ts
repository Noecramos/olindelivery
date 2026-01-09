import { NextResponse } from 'next/server';
import { getSheetByTitle, loadDoc } from '@/lib/googleSheets';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fix = searchParams.get('fix') === 'true';

        const sheet = await getSheetByTitle('Restaurants');
        const rows = await sheet.getRows();
        const headers = sheet.headerValues;

        const expectedHeaders = ['id', 'slug', 'name', 'password', 'isOpen', 'image', 'banner', 'approved', 'phone', 'address', 'deliveryTime', 'instagram', 'zipCode', 'hours', 'responsibleName', 'email', 'whatsapp', 'type'];

        let message = "Headers checked.";

        if (fix) {
            await sheet.setHeaderRow(expectedHeaders);
            message = "Headers updated/fixed.";
        }

        return NextResponse.json({
            currentHeaders: headers,
            expectedHeaders,
            missing: expectedHeaders.filter(h => !headers.includes(h)),
            rowCount: rows.length,
            message
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
