
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    try {
        console.log("🚀 Starting Subscription Migration for Olindelivery...");

        // 0. Ensure uuid-ossp extension is enabled
        console.log("🛠️ Enabling uuid-ossp extension...");
        await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

        // 1. Create saas_plans table
        console.log("📊 Creating saas_plans table...");
        await sql`
      CREATE TABLE IF NOT EXISTS saas_plans (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        duration_months INTEGER NOT NULL,
        discount_percent INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

        // 2. Insert default plans if empty
        const { rows: plans } = await sql`SELECT count(*) FROM saas_plans`;
        if (parseInt(plans[0].count) === 0) {
            console.log("🌱 Seeding default plans...");
            await sql`
        INSERT INTO saas_plans (name, duration_months, discount_percent) VALUES
        ('Mensal', 1, 0),
        ('Trimestral', 3, 5),
        ('Semestral', 6, 10),
        ('Anual', 12, 20);
      `;
        }

        // 3. Update restaurants table with subscription details
        console.log("🔄 Updating restaurants table...");

        // Check if columns exist before adding them (to make it somewhat idempotent, although IF NOT EXISTS handles simple cases)
        // The previous run might have failed midway, so some columns might already exist.
        // However, ADD COLUMN IF NOT EXISTS is safe.

        await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT`;
        await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT`;
        await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial'`;
        await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP`;
        await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS saas_trial_days INTEGER DEFAULT 7`;
        await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false`;

        // 4. Create payments table
        console.log("💰 Creating payments table...");
        await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
        asaas_payment_id TEXT,
        amount DECIMAL(10, 2),
        status TEXT,
        payment_method TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

        // 5. Create global_settings table if not exists
        console.log("⚙️ Creating global_settings table...");
        await sql`
        CREATE TABLE IF NOT EXISTS global_settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at TIMESTAMP DEFAULT NOW()
        )
    `;

        // 6. Global Settings for Pricing
        console.log("⚙️ Setting default global settings...");
        await sql`
        INSERT INTO global_settings (key, value)
        VALUES 
            ('saasMonthlyPrice', '49.90'),
            ('saasTrialDays', '7')
        ON CONFLICT (key) DO NOTHING;
    `;

        console.log("✅ Migration completed successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();
