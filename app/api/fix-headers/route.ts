import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';

export async function GET() {
    try {
        // Update Restaurants Sheet
        const restaurantsSheet = await getSheetByTitle('Restaurants');
        const restaurantHeaders = [
            'id', 'slug', 'name', 'password', 'isOpen', 'image', 'banner', 'approved',
            'phone', 'address', 'deliveryTime', 'instagram', 'whatsapp', 'type',
            'zipCode', 'hours', 'responsibleName', 'email', 'ratingSum', 'ratingCount'
        ];
        await restaurantsSheet.setHeaderRow(restaurantHeaders);

        const oSheet = await getSheetByTitle('Orders');
        await oSheet.setHeaderRow(['id', 'ticketNumber', 'restaurantId', 'status', 'total', 'customerName', 'customerPhone', 'customerAddress', 'paymentMethod', 'changeFor', 'items', 'createdAt']);

        return NextResponse.json({ success: true, message: 'Headers updated' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
