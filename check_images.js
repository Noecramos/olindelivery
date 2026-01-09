const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');

// Read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
        env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
});


async function checkRestaurantImages() {
    try {
        const serviceAccountAuth = new JWT({
            email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        const sheet = doc.sheetsByTitle['Restaurants'];
        await sheet.loadHeaderRow();

        console.log('Headers:', sheet.headerValues);
        console.log('\n=== Restaurants with Images ===\n');

        const rows = await sheet.getRows();
        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.get('name')}`);
            console.log(`   Image: ${row.get('image') || '(empty)'}`);
            console.log(`   Approved: ${row.get('approved')}`);
            console.log('');
        });

        console.log(`Total restaurants: ${rows.length}`);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkRestaurantImages();
