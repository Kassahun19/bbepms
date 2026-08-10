import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

const config: any = appletConfig || {};

const getMetaEnv = (key: string) => {
  try {
    return (import.meta as any).env?.[key];
  } catch {
    return undefined;
  }
};

const apiKey = (typeof process !== 'undefined' && process.env && (process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY)) || getMetaEnv('VITE_FIREBASE_API_KEY') || config.apiKey || "AIzaSyBw427eVaswPMfF45BTKSQgReoVKAIjBNg";
const authDomain = (typeof process !== 'undefined' && process.env && (process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN)) || getMetaEnv('VITE_FIREBASE_AUTH_DOMAIN') || config.authDomain || "curious-stream-pf4nj.firebaseapp.com";
const projectId = (typeof process !== 'undefined' && process.env && (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID)) || getMetaEnv('VITE_FIREBASE_PROJECT_ID') || config.projectId || "curious-stream-pf4nj";
const storageBucket = (typeof process !== 'undefined' && process.env && (process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET)) || getMetaEnv('VITE_FIREBASE_STORAGE_BUCKET') || config.storageBucket || "curious-stream-pf4nj.firebasestorage.app";
const messagingSenderId = (typeof process !== 'undefined' && process.env && (process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID)) || getMetaEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || config.messagingSenderId || "285188962715";
const appId = (typeof process !== 'undefined' && process.env && (process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID)) || getMetaEnv('VITE_FIREBASE_APP_ID') || config.appId || "1:285188962715:web:fbd667b2c81fcb3d43893e";
const firestoreDatabaseId = (typeof process !== 'undefined' && process.env && (process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID)) || getMetaEnv('VITE_FIREBASE_DATABASE_ID') || config.firestoreDatabaseId || "ai-studio-bunnabankscepms-3a3ddc66-e2a1-4df7-9b2b-3c1fb20fb708";

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

export {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
};
