"use server";

import { prisma } from "../prisma";
import type { Category, Product } from "@prisma/client";

export type { Category, Product };

// CATEGORÍAS
export async function getCategories(truckId: string): Promise<Category[]> {
    return await prisma.category.findMany({
        where: { foodTruckId: truckId },
        orderBy: { order: 'asc' }
    });
}

export async function addCategory(category: any): Promise<string> {
    const created = await prisma.category.create({
        data: category
    });
    return created.id;
}

export async function updateCategory(id: string, data: any): Promise<void> {
    await prisma.category.update({
        where: { id },
        data
    });
}

export async function deleteCategory(id: string): Promise<void> {
    await prisma.category.delete({
        where: { id }
    });
}

// PRODUCTOS
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await prisma.product.findMany({
        where: { categoryId }
    });
}

export async function addProduct(product: any): Promise<string> {
    const created = await prisma.product.create({
        data: product as any // Cast needed if types mismatch slightly
    });
    return created.id;
}

export async function updateProduct(id: string, data: any): Promise<void> {
    await prisma.product.update({
        where: { id },
        data: data as any
    });
}

export async function deleteProduct(id: string): Promise<void> {
    await prisma.product.delete({
        where: { id }
    });
}

// MENÚ COMPLETO
export async function getFullMenu(truckId: string) {
    // Prisma allows fetching relations in a single query!
    const menu = await prisma.category.findMany({
        where: { foodTruckId: truckId },
        include: {
            products: true
        },
        orderBy: { order: 'asc' }
    });
    return menu;
}


