"use client";

import { useEffect, useState } from "react";
import { getFoodTrucksByOwner, FoodTruck } from "@/lib/services/foodTruckService";
import { updateOrderStatus, OrderWithItems, Order } from "@/lib/services/orderService";
import { reportService } from "@/lib/services/reportService";
import { getLowStockProducts, Product } from "@/lib/services/menuService";
import { useOrders } from "@/hooks/useOrders";
import {
    ShoppingBag,
    TrendingUp,
    Users,
    AlertCircle,
    PackageCheck,
    ChevronRight,
    Clock,
    UtensilsCrossed,
    Bell,
    CheckCircle2,
    FileDown,
    Calendar
} from "lucide-react";

export default function AdminDashboard() {
    const [trucks, setTrucks] = useState<FoodTruck[]>([]);
    const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [lastNotification, setLastNotification] = useState<string | null>(null);

    // Initial load
    useEffect(() => {
        async function initDashboard() {
            try {
                const truckData = await getFoodTrucksByOwner("admin-user-123");
                setTrucks(truckData);

                if (truckData.length > 0 && !selectedTruckId) {
                    setSelectedTruckId(truckData[0].id!);
                }
            } catch (error) {
                console.error(error);
            }
        }
        initDashboard();
    }, []);

    // Real-time hook for orders
    const { orders, loading: ordersLoading } = useOrders(selectedTruckId || "");

    // Stock alerts and notifications
    useEffect(() => {
        const audio = new Audio("/sounds/bell.mp3");

        async function refreshExtras() {
            if (!selectedTruckId) return;

            // Check for low stock
            const lowStock = await getLowStockProducts(selectedTruckId);
            setLowStockProducts(lowStock);

            // Handle audio notification for new orders
            if (orders.length > 0) {
                const newestId = orders[0].id;
                if (lastNotification && newestId !== lastNotification && orders[0].status === 'pending') {
                    audio.play().catch(e => console.log("Audio play blocked:", e));
                }
                setLastNotification(newestId);
            }
        }

        refreshExtras();
    }, [selectedTruckId, orders, lastNotification]);

    const handleUpdateStatus = async (orderId: string, status: OrderWithItems['status']) => {
        try {
            await updateOrderStatus(orderId, status);
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const todaySales = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + Number(o.total), 0);

    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;

    if (ordersLoading && orders.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">Cargando panel de control...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-10 px-4 md:px-0">
            {/* Bienvenida Premium */}
            <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-[#1E293B] text-white overflow-hidden shadow-2xl shadow-slate-200">
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Sistema Activo</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">¡Hola de nuevo, Jefe! 👋</h1>
                        <p className="text-slate-400 text-lg max-w-xl">Gestiona tus operaciones y visualiza el rendimiento de tu flota de Food Trucks en tiempo real.</p>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {trucks.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTruckId(t.id!)}
                                    className={`px-6 py-3 rounded-2xl border transition-all flex items-center gap-3 whitespace-nowrap ${selectedTruckId === t.id
                                        ? 'bg-white text-slate-900 border-white shadow-lg'
                                        : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    <div className={`h-2 w-2 rounded-full ${selectedTruckId === t.id ? 'bg-primary animate-pulse shadow-[0_0_10px_#FF6B35]' : 'bg-slate-500'}`} />
                                    <span className="font-bold text-sm">{t.name}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                const activeTruck = trucks.find(t => t.id === selectedTruckId);
                                reportService.generateDailySalesReport(activeTruck?.name || "Mi Food Truck", orders, new Date());
                            }}
                            className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl shadow-orange-950/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                        >
                            <FileDown size={20} />
                            Reporte Diario
                        </button>
                    </div>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[20%] w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Ventas Acumuladas"
                    value={`$${todaySales.toFixed(2)}`}
                    icon={<TrendingUp size={24} />}
                    trend="Total en sistema"
                    color="text-primary"
                    bgColor="bg-orange-50"
                />
                <StatCard
                    title="Pedidos Activos"
                    value={pendingOrders.toString()}
                    icon={<ShoppingBag size={24} />}
                    trend="Requieren atención"
                    color="text-secondary"
                    bgColor="bg-green-50"
                />
                <StatCard
                    title="Clientes Hoy"
                    value={Array.from(new Set(orders.map(o => o.customerName))).length.toString()}
                    icon={<Users size={24} />}
                    trend="Invitados únicos"
                    color="text-blue-500"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Alertas Stock"
                    value="2"
                    icon={<AlertCircle size={24} />}
                    trend="Acción requerida"
                    color="text-red-500"
                    bgColor="bg-red-50"
                    alert
                />
            </div>

            {/* Main Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pedidos Recientes en Tiempo Real */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight">Monitor de Pedidos</h2>
                            <p className="text-muted-foreground text-sm flex items-center gap-1.5 font-medium">
                                <Bell size={14} className="text-primary animate-bounce" />
                                {orders.length > 0 ? 'Recibiendo pedidos en vivo' : 'Esperando primer pedido...'}
                            </p>
                        </div>
                        <button className="flex items-center gap-2 text-primary text-sm font-black uppercase tracking-widest hover:gap-3 transition-all">
                            Historial <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="py-20 text-center space-y-4 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
                                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-gray-300">
                                    <ShoppingBag size={32} />
                                </div>
                                <p className="text-gray-400 font-medium">Aún no hay pedidos registrados.</p>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50/50 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-gray-100/50 hover:border-orange-100 border border-transparent transition-all gap-4">
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <UtensilsCrossed size={24} className="text-slate-400 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">
                                                {order.customerName} <span className="text-slate-400 font-medium ml-2">#{order.tableNumber}</span>
                                            </h4>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {order.items.map((item, idx) => (
                                                    <span key={idx} className="text-[10px] bg-white px-2 py-0.5 rounded-lg border border-gray-100 font-bold text-slate-500">
                                                        {item.quantity}x {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 md:min-w-[280px]">
                                        <span className="text-xl font-black text-slate-800">${order.total.toFixed(2)}</span>

                                        <select
                                            value={order.status}
                                            onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderWithItems['status'])}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${order.status === 'pending' ? 'bg-orange-100 text-orange-700 focus:ring-orange-200' :
                                                order.status === 'preparing' ? 'bg-blue-100 text-blue-700 focus:ring-blue-200' :
                                                    order.status === 'ready' ? 'bg-green-100 text-green-700 focus:ring-green-200' :
                                                        order.status === 'delivered' ? 'bg-slate-100 text-slate-700 focus:ring-slate-200' :
                                                            'bg-red-100 text-red-700 focus:ring-red-200'
                                                }`}
                                        >
                                            <option value="pending">Pendiente</option>
                                            <option value="preparing">Preparando</option>
                                            <option value="ready">Listo</option>
                                            <option value="delivered">Entregado</option>
                                            <option value="cancelled">Cancelado</option>
                                        </select>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Notificaciones y Stock */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-xl font-black flex items-center gap-3">
                            <PackageCheck className="text-secondary" />
                            Gestión de Stock
                        </h2>
                        <div className="space-y-4">
                            {lowStockProducts.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">Todo el inventario está en niveles óptimos.</p>
                            ) : (
                                lowStockProducts.slice(0, 3).map(p => (
                                    <AlertItem
                                        key={p.id}
                                        title={p.name}
                                        status={p.stock === 0 ? "Agotado" : "Bajo Stock"}
                                        desc={p.stock === 0 ? "Reponer inmediatamente" : `${p.stock} unidades restantes`}
                                        type={p.stock === 0 ? "error" : "warning"}
                                    />
                                ))
                            )}
                        </div>
                        <button className="w-full py-4 bg-gray-50 text-slate-600 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-colors">
                            Ver Inventario Completo
                        </button>
                    </div>

                    <div className="bg-primary p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-orange-100 overflow-hidden relative">
                        <h3 className="text-xl font-black relative z-10">Monitor Activo</h3>
                        <p className="text-orange-100 text-sm leading-relaxed relative z-10">
                            Estás viendo los pedidos en tiempo real. Los cambios de estado notifican al cliente.
                        </p>
                        <TrendingUp size={80} className="absolute bottom-[-20px] right-[-20px] text-white/10 rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend, color, bgColor, alert = false }: any) {
    return (
        <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/50 transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className={`p-4 ${bgColor} ${color} rounded-2xl`}>{icon}</div>
                {alert && <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping" />}
            </div>
            <div className="mt-6">
                <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-3xl font-black tracking-tighter text-slate-800">{value}</h3>
            </div>
            <p className="mt-4 text-[11px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-xl w-fit">
                {trend}
            </p>
        </div>
    )
}

function AlertItem({ title, status, desc, type }: any) {
    const isError = type === 'error';
    return (
        <div className={`p-5 rounded-3xl border ${isError ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'} space-y-1`}>
            <div className="flex justify-between items-center">
                <p className={`text-sm font-black ${isError ? 'text-red-800' : 'text-orange-800'}`}>{title}</p>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isError ? 'text-red-500' : 'text-orange-500'}`}>
                    {status}
                </span>
            </div>
            <p className={`text-[11px] font-medium ${isError ? 'text-red-600' : 'text-orange-600'}`}>{desc}</p>
        </div>
    )
}
