import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Return empty config or defaults since we migrated away from Sheets
    return NextResponse.json({});
}

export async function POST(req: Request) {
    // Mock success
    return NextResponse.json({ success: true });
}
