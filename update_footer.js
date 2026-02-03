// Update footer text in database to standard format
const { sql } = require('@vercel/postgres');

async function updateFooter() {
    try {
        console.log('🔄 Updating footer text in database...');

        await sql`
            INSERT INTO global_settings (key, value)
            VALUES ('footerText', '© 2026 Noviapp Mobile Apps • ZAPPY®')
            ON CONFLICT (key) 
            DO UPDATE SET value = '© 2026 Noviapp Mobile Apps • ZAPPY®'
        `;

        console.log('✅ Footer text updated successfully!');
        console.log('New footer: © 2026 Noviapp Mobile Apps • ZAPPY®');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

updateFooter();
