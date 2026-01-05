import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { slug, password } = body;

        if (!slug || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        const sheet = await getSheetByTitle('Restaurants');
        const rows = await sheet.getRows();

        // Find restaurant by slug
        const restaurant = rows.find((r: any) => {
            const dbSlug = r.get('slug');
            return dbSlug === slug || dbSlug.replace(/-/g, '') === slug?.replace(/-/g, '');
        });

        if (restaurant) {
            // Check password
            // In a real app, this should be hashed. Here it's plain text as per project scope.
            const dbPassword = restaurant.get('password');
            console.log(`Verifying for ${slug}: DB '${dbPassword}' vs Input '${password}'`);

            // Robust comparison: trim and optional case-insensitivity if needed (keeping strict for now but safe guarding against spaces)
            if (dbPassword && password && dbPassword.trim() === password.trim()) {
                return NextResponse.json({ success: true });
            }
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (e) {
        console.error('Login error:', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
