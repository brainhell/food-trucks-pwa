"use client";

import { useEffect, useState } from "react";
import { getFoodTrucksByOwner, saveFoodTruck, FoodTruck } from "@/lib/services/foodTruckService";
import {
    Plus,
    Truck,
    MapPin,
    ChevronRight,
    Edit2,
    ExternalLink,
    X,
    Loader2,
    Save,
    Image as ImageIcon
} from "lucide-react";
import Link from "next/link";

export default function TrucksManagementPage() {
    const [trucks, setTrucks] = useState<FoodTruck[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTruck, setEditingTruck] = useState<Partial<FoodTruck> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const loadTrucks = async () => {
        try {
            const data = await getFoodTrucksByOwner("admin-user-123");
            setTrucks(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrucks();
    }, []);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTruck?.name) return;
        setIsSaving(true);
        try {
            const truckData = {
                name: editingTruck.name,
                description: editingTruck.description || "",
                slug: editingTruck.slug || generateSlug(editingTruck.name),
                active: editingTruck.active ?? true,
                ownerId: "admin-user-123",
                logoUrl: editingTruck.logoUrl || null,
                bannerUrl: editingTruck.bannerUrl || null,
                primaryColor: editingTruck.primaryColor || "#CC562A", // Default un poco más suave
                accentColor: editingTruck.accentColor || "#1e293b",
                id: editingTruck.id as any
            };
            await saveFoodTruck(truckData);
            await loadTrucks();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">Cargando tus negocios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="space-y-8 max-w-6xl mx-auto">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-800">Gestión de Food Trucks</h1>
                    <p className="text-slate-500 font-medium">Administra todos los negocios asociados al Hub.</p>
                </div>

                <button
                    onClick={() => { setEditingTruck({ active: true }); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-orange-100 hover:bg-primary/90 transition-all active:scale-95"
                >
                    <Plus size={20} /> Registrar Nuevo Truck
                </button>
            </div>

            {/* Trucks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trucks.map((truck) => (
                    <div key={truck.id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-100 transition-all overflow-hidden flex flex-col">
                        <div className="h-32 bg-slate-800 relative overflow-hidden">
                            {truck.bannerUrl ? (
                                <img src={truck.bannerUrl} alt="" className="w-full h-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                            )}
                            <div className="absolute -bottom-10 left-8">
                                <div className="h-20 w-20 bg-white rounded-3xl shadow-lg border-4 border-white flex items-center justify-center text-primary overflow-hidden">
                                    {truck.logoUrl ? (
                                        <img src={truck.logoUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Truck size={32} />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 pt-14 flex-1 flex flex-col space-y-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">{truck.name}</h3>
                                <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed line-clamp-2">{truck.description}</p>
                            </div>

                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                                <span className={`px-3 py-1 rounded-full ${truck.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {truck.active ? 'Abierto' : 'Cerrado'}
                                </span>
                                <span className="bg-gray-50 text-slate-400 px-3 py-1 rounded-full">
                                    Slug: {truck.slug}
                                </span>
                            </div>

                            <div className="pt-6 border-t border-gray-50 mt-auto flex items-center justify-between">
                                <Link
                                    href={`/menu/${truck.slug}`}
                                    className="flex items-center gap-2 text-primary font-black text-xs hover:gap-3 transition-all"
                                >
                                    VER MENÚ PÚBLICO <ExternalLink size={14} />
                                </Link>
                                <button
                                    onClick={() => { setEditingTruck(truck); setIsModalOpen(true); }}
                                    className="p-3 bg-gray-50 text-slate-400 rounded-2xl hover:text-primary hover:bg-orange-50 transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black">{editingTruck?.id ? 'Editar' : 'Registrar'} Food Truck</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Negocio</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Street Tacos"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold"
                                        value={editingTruck?.name || ''}
                                        onChange={(e) => setEditingTruck({ ...editingTruck, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción</label>
                                    <textarea
                                        placeholder="Breve descripción..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold h-24 resize-none"
                                        value={editingTruck?.description || ''}
                                        onChange={(e) => setEditingTruck({ ...editingTruck, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Slug Personalizado (Opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="mi-negocio-tacos"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold"
                                        value={editingTruck?.slug || ''}
                                        onChange={(e) => setEditingTruck({ ...editingTruck, slug: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Color Primario</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={editingTruck?.primaryColor || '#FF6B35'}
                                                onChange={(e) => setEditingTruck({ ...editingTruck, primaryColor: e.target.value })}
                                                className="h-12 w-12 rounded-xl border-none cursor-pointer p-0 overflow-hidden"
                                            />
                                            <input
                                                type="text"
                                                value={editingTruck?.primaryColor || '#FF6B35'}
                                                onChange={(e) => setEditingTruck({ ...editingTruck, primaryColor: e.target.value })}
                                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Color Acento</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={editingTruck?.accentColor || '#1e293b'}
                                                onChange={(e) => setEditingTruck({ ...editingTruck, accentColor: e.target.value })}
                                                className="h-12 w-12 rounded-xl border-none cursor-pointer p-0 overflow-hidden"
                                            />
                                            <input
                                                type="text"
                                                value={editingTruck?.accentColor || '#1e293b'}
                                                onChange={(e) => setEditingTruck({ ...editingTruck, accentColor: e.target.value })}
                                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <span className="font-bold text-slate-700">Estado Activo</span>
                                    <button
                                        type="button"
                                        onClick={() => setEditingTruck({ ...editingTruck, active: !editingTruck?.active })}
                                        className={`w-12 h-6 rounded-full relative transition-all ${editingTruck?.active !== false ? 'bg-primary' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${editingTruck?.active !== false ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {editingTruck?.id ? 'Guardar Cambios' : 'Registrar Food Truck'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
