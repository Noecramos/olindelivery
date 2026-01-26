
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function addOptionsColumn() {
    try {
        console.log('Adding options column to products table...');
        await sql`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;
    `;
        console.log('✅ Column options added successfully.');
    } catch (error) {
        console.error('❌ Error adding column:', error);
    }
}

addOptionsColumn();
