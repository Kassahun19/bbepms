// =============================================================================
// Bunna Bank S.C. EPMS - Centralized Environment Configuration
// =============================================================================
import dotenv from 'dotenv';
dotenv.config({ override: true });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  appUrl: process.env.APP_URL || 'https://bbepms.vercel.app',

  // Database Connection (Supabase PostgreSQL)
  databaseUrl: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || process.env.POSTGRES_PRISMA_URL || '',
  directUrl: process.env.DIRECT_URL || process.env.POSTGRES_URL_NON_POOLING || '',

  // JWT Authentication Secrets & Lifespans
  jwt: {
    secret: process.env.JWT_SECRET || 'bunna-bank-epms-production-secure-jwt-secret-2026-key-360',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'bunna-bank-epms-production-refresh-secret-2026-token-key-720',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // AI & External Integrations
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '8966989429:AAGpqUHIKmYNfjGG5KBE7P83X6kLTk1QK_4',

  // Firebase Fallback Persistence (if active)
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "AIzaSyBw427eVaswPMfF45BTKSQgReoVKAIjBNg",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || "curious-stream-pf4nj.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "curious-stream-pf4nj",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || "curious-stream-pf4nj.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "285188962715",
    appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || "1:285188962715:web:fbd667b2c81fcb3d43893e",
    databaseId: process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-bunnabankscepms-3a3ddc66-e2a1-4df7-9b2b-3c1fb20fb708"
  }
};
