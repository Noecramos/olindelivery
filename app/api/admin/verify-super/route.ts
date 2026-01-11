import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ error: 'Password required' }, { status: 400 });
        }

        // Check environment variable or fallback
        const masterPassword = process.env.SUPER_ADMIN_PASSWORD || 'master';

        console.log('Super admin login attempt:', {
            match: password === masterPassword
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
