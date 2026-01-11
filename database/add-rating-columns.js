const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function addRatingColumns() {
    try {
        console.log('Adding rating columns...');
        await sql`
            ALTER TABLE restaurants 
            ADD COLUMN IF NOT EXISTS rating_sum INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0
        `;
        console.log('✅ Columns added successfully');
    } catch (error) {
        console.error('Error:', error);
    }
}

addRatingColumns();
