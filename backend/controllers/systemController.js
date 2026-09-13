// backend/controllers/systemController.js
import { AuditLog } from '../models/AuditLog.js';
import { loadPersistentData, savePersistentData, checkMySqlConnection } from '../config/db.js';

export const systemController = {
  async getAuditLogs(req, res) {
    try {
      const logs = await AuditLog.findAll(100);
      return res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getAnnouncements(req, res) {
    try {
      const store = loadPersistentData();
      return res.status(200).json({ success: true, data: store.announcements || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createAnnouncement(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.announcements) store.announcements = [];
      const newAnn = {
        announcement_id: `ANN-${Date.now()}`,
        title: req.body.title || '',
        content: req.body.content || '',
        priority: req.body.priority || 'Medium',
        target_audience: req.body.target_audience || 'ALL',
        created_by: req.user?.fullName || 'Super Admin',
        created_at: new Date().toISOString()
      };
      store.announcements.unshift(newAnn);
      savePersistentData(store);
      return res.status(201).json({ success: true, data: newAnn });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getHealth(req, res) {
    const dbStatus = await checkMySqlConnection();
    return res.status(200).json({
      status: 'ok',
      service: 'Bunna Bank Daily KPI Performance Management System API',
      version: '2.5.0-production',
      timestamp: new Date().toISOString(),
      database: dbStatus
    });
  }
};

export default systemController;
