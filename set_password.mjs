// Set password for olin-burgers restaurant
import { getSheetByTitle } from './lib/googleSheets.js';

async function setPassword() {
    try {
        const sheet = await getSheetByTitle('Restaurants');
        const rows = await sheet.getRows();

        const restaurant = rows.find(r => r.get('slug') === 'olin-burgers');

        if (restaurant) {
            // Set a simple password for testing
            const newPassword = '123456';

            restaurant.set('password', newPassword);
            restaurant.set('approved', 'TRUE');
            await restaurant.save();

            console.log('✅ Password set successfully!');
            console.log('Restaurant:', restaurant.get('name'));
            console.log('Slug:', restaurant.get('slug'));
            console.log('Password:', newPassword);
            console.log('\nYou can now login at: https://olindelivery.vercel.app/admin/olin-burgers');
            console.log('Use password:', newPassword);
        } else {
            console.log('❌ Restaurant "olin-burgers" not found');
            console.log('\nAvailable restaurants:');
            rows.forEach(r => {
                console.log(`- ${r.get('slug')} (${r.get('name')})`);
            });
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

setPassword();
