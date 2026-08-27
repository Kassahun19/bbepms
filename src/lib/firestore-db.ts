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

// Persistent quota tracking across browser sessions
const QUOTA_STORAGE_KEY = 'epms_firestore_quota_exhausted_until';

function getInitialQuotaExhaustedTime(): number {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(QUOTA_STORAGE_KEY);
      if (stored) {
        const val = parseInt(stored, 10);
        if (!isNaN(val) && val > Date.now()) return val;
      }
    }
  } catch {}
  return 0;
}

let quotaExhaustedUntil = getInitialQuotaExhaustedTime();
let quotaExceededLogged = false;

export function isFirestoreQuotaExhausted(): boolean {
  if (quotaExhaustedUntil > Date.now()) return true;
  return false;
}

export function setFirestoreQuotaExhausted(durationMs: number = 60 * 60 * 1000): void {
  quotaExhaustedUntil = Date.now() + durationMs;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(QUOTA_STORAGE_KEY, String(quotaExhaustedUntil));
    }
  } catch {}
}

function handleFirestoreError(err: any, context: string) {
  const isQuota = 
    err?.code === 'resource-exhausted' || 
    err?.code === 8 ||
    err?.message?.includes('RESOURCE_EXHAUSTED') ||
    err?.message?.includes('Quota exceeded') ||
    err?.message?.includes('quota');

  if (isQuota) {
    setFirestoreQuotaExhausted(60 * 60 * 1000); // 1-hour backoff
    if (!quotaExceededLogged) {
      console.info(`[EPMS Persistence] Firestore daily quota reached. Seamlessly routing all data through local server persistence.`);
      quotaExceededLogged = true;
    }
  } else {
    // Suppress verbose gRPC errors when quota or connection is unavailable
    if (err?.code !== 'unavailable' && err?.code !== 'cancelled') {
      console.warn(`[Firestore Notice] Note during ${context}:`, err?.message || err);
    }
  }
}

/**
 * Generic Firestore collection fetcher
 */
export async function getCollectionItems<T>(collectionName: string): Promise<T[]> {
  if (isFirestoreQuotaExhausted()) {
    return [];
  }
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return [];
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as T[];
  } catch (err: any) {
    handleFirestoreError(err, `fetching Firestore collection ${collectionName}`);
    return [];
  }
}

/**
 * Generic Firestore single document saver
 */
export async function saveDocument(collectionName: string, id: string, data: any): Promise<void> {
  if (isFirestoreQuotaExhausted()) {
    return;
  }
  try {
    const docRef = doc(db, collectionName, id);
    // Sanitize undefined fields to null or delete them
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err: any) {
    handleFirestoreError(err, `saving document ${id} to ${collectionName}`);
  }
}

/**
 * Generic Firestore batch collection writer with automatic 400-item chunking
 */
export async function saveCollectionBatch(collectionName: string, items: any[]): Promise<void> {
  if (isFirestoreQuotaExhausted()) {
    return;
  }
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
  } catch (err: any) {
    handleFirestoreError(err, `saving batch to ${collectionName}`);
  }
}

/**
 * Generic Firestore document deleter
 */
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  if (isFirestoreQuotaExhausted()) {
    return;
  }
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err: any) {
    handleFirestoreError(err, `deleting document ${id} from ${collectionName}`);
  }
}
