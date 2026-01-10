import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get('restaurantId');

        if (!restaurantId) return NextResponse.json([], { status: 400 });

        const sheet = await getSheetByTitle('Products');
        const catSheet = await getSheetByTitle('Categories');

        const rows = await sheet.getRows();
        const catRows = await catSheet.getRows();

        const catMap = catRows.reduce((acc: any, row: any) => {
            acc[row.get('id')] = row.get('description');
            return acc;
        }, {});

        // Filter by restaurant
        const products = rows
            .filter((row: any) => row.get('restaurantId') === restaurantId)
            .map((row: any) => ({
                id: row.get('id'),
                restaurantId: row.get('restaurantId'),
                name: row.get('name'),
                description: row.get('description'),
                price: parseFloat(row.get('price')),
                image: row.get('image'),
                categoryId: row.get('categoryId'),
                category: catMap[row.get('categoryId')] || 'Outros',
                available: row.get('available') === 'TRUE'
            }));

        return NextResponse.json(products);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const sheet = await getSheetByTitle('Products');

        const newProduct = {
            id: uuidv4(),
            ...body, // Expects restaurantId, name, price, etc.
            available: 'TRUE'
        };

        await sheet.addRow({
            id: newProduct.id,
            restaurantId: newProduct.restaurantId,
            categoryId: newProduct.categoryId,
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
            image: newProduct.image,
            available: newProduct.available
        });

        return NextResponse.json(newProduct);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        const sheet = await getSheetByTitle('Products');
        const rows = await sheet.getRows();
        const row = rows.find((r: any) => r.get('id') === id);

        if (row) {
            row.assign(updates);
            await row.save();
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const sheet = await getSheetByTitle('Products');
        const rows = await sheet.getRows();
        const row = rows.find((r: any) => r.get('id') === id);

        if (row) {
            await row.delete();
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    } catch (e) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
