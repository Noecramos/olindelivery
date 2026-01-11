const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function createSettingsTable() {
    try {
        console.log('Creating global_settings table...');

        // Key-Value store for app settings
        await sql`
            CREATE TABLE IF NOT EXISTS global_settings (
                key VARCHAR(255) PRIMARY KEY,
                value TEXT
            );
        `;

        console.log('✅ Table global_settings created successfully');
    } catch (error) {
        console.error('Error:', error);
    }
}

createSettingsTable();
