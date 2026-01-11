import { NextResponse } from 'next/server';
import { sql } from "@vercel/postgres";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { restaurantId, rating } = body;

        if (!restaurantId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const { rows } = await sql`
            UPDATE restaurants
            SET 
                rating_sum = COALESCE(rating_sum, 0) + ${rating},
                rating_count = COALESCE(rating_count, 0) + 1
            WHERE id = ${restaurantId} OR slug = ${restaurantId}
            RETURNING rating_sum, rating_count
        `;

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        const { rating_sum, rating_count } = rows[0];
        const average = (rating_sum / rating_count).toFixed(1);

        return NextResponse.json({
            success: true,
            average,
            count: rating_count
        });

    } catch (e) {
        console.error('Rate Error:', e);
        return NextResponse.json({ error: 'Failed to rate' }, { status: 500 });
    }
}
