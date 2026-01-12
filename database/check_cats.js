const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function check() {
    try {
        const { rows } = await sql`
            SELECT c.name, r.slug 
            FROM categories c
            JOIN restaurants r ON c.restaurant_id = r.id
            WHERE r.slug = 'lanchonete-sol'
        `;
        console.log("Categories for lanchonete-sol:");
        rows.forEach(r => console.log(` - ${r.name}`));
    } catch (e) { console.error(e); }
}

check();
