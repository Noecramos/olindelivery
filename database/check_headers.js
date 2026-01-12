const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkHeaders() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

        // Check Categories Sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Categories!A1:1', // First row only
        });

        console.log('Categories Headers:', response.data.values ? response.data.values[0] : 'No data');

    } catch (error) {
        console.error('Error:', error);
    }
}

checkHeaders();
