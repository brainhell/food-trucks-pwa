"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getFoodTruckBySlug, FoodTruck } from "@/lib/services/foodTruckService";
import { getFullMenu, Category, Product } from "@/lib/services/menuService";
import { createOrder, getOrder, Order, OrderItem } from "@/lib/services/orderService";
import {
    Store,
    UtensilsCrossed,
    Plus,
    Minus,
    Loader2,
    Image as ImageIcon,
    ShoppingBag,
    X,
    ChevronRight,
    CheckCircle2,
    MapPin,
    Clock,
    PackageCheck,
    Truck
} from "lucide-react";

interface MenuCategory extends Category {
    products: Product[];
}

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export default function PublicMenuPage() {
    const { slug } = useParams();
    const searchParams = useSearchParams();
    const tableFromUrl = searchParams.get("table");

    const [truck, setTruck] = useState<FoodTruck | null>(null);
    const [menu, setMenu] = useState<MenuCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [tableNumber, setTableNumber] = useState(tableFromUrl || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // Order Tracking State
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);

    // Cargar pedido activo desde localStorage al iniciar
    useEffect(() => {
        const key = `activeOrder_${slug}`;
        const savedOrderId = localStorage.getItem(key);
        console.log(`[PublicMenu] Buscando pedido activo en localStorage (${key}):`, savedOrderId);
        if (savedOrderId) {
            setActiveOrderId(savedOrderId);
        }
    }, [slug]);

    // Polling del pedido activo
    useEffect(() => {
        if (!activeOrderId) return;

        console.log(`[PublicMenu] Iniciando polling para: ${activeOrderId}`);

        const fetchOrder = async () => {
            const order = await getOrder(activeOrderId);
            if (order) {
                console.log(`[PublicMenu] Estado actual: ${order.status}`);
                setActiveOrder(order);
            }
        };

        // Primera carga inmediata
        fetchOrder();

        // Polling cada 5 segundos
        const intervalId = setInterval(fetchOrder, 5000);

        return () => {
            console.log(`[PublicMenu] Limpiando polling de: ${activeOrderId}`);
            clearInterval(intervalId);
        };
    }, [activeOrderId]);

    useEffect(() => {
        if (tableFromUrl) setTableNumber(tableFromUrl);
    }, [tableFromUrl]);

    useEffect(() => {
        async function loadData() {
            if (!slug) return;
            try {
                const truckData = await getFoodTruckBySlug(slug as string);
                if (truckData) {
                    setTruck(truckData);
                    const fullMenu = await getFullMenu(truckData.id!);
                    setMenu(fullMenu as MenuCategory[]);
                }
            } catch (error) {
                console.error("Error loading menu:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [slug]);

    const addToCart = (product: Product) => {
        const inCart = cart.find(item => item.productId === product.id);
        const currentQty = inCart ? inCart.quantity : 0;

        if (product.stock !== null && product.stock !== undefined && currentQty >= product.stock) {
            return; // No permitir añadir más del stock disponible
        }

        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                productId: product.id!,
                name: product.name,
                price: Number(product.price),
                quantity: 1
            }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === productId);
            if (existing && existing.quantity > 1) {
                return prev.map(item =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prev.filter(item => item.productId !== productId);
        });
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleSubmitOrder = async () => {
        if (!truck || cart.length === 0) return;

        setIsSubmitting(true);
        try {
            const orderId = await createOrder({
                foodTruckId: truck.id!,
                items: cart,
                total: cartTotal,
                // status: 'pending', // Removed as it's set by default in server action or passed if needed
                customerName: customerName || "Cliente Anónimo",
                // tableNumber: tableNumber || "N/A" // Add tableNumber to CreateOrderInput interface in orderService if needed, otherwise this might be lost
            } as any); // Type assertion if interface mismatches, currently CreateOrderInput has items, total, customerName. tableNumber might need added.

            // Guardar en persistence y estado
            localStorage.setItem(`activeOrder_${slug}`, orderId);
            setActiveOrderId(orderId);

            setOrderSuccess(true);
            setCart([]);
            setTimeout(() => {
                setOrderSuccess(false);
                setIsCartOpen(false);
            }, 3000);
        } catch (error) {
            console.error("Error submitting order:", error);
            alert("Hubo un error al enviar tu pedido. Por favor intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin h-12 w-12 text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Cargando el menú...</p>
            </div>
        );
    }

    if (!truck) {
        return (
            <div className="text-center py-20 px-6 space-y-6">
                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <Store size={48} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Food Truck no encontrado</h1>
                    <p className="text-muted-foreground text-sm">
                        Lo sentimos, el menú que buscas no existe o ha sido desactivado temporalmente.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="space-y-10 pb-32 relative min-h-screen"
            style={{
                '--primary': (truck as any).primaryColor || '#FF6B35',
                '--secondary': (truck as any).accentColor || '#1e293b'
            } as React.CSSProperties}
        >
            {/* Order Tracking Banner */}
            {activeOrder && activeOrder.status !== 'delivered' && activeOrder.status !== 'cancelled' && (
                <div className="fixed top-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-top duration-500">
                    <div className="max-w-md mx-auto bg-slate-900 text-white rounded-[2rem] p-6 shadow-2xl shadow-slate-200 border border-slate-800 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                    {activeOrder.status === 'pending' && <Clock className="animate-pulse" />}
                                    {activeOrder.status === 'preparing' && <UtensilsCrossed className="animate-bounce" />}
                                    {activeOrder.status === 'ready' && <PackageCheck className="text-green-400" />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        Estado de tu pedido
                                        <span className="text-white bg-slate-800 px-2 py-0.5 rounded-lg font-mono border border-slate-700 shadow-sm">
                                            #{activeOrder.id?.slice(-4).toUpperCase()}
                                        </span>
                                    </p>
                                    <h4 className="font-bold text-sm">
                                        {activeOrder.status === 'pending' && "Pedido Recibido"}
                                        {activeOrder.status === 'preparing' && "En la Cocina"}
                                        {activeOrder.status === 'ready' && "¡Listo para retirar!"}
                                    </h4>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    localStorage.removeItem(`activeOrder_${slug}`);
                                    setActiveOrder(null);
                                    setActiveOrderId(null);
                                }}
                                className="p-2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex gap-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ${activeOrder.status === 'pending' ? 'w-1/3 bg-orange-500' :
                                activeOrder.status === 'preparing' ? 'w-2/3 bg-blue-500' :
                                    'w-full bg-green-500'
                                }`} />
                        </div>

                        <p className="text-[10px] text-slate-400 mt-3 text-center font-medium italic">
                            {activeOrder.status === 'pending' && "Estamos procesando tu orden..."}
                            {activeOrder.status === 'preparing' && "Tu comida está al fuego 🔥"}
                            {activeOrder.status === 'ready' && "¡Pasa por el mostrador! 👋"}
                        </p>
                    </div>
                </div>
            )}

            {/* Header del Negocio */}
            <div className="text-center space-y-4 pt-4">
                <div className="h-24 w-24 bg-primary/10 rounded-[2rem] mx-auto flex items-center justify-center text-primary border border-primary/20 shadow-xl shadow-orange-100/50 overflow-hidden">
                    {truck.logoUrl ? (
                        <img src={truck.logoUrl} alt={truck.name} className="w-full h-full object-cover" />
                    ) : (
                        <UtensilsCrossed size={40} />
                    )}
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary bg-primary/5 px-3 py-1 rounded-full">Abierto ahora</span>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground pt-2">{truck.name}</h1>
                    <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">{truck.description}</p>
                </div>
            </div>

            {/* Categorías y Productos */}
            <div className="space-y-12">
                {menu.map((category) => (
                    <div key={category.id} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-black tracking-tight text-secondary whitespace-nowrap uppercase">
                                {category.name}
                            </h2>
                            <div className="h-[2px] w-full bg-secondary/5 rounded-full" />
                        </div>

                        <div className="grid gap-6">
                            {category.products.map((product) => {
                                const inCart = cart.find(item => item.productId === product.id);
                                return (
                                    <div
                                        key={product.id}
                                        className={`flex gap-4 p-2 rounded-[1.5rem] border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:border-orange-100 transition-all active:scale-[0.98] group ${(!product.available || ((product.stock ?? 0) <= 0)) ? 'opacity-60 grayscale' : ''}`}
                                    >
                                        <div className="h-24 w-24 bg-gray-50 rounded-2xl shrink-0 overflow-hidden relative">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ImageIcon size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-2 pr-2">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-foreground text-base leading-tight">{product.name}</h3>
                                                    {(product.stock ?? 0) <= 5 && (product.stock ?? 0) > 0 && (
                                                        <span className="text-[8px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-md font-black">ÚLTIMOS {product.stock ?? 0}</span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">{product.description}</p>
                                            </div>
                                            <div className="flex justify-between items-end mt-2">
                                                <span className="font-black text-primary text-lg">${product.price.toFixed(2)}</span>

                                                {(!product.available || ((product.stock ?? 0) <= 0)) ? (
                                                    <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-3 py-1.5 rounded-xl">Agotado</span>
                                                ) : inCart ? (
                                                    <div className="flex items-center bg-gray-100 rounded-xl px-2 py-1 gap-3 border border-gray-100">
                                                        <button onClick={() => removeFromCart(product.id!)} className="text-gray-500 hover:text-red-500 transition-colors">
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="font-bold text-sm min-w-[20px] text-center">{inCart.quantity}</span>
                                                        <button
                                                            onClick={() => addToCart(product)}
                                                            disabled={(product.stock ?? 0) > 0 && inCart.quantity >= (product.stock ?? 0)}
                                                            className={`text-gray-500 hover:text-primary transition-colors ${((product.stock ?? 0) > 0 && inCart.quantity >= (product.stock ?? 0)) ? 'opacity-20' : ''}`}
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart(product)}
                                                        className="bg-secondary text-white p-2 rounded-xl shadow-lg shadow-green-100 hover:bg-secondary/90 transition-colors"
                                                    >
                                                        <Plus size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Cart Button */}
            {cart.length > 0 && !isCartOpen && (
                <div className="fixed bottom-8 left-0 right-0 px-6 z-40 animate-in fade-in slide-in-from-bottom-4">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="w-full max-w-md mx-auto bg-primary text-white py-5 rounded-[2rem] shadow-2xl shadow-orange-200 flex items-center justify-between px-8 hover:scale-105 transition-transform active:scale-95"
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <ShoppingBag size={24} />
                                <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-sm">
                                    {cartCount}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] items-center uppercase font-black tracking-widest text-orange-100 text-left">Ver Pedido</p>
                                <p className="font-bold text-lg leading-tight">Revisar selección</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black">${cartTotal.toFixed(2)}</span>
                            <ChevronRight size={24} />
                        </div>
                    </button>
                </div>
            )}

            {/* Cart Drawer / Modal */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />

                    <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-full duration-300">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-slate-800">Tu Pedido</h2>
                                <p className="text-muted-foreground text-sm font-medium">{cartCount} productos seleccionados</p>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-gray-50 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {orderSuccess ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                                    <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                        <CheckCircle2 size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold">¡Pedido Enviado!</h3>
                                    <p className="text-muted-foreground">En unos minutos estará listo. ¡Gracias!</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {cart.map(item => (
                                            <div key={item.productId} className="flex justify-between items-center py-2">
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-slate-800">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} x {item.quantity}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-black text-slate-800">${(item.price * item.quantity).toFixed(2)}</span>
                                                    <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1 gap-2 border border-gray-100">
                                                        <button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                            <Minus size={14} />
                                                        </button>
                                                        <button onClick={() => addToCart({ id: item.productId, name: item.name, price: item.price } as any)} className="text-gray-400 hover:text-primary transition-colors">
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-6 pt-6 border-t border-gray-100">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tu Nombre</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ej. Juan Pérez"
                                                    value={customerName}
                                                    onChange={(e) => setCustomerName(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mesa / Ubicación</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Ej. Mesa 5"
                                                        value={tableNumber}
                                                        onChange={(e) => setTableNumber(e.target.value)}
                                                        disabled={!!tableFromUrl}
                                                        className={`w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${tableFromUrl ? 'pl-10 text-slate-500 font-bold' : ''}`}
                                                    />
                                                    {tableFromUrl && (
                                                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-orange-50 p-6 rounded-3xl flex justify-between items-center">
                                            <span className="font-bold text-orange-800">Total del Pedido</span>
                                            <span className="text-3xl font-black text-primary">${cartTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {!orderSuccess && (
                            <div className="p-8 bg-gray-50 border-t border-gray-100">
                                <button
                                    onClick={handleSubmitOrder}
                                    disabled={isSubmitting || cart.length === 0}
                                    className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-100 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <ShoppingBag />
                                    )}
                                    {isSubmitting ? "Enviando..." : "Confirmar Mi Pedido"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
