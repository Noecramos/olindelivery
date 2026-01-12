require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function addCpfColumn() {
    try {
        console.log('🏗️ Adding CPF column to users table...');
        await sql`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS cpf TEXT;
        `;
        console.log('✅ CPF column added successfully.');
    } catch (error) {
        console.error('❌ Error adding CPF column:', error);
    }
}

addCpfColumn();
