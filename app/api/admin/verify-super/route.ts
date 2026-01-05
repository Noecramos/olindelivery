import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ error: 'Password required' }, { status: 400 });
        }

        // Try to get the master password from the sheet
        let masterPassword = 'master'; // Hardcoded default

        try {
            const sheet = await getSheetByTitle('GlobalSettings');
            const rows = await sheet.getRows();
            const row = rows.find((r: any) => r.get('key') === 'master_password');
            if (row) {
                masterPassword = row.get('value');
            }
        } catch (e) {
            console.warn('GlobalSettings sheet not found or accessible, using default fallback.');
        }

        if (password === masterPassword) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
        }
    } catch (e) {
        return NextResponse.json({ error: 'Erro de validação' }, { status: 500 });
    }
}
