
export interface UploadProgress {
    progress: number;
    status: 'uploading' | 'success' | 'error';
    url?: string;
    error?: string;
}

export const uploadService = {
    /**
     * Sube una imagen de producto al servidor local
     * @param file - Archivo de imagen a subir
     * @param truckId - ID del Food Truck
     * @param productId - ID del producto (opcional, se genera si no existe)
     * @param onProgress - Callback para reportar progreso
     * @returns URL pública de la imagen subida
     */
    async uploadProductImage(
        file: File,
        truckId: string,
        productId: string = `temp-${Date.now()}`,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<string> {
        // Validar archivo
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            throw new Error('Formato no válido. Solo JPG, PNG o WebP.');
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('La imagen es muy grande. Máximo 5MB.');
        }

        try {
            onProgress?.({ progress: 10, status: 'uploading' });

            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", `products/${truckId}`);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Error en la subida de imagen");
            }

            const data = await response.json();

            onProgress?.({ progress: 100, status: 'success', url: data.url });

            return data.url;

        } catch (error: any) {
            console.error('Error uploading image:', error);
            onProgress?.({
                progress: 0,
                status: 'error',
                error: error.message
            });
            throw error;
        }
    },

    /**
     * Elimina una imagen del servidor local (Placeholder)
     * @param imageUrl - URL completa de la imagen a eliminar
     */
    async deleteProductImage(imageUrl: string): Promise<void> {
        console.log("TODO: Implement DELETE /api/upload for", imageUrl);
        // For local dev, we can skip deletion or implement it later
    },

    /**
     * Comprime una imagen antes de subirla (opcional)
     * @param file - Archivo original
     * @param maxWidth - Ancho máximo en píxeles
     * @param quality - Calidad de compresión (0-1)
     * @returns Archivo comprimido
     */
    async compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Redimensionar si es necesario
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const compressedFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now()
                                });
                                resolve(compressedFile);
                            } else {
                                reject(new Error('Error al comprimir imagen'));
                            }
                        },
                        'image/jpeg',
                        quality
                    );
                };

                img.onerror = () => reject(new Error('Error al cargar imagen'));
            };

            reader.onerror = () => reject(new Error('Error al leer archivo'));
        });
    }
};
