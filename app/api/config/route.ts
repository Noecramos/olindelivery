
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

async function getDoc() {
    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
}

export async function GET() {
    try {
        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['GlobalConfig'];
        if (!sheet) return NextResponse.json({});

        const rows = await sheet.getRows();
        const config: any = {};

        rows.forEach((row: any) => {
            config[row.get('key')] = row.get('value');
        });

        return NextResponse.json(config);
    } catch (error) {
        console.error('Config Fetch Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const doc = await getDoc();
        const sheet = doc.sheetsByTitle['GlobalConfig'];

        if (!sheet) return NextResponse.json({ error: 'Sheet not found' }, { status: 500 });

        const rows = await sheet.getRows();

        // Update or Add
        for (const [key, value] of Object.entries(body)) {
            const row = rows.find((r: any) => r.get('key') === key);
            if (row) {
                row.assign({ value: String(value) });
                await row.save();
            } else {
                await sheet.addRow({ key, value: String(value) });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Config Save Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
