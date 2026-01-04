const https = require('https');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function debug() {
    try {
        console.log('Fetching restaurant...');
        const r = await fetchUrl('https://olindelivery.vercel.app/api/restaurants?slug=olin-burgers');
        console.log('Restaurant:', r);

        if (r.id) {
            console.log('Fetching orders...');
            const orders = await fetchUrl(`https://olindelivery.vercel.app/api/orders?restaurantId=${r.id}`);
            console.log('Orders Count:', orders.length);
            console.log('First Order:', orders[0]);
        } else {
            console.log('Restaurant ID not found/returned.');
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

debug();
