// backend/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/index.js';
import installRouter from './routes/installRoutes.js';
import { checkMySqlConnection } from './config/db.js';
import { seedInitialDatabase } from './services/seedService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = 3000;

// Security and parsing middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. Direct /install route as requested
app.use('/install', installRouter);

// 2. All REST API endpoints under /api/*
app.use('/api', apiRouter);

// API Health Check
app.get('/api/health', async (req, res) => {
  const dbStatus = await checkMySqlConnection();
  res.json({
    status: 'ok',
    service: 'Bunna Bank Daily KPI Performance Management System',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

async function startServer() {
  // Check and initialize DB in background
  checkMySqlConnection().then(conn => {
    console.log(`[DB Status]: ${conn.message}`);
    // Auto-seed persistent records if empty
    seedInitialDatabase().catch(err => {
      console.warn('[Seed Warning]:', err.message);
    });
  });

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        root: rootDir,
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
      console.log('[Vite Middleware] Attached for development mode.');
    } catch (viteErr) {
      console.error('[Vite Middleware Error]:', viteErr);
    }
  } else {
    const distPath = path.join(rootDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` ☕ BUNNA BANK EPMS - SERVER RUNNING ON PORT ${PORT}`);
    console.log(` URL: http://0.0.0.0:${PORT}`);
    console.log(` Install Route: http://0.0.0.0:${PORT}/install`);
    console.log(` API Base: http://0.0.0.0:${PORT}/api`);
    console.log(`=======================================================`);
  });
}

startServer();

export default app;
