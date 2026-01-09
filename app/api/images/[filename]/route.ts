import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
    request: Request,
    context: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await context.params;

        console.log('=== Image Request ===');
        console.log('Filename:', filename);

        const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
        console.log('Full path:', filepath);

        const imageBuffer = await readFile(filepath);
        console.log('Image loaded, size:', imageBuffer.length);

        // Determine content type
        const ext = path.extname(filename).toLowerCase();
        const contentType = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }[ext] || 'image/jpeg';

        console.log('Serving with content-type:', contentType);

        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error: any) {
        console.error('=== Image Serve Error ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        return new NextResponse('Image not found', { status: 404 });
    }
}
