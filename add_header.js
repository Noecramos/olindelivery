const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');

async function addHeader() {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            env[key] = value;
        }
    });

    const serviceAccountAuth = new JWT({
        email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, ''),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Orders'];

    if (!sheet) {
        console.log("Orders sheet not found");
        return;
    }

    await sheet.loadHeaderRow();
    const currentHeaders = sheet.headerValues;

    if (!currentHeaders.includes('observations')) {
        const newHeaders = [...currentHeaders, 'observations'];
        await sheet.setHeaderRow(newHeaders);
        console.log("Added 'observations' to headers:", newHeaders);
    } else {
        console.log("'observations' already in headers.");
    }
}

addHeader();
