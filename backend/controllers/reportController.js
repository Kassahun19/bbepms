// backend/controllers/reportController.js
import { DailyPerformanceReport } from '../models/DailyPerformanceReport.js';
import { AuditLog } from '../models/AuditLog.js';

export const reportController = {
  async getReports(req, res) {
    try {
      const { employeeId, branchId, status, date } = req.query;
      let reports = await DailyPerformanceReport.findAll();

      if (employeeId) {
        reports = reports.filter(r => r.employee_id === employeeId || r.employeeId === employeeId);
      }
      if (branchId) {
        reports = reports.filter(r => r.branch_id === branchId || r.branchId === branchId);
      }
      if (status) {
        reports = reports.filter(r => (r.status || '').toLowerCase() === status.toLowerCase());
      }
      if (date) {
        reports = reports.filter(r => (r.report_date || r.reportDate) === date);
      }

      return res.status(200).json({ success: true, count: reports.length, data: reports });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getReportById(req, res) {
    try {
      const report = await DailyPerformanceReport.findById(req.params.id);
      if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createReport(req, res) {
    try {
      const newReport = await DailyPerformanceReport.create(req.body);
      await AuditLog.create({
        user_id: req.user?.userId || newReport.employee_id,
        user_name: req.user?.fullName || newReport.employee_name,
        action: 'SUBMIT_DAILY_REPORT',
        entity_type: 'DailyPerformanceReport',
        entity_id: newReport.report_id,
        details: { date: newReport.report_date, deposits: newReport.deposits_etb }
      });
      return res.status(201).json({ success: true, data: newReport });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateReport(req, res) {
    try {
      const updated = await DailyPerformanceReport.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'Report not found' });
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async approveReport(req, res) {
    try {
      const reviewer = req.user?.fullName || 'Branch Manager';
      const { comment } = req.body;
      const approved = await DailyPerformanceReport.approve(req.params.id, reviewer, comment);
      await AuditLog.create({
        user_id: req.user?.userId || 'SYSTEM',
        user_name: reviewer,
        action: 'APPROVE_DAILY_REPORT',
        entity_type: 'DailyPerformanceReport',
        entity_id: req.params.id
      });
      return res.status(200).json({ success: true, message: 'Report approved', data: approved });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async rejectReport(req, res) {
    try {
      const reviewer = req.user?.fullName || 'Branch Manager';
      const { reason } = req.body;
      const rejected = await DailyPerformanceReport.reject(req.params.id, reviewer, reason);
      return res.status(200).json({ success: true, message: 'Report rejected', data: rejected });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async bulkApprove(req, res) {
    try {
      const { reportIds, comment } = req.body;
      const reviewer = req.user?.fullName || 'Branch Manager';
      const results = [];
      for (const id of (reportIds || [])) {
        const approved = await DailyPerformanceReport.approve(id, reviewer, comment);
        results.push(approved);
      }
      return res.status(200).json({ success: true, count: results.length, data: results });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteReport(req, res) {
    try {
      await DailyPerformanceReport.delete(req.params.id);
      return res.status(200).json({ success: true, message: 'Report deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default reportController;
