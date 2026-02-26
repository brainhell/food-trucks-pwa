"use server";

import { adminDb } from "../firebase/admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

export interface OrderItem {
    id?: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: string;
    foodTruckId: string;
    customerName?: string;
    tableNumber?: string;
    total: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    items: OrderItem[];
}

export type OrderWithItems = Order;

export interface CreateOrderInput {
    foodTruckId: string;
    customerName?: string;
    tableNumber?: string;
    items: OrderItem[];
    total: number;
}

// Helper to convert Firestore doc to Order
function mapDocToOrder(doc: FirebaseFirestore.DocumentSnapshot): Order {
    const data = doc.data()!;
    return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate(),
    } as Order;
}

// Crear un nuevo pedido
export async function createOrder(orderData: CreateOrderInput): Promise<string> {
    try {
        const now = Timestamp.now();
        const docRef = await adminDb.collection("orders").add({
            foodTruckId: orderData.foodTruckId,
            customerName: orderData.customerName || null,
            tableNumber: orderData.tableNumber || null,
            total: orderData.total,
            status: 'pending',
            items: orderData.items,
            createdAt: now,
            updatedAt: now,
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
}

// Obtener pedidos recientes de un truck (para initial load)
export async function getOrders(foodTruckId: string): Promise<OrderWithItems[]> {
    try {
        const snapshot = await adminDb
            .collection("orders")
            .where("foodTruckId", "==", foodTruckId)
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

        return snapshot.docs.map(mapDocToOrder);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

// Obtener un pedido específico
export async function getOrder(orderId: string): Promise<OrderWithItems | null> {
    try {
        const doc = await adminDb.collection("orders").doc(orderId).get();
        if (!doc.exists) return null;
        return mapDocToOrder(doc);
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
}

// Actualizar el estado de un pedido
export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
        await adminDb.runTransaction(async (transaction) => {
            const orderRef = adminDb.collection("orders").doc(orderId);
            const orderDoc = await transaction.get(orderRef);

            if (!orderDoc.exists) throw new Error("Order not found");

            const orderData = orderDoc.data() as Order;

            // Actualizar el estado del pedido
            transaction.update(orderRef, {
                status,
                updatedAt: Timestamp.now()
            });

            // Lógica de Inventario: Al marcar como entregado (o según el flujo deseado), descontamos stock
            if (status === 'delivered' || status === 'done' || status === 'ready') {
                for (const item of orderData.items) {
                    const productRef = adminDb.collection("products").doc(item.productId);
                    transaction.update(productRef, {
                        stock: FieldValue.increment(-item.quantity)
                    });
                }
            }
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
}

// Obtener pedidos por rango de fechas
export async function getOrdersByDateRange(foodTruckId: string, startDate: Date, endDate: Date): Promise<OrderWithItems[]> {
    try {
        const snapshot = await adminDb
            .collection("orders")
            .where("foodTruckId", "==", foodTruckId)
            .where("createdAt", ">=", Timestamp.fromDate(startDate))
            .where("createdAt", "<=", Timestamp.fromDate(endDate))
            .orderBy("createdAt", "desc")
            .get();

        return snapshot.docs.map(mapDocToOrder);
    } catch (error) {
        console.error("Error fetching orders by date range:", error);
        return [];
    }
}


