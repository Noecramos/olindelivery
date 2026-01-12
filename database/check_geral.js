const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function check() {
    try {
        const { rows } = await sql`
            SELECT p.id, p.name, p.category, r.slug 
            FROM products p
            JOIN restaurants r ON p.restaurant_id = r.id
            WHERE p.category = 'Geral'
        `;

        console.log(`Found ${rows.length} products in 'Geral':`);
        rows.forEach(r => console.log(` - [${r.slug}] ${r.name} (ID: ${r.id})`));

        // Check for duplicates
        if (rows.length > 0) {
            console.log("\nChecking for duplicates in other categories...");
            for (const row of rows) {
                const { rows: dups } = await sql`
                    SELECT id, name, category FROM products 
                    WHERE name = ${row.name} 
                    AND category != 'Geral'
                    AND restaurant_id = (SELECT id FROM restaurants WHERE slug = ${row.slug})
                `;
                if (dups.length > 0) {
                    console.log(`   ⚠️  Duplicate found for "${row.name}": also exists in "${dups[0].category}" (ID: ${dups[0].id})`);
                } else {
                    console.log(`   ℹ️  No duplicate for "${row.name}" (Unique to Geral).`);
                }
            }
        }

    } catch (e) {
        console.error(e);
    }
}

check();
