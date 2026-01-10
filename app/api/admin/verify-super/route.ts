import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ error: 'Password required' }, { status: 400 });
        }

        // Priority 1: Check environment variable
        let masterPassword = process.env.SUPER_ADMIN_PASSWORD;

        // Priority 2: Try to get from Google Sheets if env var not set
        if (!masterPassword) {
            try {
                const sheet = await getSheetByTitle('GlobalSettings');
                const rows = await sheet.getRows();
                const row = rows.find((r: any) => r.get('key') === 'master_password');
                if (row) {
                    masterPassword = row.get('value');
                }
            } catch (e) {
                console.warn('GlobalSettings sheet not found or accessible.');
            }
        }

        // Priority 3: Fallback to hardcoded default
        if (!masterPassword) {
            masterPassword = 'master';
        }

        console.log('Super admin login attempt:', {
            providedPassword: password,
            usingEnvVar: !!process.env.SUPER_ADMIN_PASSWORD,
            passwordMatch: password === masterPassword
        });

        if (password === masterPassword) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
        }
    } catch (e) {
        console.error('Super admin verification error:', e);
        return NextResponse.json({ error: 'Erro de validação' }, { status: 500 });
    }
}
