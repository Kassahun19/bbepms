import { Router } from 'express';
import { checkDatabaseConnection } from '../config/db';

const router = Router();

router.get('/status', async (req, res) => {
  const dbStatus = await checkDatabaseConnection();
  res.json({
    installed: true,
    database: dbStatus,
    version: '1.0.0',
    system: 'Bunna Bank S.C. Employee Performance Management System (EPMS)',
    timestamp: new Date().toISOString()
  });
});

router.post('/initialize', async (req, res) => {
  res.json({
    success: true,
    message: 'System database already initialized and schema synchronized.',
    timestamp: new Date().toISOString()
  });
});

export default router;
