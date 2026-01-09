const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');

async function checkHeaders() {
    try {
        const creds = require('./google_client_secret.json');
        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet('1ObxRjj9S4V81-iRA_aUD2C3pysuT4p67jV2W_i2W55I', serviceAccountAuth);
        await doc.loadInfo();

        const sheet = doc.sheetsByTitle['Restaurants'];
        await sheet.loadHeaderRow();
        console.log('Headers:', sheet.headerValues);
    } catch (e) {
        console.error('Error:', e);
    }
}

checkHeaders();
