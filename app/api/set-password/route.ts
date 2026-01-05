import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { slug, newPassword } = body;

        if (!slug || !newPassword) {
            return NextResponse.json({ error: 'Slug and password required' }, { status: 400 });
        }

        const sheet = await getSheetByTitle('Restaurants');
        const rows = await sheet.getRows();

        const restaurant = rows.find((r: any) => r.get('slug') === slug);

        if (restaurant) {
            restaurant.set('password', newPassword);
            restaurant.set('approved', 'TRUE');
            await restaurant.save();

            return NextResponse.json({
                success: true,
                message: 'Password set successfully',
                restaurant: restaurant.get('name'),
                password: newPassword
            });
        }

        return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    } catch (error: any) {
        console.error('Error setting password:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
