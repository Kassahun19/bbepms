import { Router } from 'express';
import authRoutes from './authRoutes';
import kpiMetricRoutes from './kpiMetricRoutes';
import dailyReportRoutes from './dailyReportRoutes';
import targetRoutes from './targetRoutes';
import branchRoutes from './branchRoutes';
import districtRoutes from './districtRoutes';
import analyticsRoutes from './analyticsRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/kpi-metrics', kpiMetricRoutes);
apiRouter.use('/daily-reports', dailyReportRoutes);
apiRouter.use('/targets', targetRoutes);
apiRouter.use('/branches', branchRoutes);
apiRouter.use('/districts', districtRoutes);
apiRouter.use('/analytics', analyticsRoutes);

export default apiRouter;
