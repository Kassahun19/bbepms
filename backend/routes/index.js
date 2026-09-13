// backend/routes/index.js
import { Router } from 'express';
import installRoutes from './installRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import districtRoutes from './districtRoutes.js';
import branchRoutes from './branchRoutes.js';
import kpiRoutes from './kpiRoutes.js';
import targetRoutes from './targetRoutes.js';
import reportRoutes from './reportRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import competitorRoutes from './competitorRoutes.js';
import coachRoutes from './coachRoutes.js';
import systemRoutes from './systemRoutes.js';

const apiRouter = Router();

apiRouter.use('/install', installRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/districts', districtRoutes);
apiRouter.use('/branches', branchRoutes);
apiRouter.use('/kpis', kpiRoutes);
apiRouter.use('/targets', targetRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/competitors', competitorRoutes);
apiRouter.use('/coach', coachRoutes);
apiRouter.use('/system', systemRoutes);

// MySQL Compatibility aliases for frontend services
apiRouter.get('/mysql/status', async (req, res) => {
  const { checkMySqlConnection } = await import('../config/db.js');
  const status = await checkMySqlConnection();
  res.json({ success: status.connected, ...status });
});
apiRouter.all('/mysql/install', (req, res, next) => {
  installRoutes(req, res, next);
});
apiRouter.post('/mysql/seed', async (req, res) => {
  const { seedInitialDatabase } = await import('../services/seedService.js');
  const result = await seedInitialDatabase();
  res.json({ success: true, message: 'Database seeded successfully', data: result });
});
apiRouter.use('/mysql/kpi-metrics', kpiRoutes);
apiRouter.use('/mysql/daily-reports', reportRoutes);
apiRouter.use('/mysql/performance-targets', targetRoutes);
apiRouter.use('/mysql/branches', branchRoutes);
apiRouter.use('/mysql/districts', districtRoutes);
apiRouter.use('/mysql/users', userRoutes);

export default apiRouter;
