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

async function updateImagePaths() {
    try {
        console.log('=== Updating Image Paths ===\n');

        const serviceAccountAuth = new JWT({
            email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        const sheet = doc.sheetsByTitle['Restaurants'];
        const rows = await sheet.getRows();

        let updatedCount = 0;

        for (const row of rows) {
            const currentImage = row.get('image');

            if (currentImage && currentImage.startsWith('/uploads/')) {
                const newImage = currentImage.replace('/uploads/', '/api/images/');
                row.set('image', newImage);
                await row.save();

                console.log(`✅ Updated: ${row.get('name')}`);
                console.log(`   Old: ${currentImage}`);
                console.log(`   New: ${newImage}\n`);

                updatedCount++;
            }
        }

        if (updatedCount === 0) {
            console.log('ℹ️  No images needed updating.');
        } else {
            console.log(`\n✅ Successfully updated ${updatedCount} restaurant image(s)!`);
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

updateImagePaths();
