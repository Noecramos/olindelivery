import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const id = searchParams.get('id');
        const showAll = searchParams.get('all') === 'true';

        const sheet = await getSheetByTitle('Restaurants');
        const rows = await sheet.getRows();

        let restaurant;

        if (id) {
            restaurant = rows.find((r: any) => r.get('id') === id);
        } else if (slug) {
            restaurant = rows.find((r: any) => r.get('slug') === slug);
        } else {
            // Return list for marketplace
            // Filter by approved unless showAll is true
            const all = rows
                .filter((r: any) => showAll || r.get('approved') === 'TRUE')
                .map((r: any) => {
                    const data: any = {
                        id: r.get('id'),
                        name: r.get('name'),
                        slug: r.get('slug'),
                        image: r.get('image'),
                        isOpen: r.get('isOpen') === 'TRUE',
                        approved: r.get('approved') === 'TRUE',
                        phone: r.get('phone'),
                        address: r.get('address')
                    };
                    // Only return password if Super Admin (requesting all)
                    if (showAll) {
                        data.password = r.get('password');
                    }
                    return data;
                });
            return NextResponse.json(all);
        }

        if (restaurant) {
            // If fetching single, check approval or allow if direct access (could restrict too)
            return NextResponse.json({
                id: restaurant.get('id'),
                name: restaurant.get('name'),
                slug: restaurant.get('slug'),
                isOpen: restaurant.get('isOpen') === 'TRUE',
                image: restaurant.get('image'),
                banner: restaurant.get('banner'),
                approved: restaurant.get('approved') === 'TRUE',
                phone: restaurant.get('phone'),
                address: restaurant.get('address'),
                // Password is NOT returned for single public view
            });
        }

        return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const sheet = await getSheetByTitle('Restaurants');

        if (!body.name || !body.slug) {
            return NextResponse.json({ error: 'Name and slug required' }, { status: 400 });
        }

        const newRestaurant = {
            id: uuidv4(),
            slug: body.slug,
            name: body.name,
            password: body.password || Math.random().toString(36).slice(-6), // Auto-generate 6-char password
            isOpen: 'TRUE',
            image: body.image || '',
            banner: body.banner || '',
            approved: 'FALSE', // Default to pending
            phone: body.phone || '',
            address: body.address || ''
        };

        await sheet.addRow({
            id: newRestaurant.id,
            slug: newRestaurant.slug,
            name: newRestaurant.name,
            password: newRestaurant.password,
            isOpen: newRestaurant.isOpen,
            image: newRestaurant.image,
            banner: newRestaurant.banner,
            approved: newRestaurant.approved,
            phone: newRestaurant.phone,
            address: newRestaurant.address
        });

        return NextResponse.json(newRestaurant);
    } catch (e) {
        return NextResponse.json({ error: 'Create failed' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, isOpen, approved } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const sheet = await getSheetByTitle('Restaurants');
        const rows = await sheet.getRows();
        const row = rows.find((r: any) => r.get('id') === id);

        if (row) {
            if (typeof isOpen !== 'undefined') row.assign({ isOpen: isOpen ? 'TRUE' : 'FALSE' });
            if (typeof approved !== 'undefined') row.assign({ approved: approved ? 'TRUE' : 'FALSE' });

            await row.save();
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'NotFound' }, { status: 404 });
    } catch (e) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const sheet = await getSheetByTitle('Restaurants');
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
