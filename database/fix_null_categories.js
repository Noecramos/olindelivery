const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function main() {
    try {
        console.log("Fixing null categories...");
        // Update NULL, empty, or 'undefined' string categories to 'Geral'
        const result = await sql`
      UPDATE products 
      SET category = 'Geral' 
      WHERE category IS NULL OR category = '' OR category = 'undefined' OR category = 'null'
    `;
        console.log(`✅ Updated ${result.rowCount} products to category 'Geral'.`);
    } catch (e) {
        console.error("❌ Error fixing categories:", e);
    }
}

main();
