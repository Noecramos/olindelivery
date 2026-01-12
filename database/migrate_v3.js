// Migration Script V3 - Robust ID Mapping
const { google } = require('googleapis');
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

async function migrate() {
    console.log('🚀 Starting Data Restoration (Migration V3)...\n');

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error("Missing Google Credentials");
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Build ID Maps
    console.log('📊 Building Restaurant ID Map...');
    const { rows: pgRestaurants } = await sql`SELECT id, slug FROM restaurants`;
    const pgSlugMap = {}; // slug -> pg_id
    pgRestaurants.forEach(r => pgSlugMap[r.slug] = r.id);

    const sheetRestaurants = await fetchSheet(sheets, 'Restaurants');
    const sheetIdMap = {}; // sheet_id -> pg_id

    sheetRestaurants.forEach(r => {
        if (r.slug && pgSlugMap[r.slug]) {
            sheetIdMap[r.id] = pgSlugMap[r.slug];
        } else {
            // If restaurant missing in PG, we could insert it, but let's skip for now to avoid side effects
            // Unless it's critical.
            // console.warn(`Skipping missing restaurant: ${r.slug}`);
        }
    });

    // 2. Map Categories (Sheet ID -> Name)
    // We need this to resolve Product -> Category Name
    console.log('📊 Mapping Categories...');
    const sheetCategories = await fetchSheet(sheets, 'Categories');
    const catNameMap = {}; // sheet_cat_id -> category_name
    sheetCategories.forEach(c => {
        if (c.id && c.description) catNameMap[c.id] = c.description;
    });

    // 3. Migrate Categories
    // We insert them using the PG Restaurant ID
    console.log('📊 Restoring Categories...');
    for (const cat of sheetCategories) {
        const pgRestId = sheetIdMap[cat.restaurantId];
        if (!pgRestId) continue;

        const name = cat.description; // Map description -> name

        // We do NOT use sheet cat.id for Postgres primary key if we can avoid it, 
        // to avoid conflicts if PG generated UUIDs.
        // BUT we need to detect duplicates.
        // Schema: UNIQUE(restaurant_id, name).

        // We try insert.
        try {
            await sql`
                INSERT INTO categories (restaurant_id, name)
                VALUES (${pgRestId}, ${name})
                ON CONFLICT (restaurant_id, name) DO NOTHING
            `;
        } catch (e) { console.error("Cat Error:", e.message); }
    }

    // 4. Migrate Products
    console.log('📊 Restoring Products...');
    const sheetProducts = await fetchSheet(sheets, 'Products');
    let prodCount = 0;

    for (const prod of sheetProducts) {
        const pgRestId = sheetIdMap[prod.restaurantId];
        if (!pgRestId) continue;

        // Resolve Category Name
        let catName = prod.category;
        if (!catName && prod.categoryId) {
            catName = catNameMap[prod.categoryId];
        }

        // Resolve Available
        let available = true;
        if (prod.available !== undefined && prod.available !== '') {
            available = (String(prod.available).toLowerCase() === 'true');
        }

        // We use Sheet Product ID as Postgres ID to ensure we update the "same" product
        // IF the Postgres table was populated previously from Sheets.
        // If Postgres has "Geral" products with matching IDs, this will FIX them.

        try {
            await sql`
                INSERT INTO products (
                    id, restaurant_id, name, price, category, image, description, available
                ) VALUES (
                    ${prod.id}, ${pgRestId}, ${prod.name}, ${prod.price}, 
                    ${catName || 'Geral'}, ${prod.image}, ${prod.description}, ${available}
                )
                ON CONFLICT (id) DO UPDATE SET
                    restaurant_id = EXCLUDED.restaurant_id,
                    name = EXCLUDED.name,
                    price = EXCLUDED.price,
                    category = EXCLUDED.category,
                    image = EXCLUDED.image,
                    description = EXCLUDED.description,
                    available = EXCLUDED.available
            `;
            prodCount++;
        } catch (e) { console.error("Prod Error:", e.message); }
    }
    console.log(`✅ Restored ${prodCount} products.`);
}

async function fetchSheet(sheets, title) {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${title}!A1:ZZ`,
    });
    const rows = res.data.values;
    if (!rows || rows.length < 2) return [];

    const headers = rows[0];
    return rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
        return obj;
    });
}

migrate();
