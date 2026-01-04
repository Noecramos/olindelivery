import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get('restaurantId');

        if (!restaurantId) return NextResponse.json([], { status: 400 });

        const sheet = await getSheetByTitle('Categories');
        const rows = await sheet.getRows();

        const categories = rows
            .filter((row: any) => row.get('restaurantId') === restaurantId)
            .map((row: any) => ({
                id: row.get('id'),
                description: row.get('description') // As requested: "Descrição da categoria"
            }));

        return NextResponse.json(categories);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const sheet = await getSheetByTitle('Categories');

        const newCategory = {
            id: uuidv4(),
            restaurantId: body.restaurantId,
            description: body.description
        };

        await sheet.addRow({
            id: newCategory.id,
            restaurantId: newCategory.restaurantId,
            description: newCategory.description
        });

        return NextResponse.json(newCategory);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
