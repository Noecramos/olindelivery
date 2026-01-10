const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function clearOrders() {
    console.log('🔄 Connecting...');
    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const restSheet = doc.sheetsByTitle['Restaurants'];
    const restRows = await restSheet.getRows();
    const targetRest = restRows.find(r => r.get('slug') === 'olin-burgers');

    if (!targetRest) {
        console.error('❌ Restaurant olin-burgers not found!');
        return;
    }

    const restId = targetRest.get('id');
    console.log(`✅ Found restaurant ID: ${restId}`);

    const ordersSheet = doc.sheetsByTitle['Orders'];
    if (!ordersSheet) {
        console.error('❌ Orders sheet not found!');
        return;
    }

    const rows = await ordersSheet.getRows();
    console.log(`📊 Total orders before: ${rows.length}`);

    const toDelete = rows.filter(r => r.get('restaurantId') === restId);
    console.log(`🗑️ Deleting ${toDelete.length} orders for olin-burgers...`);

    // Serial delete
    for (const row of toDelete) {
        try {
            await row.delete();
            process.stdout.write('.');
        } catch (e) {
            console.error('x');
        }
    }

    console.log('\n✅ Clean up complete!');
}

clearOrders().catch(console.error);
