import { storage } from "../firebase/config";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

export interface UploadProgress {
    progress: number;
    status: 'uploading' | 'success' | 'error';
    url?: string;
    error?: string;
}

export const uploadService = {
    /**
     * Sube una imagen a Firebase Storage
     * @param file - Archivo de imagen a subir
     * @param truckId - ID del Food Truck
     * @param path - Ruta en el bucket (ej: 'products', 'logos')
     * @param onProgress - Callback para reportar progreso
     * @returns URL pública de la imagen subida
     */
    async uploadImage(
        file: File,
        truckId: string,
        path: string = 'products',
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

        return new Promise((resolve, reject) => {
            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `${path}/${truckId}/${fileName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress?.({ progress, status: 'uploading' });
                },
                (error) => {
                    console.error('Error uploading image:', error);
                    onProgress?.({
                        progress: 0,
                        status: 'error',
                        error: error.message
                    });
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    onProgress?.({ progress: 100, status: 'success', url: downloadURL });
                    resolve(downloadURL);
                }
            );
        });
    },

    /**
     * Elimina una imagen de Firebase Storage
     * @param imageUrl - URL completa de la imagen a eliminar
     */
    async deleteImage(imageUrl: string): Promise<void> {
        try {
            // Extraer el path de la URL de Firebase Storage si es posible, 
            // o simplemente usar la URL si el SDK lo permite.
            // Para simplicidad, intentamos crear una referencia desde la URL.
            const storageRef = ref(storage, imageUrl);
            await deleteObject(storageRef);
        } catch (error) {
            console.error("Error deleting image from Storage:", error);
        }
    },

    /**
     * Comprime una imagen antes de subirla
     */
    async compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
        if (typeof window === 'undefined') return file; // Guard for SSR

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
