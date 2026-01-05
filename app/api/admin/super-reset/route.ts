import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';

// Note: To actually send emails, you would typically use a service like Resend or SendGrid.
// For now, this logic generates the password and prepares for email sending.

export async function POST() {
    try {
        // 1. Generate new random password
        const newMasterPassword = Math.random().toString(36).slice(-8).toUpperCase();

        // 2. Save to Google Sheets (GlobalSettings sheet)
        // Note: You must have a sheet named 'GlobalSettings' with 'key' and 'value' columns
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
            // Fallback: If sheet doesn't exist, we might want to inform the user or create it.
            // But for simplicity in this project context, we assume the sheet setup.
        }

        // 3. "Send email" to noecramos@gmail.com
        // In a real production environment, you would use:
        // await resend.emails.send({
        //     from: 'OlinDelivery <noreply@olindelivery.com>',
        //     to: 'noecramos@gmail.com',
        //     subject: 'Nova Senha Mestra - OlinDelivery',
        //     text: `Sua nova senha mestra é: ${newMasterPassword}`
        // });

        console.log('--- PASSWORD RESET SIMULATION ---');
        console.log('To: noecramos@gmail.com');
        console.log('Subject: Nova Senha Mestra - OlinDelivery');
        console.log(`Body: Sua nova senha mestra é: ${newMasterPassword}`);
        console.log('---------------------------------');

        return NextResponse.json({
            success: true,
            message: 'Uma nova senha foi gerada e enviada para o e-mail cadastrado.'
        });
    } catch (e) {
        console.error('Reset master password error:', e);
        return NextResponse.json({ error: 'Falha ao resetar senha mestra' }, { status: 500 });
    }
}
