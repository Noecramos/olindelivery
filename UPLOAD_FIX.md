# Upload Image Fix

## Changes Made:

### 1. Enhanced Upload Route (`/api/upload/route.ts`)
- ✅ Added file type validation (JPG, PNG, GIF, WEBP only)
- ✅ Added file size validation (5MB max)
- ✅ Improved filename sanitization
- ✅ Better error messages in Portuguese
- ✅ Comprehensive logging for debugging
- ✅ Directory write permission check

### 2. Next.js Configuration
- ✅ Added `bodySizeLimit: '10mb'` for larger uploads
- ✅ Configured experimental server actions

## How to Test:

1. **Go to:** `http://localhost:3000/register`
2. **Fill in the form**
3. **Click "Logo da Loja" file input**
4. **Select an image** (JPG, PNG, GIF, or WEBP)
5. **Watch for:**
   - "Enviando imagem..." message
   - Image preview appears
   - No error alerts

## Check Server Logs:

You should see in the terminal:
```
=== Upload Request Started ===
File details: { name: 'logo.png', type: 'image/png', size: 12345 }
Upload directory: D:\Antigravity\olindelivery\public\uploads
Upload directory is writable
Writing file to: D:\Antigravity\olindelivery\public\uploads\1234567890-logo.png
File written successfully
=== Upload Successful === /uploads/1234567890-logo.png
```

## If Still Getting 500 Error:

### Check the Console Output
The error message will now be very specific:
- "Tipo de arquivo não permitido" = Wrong file type
- "Arquivo muito grande" = File too large
- "Erro no servidor: [message]" = Server error with details

### Common Issues:

1. **File Type**
   - Only JPG, PNG, GIF, WEBP allowed
   - Check file extension matches content

2. **File Size**
   - Maximum 5MB
   - Compress image if needed

3. **Permissions**
   - Windows may block write access
   - Check `public/uploads` folder permissions

4. **Server Restart**
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again
   - Try upload again

## Restart Required!

After these changes, **restart the development server**:
1. Stop: Press `Ctrl+C` in the terminal
2. Start: Run `npm run dev`
3. Test upload again
