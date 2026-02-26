"use server";

import { prisma } from "../prisma";
import type { Order, OrderItem } from "@prisma/client";

export type { Order, OrderItem };
export type OrderWithItems = Order & { items: OrderItem[], tableNumber?: string | null };

export interface CreateOrderInput {
    foodTruckId: string;
    customerName?: string;
    tableNumber?: string;
    items: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
    }[];
    total: number;
}

// Crear un nuevo pedido
export async function createOrder(orderData: CreateOrderInput): Promise<string> {
    try {
        const order = await prisma.order.create({
            data: {
                foodTruckId: orderData.foodTruckId,
                customerName: orderData.customerName,
                tableNumber: orderData.tableNumber,
                total: orderData.total,
                status: 'pending',
                items: {
                    create: orderData.items.map(item => ({
                        productId: item.productId,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    }))
                }
            }
        });
        return order.id;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
}

// Obtener pedidos recientes de un truck (para polling)
export async function getOrders(foodTruckId: string): Promise<OrderWithItems[]> {
    try {
        return await prisma.order.findMany({
            where: { foodTruckId },
            orderBy: { createdAt: 'desc' },
            include: { items: true },
            take: 50
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

// Obtener un pedido específico
export async function getOrder(orderId: string): Promise<OrderWithItems | null> {
    try {
        return await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
}

// Actualizar el estado de un pedido
export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
        // Lógica de Inventario: Al marcar como entregado (delivered), descontamos stock
        if (status === 'delivered') {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: { items: true }
            });

            if (order) {
                // Transaction to ensure data consistency
                await prisma.$transaction(async (tx) => {
                    // Update order status
                    await tx.order.update({
                        where: { id: orderId },
                        data: { status }
                    });

                    // Decrease stock for each item
                    for (const item of order.items) {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { decrement: item.quantity } }
                        });
                    }
                });
                return;
            }
        }

        // Normal update without stock change
        await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });

    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
}

// Obtener pedidos por rango de fechas
export async function getOrdersByDateRange(foodTruckId: string, startDate: Date, endDate: Date): Promise<OrderWithItems[]> {
    try {
        return await prisma.order.findMany({
            where: {
                foodTruckId,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });
    } catch (error) {
        console.error("Error fetching orders by date range:", error);
        return [];
    }
}


