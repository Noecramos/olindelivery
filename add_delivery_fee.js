const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
];

const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: SCOPES,
});

async function run() {
    try {
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt);
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['Restaurants'];
        await sheet.loadHeaderRow();
        const headers = sheet.headerValues;

        console.log('Current headers:', headers);

        if (!headers.includes('deliveryFee')) {
            const newHeaders = [...headers, 'deliveryFee'];
            await sheet.setHeaderRow(newHeaders);
            console.log('Added deliveryFee column');
        } else {
            console.log('deliveryFee column already exists');
        }
    } catch (e) {
        console.error(e);
    }
}

run();
