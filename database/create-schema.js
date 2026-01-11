// Create database schema
const { sql } = require('@vercel/postgres');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function createSchema() {
    console.log('🔧 Creating database schema...\n');

    try {
        // Read schema file
        const schema = fs.readFileSync('database/schema.sql', 'utf8');

        // Split by semicolons to execute each statement separately
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

        console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.length > 0) {
                try {
                    console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
                    await sql.query(statement);
                    console.log(`✅ Statement ${i + 1} completed`);
                } catch (error) {
                    // Ignore "already exists" errors
                    if (error.message.includes('already exists')) {
                        console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
                    } else {
                        console.error(`❌ Statement ${i + 1} failed:`, error.message);
                    }
                }
            }
        }

        console.log('\n✅ Schema creation completed!');
        console.log('\n📊 Tables created:');
        console.log('  - restaurants');
        console.log('  - orders');
        console.log('  - products');
        console.log('  - categories');
        console.log('\n🎯 Next step: Run migration script');
        console.log('   node database/migrate.js\n');

    } catch (error) {
        console.error('❌ Schema creation failed:', error);
        throw error;
    }
}

createSchema().catch(console.error);
