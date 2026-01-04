const { getSheetByTitle } = require('./lib/googleSheets');
require('dotenv').config({ path: '.env.local' });

async function init() {
    console.log("Initializing SaaS Sheets...");
    const sheets = ['Restaurants', 'Categories', 'Products', 'Orders'];

    for (const title of sheets) {
        console.log(`Checking sheet: ${title}...`);
        try {
            await getSheetByTitle(title);
            console.log(`✅ ${title} ready.`);
        } catch (e) {
            console.error(`❌ Failed to init ${title}:`, e);
        }
    }
}

// Mocking the TS import for JS execution context if needed,
// or I can just rely on the API routes to lazy-create them.
// Actually, since I edited the `lib/googleSheets.ts` to auto-create,
// simply hitting an endpoint would do it.
// I will create a temporary route to trigger this initialization.
