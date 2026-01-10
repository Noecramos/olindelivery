const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function addGeolocationFields() {
    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Restaurants'];

    if (!sheet) {
        console.error('Restaurants sheet not found!');
        return;
    }

    await sheet.loadHeaderRow();
    const currentHeaders = sheet.headerValues;

    const newFields = ['latitude', 'longitude', 'deliveryRadius'];
    const fieldsToAdd = newFields.filter(field => !currentHeaders.includes(field));

    if (fieldsToAdd.length > 0) {
        const updatedHeaders = [...currentHeaders, ...fieldsToAdd];
        await sheet.setHeaderRow(updatedHeaders);
        console.log('✅ Added new fields:', fieldsToAdd.join(', '));
    } else {
        console.log('✅ All geolocation fields already exist');
    }
}

addGeolocationFields().catch(console.error);
