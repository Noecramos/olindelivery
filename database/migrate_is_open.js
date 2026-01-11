const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function main() {
    try {
        console.log("Adding is_open column...");
        await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT FALSE`;
        console.log("✅ Added is_open column successfully.");
    } catch (e) {
        console.error("❌ Migration failed:", e);
    }
}

main();
