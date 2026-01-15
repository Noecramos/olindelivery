import { put } from '@vercel/blob';
import { readFileSync } from 'fs';

async function uploadFavicon() {
    try {
        console.log('📤 Uploading OlinDelivery favicon...');

        // Path to the uploaded image
        const imagePath = 'C:/Users/noecr/.gemini/antigravity/brain/4dddce5d-6f1c-482e-8bd8-2132e9486909/uploaded_image_1768436065590.jpg';

        // Read the file
        const fileBuffer = readFileSync(imagePath);

        // Upload to Vercel Blob
        const blob = await put('olindelivery-favicon.jpg', fileBuffer, {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'image/jpeg',
        });

        console.log('✅ Upload successful!');
        console.log('🔗 Image URL:', blob.url);
        console.log('\n📋 Next: Update favicon in app/favicon.ico');

        return blob.url;
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

uploadFavicon();
