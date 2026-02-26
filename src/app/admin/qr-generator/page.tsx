"use client";

import { useEffect, useState } from "react";
import { getFoodTrucksByOwner, FoodTruck } from "@/lib/services/foodTruckService";
import { QrCode, Copy, Download, MapPin, ExternalLink, RefreshCw, Truck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function QRGeneratorPage() {
    const [trucks, setTrucks] = useState<FoodTruck[]>([]);
    const [selectedTruck, setSelectedTruck] = useState<FoodTruck | null>(null);
    const [loading, setLoading] = useState(true);
    const [table, setTable] = useState("");
    const [generatedUrl, setGeneratedUrl] = useState("");

    // Detectar URL base automáticamente (útil para red local)
    const [baseUrl, setBaseUrl] = useState("http://localhost:3000");

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(`${window.location.protocol}//${window.location.host}`);
        }

        async function init() {
            try {
                const data = await getFoodTrucksByOwner("admin-user-123");
                setTrucks(data);
                if (data.length > 0) {
                    setSelectedTruck(data[0]);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    const handleGenerate = () => {
        if (!selectedTruck) return;
        const url = new URL(`${baseUrl}/menu/${selectedTruck.slug}`);
        if (table) {
            url.searchParams.append("table", table);
        }
        setGeneratedUrl(url.toString());
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedUrl);
        alert("¡Enlace copiado al portapapeles!");
    };

    const downloadQR = () => {
        const svg = document.getElementById("qr-code-svg");
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");

            const downloadLink = document.createElement("a");
            downloadLink.download = `QR-${selectedTruck?.slug || 'Truck'}-${table || 'Menu'}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">Preparando generador...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter text-slate-800">Generador de QRs Reales</h1>
                <p className="text-slate-500 font-medium">Crea códigos QR funcionales para cada uno de tus Food Trucks.</p>
            </div>

            {/* Selector de Truck */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                <label className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Truck size={16} /> Selecciona el Food Truck
                </label>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {trucks.map(t => (
                        <button
                            key={t.id}
                            onClick={() => { setSelectedTruck(t); setGeneratedUrl(""); }}
                            className={`px-6 py-3 rounded-2xl border transition-all flex items-center gap-3 whitespace-nowrap ${selectedTruck?.id === t.id
                                ? 'bg-primary text-white border-primary shadow-lg shadow-orange-100'
                                : 'bg-white text-slate-400 border-gray-100 hover:bg-gray-50'
                                }`}
                        >
                            <span className="font-bold text-sm">{t.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="space-y-4">
                        <label className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <MapPin size={16} /> Identificador de Mesa
                        </label>
                        <input
                            type="text"
                            placeholder="Ej. Mesa-01 o VIP-A"
                            value={table}
                            onChange={(e) => setTable(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <p className="text-[10px] text-slate-400 font-medium italic">
                            El QR dirigirá a: <span className="text-primary">{baseUrl}/menu/{selectedTruck?.slug}</span>
                        </p>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!selectedTruck}
                        className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-100/50 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <RefreshCw size={20} /> Generar Código QR
                    </button>
                </div>

                {generatedUrl && (
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 flex flex-col items-center animate-in zoom-in-95 duration-300">
                        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-inner">
                            <QRCodeSVG
                                id="qr-code-svg"
                                value={generatedUrl}
                                size={200}
                                level="H"
                                includeMargin={true}
                                imageSettings={{
                                    src: "/favicon.ico",
                                    height: 24,
                                    width: 24,
                                    excavate: true,
                                }}
                            />
                        </div>

                        <div className="w-full space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-slate-400">Escanea para {selectedTruck?.name}</p>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={downloadQR}
                                    className="flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all"
                                >
                                    <Download size={16} /> Bajar Imagen
                                </button>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all"
                                >
                                    <Copy size={16} /> Copiar Link
                                </button>
                            </div>

                            <a
                                href={generatedUrl}
                                target="_blank"
                                className="w-full flex items-center justify-center gap-2 py-3 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary/90 transition-all"
                            >
                                <ExternalLink size={16} /> Probar en el Navegador
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {!generatedUrl && (
                <div className="py-20 flex flex-col items-center justify-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                    <QrCode size={64} className="text-gray-300 mb-4" />
                    <p className="text-gray-400 font-semibold tracking-tight text-center px-6">
                        {selectedTruck ? `Pulsa el botón para generar el QR de ${selectedTruck.name}` : 'Selecciona un truck arriba para comenzar'}
                    </p>
                </div>
            )}
        </div>
    );
}
