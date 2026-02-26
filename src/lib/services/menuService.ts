"use server";

import { adminDb } from "../firebase/admin";

export interface Category {
    id: string;
    foodTruckId: string;
    name: string;
    order: number;
}

export interface Product {
    id: string;
    foodTruckId: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    cost?: number;
    imageUrl?: string;
    available: boolean;
    stock?: number;
}

// CATEGORÍAS
export async function getCategories(truckId: string): Promise<Category[]> {
    try {
        const snapshot = await adminDb
            .collection("categories")
            .where("food_truck_id", "==", truckId)
            .orderBy("order", "asc")
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            foodTruckId: doc.data().food_truck_id,
            ...doc.data()
        })) as Category[];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function addCategory(category: any): Promise<string> {
    try {
        const docRef = await adminDb.collection("categories").add({
            ...category,
            food_truck_id: category.foodTruckId // Mapping for consistency with schema
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding category:", error);
        throw error;
    }
}

export async function updateCategory(id: string, data: any): Promise<void> {
    try {
        await adminDb.collection("categories").doc(id).update(data);
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
}

export async function deleteCategory(id: string): Promise<void> {
    try {
        await adminDb.collection("categories").doc(id).delete();
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
}

// PRODUCTOS
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
        const snapshot = await adminDb
            .collection("products")
            .where("category_id", "==", categoryId)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            foodTruckId: doc.data().food_truck_id,
            categoryId: doc.data().category_id,
            ...doc.data()
        })) as Product[];
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

export async function addProduct(product: any): Promise<string> {
    try {
        const docRef = await adminDb.collection("products").add({
            ...product,
            food_truck_id: product.foodTruckId,
            category_id: product.categoryId
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding product:", error);
        throw error;
    }
}

export async function updateProduct(id: string, data: any): Promise<void> {
    try {
        await adminDb.collection("products").doc(id).update(data);
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
}

export async function deleteProduct(id: string): Promise<void> {
    try {
        await adminDb.collection("products").doc(id).delete();
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
}

// MENÚ COMPLETO
export async function getFullMenu(truckId: string) {
    try {
        const categories = await getCategories(truckId);

        const fullMenu = await Promise.all(categories.map(async (category) => {
            const products = await getProductsByCategory(category.id);
            return {
                ...category,
                products
            };
        }));

        return fullMenu;
    } catch (error) {
        console.error("Error fetching full menu:", error);
        return [];
    }
}

// ALERTAS DE STOCK
export async function getLowStockProducts(truckId: string, limit: number = 10): Promise<Product[]> {
    try {
        const snapshot = await adminDb
            .collection("products")
            .where("food_truck_id", "==", truckId)
            .where("stock", "<=", limit)
            .orderBy("stock", "asc")
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            foodTruckId: doc.data().food_truck_id,
            categoryId: doc.data().category_id,
            ...doc.data()
        })) as Product[];
    } catch (error) {
        console.error("Error fetching low stock products:", error);
        return [];
    }
}


