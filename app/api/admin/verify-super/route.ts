import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ error: 'Password required' }, { status: 400 });
        }

        // Check database first (for reset passwords)
        let masterPassword = process.env.SUPER_ADMIN_PASSWORD || 'master';

        try {
            const { rows } = await sql`
                SELECT value FROM global_settings 
                WHERE key = 'super_admin_password'
                LIMIT 1
            `;

            if (rows.length > 0 && rows[0].value) {
                // Use database password if it exists
                masterPassword = rows[0].value;
                console.log('Using database password');
            } else {
                console.log('Using environment variable password');
            }
        } catch (dbError) {
            console.error('Database check error:', dbError);
            // Continue with environment variable if database fails
        }

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
