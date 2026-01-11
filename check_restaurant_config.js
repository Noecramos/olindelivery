// Check restaurant configuration for geolocation
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkRestaurantConfig() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

        // Get all restaurants
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Restaurants!A1:ZZ',
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('❌ No restaurants found');
            return;
        }

        const headers = rows[0];
        const restaurants = rows.slice(1);

        console.log('\n📊 RESTAURANT GEOLOCATION CHECK\n');
        console.log('='.repeat(80));

        // Find column indices
        const nameIdx = headers.indexOf('name');
        const zipCodeIdx = headers.indexOf('zipCode');
        const latIdx = headers.indexOf('latitude');
        const lonIdx = headers.indexOf('longitude');
        const radiusIdx = headers.indexOf('deliveryRadius');
        const tiersIdx = headers.indexOf('deliveryFeeTiers');

        restaurants.forEach((row, idx) => {
            const name = row[nameIdx] || 'Unknown';
            const zipCode = row[zipCodeIdx] || 'Not set';
            const lat = row[latIdx] || 'Not set';
            const lon = row[lonIdx] || 'Not set';
            const radius = row[radiusIdx] || 'Not set';
            const tiers = row[tiersIdx] || 'Not set';

            console.log(`\nRestaurant #${idx + 1}: ${name}`);
            console.log('-'.repeat(80));
            console.log(`  CEP: ${zipCode}`);
            console.log(`  Latitude: ${lat}`);
            console.log(`  Longitude: ${lon}`);
            console.log(`  Delivery Radius: ${radius} km`);
            console.log(`  Delivery Fee Tiers: ${tiers}`);

            // Validation
            const hasValidCoords = lat !== 'Not set' && lon !== 'Not set' &&
                !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon));
            const hasValidRadius = radius !== 'Not set' && !isNaN(parseFloat(radius));

            console.log(`\n  ✓ Status:`);
            console.log(`    Coordinates configured: ${hasValidCoords ? '✅ YES' : '❌ NO'}`);
            console.log(`    Delivery radius set: ${hasValidRadius ? '✅ YES' : '❌ NO'}`);
            console.log(`    Validation enabled: ${hasValidCoords && hasValidRadius ? '✅ YES' : '❌ NO - ORDERS WILL NOT BE BLOCKED!'}`);

            if (!hasValidCoords) {
                console.log(`\n  ⚠️  WARNING: No valid coordinates! Delivery validation is DISABLED.`);
                console.log(`      → Go to Admin → Configurações → Área de Entrega`);
                console.log(`      → Click "Obter Coordenadas do Endereço Automaticamente"`);
            }

            if (!hasValidRadius) {
                console.log(`\n  ⚠️  WARNING: No delivery radius set! Validation is DISABLED.`);
                console.log(`      → Go to Admin → Configurações → Raio de Entrega (km)`);
                console.log(`      → Enter maximum delivery distance (e.g., 5 for 5km)`);
            }
        });

        console.log('\n' + '='.repeat(80));
        console.log('\n✅ Check complete!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkRestaurantConfig();
