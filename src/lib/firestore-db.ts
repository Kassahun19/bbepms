import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

const config: any = appletConfig || {};

const apiKey = (typeof process !== 'undefined' && process.env && (process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY)) || config.apiKey || "AIzaSyBw427eVaswPMfF45BTKSQgReoVKAIjBNg";
const authDomain = (typeof process !== 'undefined' && process.env && (process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN)) || config.authDomain || "curious-stream-pf4nj.firebaseapp.com";
const projectId = (typeof process !== 'undefined' && process.env && (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID)) || config.projectId || "curious-stream-pf4nj";
const storageBucket = (typeof process !== 'undefined' && process.env && (process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET)) || config.storageBucket || "curious-stream-pf4nj.firebasestorage.app";
const messagingSenderId = (typeof process !== 'undefined' && process.env && (process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID)) || config.messagingSenderId || "285188962715";
const appId = (typeof process !== 'undefined' && process.env && (process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID)) || config.appId || "1:285188962715:web:fbd667b2c81fcb3d43893e";
const firestoreDatabaseId = (typeof process !== 'undefined' && process.env && (process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID)) || config.firestoreDatabaseId || "ai-studio-bunnabankscepms-3a3ddc66-e2a1-4df7-9b2b-3c1fb20fb708";

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firestoreDatabaseId || '(default)');

/**
 * Generic Firestore collection fetcher
 */
export async function getCollectionItems<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return [];
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as T[];
  } catch (err) {
    console.error(`Error fetching Firestore collection ${collectionName}:`, err);
    return [];
  }
}

/**
 * Generic Firestore single document saver
 */
export async function saveDocument(collectionName: string, id: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    // Sanitize undefined fields to null or delete them
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    console.error(`Error saving document ${id} to ${collectionName}:`, err);
  }
}

/**
 * Generic Firestore batch collection writer with automatic 400-item chunking
 */
export async function saveCollectionBatch(collectionName: string, items: any[]): Promise<void> {
  try {
    if (!items || items.length === 0) return;
    const chunkSize = 400;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach(item => {
        const docId = item.id ? String(item.id) : `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const docRef = doc(db, collectionName, docId);
        const cleanData = JSON.parse(JSON.stringify(item));
        batch.set(docRef, cleanData, { merge: true });
      });
      await batch.commit();
    }
  } catch (err) {
    console.error(`Error saving batch to ${collectionName}:`, err);
  }
}

/**
 * Generic Firestore document deleter
 */
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`Error deleting document ${id} from ${collectionName}:`, err);
  }
}
