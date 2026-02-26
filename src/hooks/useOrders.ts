import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Order } from "@/lib/services/orderService";

export function useOrders(foodTruckId: string) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!foodTruckId) return;

        setLoading(true);
        const q = query(
            collection(db, "orders"),
            where("foodTruckId", "==", foodTruckId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: (data.createdAt as Timestamp)?.toDate(),
                    updatedAt: (data.updatedAt as Timestamp)?.toDate(),
                } as Order;
            });
            setOrders(ordersData);
            setLoading(false);
        }, (err) => {
            console.error("Error subscribing to orders:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [foodTruckId]);

    return { orders, loading, error };
}
