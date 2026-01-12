require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function createUsersTable() {
    try {
        console.log('🏗️ Creating users table...');
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                phone TEXT,
                whatsapp TEXT,
                zip_code TEXT,
                address TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `;
        console.log('✅ Users table created successfully.');
    } catch (error) {
        console.error('❌ Error creating users table:', error);
    }
}

createUsersTable();
