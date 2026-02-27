import admin from "firebase-admin";

const isConfigured =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length && isConfigured) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        } as any),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
} else if (!admin.apps.length) {
    console.warn("⚠️ Firebase Admin not initialized: Missing environment variables.");
}

const adminDb = admin.apps.length > 0 ? admin.firestore() : null as any;
const adminAuth = admin.apps.length > 0 ? admin.auth() : null as any;
const adminStorage = admin.apps.length > 0 ? admin.storage() : null as any;

export { adminDb, adminAuth, adminStorage };
