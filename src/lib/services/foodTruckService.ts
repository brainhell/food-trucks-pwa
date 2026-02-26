"use server";

import { adminDb } from "../firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export interface FoodTruck {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    ownerId: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Helper to convert Firestore doc to FoodTruck
function mapDocToTruck(doc: FirebaseFirestore.DocumentSnapshot): FoodTruck {
    const data = doc.data()!;
    return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate(),
    } as FoodTruck;
}

// Obtener un truck por su slug (útil para el menú QR)
export async function getFoodTruckBySlug(slug: string): Promise<FoodTruck | null> {
    try {
        const snapshot = await adminDb
            .collection("food_trucks")
            .where("slug", "==", slug)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        return mapDocToTruck(snapshot.docs[0]);
    } catch (error) {
        console.error("Error fetching truck by slug:", error);
        return null;
    }
}

// Obtener todos los trucks de un dueño (para el admin)
export async function getFoodTrucksByOwner(ownerId: string): Promise<FoodTruck[]> {
    try {
        const snapshot = await adminDb
            .collection("food_trucks")
            .where("ownerId", "==", ownerId)
            .get();

        return snapshot.docs.map(mapDocToTruck);
    } catch (error) {
        console.error("Error fetching trucks by owner:", error);
        return [];
    }
}

// Crear o actualizar un truck
export async function saveFoodTruck(truck: Partial<FoodTruck>): Promise<string> {
    try {
        const { id, ...data } = truck;
        const now = Timestamp.now();

        const truckData = {
            ...data,
            updatedAt: now,
        };

        if (id) {
            // Update
            await adminDb.collection("food_trucks").doc(id).update(truckData);
            return id;
        } else {
            // Create
            const docRef = await adminDb.collection("food_trucks").add({
                ...truckData,
                createdAt: now,
                active: truck.active ?? true,
            });
            return docRef.id;
        }
    } catch (error) {
        console.error("Error saving truck:", error);
        throw error;
    }
}

// Obtener todos los trucks activos (para el Hub público)
export async function getAllActiveFoodTrucks(): Promise<FoodTruck[]> {
    try {
        const snapshot = await adminDb
            .collection("food_trucks")
            .where("active", "==", true)
            .get();

        return snapshot.docs.map(mapDocToTruck);
    } catch (error) {
        console.error("Error fetching active trucks:", error);
        return [];
    }
}


