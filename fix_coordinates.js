const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function fixCoordinateFormat() {
    console.log('🔧 Fixing coordinate format in Google Sheets...\n');

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

    // Load the sheet to use raw API
    await sheet.loadCells();

    const rows = await sheet.getRows();

    // Coordinates - using simpler format
    const latitude = '-8.010445';
    const longitude = '-34.876913';
    const deliveryRadius = '5';

    console.log('📍 Coordinates to update (simplified):');
    console.log(`   Latitude: ${latitude}`);
    console.log(`   Longitude: ${longitude}`);
    console.log(`   Delivery Radius: ${deliveryRadius} km\n`);

    // Get header row to find column indices
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;
    const latIndex = headers.indexOf('latitude');
    const lonIndex = headers.indexOf('longitude');
    const radiusIndex = headers.indexOf('deliveryRadius');

    console.log('Column indices:', { latIndex, lonIndex, radiusIndex });

    let updated = 0;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const name = row.get('name');
        const rowIndex = i + 2; // +2 because row 1 is headers, and we're 0-indexed

        console.log(`\nUpdating: ${name} (Row ${rowIndex})`);

        // Get cells and set as string values
        const latCell = sheet.getCell(rowIndex - 1, latIndex);
        const lonCell = sheet.getCell(rowIndex - 1, lonIndex);
        const radiusCell = sheet.getCell(rowIndex - 1, radiusIndex);

        // Set values as strings to prevent formatting
        latCell.value = latitude;
        lonCell.value = longitude;
        radiusCell.value = deliveryRadius;

        // Also update via row API
        row.set('latitude', latitude);
        row.set('longitude', longitude);
        row.set('deliveryRadius', deliveryRadius);

        await row.save();
        console.log(`✅ Updated ${name}`);
        updated++;
    }

    // Save all cells
    await sheet.saveUpdatedCells();

    console.log(`\n🎉 Successfully updated ${updated} restaurant(s)!`);
    console.log('\n📝 Next step: Run "node test_geolocation.js" to verify');
}

fixCoordinateFormat().catch(console.error);
