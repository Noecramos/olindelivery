import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');
        const id = searchParams.get('id');
        const isAdminAccess = searchParams.get('admin') === 'true';

        const selectColumns = `
            id, name, slug, responsible_name as "responsibleName", 
            email, whatsapp, instagram, 
            zip_code as "zipCode", address, hours, type, image, pix_key as "pixKey",
            latitude, longitude, delivery_radius as "deliveryRadius",
            delivery_fee as "deliveryFee", delivery_fee_tiers as "deliveryFeeTiers",
            delivery_time as "deliveryTime", popular_title as "popularTitle",
            welcome_subtitle as "welcomeSubtitle", password, approved, is_open as "isOpen",
            created_at as "createdAt", updated_at as "updatedAt"
        `;

        if (slug) {
            // Fetch restaurant by slug
            // If admin=true, bypass approval check (for restaurant admin panel)
            // Otherwise, only return approved restaurants (for public frontend)
            const { rows } = isAdminAccess
                ? await sql`
                    SELECT 
                        id, name, slug, responsible_name as "responsibleName", 
                        email, whatsapp, instagram, 
                        zip_code as "zipCode", address, hours, type, image, pix_key as "pixKey",
                        latitude, longitude, delivery_radius as "deliveryRadius",
                        delivery_fee as "deliveryFee", delivery_fee_tiers as "deliveryFeeTiers",
                        delivery_time as "deliveryTime", popular_title as "popularTitle",
                        welcome_subtitle as "welcomeSubtitle", password, approved, is_open as "isOpen",
                        rating_sum as "ratingSum", rating_count as "ratingCount",
                        created_at as "createdAt", updated_at as "updatedAt"
                    FROM restaurants 
                    WHERE slug = ${slug}
                    LIMIT 1
                `
                : await sql`
                    SELECT 
                        id, name, slug, responsible_name as "responsibleName", 
                        email, whatsapp, instagram, 
                        zip_code as "zipCode", address, hours, type, image, pix_key as "pixKey",
                        latitude, longitude, delivery_radius as "deliveryRadius",
                        delivery_fee as "deliveryFee", delivery_fee_tiers as "deliveryFeeTiers",
                        delivery_time as "deliveryTime", popular_title as "popularTitle",
                        welcome_subtitle as "welcomeSubtitle", password, approved, is_open as "isOpen",
                        rating_sum as "ratingSum", rating_count as "ratingCount",
                        created_at as "createdAt", updated_at as "updatedAt"
                    FROM restaurants 
                    WHERE slug = ${slug} AND approved = true
                    LIMIT 1
                `;

            if (rows.length === 0) {
                return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
            }

            const restaurant = rows[0];
            return NextResponse.json({
                ...restaurant,
                deliveryFee: Number(restaurant.deliveryFee),
                deliveryRadius: Number(restaurant.deliveryRadius),
                latitude: Number(restaurant.latitude),
                longitude: Number(restaurant.longitude)
            });
        }

        if (id) {
            // Fetch approved restaurant by id (for public frontend)
            const { rows } = await sql`
                SELECT 
                    id, name, slug, responsible_name as "responsibleName", 
                    email, whatsapp, instagram, 
                    zip_code as "zipCode", address, hours, type, image, pix_key as "pixKey",
                    latitude, longitude, delivery_radius as "deliveryRadius",
                    delivery_fee as "deliveryFee", delivery_fee_tiers as "deliveryFeeTiers",
                    delivery_time as "deliveryTime", popular_title as "popularTitle",
                    welcome_subtitle as "welcomeSubtitle", password, approved, is_open as "isOpen",
                    created_at as "createdAt", updated_at as "updatedAt"
                FROM restaurants 
                WHERE id = ${id} AND approved = true
                LIMIT 1
            `;
            if (rows.length === 0) {
                return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
            }
            return NextResponse.json(rows[0]);
        }

        // List restaurants
        // If all=true, return everything (Admin view). Otherwise, return only approved/open (Public view).
        const showAll = searchParams.get('all') === 'true';

        const { rows } = showAll ? await sql`
            SELECT 
                id, name, slug, responsible_name as "responsibleName", 
                email, whatsapp, instagram, 
                zip_code as "zipCode", address, hours, type, image, pix_key as "pixKey",
                latitude, longitude, delivery_radius as "deliveryRadius",
                delivery_fee as "deliveryFee", delivery_fee_tiers as "deliveryFeeTiers",
                delivery_time as "deliveryTime", popular_title as "popularTitle",
                welcome_subtitle as "welcomeSubtitle", password, approved, is_open as "isOpen",
                created_at as "createdAt", updated_at as "updatedAt"
            FROM restaurants 
            ORDER BY created_at DESC
        ` : await sql`
            SELECT 
                id, name, slug, responsible_name as "responsibleName", 
                email, whatsapp, instagram, 
                zip_code as "zipCode", address, hours, type, image, pix_key as "pixKey",
                latitude, longitude, delivery_radius as "deliveryRadius",
                delivery_fee as "deliveryFee", delivery_fee_tiers as "deliveryFeeTiers",
                delivery_time as "deliveryTime", popular_title as "popularTitle",
                welcome_subtitle as "welcomeSubtitle", password, approved, is_open as "isOpen",
                created_at as "createdAt", updated_at as "updatedAt"
            FROM restaurants 
            WHERE approved = true
            ORDER BY created_at DESC
        `;

        return NextResponse.json(rows);

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Restaurant registration request:', JSON.stringify(body, null, 2));

        let {
            name, slug, responsibleName, email, whatsapp, instagram,
            zipCode, address, hours, type, image, pixKey
        } = body;

        // Validate required fields
        if (!name) {
            console.error('Validation failed: name is missing');
            return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
        }

        if (!slug) {
            console.error('Validation failed: slug is missing');
            return NextResponse.json({ error: 'Slug é obrigatório' }, { status: 400 });
        }

        // Check for duplicate slug and auto-generate unique one if needed
        let finalSlug = slug;
        let slugExists = await sql`SELECT id FROM restaurants WHERE slug = ${finalSlug}`;

        if (slugExists.rows.length > 0) {
            console.log('Slug already exists, generating unique slug...');
            let counter = 1;
            let uniqueSlugFound = false;

            while (!uniqueSlugFound && counter < 100) {
                finalSlug = `${slug}-${counter}`;
                slugExists = await sql`SELECT id FROM restaurants WHERE slug = ${finalSlug}`;

                if (slugExists.rows.length === 0) {
                    uniqueSlugFound = true;
                    console.log('Generated unique slug:', finalSlug);
                } else {
                    counter++;
                }
            }

            if (!uniqueSlugFound) {
                console.error('Could not generate unique slug after 100 attempts');
                return NextResponse.json({ error: 'Não foi possível gerar um link único. Tente outro nome.' }, { status: 409 });
            }
        }

        const { rows } = await sql`
            INSERT INTO restaurants (
                name, slug, responsible_name, email, whatsapp, instagram, 
                zip_code, address, hours, type, image, pix_key, approved
            ) VALUES (
                ${name}, ${finalSlug}, ${responsibleName || null}, ${email || null}, ${whatsapp || null}, ${instagram || null},
                ${zipCode || null}, ${address || null}, ${hours || null}, ${type || null}, ${image || null}, ${pixKey || null}, false
            ) RETURNING *
        `;

        console.log('Restaurant registered successfully with slug:', finalSlug);
        return NextResponse.json({
            success: true,
            restaurant: rows[0],
            slug: finalSlug
        });

    } catch (error: any) {
        console.error("Database Error:", error);
        console.error("Error stack:", error.stack);
        return NextResponse.json({
            error: "Failed to create restaurant",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            id, name, email, whatsapp, instagram, zipCode, address, hours, type,
            deliveryFee, deliveryTime, image, pixKey, approved, password,
            latitude, longitude, deliveryRadius, deliveryFeeTiers,
            popularTitle, welcomeSubtitle, resetPassword, isOpen
        } = body;

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        // Generate a random 8-char password
        const generated = Math.random().toString(36).slice(-8);

        // Logic:
        // 1. If resetPassword is true, force use generated password (first arg of COALESCE)
        // 2. Else use provided password (if any)
        // 3. Fallback to existing DB password
        // 4. If DB password is null (new approval) AND approved=true, use generated

        const forcePassword = resetPassword ? generated : password;
        const fallbackPassword = (approved === true) ? generated : null;

        // Use COALESCE to allow partial updates and handle password logic
        const { rows } = await sql`
            UPDATE restaurants SET
                name = COALESCE(${name}, name),
                email = COALESCE(${email}, email),
                whatsapp = COALESCE(${whatsapp}, whatsapp),
                instagram = COALESCE(${instagram}, instagram),
                zip_code = COALESCE(${zipCode}, zip_code),
                address = COALESCE(${address}, address),
                hours = COALESCE(${hours}, hours),
                type = COALESCE(${type}, type),
                delivery_fee = COALESCE(${deliveryFee}, delivery_fee),
                delivery_time = COALESCE(${deliveryTime}, delivery_time),
                image = COALESCE(${image}, image),
                pix_key = COALESCE(${pixKey}, pix_key),
                approved = COALESCE(${approved}, approved),
                is_open = COALESCE(${isOpen}, is_open),
                password = COALESCE(${forcePassword}, password, ${fallbackPassword}),
                latitude = COALESCE(${latitude}, latitude),
                longitude = COALESCE(${longitude}, longitude),
                delivery_radius = COALESCE(${deliveryRadius}, delivery_radius),
                delivery_fee_tiers = COALESCE(${JSON.stringify(deliveryFeeTiers) === undefined ? null : JSON.stringify(deliveryFeeTiers)}, delivery_fee_tiers),
                popular_title = COALESCE(${popularTitle}, popular_title),
                welcome_subtitle = COALESCE(${welcomeSubtitle}, welcome_subtitle),
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        return NextResponse.json({ success: true, ...rows[0] });

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to update restaurant" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await sql`DELETE FROM restaurants WHERE id = ${id}`;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to delete restaurant" }, { status: 500 });
    }
}
