const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values) {
        process.env[key.trim()] = values.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
});


async function migrate() {
    try {
        console.log('Authenticating...');
        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        const sheet = doc.sheetsByTitle['Orders'];
        const rows = await sheet.getRows();

        console.log(`Found ${rows.length} rows. Checking for shifted data...`);
        let fixedCount = 0;

        for (const row of rows) {
            const pm = row.get('paymentMethod');
            const items = row.get('items');
            const changeFor = row.get('changeFor');

            // Debug first row
            if (row.rowNumber === 2) {
                console.log('Row 2 Sample:', { pm, items, changeFor, created: row.get('createdAt') });
            }

            // Check if paymentMethod looks like the items JSON
            // Also checking if 'pm' exists to avoid errors
            if (pm && typeof pm === 'string' && pm.trim().startsWith('[') && (!items || items === '')) {
                console.log(`Fixing row ${row.rowNumber}...`);

                // Shift data
                const realItems = pm;
                const realCreatedAt = changeFor;

                // Update row
                row.assign({
                    paymentMethod: 'money', // Default fallback
                    changeFor: '',
                    items: realItems,
                    createdAt: realCreatedAt || new Date().toISOString()
                });

                await row.save();
                fixedCount++;
            }
        }

        console.log(`Migration Complete. Fixed ${fixedCount} rows.`);

    } catch (e) {
        console.error('Error:', e);
    }
}

migrate();
