"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadService, UploadProgress } from "@/lib/services/uploadService";

interface ImageUploaderProps {
    currentImageUrl?: string;
    truckId: string;
    productId?: string;
    onImageUploaded: (url: string) => void;
    onImageRemoved?: () => void;
}

export default function ImageUploader({
    currentImageUrl,
    truckId,
    productId,
    onImageUploaded,
    onImageRemoved
}: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<UploadProgress | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file) return;

        // Validar tipo
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Formato no válido. Solo JPG, PNG o WebP.');
            return;
        }

        // Validar tamaño
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            alert('La imagen es muy grande. Máximo 2MB.');
            return;
        }

        // Mostrar preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Subir imagen
        setUploading(true);
        try {
            // Comprimir antes de subir
            const compressedFile = await uploadService.compressImage(file, 1200, 0.85);

            const url = await uploadService.uploadProductImage(
                compressedFile,
                truckId,
                productId,
                (progressData) => {
                    setProgress(progressData);
                }
            );

            onImageUploaded(url);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(error instanceof Error ? error.message : 'Error al subir imagen');
            setPreview(currentImageUrl || null);
        } finally {
            setUploading(false);
            setProgress(null);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onImageRemoved?.();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Imagen del Producto
            </label>

            {preview ? (
                <div className="relative group">
                    <div className="relative h-48 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        {uploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <div className="text-center space-y-3">
                                    <Loader2 className="animate-spin text-white mx-auto" size={32} />
                                    <div className="text-white font-bold text-sm">
                                        {progress?.progress ? `${Math.round(progress.progress)}%` : 'Subiendo...'}
                                    </div>
                                    {progress && progress.progress > 0 && (
                                        <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-300"
                                                style={{ width: `${progress.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {!uploading && (
                        <div className="absolute top-3 right-3 flex gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
                                title="Cambiar imagen"
                            >
                                <Upload size={16} className="text-slate-600" />
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="p-2 bg-white rounded-xl shadow-lg hover:bg-red-50 transition-colors"
                                title="Eliminar imagen"
                            >
                                <X size={16} className="text-red-600" />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                        }`}
                >
                    <ImageIcon size={48} className={dragActive ? 'text-primary' : 'text-gray-300'} />
                    <p className="mt-4 text-sm font-bold text-slate-600">
                        {dragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic'}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">JPG, PNG o WebP • Máx 2MB</p>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleChange}
                className="hidden"
            />

            {progress?.status === 'success' && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 px-4 py-2 rounded-xl">
                    <CheckCircle2 size={16} />
                    Imagen subida exitosamente
                </div>
            )}

            {progress?.status === 'error' && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 px-4 py-2 rounded-xl">
                    <AlertCircle size={16} />
                    {progress.error || 'Error al subir imagen'}
                </div>
            )}
        </div>
    );
}
