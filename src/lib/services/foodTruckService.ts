"use server";

import { prisma } from "../prisma";
import type { FoodTruck as PrismaFoodTruck } from "@prisma/client";

export type FoodTruck = PrismaFoodTruck;

// Obtener un truck por su slug (útil para el menú QR)
export async function getFoodTruckBySlug(slug: string): Promise<FoodTruck | null> {
    try {
        return await prisma.foodTruck.findUnique({
            where: { slug }
        });
    } catch (error) {
        console.error("Error fetching truck by slug:", error);
        return null;
    }
}

// Obtener todos los trucks de un dueño (para el admin)
export async function getFoodTrucksByOwner(ownerId: string): Promise<FoodTruck[]> {
    try {
        return await prisma.foodTruck.findMany({
            where: { ownerId }
        });
    } catch (error) {
        console.error("Error fetching trucks by owner:", error);
        return [];
    }
}

// Crear o actualizar un truck
export async function saveFoodTruck(truck: Partial<FoodTruck>): Promise<string> {
    try {
        if (truck.id) {
            // Update
            const { id, ...data } = truck;
            const updated = await prisma.foodTruck.update({
                where: { id },
                data: data as any // Type assertion needed for partial update
            });
            return updated.id;
        } else {
            // Create
            const created = await prisma.foodTruck.create({
                data: truck as any
            });
            return created.id;
        }
    } catch (error) {
        console.error("Error saving truck:", error);
        throw error;
    }
}

// Obtener todos los trucks activos (para el Hub público)
export async function getAllActiveFoodTrucks(): Promise<FoodTruck[]> {
    try {
        return await prisma.foodTruck.findMany({
            where: { active: true }
        });
    } catch (error) {
        console.error("Error fetching active trucks:", error);
        return [];
    }
}


