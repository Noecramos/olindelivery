import { NextResponse } from 'next/server';
import { doc, loadDoc } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const envStatus = {
            hasSheetId: !!process.env.GOOGLE_SHEET_ID,
            hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
            keyLength: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.length : 0,
        };

        if (!envStatus.hasKey) {
            return NextResponse.json({ error: 'Missing Private Key', envStatus }, { status: 500 });
        }

        // Test Basic Connectivity
        const connectivityTest = await fetch('https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest', { method: 'HEAD' })
            .then(r => ({ ok: r.ok, status: r.status }))
            .catch(e => ({ ok: false, error: e.message }));

        console.log("Attempting to load doc...");
        await loadDoc();
        console.log("Doc loaded:", doc.title);

        const sheetCount = doc.sheetCount;
        const sheets = Object.keys(doc.sheetsByTitle);

        return NextResponse.json({
            success: true,
            connectivityTest,
            title: doc.title,
            sheetCount,
            sheets,
            envStatus
        });
    } catch (e: any) {
        console.error("Debug Error:", e);
        return NextResponse.json({
            error: 'Connection Failed',
            message: e.message,
            stack: e.stack
        }, { status: 500 });
    }
}
