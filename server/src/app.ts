// =============================================================================
// Bunna Bank S.C. EPMS - Express Application Setup
// =============================================================================
import express from 'express';
import path from 'path';
import { helmetMiddleware, corsMiddleware, apiRateLimiter } from './config/security';
import apiRouter from './routes/index';

export function createApp() {
  const app = express();

  // Security middlewares
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Apply rate limiter to /api routes
  app.use('/api', apiRateLimiter);

  // Mount central API router
  app.use('/api', apiRouter);

  return app;
}
