import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';

export async function GET() {
    try {
        const rSheet = await getSheetByTitle('Restaurants');
        await rSheet.setHeaderRow(['id', 'slug', 'name', 'password', 'isOpen', 'image', 'banner', 'approved', 'phone', 'address', 'deliveryTime', 'instagram', 'zipCode', 'hours', 'responsibleName', 'email', 'whatsapp', 'type']);

        const oSheet = await getSheetByTitle('Orders');
        await oSheet.setHeaderRow(['id', 'ticketNumber', 'restaurantId', 'status', 'total', 'customerName', 'customerPhone', 'customerAddress', 'paymentMethod', 'changeFor', 'items', 'createdAt']);

        return NextResponse.json({ success: true, message: 'Headers updated' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
