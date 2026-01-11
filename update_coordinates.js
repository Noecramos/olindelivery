const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function updateCoordinates() {
    console.log('🔧 Updating restaurant coordinates...\n');

    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Restaurants'];

    if (!sheet) {
        console.error('❌ Restaurants sheet not found!');
        return;
    }

    console.log('✅ Connected to Google Sheets\n');

    const rows = await sheet.getRows();

    // Coordinates provided by user
    const latitude = '-8.010444985010912';
    const longitude = '-34.876913059859255';
    const deliveryRadius = '5';

    console.log('📍 Coordinates to update:');
    console.log(`   Latitude: ${latitude}`);
    console.log(`   Longitude: ${longitude}`);
    console.log(`   Delivery Radius: ${deliveryRadius} km\n`);

    let updated = 0;

    for (const row of rows) {
        const name = row.get('name');
        const id = row.get('id');

        // Update both restaurants with the same coordinates
        // You can modify this to update specific restaurants
        console.log(`Updating: ${name} (${id})`);

        row.set('latitude', latitude);
        row.set('longitude', longitude);
        row.set('deliveryRadius', deliveryRadius);

        await row.save();
        console.log(`✅ Updated ${name}\n`);
        updated++;
    }

    console.log(`\n🎉 Successfully updated ${updated} restaurant(s)!`);
    console.log('\n📝 Next step: Run "node test_geolocation.js" to verify');
}

updateCoordinates().catch(console.error);
