import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import appletConfig from "../../../firebase-applet-config.json";
try {
  setLogLevel("silent");
} catch {
}
const config = appletConfig || {};
const apiKey = typeof process !== "undefined" && process.env && (process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY) || config.apiKey || "AIzaSyBw427eVaswPMfF45BTKSQgReoVKAIjBNg";
const authDomain = typeof process !== "undefined" && process.env && (process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN) || config.authDomain || "curious-stream-pf4nj.firebaseapp.com";
const projectId = typeof process !== "undefined" && process.env && (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID) || config.projectId || "curious-stream-pf4nj";
const storageBucket = typeof process !== "undefined" && process.env && (process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET) || config.storageBucket || "curious-stream-pf4nj.firebasestorage.app";
const messagingSenderId = typeof process !== "undefined" && process.env && (process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || config.messagingSenderId || "285188962715";
const appId = typeof process !== "undefined" && process.env && (process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID) || config.appId || "1:285188962715:web:fbd667b2c81fcb3d43893e";
const firestoreDatabaseId = typeof process !== "undefined" && process.env && (process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID) || config.firestoreDatabaseId || "ai-studio-bunnabankscepms-3a3ddc66-e2a1-4df7-9b2b-3c1fb20fb708";
const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true
  }, firestoreDatabaseId || "(default)");
} catch {
  dbInstance = getFirestore(app, firestoreDatabaseId || "(default)");
}
export const db = dbInstance;
const QUOTA_STORAGE_KEY = "epms_firestore_quota_exhausted_until";
function getInitialQuotaExhaustedTime() {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(QUOTA_STORAGE_KEY);
      if (stored) {
        const val = parseInt(stored, 10);
        if (!isNaN(val) && val > Date.now()) return val;
      }
    }
  } catch {
  }
  return 0;
}
let quotaExhaustedUntil = getInitialQuotaExhaustedTime();
let quotaExceededLogged = false;
export function isFirestoreQuotaExhausted() {
  if (quotaExhaustedUntil > Date.now()) return true;
  return false;
}
export function setFirestoreQuotaExhausted(durationMs = 60 * 60 * 1e3) {
  quotaExhaustedUntil = Date.now() + durationMs;
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(QUOTA_STORAGE_KEY, String(quotaExhaustedUntil));
    }
  } catch {
  }
}
function handleFirestoreError(err, context) {
  const isQuotaOrUnavailable = err?.code === "resource-exhausted" || err?.code === "unavailable" || err?.code === "deadline-exceeded" || err?.code === 8 || err?.message?.includes("RESOURCE_EXHAUSTED") || err?.message?.includes("Quota exceeded") || err?.message?.includes("Could not reach Cloud Firestore") || err?.message?.includes("offline") || err?.message?.includes("quota");
  if (isQuotaOrUnavailable) {
    setFirestoreQuotaExhausted(5 * 60 * 1e3);
    if (!quotaExceededLogged) {
      console.info(`[EPMS Persistence] Firestore connection or quota unavailable. Seamlessly routing all data through local server persistence.`);
      quotaExceededLogged = true;
    }
  } else {
    if (err?.code !== "unavailable" && err?.code !== "cancelled") {
      console.warn(`[Firestore Notice] Note during ${context}:`, err?.message || err);
    }
  }
}
export async function getCollectionItems(collectionName) {
  if (isFirestoreQuotaExhausted()) {
    return [];
  }
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return [];
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (err) {
    handleFirestoreError(err, `fetching Firestore collection ${collectionName}`);
    return [];
  }
}
export async function saveDocument(collectionName, id, data) {
  if (isFirestoreQuotaExhausted()) {
    return;
  }
  try {
    const docRef = doc(db, collectionName, id);
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, `saving document ${id} to ${collectionName}`);
  }
}
export async function saveCollectionBatch(collectionName, items) {
  if (isFirestoreQuotaExhausted()) {
    return;
  }
  try {
    if (!items || items.length === 0) return;
    const chunkSize = 400;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((item) => {
        const docId = item.id ? String(item.id) : `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const docRef = doc(db, collectionName, docId);
        const cleanData = JSON.parse(JSON.stringify(item));
        batch.set(docRef, cleanData, { merge: true });
      });
      await batch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, `saving batch to ${collectionName}`);
  }
}
export async function deleteDocument(collectionName, id) {
  if (isFirestoreQuotaExhausted()) {
    return;
  }
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, `deleting document ${id} from ${collectionName}`);
  }
}
