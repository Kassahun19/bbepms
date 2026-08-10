// =============================================================================
// Bunna Bank S.C. EPMS - Central API Router
// =============================================================================
import { Router } from 'express';
import authRoutes from './authRoutes';
import installRoutes from './installRoutes';
import { getDbCollection, saveLocalJsonDb } from '../services/dataService';
import { getPrismaClient, checkDatabaseConnection } from '../config/db';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', installRoutes);

// Health check endpoint
router.get('/health', async (req, res) => {
  const status = await checkDatabaseConnection();
  res.json({
    success: status.connected,
    status: status.connected ? 'ok' : 'degraded',
    database: status.provider,
    timestamp: new Date().toISOString()
  });
});

// Generic CRUD handlers for all EPMS entities to maintain 100% backward compatibility
const collections = [
  'users', 'reports', 'branches', 'districts', 'targets', 'kpis',
  'announcements', 'notifications', 'messages', 'auditLogs',
  'competitorBanks', 'competitorBranches', 'competitorMonthlyPerformance',
  'areaRankings', 'aiInsights', 'competitorAlerts', 'telegramSessions',
  'contactInquiries', 'systemSettings'
];

for (const col of collections) {
  router.get(`/${col}`, async (req, res) => {
    try {
      const data = await getDbCollection(col);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post(`/${col}`, async (req, res) => {
    try {
      const newItem = req.body;
      const prisma = getPrismaClient();
      let created = null;

      // Try prisma create if model exists
      if (prisma) {
        try {
          const modelName = col.slice(0, 1).toUpperCase() + col.slice(1, -1);
          if ((prisma as any)[col]) {
            created = await (prisma as any)[col].create({ data: newItem });
          }
        } catch (e) {
          // fallback to JSON
        }
      }

      if (!created) {
        if (process.env.NODE_ENV === 'production') {
          return res.status(500).json({ success: false, error: `Database error: Unable to create record in ${col} using Supabase PostgreSQL.` });
        }
        // Fallback to local JSON (development only)
        const db: any = {};
        for (const c of collections) {
          db[c] = await getDbCollection(c);
        }
        if (!db[col]) db[col] = [];
        newItem.id = newItem.id || (col.slice(0, 3) + '_' + Date.now());
        newItem.createdAt = newItem.createdAt || new Date().toISOString();
        db[col].push(newItem);
        saveLocalJsonDb(db);
        created = newItem;
      }

      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}

export default router;
