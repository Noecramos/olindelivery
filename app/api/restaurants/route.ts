import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');
        const id = searchParams.get('id');

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
            // Safe interpolation with Vercel Postgres is tricky with dynamic columns.
            // But here columns are static string.
            // We can't use template literal for columns easily in sql`` tag without helpers.
            // So we'll select * and map in JS or just write the query fully.
            // Let's write the query fully for slug.
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
                WHERE slug = ${slug} 
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
                WHERE id = ${id} 
                LIMIT 1
            `;
            if (rows.length === 0) {
                return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
            }
            return NextResponse.json(rows[0]);
        }

        // List all
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
        const {
            name, slug, responsibleName, email, whatsapp, instagram,
            zipCode, address, hours, type, image, pixKey
        } = body;

        // Check if slug exists
        const { rows: existing } = await sql`SELECT slug FROM restaurants WHERE slug = ${slug}`;
        if (existing.length > 0) {
            return NextResponse.json({ error: "URL (slug) already taken" }, { status: 400 });
        }

        const { rows } = await sql`
            INSERT INTO restaurants (
                name, slug, responsible_name, email, whatsapp, instagram, 
                zip_code, address, hours, type, image, pix_key, approved
            ) VALUES (
                ${name}, ${slug}, ${responsibleName}, ${email}, ${whatsapp}, ${instagram},
                ${zipCode}, ${address}, ${hours}, ${type}, ${image}, ${pixKey}, false
            ) RETURNING *
        `;

        return NextResponse.json({ success: true, restaurant: rows[0] });

    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to create restaurant" }, { status: 500 });
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
