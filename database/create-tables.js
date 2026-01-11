// Create database tables - Simple version
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function createTables() {
    console.log('🔧 Creating database tables...\n');

    try {
        // Create restaurants table
        console.log('⏳ Creating restaurants table...');
        await sql`
            CREATE TABLE IF NOT EXISTS restaurants (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                responsible_name TEXT,
                email TEXT,
                whatsapp TEXT,
                instagram TEXT,
                zip_code TEXT,
                address TEXT,
                hours TEXT,
                type TEXT,
                image TEXT,
                pix_key TEXT,
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                delivery_radius DECIMAL(5, 2),
                delivery_fee DECIMAL(10, 2),
                delivery_fee_tiers JSONB,
                delivery_time TEXT,
                popular_title TEXT,
                welcome_subtitle TEXT,
                password TEXT,
                approved BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;
        console.log('✅ Restaurants table created\n');

        // Create orders table
        console.log('⏳ Creating orders table...');
        await sql`
            CREATE TABLE IF NOT EXISTS orders (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
                ticket_number INTEGER,
                customer_name TEXT NOT NULL,
                customer_phone TEXT NOT NULL,
                customer_address TEXT NOT NULL,
                customer_zip_code TEXT,
                items JSONB NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL,
                delivery_fee DECIMAL(10, 2) DEFAULT 0,
                total DECIMAL(10, 2) NOT NULL,
                payment_method TEXT,
                change_for DECIMAL(10, 2),
                observations TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;
        console.log('✅ Orders table created\n');

        // Create products table
        console.log('⏳ Creating products table...');
        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                category TEXT,
                image TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;
        console.log('✅ Products table created\n');

        // Create categories table
        console.log('⏳ Creating categories table...');
        await sql`
            CREATE TABLE IF NOT EXISTS categories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(restaurant_id, name)
            )
        `;
        console.log('✅ Categories table created\n');

        // Create indexes
        console.log('⏳ Creating indexes...');
        await sql`CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_restaurants_approved ON restaurants(approved)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_products_restaurant_id ON products(restaurant_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_categories_restaurant_id ON categories(restaurant_id)`;
        console.log('✅ Indexes created\n');

        console.log('✅ Database schema created successfully!\n');
        console.log('📊 Tables:');
        console.log('  - restaurants ✓');
        console.log('  - orders ✓');
        console.log('  - products ✓');
        console.log('  - categories ✓');
        console.log('\n🎯 Next step: Migrate data');
        console.log('   node database/migrate.js\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

createTables().catch(console.error);
