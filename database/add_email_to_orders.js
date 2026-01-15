const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    try {
        console.log('Adding customer_email column to orders...');
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT`;
        console.log('✅ Column added successfully');
    } catch (e) {
        console.error('❌ Migration failed:', e);
    }
}

migrate();
