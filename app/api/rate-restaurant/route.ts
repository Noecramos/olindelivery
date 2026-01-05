import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { restaurantId, rating } = body;

        if (!restaurantId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const sheet = await getSheetByTitle('Restaurants');
        const rows = await sheet.getRows();
        const row = rows.find((r: any) => r.get('id') === restaurantId);

        if (row) {
            const currentSum = parseInt(row.get('ratingSum') || '0');
            const currentCount = parseInt(row.get('ratingCount') || '0');

            const newSum = currentSum + rating;
            const newCount = currentCount + 1;

            row.assign({
                ratingSum: newSum.toString(),
                ratingCount: newCount.toString()
            });
            await row.save();

            const average = (newSum / newCount).toFixed(1);
            return NextResponse.json({ success: true, average, count: newCount });
        }

        return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    } catch (e) {
        console.error('Rate Error:', e);
        return NextResponse.json({ error: 'Failed to rate' }, { status: 500 });
    }
}
