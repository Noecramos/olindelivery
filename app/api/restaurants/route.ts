import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';
import { v4 as uuidv4 } from 'uuid';

// API route for restaurant data - includes geolocation fields (latitude, longitude, deliveryRadius)

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
            restaurant = rows.find((r: any) => {
                const dbSlug = r.get('slug');
                return dbSlug === slug || dbSlug.replace(/-/g, '') === slug?.replace(/-/g, '');
            });
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
                        address: r.get('address'),
                        deliveryTime: r.get('deliveryTime') || '30-45 min',
                        instagram: r.get('instagram'),
                        zipCode: r.get('zipCode'),
                        hours: r.get('hours'),
                        responsibleName: r.get('responsibleName'),
                        email: r.get('email'),
                        whatsapp: r.get('whatsapp'),
                        pixKey: r.get('pixKey'),
                        type: r.get('type'),
                        deliveryFee: r.get('deliveryFee'),
                        ratingSum: parseInt(r.get('ratingSum') || '0'),
                        ratingCount: parseInt(r.get('ratingCount') || '0'),
                        latitude: r.get('latitude'),
                        longitude: r.get('longitude'),
                        deliveryRadius: r.get('deliveryRadius')
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
                deliveryTime: restaurant.get('deliveryTime') || '30-45 min',
                instagram: restaurant.get('instagram'),
                whatsapp: restaurant.get('whatsapp'),
                pixKey: restaurant.get('pixKey'),
                type: restaurant.get('type'),
                deliveryFee: restaurant.get('deliveryFee'),
                latitude: restaurant.get('latitude'),
                longitude: restaurant.get('longitude'),
                deliveryRadius: restaurant.get('deliveryRadius'),
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

        console.log('=== Creating Restaurant ===');
        console.log('Received data:', {
            name: body.name,
            slug: body.slug,
            image: body.image,
            whatsapp: body.whatsapp,
            pixKey: body.pixKey,
            email: body.email
        });

        if (!body.name || !body.slug) {
            return NextResponse.json({ error: 'Name and slug required' }, { status: 400 });
        }

        const newRestaurant = {
            id: uuidv4(),
            slug: body.slug,
            name: body.name,
            password: body.password || '', // Password generated only on approval
            isOpen: 'TRUE',
            image: body.image || '',
            banner: body.banner || '',
            approved: 'FALSE', // Default to pending
            phone: body.phone || body.whatsapp || '', // Fallback to whatsapp if phone not provided
            address: body.address || '',
            deliveryTime: body.deliveryTime || '30-45 min',
            deliveryFee: body.deliveryFee || '0',
            instagram: body.instagram || '',
            zipCode: body.zipCode || '',
            hours: body.hours || '',
            responsibleName: body.responsibleName || '',
            email: body.email || '',
            whatsapp: body.whatsapp || '',
            pixKey: body.pixKey || '',
            type: body.type || 'Outro'
        };

        console.log('Saving to Google Sheets with image:', newRestaurant.image);

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
            address: newRestaurant.address,
            deliveryTime: newRestaurant.deliveryTime,
            deliveryFee: newRestaurant.deliveryFee,
            instagram: newRestaurant.instagram,
            zipCode: newRestaurant.zipCode,
            hours: newRestaurant.hours,
            responsibleName: newRestaurant.responsibleName,
            email: newRestaurant.email,
            whatsapp: newRestaurant.whatsapp,
            pixKey: newRestaurant.pixKey,
            type: newRestaurant.type
        });

        console.log('=== Restaurant Created Successfully ===');

        return NextResponse.json(newRestaurant);
    } catch (e: any) {
        console.error('=== Restaurant Creation Error ===', e.message);
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
            const updates: any = {};
            let currentPassword = row.get('password');

            if (typeof isOpen !== 'undefined') updates.isOpen = isOpen ? 'TRUE' : 'FALSE';

            if (typeof approved !== 'undefined') {
                const isApproving = approved === true || approved === 'TRUE';
                updates.approved = isApproving ? 'TRUE' : 'FALSE';

                // Always generate a new random password when approving
                if (isApproving) {
                    currentPassword = Math.random().toString(36).slice(-6).toUpperCase();
                    updates.password = currentPassword;
                }
            }

            if (body.resetPassword === true) {
                currentPassword = Math.random().toString(36).slice(-6).toUpperCase();
                updates.password = currentPassword;
            }

            if (typeof body.deliveryTime !== 'undefined') updates.deliveryTime = body.deliveryTime;

            if (body.name) {
                const newSlug = body.name.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');

                // Update slug if name changed OR if current slug doesn't match expected slug (self-healing)
                if (body.name !== row.get('name') || row.get('slug') !== newSlug) {
                    updates.slug = newSlug;
                }
            }

            // Allow updating other profile fields
            const profileFields = [
                'name', 'image', 'banner', 'phone', 'address', 'instagram',
                'zipCode', 'hours', 'responsibleName', 'email', 'whatsapp',
                'pixKey', 'type', 'deliveryFee', 'latitude', 'longitude', 'deliveryRadius'
            ];

            profileFields.forEach(field => {
                if (typeof body[field] !== 'undefined') updates[field] = body[field];
            });

            row.assign(updates);
            await row.save();

            return NextResponse.json({ success: true, password: currentPassword, slug: updates.slug || row.get('slug') });
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
