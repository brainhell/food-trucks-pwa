"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingBag,
    Settings,
    Menu as MenuIcon,
    QrCode,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Truck
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin/dashboard" },
        { name: "Trucks", icon: <Truck size={20} />, href: "/admin/trucks" },
        { name: "Pedidos", icon: <ShoppingBag size={20} />, href: "/admin/orders" },
        { name: "Menú", icon: <MenuIcon size={20} />, href: "/admin/menu-management" },
        { name: "Generar QRs", icon: <QrCode size={20} />, href: "/admin/qr-generator" },
        { name: "Ajustes", icon: <Settings size={20} />, href: "/admin/settings" },
    ];

    return (
        <aside className={`${isCollapsed ? 'w-24' : 'w-72'} bg-white border-r border-gray-100 transition-all duration-300 flex flex-col items-center py-10 relative hidden md:flex`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-12 bg-white border border-gray-100 rounded-full p-1.5 shadow-sm text-slate-400 hover:text-primary transition-colors"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Logo */}
            <div className={`mb-14 flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-8 w-full'}`}>
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <ShoppingBag size={22} />
                </div>
                {!isCollapsed && (
                    <h1 className="text-xl font-black tracking-tighter text-slate-800">
                        FoodTruck<span className="text-primary italic">Hub</span>
                    </h1>
                )}
            </div>

            {/* Navigation */}
            <nav className={`flex-1 space-y-2 w-full ${isCollapsed ? 'px-4' : 'px-6'}`}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all group ${isActive
                                ? 'bg-primary text-white shadow-xl shadow-orange-100'
                                : 'text-slate-400 hover:bg-gray-50 hover:text-slate-700'
                                }`}
                        >
                            <span className={`${isActive ? 'text-white' : 'group-hover:text-primary'}`}>
                                {item.icon}
                            </span>
                            {!isCollapsed && (
                                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / User */}
            <div className={`mt-auto w-full ${isCollapsed ? 'px-4' : 'px-6'}`}>
                <button className="flex items-center gap-4 p-4 w-full rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all group">
                    <LogOut size={20} />
                    {!isCollapsed && <span className="font-bold text-sm tracking-tight">Cerrar Sesión</span>}
                </button>
            </div>
        </aside>
    );
}
