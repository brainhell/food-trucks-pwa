"use client";

import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus, OrderWithItems } from "@/lib/services/orderService";
import { getFoodTrucksByOwner, FoodTruck } from "@/lib/services/foodTruckService";
import {
    ShoppingBag,
    Clock,
    CheckCircle2,
    AlertCircle,
    Filter,
    Search,
    ChevronRight,
    MoreVertical,
    UtensilsCrossed,
    MapPin,
    Calendar,
    Truck
} from "lucide-react";

export default function OrdersPage() {
    const [trucks, setTrucks] = useState<FoodTruck[]>([]);
    const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<OrderWithItems['status'] | 'all'>('all');
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);

    // Initial load of trucks
    useEffect(() => {
        async function init() {
            try {
                const data = await getFoodTrucksByOwner("admin-user-123");
                setTrucks(data);
                if (data.length > 0 && !selectedTruckId) {
                    setSelectedTruckId(data[0].id);
                }
            } catch (error) {
                console.error(error);
            }
        }
        init();
    }, []);

    // Polling for orders
    useEffect(() => {
        const audio = new Audio("/sounds/bell.mp3");
        if (!selectedTruckId) return;

        const fetchOrders = async () => {
            try {
                const newOrders = await getOrders(selectedTruckId);

                if (newOrders.length > 0) {
                    const newestId = newOrders[0].id;

                    if (lastOrderId && newestId !== lastOrderId && newOrders[0].status === 'pending') {
                        audio.play().catch(e => console.log("Audio notify blocked:", e));
                    }
                    setLastOrderId(newestId);
                }
                setOrders(newOrders);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };

        // Initial fetch
        fetchOrders();

        // Interval
        const intervalId = setInterval(fetchOrders, 5000);

        return () => clearInterval(intervalId);
    }, [selectedTruckId, lastOrderId]);

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);

    const handleUpdateStatus = async (orderId: string, status: OrderWithItems['status']) => {
        try {
            await updateOrderStatus(orderId, status);
            // Re-fetch orders immediately to update UI state properly (especially for moved items)
            if (selectedTruckId) {
                const updatedOrders = await getOrders(selectedTruckId);
                setOrders(updatedOrders);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-800">Historial de Pedidos</h1>
                    <p className="text-slate-500 font-medium">Gestiona y filtra todas las comandas recibidas.</p>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {trucks.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTruckId(t.id)}
                                className={`px-6 py-3 rounded-2xl border transition-all flex items-center gap-3 whitespace-nowrap ${selectedTruckId === t.id
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-orange-100'
                                    : 'bg-white text-slate-400 border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`h-2 w-2 rounded-full ${selectedTruckId === t.id ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
                                <span className="font-bold text-sm tracking-tight">{t.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto scrollbar-hide">
                        {['all', 'pending', 'preparing', 'ready', 'delivered'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f
                                    ? 'bg-slate-800 text-white shadow-lg shadow-slate-200'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-gray-50'
                                    }`}
                            >
                                {f === 'all' ? 'Todos' :
                                    f === 'pending' ? 'Pendientes' :
                                        f === 'preparing' ? 'Cocina' :
                                            f === 'ready' ? 'Listos' : 'Entregados'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                        <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold">No hay pedidos que coincidan con el filtro.</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-gray-100/50 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-5">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${order.status === 'pending' ? 'bg-orange-50 text-orange-500' :
                                        order.status === 'preparing' ? 'bg-blue-50 text-blue-500' :
                                            order.status === 'ready' ? 'bg-green-50 text-green-500' :
                                                'bg-slate-50 text-slate-400'
                                        }`}>
                                        <UtensilsCrossed size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-black text-slate-800 tracking-tight">{order.customerName}</h3>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-widest ">
                                                #{order.id?.slice(-4)}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-500">
                                            <span className="flex items-center gap-1.5 text-primary font-bold">
                                                <MapPin size={14} /> {order.tableNumber ?? "Sin mesa"}
                                            </span>
                                            {/* Date handling: Prisma dates are Date objects but checking just in case */}
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={14} /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="space-y-1 md:text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pedido</p>
                                        <p className="text-2xl font-black text-slate-800">${Number(order.total).toFixed(2)}</p>
                                    </div>

                                    <div className="h-10 w-[1px] bg-gray-100 hidden md:block" />

                                    <div className="flex items-center gap-3">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderWithItems['status'])}
                                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer focus:outline-none transition-all ${order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'ready' ? 'bg-green-100 text-green-700' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}
                                        >
                                            <option value="pending">🔔 Pendiente</option>
                                            <option value="preparing">🍳 Preparando</option>
                                            <option value="ready">✅ Listo</option>
                                            <option value="delivered">📦 Entregado</option>
                                            <option value="cancelled">❌ Cancelado</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Detalle de Items */}
                            <div className="mt-6 pt-6 border-t border-gray-50 flex flex-wrap gap-3">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-3">
                                        <span className="h-6 w-6 bg-white rounded-lg flex items-center justify-center text-xs font-black text-primary border border-gray-100 shadow-sm">
                                            {item.quantity}
                                        </span>
                                        <span className="text-sm font-bold text-slate-700">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function Loader() {
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">Cargando pedidos...</p>
        </div>
    );
}
