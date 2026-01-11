// Quick script to calculate distance between two CEPs
async function calculateDistance() {
    const cep1 = '53160-500'; // Restaurant
    const cep2 = '53784-715'; // Customer

    console.log('Calculating distance between:');
    console.log('Restaurant CEP:', cep1);
    console.log('Customer CEP:', cep2);
    console.log('');

    try {
        // Get coordinates for CEP 1
        const res1 = await fetch(`https://viacep.com.br/ws/${cep1.replace(/\D/g, '')}/json/`);
        const data1 = await res1.json();

        if (data1.erro) {
            console.log('❌ Invalid CEP 1');
            return;
        }

        const addr1 = `${data1.logradouro}, ${data1.bairro}, ${data1.localidade}, ${data1.uf}, Brazil`;
        console.log('Restaurant address:', addr1);

        const geo1 = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr1)}&format=json&limit=1`,
            { headers: { 'User-Agent': 'OlinDelivery/1.0' } }
        );
        const geoData1 = await geo1.json();

        if (!geoData1 || geoData1.length === 0) {
            console.log('❌ Could not geocode restaurant address');
            return;
        }

        const lat1 = parseFloat(geoData1[0].lat);
        const lon1 = parseFloat(geoData1[0].lon);
        console.log('Restaurant coordinates:', { lat: lat1, lon: lon1 });
        console.log('');

        // Get coordinates for CEP 2
        const res2 = await fetch(`https://viacep.com.br/ws/${cep2.replace(/\D/g, '')}/json/`);
        const data2 = await res2.json();

        if (data2.erro) {
            console.log('❌ Invalid CEP 2');
            return;
        }

        const addr2 = `${data2.logradouro}, ${data2.bairro}, ${data2.localidade}, ${data2.uf}, Brazil`;
        console.log('Customer address:', addr2);

        const geo2 = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr2)}&format=json&limit=1`,
            { headers: { 'User-Agent': 'OlinDelivery/1.0' } }
        );
        const geoData2 = await geo2.json();

        if (!geoData2 || geoData2.length === 0) {
            console.log('❌ Could not geocode customer address');
            return;
        }

        const lat2 = parseFloat(geoData2[0].lat);
        const lon2 = parseFloat(geoData2[0].lon);
        console.log('Customer coordinates:', { lat: lat2, lon: lon2 });
        console.log('');

        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        console.log('📏 DISTANCE:', distance.toFixed(2), 'km');
        console.log('');
        console.log('Delivery radius: 5 km');
        console.log('');

        if (distance > 5) {
            console.log('❌ SHOULD BE BLOCKED - Distance exceeds 5km');
        } else {
            console.log('✅ SHOULD BE ALLOWED - Distance within 5km');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

calculateDistance();
