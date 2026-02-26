"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllActiveFoodTrucks, FoodTruck } from "@/lib/services/foodTruckService";
import {
  Truck,
  ArrowRight,
  ShoppingBag,
  Star,
  MapPin,
  ShieldCheck,
  Zap,
  UtensilsCrossed,
  LayoutDashboard
} from "lucide-react";

export default function Home() {
  const [trucks, setTrucks] = useState<FoodTruck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrucks() {
      try {
        const activeTrucks = await getAllActiveFoodTrucks();
        setTrucks(activeTrucks);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadTrucks();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation / Header */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
            <ShoppingBag size={22} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-800">
            FoodTruck<span className="text-primary italic">Hub</span>
          </h1>
        </div>

        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-sm hover:bg-slate-50 transition-all shadow-sm"
        >
          <LayoutDashboard size={18} /> Panel Admin
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 space-y-20">
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest animate-in fade-in zoom-in duration-700">
            <Zap size={14} fill="currentColor" /> El Futuro de la Comida Callejera
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9]">
            Tu comunidad de <span className="text-primary italic">Food Trucks</span> en un solo lugar.
          </h2>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
            Explora los mejores sabores locales, pide desde tu mesa y disfruta de una experiencia gastronómica sin esperas.
          </p>
        </section>

        {/* Trucks Grid / Directory */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-800">Negocios Activos</h3>
              <p className="text-sm text-slate-400 font-medium italic">Encuentra tu sabor favorito hoy</p>
            </div>
            <div className="h-10 px-4 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-500">
              <MapPin size={14} className="text-primary" /> Venezuela, Caracas
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-slate-200 rounded-[2.5rem] animate-pulse" />
              ))}
            </div>
          ) : trucks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trucks.map(truck => (
                <Link
                  key={truck.id}
                  href={`/menu/${truck.slug}`}
                  className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-orange-100/30 transition-all overflow-hidden flex flex-col"
                >
                  <div className="h-32 bg-slate-800 relative overflow-hidden">
                    {truck.bannerUrl ? (
                      <img src={truck.bannerUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    <div className="absolute bottom-4 left-6 flex items-center gap-2">
                      <div className="h-12 w-12 bg-white rounded-xl shadow-lg flex items-center justify-center p-1.5 overflow-hidden">
                        {truck.logoUrl ? (
                          <img src={truck.logoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UtensilsCrossed className="text-primary" size={24} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-black text-lg tracking-tight leading-none">{truck.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={10} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Premium Vendor</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-2">
                      {truck.description || "Explora las especialidades de este Food Truck disponible hoy."}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-3 py-1 rounded-full">Abierto</span>
                        <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-3 py-1 rounded-full">Menu QR</span>
                      </div>
                      <div className="text-primary group-hover:translate-x-1 transition-transform">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <Truck size={64} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400">No hay Food Trucks activos en este momento</h3>
              <p className="text-slate-300 text-sm mt-2">Vuelve pronto para descubrir nuevos sabores.</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h1 className="text-2xl font-black tracking-tighter">
              FoodTruck<span className="text-primary italic">Hub</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Optimizando la eficiencia de las comunidades gastronómicas mediante tecnología de punta y procesos simplificados.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary">Para Negocios</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li><Link href="/admin/dashboard" className="hover:text-white transition-colors">Panel de Administración</Link></li>
              <li><button className="hover:text-white transition-colors">Registrar mi Food Truck</button></li>
              <li><button className="hover:text-white transition-colors">Planes y Precios (Spark)</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-primary" size={24} />
                <h4 className="font-bold text-sm">Plataforma Segura</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operamos sobre la infraestructura de Google Cloud para garantizar disponibilidad 24/7 y seguridad en tus datos.
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-medium">© 2026 FoodTruck Hub. Todos los derechos reservados.</p>
          <div className="flex gap-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <button className="hover:text-white transition-colors">Términos</button>
            <button className="hover:text-white transition-colors">Privacidad</button>
            <button className="hover:text-white transition-colors">Soporte</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
