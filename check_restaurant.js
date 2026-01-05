// Quick debug script to check restaurant password
const { getSheetByTitle } = require('./lib/googleSheets');

async function checkRestaurant() {
    try {
        const sheet = await getSheetByTitle('Restaurants');
        const rows = await sheet.getRows();

        const restaurant = rows.find(r => r.get('slug') === 'olin-burgers');

        if (restaurant) {
            console.log('Restaurant found!');
            console.log('Name:', restaurant.get('name'));
            console.log('Slug:', restaurant.get('slug'));
            console.log('Approved:', restaurant.get('approved'));
            console.log('Password:', restaurant.get('password') || '(NO PASSWORD SET)');
            console.log('ID:', restaurant.get('id'));
        } else {
            console.log('Restaurant "olin-burgers" not found');
            console.log('\nAvailable restaurants:');
            rows.forEach(r => {
                console.log(`- ${r.get('slug')} (${r.get('name')}) - Approved: ${r.get('approved')}`);
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

checkRestaurant();
