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
                    paymentMethod: get('paymentMethod'),
                    changeFor: get('changeFor'),
                    observations: get('observations'),         // Added
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
        // Log payload for debugging (Vercel logs)
        console.log('📝 Received Order Paylod:', JSON.stringify(body).slice(0, 200) + '...');

        const sheet = await getSheetByTitle('Orders');

        // Ensure headers are loaded to prevent schema mismatch errors
        await sheet.loadHeaderRow();
        const headerValues = sheet.headerValues;

        const ticketNumber = await generateTicketNumber(body.restaurantId || 'default');

        const newOrder = {
            id: Date.now().toString(),
            ticketNumber: ticketNumber,
            createdAt: new Date().toISOString(),
            status: 'pending',
            ...body
        };

        // Construct row object ONLY with keys present in the sheet header
        // This is a defensive coding strategy to prevent 500 errors if columns are missing
        const rowData: any = {};

        // Map of potential keys to values
        const potentialData: any = {
            id: newOrder.id,
            ticketNumber: newOrder.ticketNumber,
            restaurantId: newOrder.restaurantId || 'default',
            status: newOrder.status,
            customerName: newOrder.customer?.name || '',
            customerPhone: newOrder.customer?.phone || '',
            customerAddress: newOrder.customer?.address || '',
            total: newOrder.total,
            paymentMethod: newOrder.paymentMethod,
            changeFor: newOrder.changeFor,
            observations: newOrder.observations || '',
            items: JSON.stringify(newOrder.items || []),
            createdAt: newOrder.createdAt
        };

        // Only add fields that exist in the sheet headers
        if (headerValues && headerValues.length > 0) {
            headerValues.forEach((header: string) => {
                if (potentialData[header] !== undefined) {
                    rowData[header] = potentialData[header];
                }
            });
        } else {
            // Fallback if headers couldn't be loaded (unlikely via Google API v4)
            // Just use all data and hope for best
            Object.assign(rowData, potentialData);
        }

        console.log('💾 Saving row to Sheets...');
        await sheet.addRow(rowData);
        console.log('✅ Order saved:', newOrder.id);

        return NextResponse.json(newOrder);
    } catch (e: any) {
        console.error("Sheets Error:", e);
        // Returns 500 but log detailed error
        return NextResponse.json(
            { error: 'Failed to save order', details: e.message },
            { status: 500 }
        );
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

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get('restaurantId');
        const clearHistory = searchParams.get('clearHistory');

        if (!restaurantId) return NextResponse.json({ error: 'Missing restaurantId' }, { status: 400 });

        const sheet = await getSheetByTitle('Orders');
        const rows = await sheet.getRows();

        if (clearHistory === 'true') {
            const rowsToDelete = rows.filter((r: any) =>
                r.get('restaurantId') === restaurantId &&
                ['sent', 'delivered', 'cancelled'].includes(r.get('status'))
            );

            // Delete in reverse to avoid index shifting issues if sequential?
            // Actually, just awaiting each delete is safest for now.
            for (const row of rowsToDelete) {
                await row.delete();
            }

            return NextResponse.json({ success: true, count: rowsToDelete.length });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e) {
        console.error("Sheets Delete Error:", e);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
