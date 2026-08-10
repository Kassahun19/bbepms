// =============================================================================
// Bunna Bank S.C. EPMS - Security & Middleware Configuration
// =============================================================================
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Allows flexible integration with Vite SPA and Telegram
  crossOriginEmbedderPolicy: false,
});

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (such as mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
});

// General API rate limiter: 1000 requests per 15 minutes
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// Stricter rate limiter for authentication endpoints: 50 requests per 15 minutes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});
