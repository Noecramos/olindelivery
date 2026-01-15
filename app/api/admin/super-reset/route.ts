import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
    try {
        // Generate a new random password
        const newPassword = Math.random().toString(36).slice(-10);

        // Save to database (global_settings table)
        await sql`
            INSERT INTO global_settings (key, value)
            VALUES ('super_admin_password', ${newPassword})
            ON CONFLICT (key) 
            DO UPDATE SET value = ${newPassword}
        `;

        // Send email using Resend API
        const resendApiKey = process.env.RESEND_API_KEY;

        if (resendApiKey) {
            try {
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'OlinDelivery <onboarding@resend.dev>',
                        to: ['noecramos@gmail.com'],
                        subject: 'OlinDelivery - Nova Senha de Super Admin',
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #EA1D2C;">🔐 Nova Senha de Super Admin</h2>
                                <p>Sua senha de super administrador foi resetada com sucesso.</p>
                                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0; font-size: 14px; color: #666;">Nova Senha:</p>
                                    <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #EA1D2C; font-family: monospace;">${newPassword}</p>
                                </div>
                                <p style="color: #666; font-size: 14px;">
                                    Por favor, guarde esta senha em um local seguro.<br>
                                    Acesse: <a href="https://olindelivery.vercel.app/admin/super">https://olindelivery.vercel.app/admin/super</a>
                                </p>
                                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                                <p style="color: #999; font-size: 12px;">
                                    © 2025 OlinDelivery - Sistema de Gestão
                                </p>
                            </div>
                        `
                    })
                });

                const result = await response.json();
                console.log('Resend API response:', result);

                if (response.ok) {
                    return NextResponse.json({
                        success: true,
                        message: 'Nova senha gerada e enviada para o e-mail cadastrado com sucesso!',
                        emailId: result.id,
                        tempPassword: newPassword // Include password in response for now
                    });
                } else {
                    console.error('Resend API error:', result);
                    // If email fails, return the password in the response
                    return NextResponse.json({
                        success: true,
                        message: 'Nova senha gerada, mas não foi possível enviar o e-mail.',
                        tempPassword: newPassword,
                        error: result
                    });
                }
            } catch (emailError) {
                console.error('Email error:', emailError);
                // If email fails, return the password in the response
                return NextResponse.json({
                    success: true,
                    message: 'Nova senha gerada, mas não foi possível enviar o e-mail.',
                    tempPassword: newPassword
                });
            }
        } else {
            // Email not configured, return password in response
            return NextResponse.json({
                success: true,
                message: 'Nova senha gerada com sucesso!',
                tempPassword: newPassword
            });
        }
    } catch (error: any) {
        console.error('Password reset error:', error);
        return NextResponse.json({
            error: 'Erro ao resetar senha: ' + error.message
        }, { status: 500 });
    }
}
