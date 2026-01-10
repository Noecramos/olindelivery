const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function updateSchema() {
    console.log('🔄 Connecting to Google Sheets Database...');

    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    console.log(`✅ Connected to: ${doc.title}`);

    // 1. Update Restaurants Sheet
    const restaurantSheet = doc.sheetsByTitle['Restaurants'];
    if (restaurantSheet) {
        console.log('📝 Updating "Restaurants" columns...');
        const headers = [
            'id', 'slug', 'name', 'password', 'isOpen', 'image', 'banner',
            'approved', 'phone', 'address', 'deliveryTime', 'instagram',
            'zipCode', 'hours', 'responsibleName', 'email', 'whatsapp',
            'type', 'pixKey', 'ratingSum', 'ratingCount' // New fields
        ];
        await restaurantSheet.setHeaderRow(headers);
        console.log('✅ "Restaurants" columns updated!');
    } else {
        console.error('❌ "Restaurants" sheet not found!');
    }

    console.log('🚀 Database schema update complete!');
}

updateSchema().catch(console.error);
