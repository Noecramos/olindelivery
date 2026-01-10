
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function setupConfigSheet() {
    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    let sheet = doc.sheetsByTitle['GlobalConfig'];

    if (!sheet) {
        console.log('Creating GlobalConfig sheet...');
        sheet = await doc.addSheet({ headerValues: ['key', 'value'], title: 'GlobalConfig' });

        // Add default values
        const defaults = [
            { key: 'headerImage', value: 'https://i.imgur.com/Fyccvly.gif' },
            { key: 'welcomeTitle', value: 'O que vamos\npedir hoje?' },
            { key: 'welcomeSubtitle', value: 'Entregar em Casa' },
            { key: 'popularTitle', value: 'Populares' },
            { key: 'footerText', value: '© 2024 OlindAki Delivery' }
        ];

        await sheet.addRows(defaults);
        console.log('GlobalConfig initialized with defaults.');
    } else {
        console.log('GlobalConfig sheet already exists.');
    }
}

setupConfigSheet().catch(console.error);
