// Migration script V2: Google Sheets → Vercel Postgres
// Fixes Auth, ID resolution, and Schema Mismatches

const { google } = require('googleapis');
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID; // Singular in .env.local

async function migrateData() {
    console.log('🚀 Starting migration V2...\n');

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error("Missing Google Credentials in .env.local");
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // 1. Fetch Categories first to build ID->Name map
        console.log('📊 Fetching Categories for mapping...');
        const catMap = await getCategoryMap(sheets, SPREADSHEET_ID);
        console.log(`   Found ${Object.keys(catMap).length} categories.`);

        // 2. Migrate Categories
        console.log('📊 Migrating Categories...');
        await migrateCategories(sheets, SPREADSHEET_ID);

        // 3. Migrate Products (using catMap)
        console.log('📊 Migrating Products...');
        await migrateProducts(sheets, SPREADSHEET_ID, catMap);

        // 4. (Optional) Migrate Restaurants? Assuming they are OK or user focuses on products.
        // Let's migrate them to ensure "isOpen" etc are synced if needed, but be careful of overwrite.
        // User asked to "update". Let's do it light or skip if satisfied.
        // User specifically asked for "categories" and "products" (implied).
        // Let's Skip Restaurants to avoid resetting passwords or manual changes in Postgres.

        console.log('\n✅ Migration V2 completed!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

async function getCategoryMap(sheets, spreadsheetId) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Categories!A1:ZZ',
    });
    const rows = response.data.values;
    if (!rows || rows.length < 2) return {};

    const headers = rows[0];
    const data = rows.slice(1);
    const map = {}; // id -> description (Name)

    data.forEach(row => {
        const item = {};
        headers.forEach((h, i) => item[h] = row[i]);
        if (item.id && item.description) {
            map[item.id] = item.description;
        }
    });
    return map;
}

async function migrateCategories(sheets, spreadsheetId) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Categories!A1:ZZ',
    });
    const rows = response.data.values;
    if (!rows || rows.length < 2) return;

    const headers = rows[0];
    const data = rows.slice(1);
    let count = 0;

    for (const row of data) {
        const item = {};
        headers.forEach((h, i) => item[h] = row[i]);

        // Map 'description' to 'name'
        const name = item.description || item.name;

        await sql`
            INSERT INTO categories (id, restaurant_id, name)
            VALUES (${item.id}, ${item.restaurantId}, ${name})
            ON CONFLICT (id) DO UPDATE SET 
                name = EXCLUDED.name
        `;
        count++;
    }
    console.log(`   ✅ Upserted ${count} categories.`);
}

async function migrateProducts(sheets, spreadsheetId, catMap) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Products!A1:ZZ',
    });
    const headers = response.data.values[0];
    const data = response.data.values.slice(1);
    let count = 0;

    for (const row of data) {
        const item = {};
        headers.forEach((h, i) => item[h] = row[i]);

        // Resolve Category Name
        let categoryName = item.category; // If exists directly

        if (!categoryName && item.categoryId) {
            categoryName = catMap[item.categoryId];
        }

        // Handle Available (Sheet might have string 'TRUE'/'FALSE' or empty)
        let available = true;
        if (item.available !== undefined && item.available !== null && item.available !== '') {
            available = (String(item.available).toLowerCase() === 'true');
        }

        await sql`
            INSERT INTO products (
                id, restaurant_id, name, price, category, image, description, available
            ) VALUES (
                ${item.id},
                ${item.restaurantId},
                ${item.name},
                ${item.price},
                ${categoryName || 'Geral'},
                ${item.image},
                ${item.description},
                ${available}
            )
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                price = EXCLUDED.price,
                category = EXCLUDED.category,
                image = EXCLUDED.image,
                description = EXCLUDED.description,
                available = EXCLUDED.available,
                updated_at = NOW()
        `;
        count++;
    }
    console.log(`   ✅ Upserted ${count} products.`);
}

migrateData();
