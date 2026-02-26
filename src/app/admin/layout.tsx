import { ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Panel de Control</span>
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">Administración</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-sm font-bold text-slate-800">Admin Jefe</span>
                            <span className="text-[10px] text-primary font-black uppercase tracking-widest">Plan Spark</span>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-primary font-black shadow-sm">
                            AJ
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide">
                    {children}
                </div>
            </main>
        </div>
    );
}
