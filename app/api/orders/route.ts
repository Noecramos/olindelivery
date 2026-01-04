import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';
import { generateTicketNumber } from '@/lib/ticket';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get('restaurantId');

        // Return 400 if no restaurant specified (Security/Isolation)
        if (!restaurantId) return NextResponse.json([], { status: 400 });

        const sheet = await getSheetByTitle('Orders');
        const rows = await sheet.getRows();

        const orders = rows
            .filter((row: any) => row.get('restaurantId') === restaurantId)
            .map((row: any) => {
                const get = (key: string) => row.get(key);

                return {
                    id: get('id'),
                    ticketNumber: get('ticketNumber'),
                    createdAt: get('createdAt'),
                    status: get('status'),
                    total: parseFloat(get('total') || '0'),
                    paymentMethod: get('paymentMethod'), // Added
                    changeFor: get('changeFor'),         // Added
                    customer: {
                        name: get('customerName'),
                        phone: get('customerPhone'),
                        address: get('customerAddress'),
                    },
                    items: get('items') ? JSON.parse(get('items')) : []
                };
            });

        orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(orders);
    } catch (e) {
        console.error("Sheets Error:", e);
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Body must now include restaurantId

        const sheet = await getSheetByTitle('Orders');
        const ticketNumber = await generateTicketNumber(body.restaurantId || 'default'); // Fallback for now

        const newOrder = {
            id: Date.now().toString(),
            ticketNumber: ticketNumber,
            createdAt: new Date().toISOString(),
            status: 'pending',
            ...body
        };

        await sheet.addRow({
            id: newOrder.id,
            ticketNumber: newOrder.ticketNumber,
            restaurantId: newOrder.restaurantId || 'default',
            status: newOrder.status,
            customerName: newOrder.customer.name,
            customerPhone: newOrder.customer.phone,
            customerAddress: newOrder.customer.address,
            total: newOrder.total,
            paymentMethod: newOrder.paymentMethod, // Added
            changeFor: newOrder.changeFor,         // Added
            items: JSON.stringify(newOrder.items)
        });

        return NextResponse.json(newOrder);
    } catch (e) {
        console.error("Sheets Error:", e);
        return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const sheet = await getSheetByTitle('Orders');
        const rows = await sheet.getRows();
        const row = rows.find((r: any) => r.get('id') === id);

        if (row) {
            row.assign({ status });
            await row.save();
            return NextResponse.json({ id, status });
        }

        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    } catch (e) {
        console.error("Sheets Update Error:", e);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
