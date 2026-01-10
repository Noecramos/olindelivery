import { NextResponse } from "next/server";
import { put } from '@vercel/blob';

export async function POST(request: Request) {
    console.log("=== Upload Request Started ===");

    try {
        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;

        if (!file) {
            console.error("No file in request");
            return NextResponse.json({
                success: false,
                message: "Nenhum arquivo foi enviado"
            }, { status: 400 });
        }

        console.log("File details:", {
            name: file.name,
            type: file.type,
            size: file.size
        });

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            console.error("Invalid file type:", file.type);
            return NextResponse.json({
                success: false,
                message: `Tipo de arquivo não permitido. Use: JPG, PNG, GIF ou WEBP`
            }, { status: 400 });
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            console.error("File too large:", file.size);
            return NextResponse.json({
                success: false,
                message: `Arquivo muito grande. Máximo: 5MB`
            }, { status: 400 });
        }

        // Sanitize filename
        const ext = file.name.split('.').pop();
        const nameWithoutExt = file.name.replace(`.${ext}`, '');
        const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '');
        const filename = `${Date.now()}-${safeName}.${ext}`;

        console.log("Uploading to Vercel Blob:", filename);

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
            addRandomSuffix: false,
        });

        console.log("=== Upload Successful ===", blob.url);

        return NextResponse.json({
            success: true,
            url: blob.url
        });
    } catch (error: any) {
        console.error("=== Upload Error ===");
        console.error("Error type:", error.constructor.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        return NextResponse.json({
            success: false,
            message: `Erro no servidor: ${error.message}`
        }, { status: 500 });
    }
}
