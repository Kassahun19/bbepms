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
  },

  async getPublicStats(req, res) {
    try {
      const { District } = await import('../models/District.js');
      const { Branch } = await import('../models/Branch.js');
      const { User } = await import('../models/User.js');
      const { DailyPerformanceReport } = await import('../models/DailyPerformanceReport.js');

      const [districts, branches, users, reports] = await Promise.all([
        District.findAll(),
        Branch.findAll(),
        User.findAll(),
        DailyPerformanceReport.findAll()
      ]);

      const totalDistricts = Array.isArray(districts) ? districts.length : 0;
      const totalBranches = Array.isArray(branches) ? branches.length : 0;
      const totalUsers = Array.isArray(users) ? users.length : 0;

      // Calculate employees based on actual branch employee allocations in database
      const branchStaffCount = Array.isArray(branches)
        ? branches.reduce((sum, b) => sum + (Number(b.employee_count || b.employeeCount) || 0), 0)
        : 0;
      const districtStaffCount = Array.isArray(districts)
        ? districts.reduce((sum, d) => sum + (Number(d.total_employees || d.totalEmployees) || 0), 0)
        : 0;
      
      const totalEmployees = branchStaffCount > 0 ? branchStaffCount : (districtStaffCount > 0 ? districtStaffCount : totalUsers);

      // Calculate approval efficiency from actual daily report records
      const reportList = Array.isArray(reports) ? reports : [];
      const totalReports = reportList.length;
      const approvedReports = reportList.filter(r => (r.status || '').toLowerCase() === 'approved').length;
      const pendingReports = reportList.filter(r => (r.status || '').toLowerCase() === 'pending').length;
      const rejectedReports = reportList.filter(r => (r.status || '').toLowerCase() === 'rejected').length;
      const returnedReports = reportList.filter(r => (r.status || '').toLowerCase().includes('return')).length;

      const approvalEfficiency = totalReports > 0
        ? Number(((approvedReports / totalReports) * 100).toFixed(1))
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          districtsCount: totalDistricts,
          branchesCount: totalBranches,
          employeesCount: totalEmployees,
          registeredUsersCount: totalUsers,
          branchStaffCount,
          districtStaffCount,
          totalReports,
          approvedReports,
          pendingReports,
          rejectedReports,
          returnedReports,
          approvalEfficiency
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default systemController;
