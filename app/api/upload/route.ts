import { NextResponse } from "next/server";
import { writeFile, mkdir, access } from "fs/promises";
import path from "path";
import { constants } from "fs";

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

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename
        const ext = path.extname(file.name);
        const nameWithoutExt = path.basename(file.name, ext);
        const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '');
        const filename = `${Date.now()}-${safeName}${ext}`;

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        console.log("Upload directory:", uploadDir);

        // Ensure directory exists
        try {
            await access(uploadDir, constants.W_OK);
            console.log("Upload directory is writable");
        } catch {
            console.log("Creating upload directory...");
            await mkdir(uploadDir, { recursive: true });
            console.log("Upload directory created");
        }

        const filepath = path.join(uploadDir, filename);
        console.log("Writing file to:", filepath);

        await writeFile(filepath, buffer);
        console.log("File written successfully");

        // Use API route for serving images (more reliable in dev mode)
        const url = `/api/images/${filename}`;
        console.log("=== Upload Successful ===", url);

        return NextResponse.json({
            success: true,
            url
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
