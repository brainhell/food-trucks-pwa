"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Escuchar evento de instalación
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Mostrar prompt solo si no se ha instalado antes
            const hasDeclined = localStorage.getItem('pwa-install-declined');
            if (!hasDeclined) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Detectar si ya está instalada
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowPrompt(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('Usuario aceptó instalar la PWA');
        } else {
            console.log('Usuario rechazó instalar la PWA');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-declined', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-gradient-to-br from-primary to-orange-600 text-white p-6 rounded-3xl shadow-2xl border-2 border-white/20">
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-xl transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                        <Download size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-black text-lg mb-1">¡Instala nuestra app!</h3>
                        <p className="text-white/90 text-sm mb-4 leading-relaxed">
                            Accede más rápido, recibe notificaciones de tus pedidos y úsala sin conexión.
                        </p>
                        <button
                            onClick={handleInstall}
                            className="w-full bg-white text-primary px-5 py-3 rounded-2xl font-black text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            Instalar Ahora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
