import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
    try {
        // 1. Generate new random password
        const newMasterPassword = Math.random().toString(36).slice(-8).toUpperCase();

        // 2. Save to Google Sheets (GlobalSettings sheet)
        try {
            const sheet = await getSheetByTitle('GlobalSettings');
            const rows = await sheet.getRows();
            let row = rows.find((r: any) => r.get('key') === 'master_password');

            if (row) {
                row.set('value', newMasterPassword);
                await row.save();
            } else {
                await sheet.addRow({ key: 'master_password', value: newMasterPassword });
            }
        } catch (sheetError) {
            console.error('Error saving to GlobalSettings sheet:', sheetError);
        }

        // 3. Send real email via Resend API
        const RESEND_API_KEY = process.env.RESEND_API_KEY;

        if (!RESEND_API_KEY) {
            console.error('RESEND_API_KEY is missing in process.env');
            return NextResponse.json({
                success: true,
                message: 'Senha gerada no banco de dados, mas o e-mail não pôde ser enviado por falta de configuração (RESEND_API_KEY).',
                tempPassword: newMasterPassword
            });
        }

        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'OlinDelivery <onboarding@resend.dev>',
                    to: 'noecramos@gmail.com',
                    subject: 'Nova Senha Mestra - OlinDelivery',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
                            <h2 style="color: #EA1D2C;">Novo Acesso Master</h2>
                            <p>Sua nova senha mestra para o painel Super Admin foi gerada com sucesso:</p>
                            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 2px; color: #333;">
                                ${newMasterPassword}
                            </div>
                            <p style="color: #666; font-size: 12px; margin-top: 20px;">Se você não solicitou este reset, entre em contato com o suporte imediatamente.</p>
                        </div>
                    `,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('Resend API Error:', errorData);
                return NextResponse.json({
                    success: true,
                    message: `Senha gerada, mas Resend retornou erro: ${errorData.message || 'Erro desconhecido'}`,
                    tempPassword: newMasterPassword
                });
            }
        } catch (mailError: any) {
            console.error('Mail sending error:', mailError);
            return NextResponse.json({
                success: true,
                message: `Senha gerada, mas houve um erro técnico no envio: ${mailError.message}`,
                tempPassword: newMasterPassword
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Uma nova senha foi gerada e enviada para noecramos@gmail.com.'
        });
    } catch (e: any) {
        console.error('Reset master password error:', e);
        return NextResponse.json({ error: 'Falha ao resetar senha mestra: ' + e.message }, { status: 500 });
    }
}
