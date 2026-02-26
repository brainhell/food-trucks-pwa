"use client";

import React, { useEffect, useState } from "react";
import { getCategories, getFullMenu, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct, Category, Product } from "@/lib/services/menuService";
import { getFoodTrucksByOwner, FoodTruck } from "@/lib/services/foodTruckService";
import ImageUploader from "@/components/ImageUploader";
import {
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    MoreVertical,
    Image as ImageIcon,
    LayoutGrid,
    List,
    ChevronRight,
    Package,
    Layers,
    X,
    Loader2,
    Save,
    AlertTriangle
} from "lucide-react";

export default function MenuManagementPage() {
    const [trucks, setTrucks] = useState<FoodTruck[]>([]);
    const [truckId, setTruckId] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState("");

    // Modals State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const loadMenuData = async (targetTruckId?: string) => {
        try {
            const myTrucks = await getFoodTrucksByOwner("admin-user-123");
            setTrucks(myTrucks);

            const activeId = targetTruckId || truckId || myTrucks[0]?.id;
            if (activeId) {
                setTruckId(activeId);
                const cats = await getCategories(activeId);
                setCategories(cats);

                const menu = await getFullMenu(activeId);
                const products = menu.flatMap(cat => cat.products);
                setAllProducts(products);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMenuData();
    }, []);

    useEffect(() => {
        if (truckId) {
            loadMenuData(truckId);
        }
    }, [truckId]);

    // Handlers
    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!truckId || !editingCategory?.name) return;
        setIsSaving(true);
        try {
            if (editingCategory.id) {
                await updateCategory(editingCategory.id, editingCategory);
            } else {
                await addCategory({
                    foodTruckId: truckId,
                    name: editingCategory.name,
                    order: categories.length + 1
                });
            }
            await loadMenuData();
            setIsCategoryModalOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("¿Estás seguro? Se eliminarán todos los productos de esta categoría.")) return;
        try {
            await deleteCategory(id);
            await loadMenuData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!truckId || !editingProduct?.name || !editingProduct?.categoryId) return;
        setIsSaving(true);
        try {
            const productData = {
                ...editingProduct,
                foodTruckId: truckId,
                price: Number(editingProduct.price) || 0,
                cost: Number(editingProduct.cost) || 0,
                stock: Number(editingProduct.stock) || 0,
                available: editingProduct.available ?? true,
            } as any;

            if (editingProduct.id) {
                await updateProduct(editingProduct.id, productData);
            } else {
                await addProduct(productData);
            }
            await loadMenuData();
            setIsProductModalOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("¿Eliminar este producto?")) return;
        try {
            await deleteProduct(id);
            await loadMenuData();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">Cargando inventario...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-800">Gestión de Menú</h1>
                    <p className="text-slate-500 font-medium">Organiza tus categorías y productos del food truck.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setEditingCategory({}); setIsCategoryModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-slate-600 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Layers size={20} /> Nueva Categoría
                    </button>
                    <button
                        onClick={() => { setEditingProduct({ categoryId: categories[0]?.id }); setIsProductModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-orange-100"
                    >
                        <Plus size={20} /> Añadir Producto
                    </button>
                </div>
            </div>

            {/* Truck Selector */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {trucks.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTruckId(t.id!)}
                        className={`px-6 py-3 rounded-2xl border transition-all flex items-center gap-3 whitespace-nowrap ${truckId === t.id
                            ? 'bg-primary text-white border-primary shadow-lg shadow-orange-100'
                            : 'bg-white text-slate-400 border-gray-100 hover:bg-gray-50'
                            }`}
                    >
                        <div className={`h-2 w-2 rounded-full ${truckId === t.id ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
                        <span className="font-bold text-sm">{t.name}</span>
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {/* Categories and Products */}
            <div className="space-y-12">
                {categories.map((category) => {
                    const products = filteredProducts.filter(p => p.categoryId === category.id);
                    return (
                        <div key={category.id} className="space-y-6">
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-black tracking-tight text-slate-800 uppercase italic">
                                        {category.name}
                                    </h2>
                                    <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-lg">
                                        {products.length} ITEMS
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setEditingCategory(category); setIsCategoryModalOpen(true); }}
                                        className="p-2 text-slate-300 hover:text-primary transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(category.id!)}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className={`group bg-white border border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 hover:border-orange-100 transition-all overflow-hidden ${viewMode === 'grid' ? 'rounded-[2.5rem] flex flex-col' : 'rounded-3xl flex items-center p-3 gap-4'
                                            }`}
                                    >
                                        <div className={`${viewMode === 'grid' ? 'h-48 w-full' : 'h-16 w-16'
                                            } bg-gray-50 relative shrink-0 overflow-hidden`}>
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ImageIcon size={viewMode === 'grid' ? 40 : 20} />
                                                </div>
                                            )}
                                        </div>

                                        <div className={`p-6 flex-1 flex flex-col ${viewMode === 'list' ? 'p-0' : ''}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{product.name}</h3>
                                                    <p className="text-xs text-slate-400 font-medium line-clamp-1">{product.description || "Sin descripción"}</p>
                                                </div>
                                                <div className="flex items-center gap-1 font-black text-primary bg-orange-50 px-3 py-1 rounded-full text-sm">
                                                    ${product.price.toFixed(2)}
                                                </div>
                                            </div>

                                            {viewMode === 'grid' && (
                                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit ${product.available ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                            }`}>
                                                            {product.available ? 'Disponible' : 'Agotado'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold ml-1">
                                                            Stock: <span className={(product.stock ?? 0) < 10 ? 'text-red-500' : 'text-slate-600'}>{product.stock ?? 0} units</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                                                            className="p-2.5 bg-gray-50 text-slate-400 rounded-xl hover:text-primary hover:bg-orange-50 transition-all"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.id!)}
                                                            className="p-2.5 bg-gray-50 text-slate-400 rounded-xl hover:text-red-500 hover:bg-red-50 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {viewMode === 'list' && (
                                            <div className="ml-auto pr-4 flex items-center gap-4">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${product.available ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                        }`}>
                                                        {product.available ? 'Disponible' : 'Agotado'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold">Stock: {product.stock}</span>
                                                </div>
                                                <button
                                                    onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                                                    className="text-slate-300 hover:text-primary"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <button
                                    onClick={() => { setEditingProduct({ categoryId: category.id }); setIsProductModalOpen(true); }}
                                    className={`border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-primary hover:text-primary hover:bg-orange-50/30 transition-all group ${viewMode === 'grid' ? 'h-full min-h-[200px]' : 'h-20 w-full flex-row'
                                        }`}
                                >
                                    <Plus className="group-hover:scale-110 transition-transform" size={viewMode === 'grid' ? 32 : 20} />
                                    <span className="font-bold text-sm">Añadir a {category.name}</span>
                                </button>
                            </div>
                        </div>
                    );
                })}

                {categories.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <Package size={64} className="mx-auto text-gray-200 mb-6" />
                        <h3 className="text-2xl font-bold text-slate-400">Tu menú está vacío</h3>
                        <p className="text-slate-300 mt-2 max-w-xs mx-auto">Comienza creando tu primera categoría para organizar tus productos.</p>
                        <button
                            onClick={() => { setEditingCategory({}); setIsCategoryModalOpen(true); }}
                            className="mt-8 px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-orange-100"
                        >
                            Empezar ahora
                        </button>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black">{editingCategory?.id ? 'Editar' : 'Nueva'} Categoría</h2>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveCategory} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre de la Categoría</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Hamburguesas, Bebidas..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={editingCategory?.name || ''}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                Guardar Categoría
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
                    <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black">{editingProduct?.id ? 'Editar' : 'Nuevo'} Producto</h2>
                            <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveProduct} className="space-y-6">
                            {/* Image Uploader */}
                            <div className="md:col-span-2">
                                <ImageUploader
                                    currentImageUrl={editingProduct?.imageUrl || undefined}
                                    truckId={truckId || ''}
                                    productId={editingProduct?.id}
                                    onImageUploaded={(url: string) => setEditingProduct({ ...editingProduct, imageUrl: url })}
                                    onImageRemoved={() => setEditingProduct({ ...editingProduct, imageUrl: '' })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Producto</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold"
                                        value={editingProduct?.name || ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción</label>
                                    <textarea
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold h-24 resize-none"
                                        value={editingProduct?.description || ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Precio de Venta ($)</label>
                                    <input
                                        type="number" step="0.01"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold"
                                        value={editingProduct?.price ? Number(editingProduct.price) : ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) as any })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Costo ($)</label>
                                    <input
                                        type="number" step="0.01"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold"
                                        value={editingProduct?.cost ? Number(editingProduct.cost) : ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, cost: Number(e.target.value) as any })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Stock Inicial</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold"
                                        value={editingProduct?.stock || ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoría</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold appearance-none"
                                        value={editingProduct?.categoryId || ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                                        required
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Imagen URL</label>
                                    <input
                                        type="text"
                                        placeholder="https://images.unsplash..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold"
                                        value={editingProduct?.imageUrl || ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <span className="font-bold text-slate-700">Disponible para la venta</span>
                                    <button
                                        type="button"
                                        onClick={() => setEditingProduct({ ...editingProduct, available: !editingProduct?.available })}
                                        className={`w-12 h-6 rounded-full relative transition-all ${editingProduct?.available !== false ? 'bg-primary' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${editingProduct?.available !== false ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                Guardar Producto
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

