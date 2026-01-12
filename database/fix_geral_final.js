const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function fix() {
    try {
        console.log("Moving Geral products to Hamburger...");

        const result = await sql`
            UPDATE products 
            SET category = 'Hamburger' 
            WHERE category = 'Geral' 
            AND name ILIKE '%Bacon%' 
            AND restaurant_id = (SELECT id FROM restaurants WHERE slug = 'lanchonete-sol' LIMIT 1)
        `; // Safer: only for known item type

        console.log(`✅ Moved ${result.rowCount} items.`);

        // Fallback: If any Geral remains, check them?
        const { rows } = await sql`SELECT name FROM products WHERE category = 'Geral'`;
        if (rows.length > 0) {
            console.log("⚠️ Products still in Geral:", rows.map(r => r.name));
        } else {
            console.log("Empty Geral category. It should disappear from frontend.");
        }

    } catch (e) {
        console.error(e);
    }
}

fix();
