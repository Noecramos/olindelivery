
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
    try {
        const { rows } = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products';
    `;
        console.log('Products Table Schema:', rows);
    } catch (error) {
        console.error('Error:', error);
    }
}

checkSchema();
