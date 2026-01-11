// Migration script: Google Sheets → Vercel Postgres
// Run this AFTER setting up the database and running schema.sql

const { google } = require('googleapis');
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function migrateData() {
    console.log('🚀 Starting migration from Google Sheets to Postgres...\n');

    try {
        // Connect to Google Sheets
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

        // Migrate Restaurants
        console.log('📊 Migrating Restaurants...');
        await migrateRestaurants(sheets, spreadsheetId);

        // Migrate Products
        console.log('📊 Migrating Products...');
        await migrateProducts(sheets, spreadsheetId);

        // Migrate Categories
        console.log('📊 Migrating Categories...');
        await migrateCategories(sheets, spreadsheetId);

        // Migrate Orders
        console.log('📊 Migrating Orders...');
        await migrateOrders(sheets, spreadsheetId);

        console.log('\n✅ Migration completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Verify data in Vercel Postgres dashboard');
        console.log('2. Update API routes to use Postgres');
        console.log('3. Test the application');
        console.log('4. Deploy to production');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

async function migrateRestaurants(sheets, spreadsheetId) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Restaurants!A1:ZZ',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
        console.log('  ⚠️  No restaurants found');
        return;
    }

    const headers = rows[0];
    const data = rows.slice(1);

    let migrated = 0;
    for (const row of data) {
        const restaurant = {};
        headers.forEach((header, index) => {
            restaurant[header] = row[index] || null;
        });

        // Parse delivery fee tiers if exists
        let deliveryFeeTiers = null;
        if (restaurant.deliveryFeeTiers) {
            try {
                deliveryFeeTiers = JSON.parse(restaurant.deliveryFeeTiers);
            } catch (e) {
                deliveryFeeTiers = null;
            }
        }

        await sql`
            INSERT INTO restaurants (
                id, name, slug, responsible_name, email, whatsapp, instagram,
                zip_code, address, hours, type, image, pix_key,
                latitude, longitude, delivery_radius,
                delivery_fee, delivery_fee_tiers, delivery_time,
                popular_title, welcome_subtitle,
                password, approved
            ) VALUES (
                ${restaurant.id || null},
                ${restaurant.name},
                ${restaurant.slug},
                ${restaurant.responsibleName || null},
                ${restaurant.email || null},
                ${restaurant.whatsapp || null},
                ${restaurant.instagram || null},
                ${restaurant.zipCode || null},
                ${restaurant.address || null},
                ${restaurant.hours || null},
                ${restaurant.type || null},
                ${restaurant.image || null},
                ${restaurant.pixKey || null},
                ${restaurant.latitude || null},
                ${restaurant.longitude || null},
                ${restaurant.deliveryRadius || null},
                ${restaurant.deliveryFee || null},
                ${deliveryFeeTiers},
                ${restaurant.deliveryTime || null},
                ${restaurant.popularTitle || null},
                ${restaurant.welcomeSubtitle || null},
                ${restaurant.password || null},
                ${restaurant.approved === 'true' || restaurant.approved === true}
            )
            ON CONFLICT (slug) DO UPDATE SET
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                whatsapp = EXCLUDED.whatsapp,
                zip_code = EXCLUDED.zip_code,
                address = EXCLUDED.address,
                latitude = EXCLUDED.latitude,
                longitude = EXCLUDED.longitude,
                delivery_radius = EXCLUDED.delivery_radius,
                delivery_fee = EXCLUDED.delivery_fee,
                delivery_fee_tiers = EXCLUDED.delivery_fee_tiers,
                updated_at = NOW()
        `;

        migrated++;
    }

    console.log(`  ✅ Migrated ${migrated} restaurants`);
}

async function migrateProducts(sheets, spreadsheetId) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Products!A1:ZZ',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
        console.log('  ⚠️  No products found');
        return;
    }

    const headers = rows[0];
    const data = rows.slice(1);

    let migrated = 0;
    for (const row of data) {
        const product = {};
        headers.forEach((header, index) => {
            product[header] = row[index] || null;
        });

        await sql`
            INSERT INTO products (
                id, restaurant_id, name, price, category, image, description
            ) VALUES (
                ${product.id || null},
                ${product.restaurantId},
                ${product.name},
                ${product.price},
                ${product.category || null},
                ${product.image || null},
                ${product.description || null}
            )
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                price = EXCLUDED.price,
                category = EXCLUDED.category,
                image = EXCLUDED.image,
                updated_at = NOW()
        `;

        migrated++;
    }

    console.log(`  ✅ Migrated ${migrated} products`);
}

async function migrateCategories(sheets, spreadsheetId) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Categories!A1:ZZ',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
        console.log('  ⚠️  No categories found');
        return;
    }

    const headers = rows[0];
    const data = rows.slice(1);

    let migrated = 0;
    for (const row of data) {
        const category = {};
        headers.forEach((header, index) => {
            category[header] = row[index] || null;
        });

        await sql`
            INSERT INTO categories (
                id, restaurant_id, name
            ) VALUES (
                ${category.id || null},
                ${category.restaurantId},
                ${category.name}
            )
            ON CONFLICT (restaurant_id, name) DO NOTHING
        `;

        migrated++;
    }

    console.log(`  ✅ Migrated ${migrated} categories`);
}

async function migrateOrders(sheets, spreadsheetId) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Orders!A1:ZZ',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
        console.log('  ⚠️  No orders found');
        return;
    }

    const headers = rows[0];
    const data = rows.slice(1);

    let migrated = 0;
    for (const row of data) {
        const order = {};
        headers.forEach((header, index) => {
            order[header] = row[index] || null;
        });

        // Parse items JSON
        let items = [];
        if (order.items) {
            try {
                items = JSON.parse(order.items);
            } catch (e) {
                console.log(`  ⚠️  Failed to parse items for order ${order.id}`);
                continue;
            }
        }

        // Parse customer JSON if exists
        let customerName = order.customerName;
        let customerPhone = order.customerPhone;
        let customerAddress = order.customerAddress;
        let customerZipCode = order.customerZipCode;

        if (order.customer) {
            try {
                const customer = JSON.parse(order.customer);
                customerName = customer.name;
                customerPhone = customer.phone;
                customerAddress = customer.address;
                customerZipCode = customer.zipCode;
            } catch (e) {
                // Use individual fields
            }
        }

        await sql`
            INSERT INTO orders (
                id, restaurant_id, ticket_number,
                customer_name, customer_phone, customer_address, customer_zip_code,
                items, subtotal, delivery_fee, total,
                payment_method, change_for, observations,
                status, created_at
            ) VALUES (
                ${order.id || null},
                ${order.restaurantId},
                ${order.ticketNumber || null},
                ${customerName},
                ${customerPhone},
                ${customerAddress},
                ${customerZipCode || null},
                ${JSON.stringify(items)},
                ${order.subtotal || order.total || 0},
                ${order.deliveryFee || 0},
                ${order.total || 0},
                ${order.paymentMethod || null},
                ${order.changeFor || null},
                ${order.observations || null},
                ${order.status || 'pending'},
                ${order.createdAt || new Date()}
            )
            ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                updated_at = NOW()
        `;

        migrated++;
    }

    console.log(`  ✅ Migrated ${migrated} orders`);
}

// Run migration
migrateData().catch(console.error);
