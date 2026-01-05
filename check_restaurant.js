// Quick debug script to check restaurant password
const { getSheetByTitle } = require('./lib/googleSheets');

async function checkRestaurant() {
    try {
        const sheet = await getSheetByTitle('Restaurants');
        const rows = await sheet.getRows();

        console.log('\n--- RESTAURANT DEBUG INFO ---');
        rows.forEach(r => {
            console.log(`\nName: ${r.get('name')}`);
            console.log(`Slug: ${r.get('slug')}`);
            console.log(`Password: '${r.get('password')}'`); // Quotes to see whitespace
            console.log(`Approved: ${r.get('approved')}`);
        });
        console.log('\n-----------------------------');
    } catch (error) {
        console.error('Error:', error);
    }
}

checkRestaurant();
