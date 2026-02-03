// Update header image to ZAPPY logo in database
import { sql } from '@vercel/postgres';

async function updateHeaderToZappy() {
    try {
        console.log('🔄 Updating header image to ZAPPY logo...');

        // Update the headerImage setting to use local ZAPPY logo
        await sql`
            INSERT INTO global_settings (key, value)
            VALUES ('headerImage', '/logo.jpg')
            ON CONFLICT (key) DO UPDATE SET value = '/logo.jpg'
        `;

        console.log('✅ Header image updated to ZAPPY logo!');

        // Also update headerBackgroundImage if it exists
        await sql`
            INSERT INTO global_settings (key, value)
            VALUES ('headerBackgroundImage', '/logo.jpg')
            ON CONFLICT (key) DO UPDATE SET value = '/logo.jpg'
        `;

        console.log('✅ Header background image updated!');

        // Verify the changes
        const { rows } = await sql`
            SELECT key, value FROM global_settings 
            WHERE key IN ('headerImage', 'headerBackgroundImage')
        `;

        console.log('\n📊 Current settings:');
        rows.forEach(row => {
            console.log(`  ${row.key}: ${row.value}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating header:', error);
        process.exit(1);
    }
}

updateHeaderToZappy();
