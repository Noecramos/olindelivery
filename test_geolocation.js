const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function testGeolocationSetup() {
    console.log('🔍 Testing Geolocation Setup...\n');

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

    // Check headers
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;

    console.log('📋 Current Headers:');
    console.log(headers.join(', '));
    console.log('');

    const requiredFields = ['latitude', 'longitude', 'deliveryRadius'];
    const missingFields = requiredFields.filter(field => !headers.includes(field));

    if (missingFields.length > 0) {
        console.log('❌ Missing required fields:', missingFields.join(', '));
        console.log('Run: node add_geolocation_fields.js');
        return;
    } else {
        console.log('✅ All required fields exist\n');
    }

    // Check restaurant data
    const rows = await sheet.getRows();
    console.log(`📊 Found ${rows.length} restaurant(s)\n`);

    rows.forEach((row, index) => {
        const id = row.get('id');
        const name = row.get('name');
        const latitude = row.get('latitude');
        const longitude = row.get('longitude');
        const deliveryRadius = row.get('deliveryRadius');

        console.log(`Restaurant ${index + 1}: ${name}`);
        console.log(`  ID: ${id}`);
        console.log(`  Latitude: ${latitude || '❌ NOT SET'}`);
        console.log(`  Longitude: ${longitude || '❌ NOT SET'}`);
        console.log(`  Delivery Radius: ${deliveryRadius || '❌ NOT SET'} km`);

        if (latitude && longitude && deliveryRadius) {
            console.log(`  ✅ Geolocation ENABLED`);
        } else {
            console.log(`  ⚠️ Geolocation DISABLED (missing data)`);
        }
        console.log('');
    });

    console.log('\n📝 Next Steps:');
    console.log('1. If fields are missing, go to Admin Panel → Settings');
    console.log('2. Fill in complete address');
    console.log('3. Click "Obter Coordenadas do Endereço Automaticamente"');
    console.log('4. Enter delivery radius (e.g., 5 for 5km)');
    console.log('5. Click "Salvar Alterações"');
    console.log('6. Run this script again to verify');
}

testGeolocationSetup().catch(console.error);
