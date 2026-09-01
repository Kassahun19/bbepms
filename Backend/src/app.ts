import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRouter from './routes/index';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // Global Security & Parsers
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'bunna-epms-backend', timestamp: new Date().toISOString() });
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
