import { sql } from '@vercel/postgres';

async function runMigration() {
    try {
        console.log('🔄 Running combo migration...');

        // Add combo support columns
        await sql`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS is_combo BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS combo_items JSONB;
        `;

        console.log('✅ Migration completed successfully!');
        console.log('   - Added is_combo column');
        console.log('   - Added combo_items column');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
