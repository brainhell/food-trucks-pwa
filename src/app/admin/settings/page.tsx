"use client";

import { useState } from "react";
import {
    Settings,
    User,
    Bell,
    Lock,
    Globe,
    Palette,
    Database,
    CreditCard,
    ChevronRight,
    CheckCircle2,
    RefreshCw
} from "lucide-react";

export default function SettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Simular guardado
        setTimeout(() => {
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1500);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-800">Ajustes</h1>
                    <p className="text-slate-500 font-medium">Configura tu perfil, preferencias y sistema de notificaciones.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-orange-100 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70"
                >
                    {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Settings size={20} />}
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
            </div>

            {showSuccess && (
                <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 className="text-green-500" size={20} />
                    <p className="text-green-800 font-bold text-sm">¡Configuración actualizada correctamente!</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                {/* Sección Perfil */}
                <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 text-slate-800">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                            <User size={24} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Perfil del Food Truck</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Negocio</label>
                            <input
                                type="text"
                                defaultValue="Gourmet Street Burger"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</label>
                            <input
                                type="email"
                                defaultValue="admin@foodtruckhub.com"
                                suppressHydrationWarning
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                </section>

                {/* Sección Notificaciones */}
                <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4 text-slate-800">
                        <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                            <Bell size={24} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Notificaciones</h2>
                    </div>

                    <div className="space-y-4">
                        <ToggleSetting
                            label="Sonido de Comanda Nueva"
                            desc="Reproducir una campana cada vez que ingrese un pedido."
                            defaultChecked={true}
                        />
                        <ToggleSetting
                            label="Alertas de Stock Bajo"
                            desc="Notificar cuando un ingrediente esté por agotarse."
                            defaultChecked={true}
                        />
                        <ToggleSetting
                            label="Resumen Diario de Ventas"
                            desc="Enviar un correo al cierre del día con el reporte PDF."
                            defaultChecked={false}
                        />
                    </div>
                </section>

                {/* Sección Sistema */}
                <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-4 text-slate-800 mb-2">
                        <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
                            <Database size={24} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Sistema y Datos</h2>
                    </div>

                    <div className="space-y-2 border-t border-gray-50 pt-6">
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group">
                            <div className="flex items-center gap-4">
                                <Lock className="text-slate-400" size={20} />
                                <span className="font-bold text-slate-700">Cambiar Contraseña</span>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group">
                            <div className="flex items-center gap-4">
                                <CreditCard className="text-slate-400" size={20} />
                                <span className="font-bold text-slate-700">Gestionar Plan (Spark)</span>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

function ToggleSetting({ label, desc, defaultChecked }: { label: string, desc: string, defaultChecked: boolean }) {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-orange-100 transition-all group">
            <div className="space-y-1">
                <p className="font-bold text-slate-800">{label}</p>
                <p className="text-xs text-slate-400 font-medium">{desc}</p>
            </div>
            <button
                onClick={() => setChecked(!checked)}
                className={`w-14 h-8 rounded-full relative transition-all duration-300 ${checked ? 'bg-primary shadow-lg shadow-orange-100' : 'bg-slate-200'
                    }`}
            >
                <div className={`absolute top-1 h-6 w-6 bg-white rounded-full shadow-sm transition-all duration-300 ${checked ? 'left-7' : 'left-1'
                    }`} />
            </button>
        </div>
    );
}
