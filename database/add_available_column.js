const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function main() {
    try {
        console.log("Adding available column to products...");
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true`;
        console.log("✅ Added available column successfully.");
    } catch (e) {
        console.error("❌ Error adding column:", e);
    }
}

main();
