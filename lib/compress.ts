export async function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        // If not an image, return as is
        if (!file.type.match(/image.*/)) {
            return resolve(file);
        }

        // If file is already small (< 1MB), return as is
        if (file.size < 1024 * 1024) {
            return resolve(file);
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (readerEvent) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calc new dimensions
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas context missing'));

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);

                // Export as JPEG
                canvas.toBlob((blob) => {
                    if (!blob) return reject(new Error('Compression failed'));

                    // Create new File object
                    const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });

                    console.log(`Compressed: ${(file.size / 1024).toFixed(0)}KB -> ${(compressedFile.size / 1024).toFixed(0)}KB`);
                    resolve(compressedFile);
                }, 'image/jpeg', quality);
            };
            img.onerror = (e) => reject(e);
            img.src = readerEvent.target?.result as string;
        };
        reader.onerror = (e) => reject(e);
    });
}
