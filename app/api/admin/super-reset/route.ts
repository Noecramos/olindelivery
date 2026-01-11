import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json({
        error: 'Master password reset is now managed via Vercel Environment Variables (SUPER_ADMIN_PASSWORD).'
    }, { status: 400 });
}
