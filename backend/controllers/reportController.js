// backend/controllers/reportController.js
import { DailyPerformanceReport } from '../models/DailyPerformanceReport.js';
import { AuditLog } from '../models/AuditLog.js';

export const reportController = {
  async getReports(req, res) {
    try {
      const { employeeId, branchId, districtId, status, date } = req.query;
      let reports = await DailyPerformanceReport.findAll();

      // Role-based data access scoping
      if (req.user && req.user.role === 'EMPLOYEE' && !employeeId) {
        reports = reports.filter(r => r.employee_id === req.user.userId || r.employeeId === req.user.userId || r.employee_id === req.user.id);
      } else if (req.user && req.user.role === 'MANAGER' && !branchId && req.user.branchId) {
        reports = reports.filter(r => r.branch_id === req.user.branchId || r.branchId === req.user.branchId);
      }

      if (employeeId) {
        reports = reports.filter(r => r.employee_id === employeeId || r.employeeId === employeeId);
      }
      if (branchId) {
        reports = reports.filter(r => r.branch_id === branchId || r.branchId === branchId);
      }
      if (districtId) {
        reports = reports.filter(r => r.district_id === districtId || r.districtId === districtId);
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

      // FIX: RBAC scoping - employees can only see their own reports
      if (req.user && req.user.role === 'EMPLOYEE') {
        const empId = report.employee_id || report.employeeId;
        if (empId !== req.user.userId && empId !== req.user.id) {
          return res.status(403).json({ success: false, error: 'Unauthorized to view this report' });
        }
      }
      
      return res.status(200).json({ success: true, data: report });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createReport(req, res) {
    try {
      const body = req.body;
      const reportDate = body.reportDate || body.report_date || new Date().toISOString().split('T')[0];
      const status = body.status || 'Pending';

      // Validation: Non-negative numbers
      const numericFields = ['deposits_etb', 'depositsETB', 'foreign_currency_etb', 'foreignCurrencyETB', 'customer_onboarding', 'customerOnboarding', 'mobile_banking', 'mobileBanking'];
      for (const f of numericFields) {
        if (body[f] !== undefined && Number(body[f]) < 0) {
          return res.status(400).json({ success: false, error: `Invalid value for ${f}: must be non-negative (0 or greater).` });
        }
      }

      // Check Sunday submission restriction for official submissions (allow Drafts)
      if (status !== 'Draft') {
        const d = new Date(reportDate);
        if (d.getDay() === 0) {
          return res.status(400).json({ success: false, error: 'Daily performance submission is disallowed on Sundays.' });
        }
      }

      const reportPayload = {
        ...body,
        employee_id: body.employeeId || body.employee_id || req.user?.userId || req.user?.id,
        employee_name: body.employeeName || body.employee_name || req.user?.fullName,
        branch_id: body.branchId || body.branch_id || req.user?.branchId,
        branch_name: body.branchName || body.branch_name || req.user?.branchName,
        district_id: body.districtId || body.district_id || req.user?.districtId,
        district_name: body.districtName || body.district_name || req.user?.districtName,
        status
      };

      const newReport = await DailyPerformanceReport.create(reportPayload);

      await AuditLog.create({
        user_id: req.user?.userId || newReport.employee_id,
        user_name: req.user?.fullName || newReport.employee_name,
        action: status === 'Draft' ? 'SAVE_DRAFT_REPORT' : 'SUBMIT_DAILY_REPORT',
        entity_type: 'DailyPerformanceReport',
        entity_id: newReport.report_id,
        details: { date: newReport.report_date, deposits: newReport.deposits_etb, status }
      });

      return res.status(201).json({ success: true, message: `Report ${status.toLowerCase()}ed successfully`, data: newReport });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateReport(req, res) {
    try {
      const report = await DailyPerformanceReport.findById(req.params.id);
      if (!report) return res.status(404).json({ success: false, error: 'Report not found' });

      // If employee, verify ownership
      if (req.user && req.user.role === 'EMPLOYEE') {
        const isOwner = report.employee_id === req.user.userId || report.employeeId === req.user.userId || report.employee_id === req.user.id;
        if (!isOwner) {
          return res.status(403).json({ success: false, error: 'You are only authorized to edit your own reports.' });
        }
      }

      const updated = await DailyPerformanceReport.update(req.params.id, req.body);
      return res.status(200).json({ success: true, message: 'Report updated successfully', data: updated });
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
        entity_id: req.params.id,
        details: { comment }
      });
      return res.status(200).json({ success: true, message: 'Report approved successfully', data: approved });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async rejectReport(req, res) {
    try {
      const reviewer = req.user?.fullName || 'Branch Manager';
      const { reason, comment } = req.body;
      const rejected = await DailyPerformanceReport.reject(req.params.id, reviewer, reason || comment || 'Report rejected');
      await AuditLog.create({
        user_id: req.user?.userId || 'SYSTEM',
        user_name: reviewer,
        action: 'REJECT_DAILY_REPORT',
        entity_type: 'DailyPerformanceReport',
        entity_id: req.params.id,
        details: { reason: reason || comment }
      });
      return res.status(200).json({ success: true, message: 'Report rejected', data: rejected });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async returnReport(req, res) {
    try {
      const reviewer = req.user?.fullName || 'Branch Manager';
      const { comment, reason } = req.body;
      const returned = await DailyPerformanceReport.update(req.params.id, {
        status: 'Returned',
        reviewed_by: reviewer,
        reviewed_at: new Date().toISOString(),
        manager_comment: comment || reason || 'Returned for correction'
      });
      await AuditLog.create({
        user_id: req.user?.userId || 'SYSTEM',
        user_name: reviewer,
        action: 'RETURN_DAILY_REPORT',
        entity_type: 'DailyPerformanceReport',
        entity_id: req.params.id,
        details: { comment: comment || reason }
      });
      return res.status(200).json({ success: true, message: 'Report returned for correction', data: returned });
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
      const report = await DailyPerformanceReport.findById(req.params.id);
      if (!report) return res.status(404).json({ success: false, error: 'Report not found' });

      // If employee, can only delete their own Draft or Returned reports
      if (req.user && req.user.role === 'EMPLOYEE') {
        const isOwner = report.employee_id === req.user.userId || report.employeeId === req.user.userId || report.employee_id === req.user.id;
        if (!isOwner) {
          return res.status(403).json({ success: false, error: 'Unauthorized to delete other employees reports.' });
        }
        if (report.status === 'Approved') {
          return res.status(400).json({ success: false, error: 'Approved reports cannot be deleted by employees.' });
        }
      }

      await DailyPerformanceReport.delete(req.params.id);
      await AuditLog.create({
        user_id: req.user?.userId || 'SYSTEM',
        user_name: req.user?.fullName || 'User',
        action: 'DELETE_DAILY_REPORT',
        entity_type: 'DailyPerformanceReport',
        entity_id: req.params.id
      });
      return res.status(200).json({ success: true, message: 'Report deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default reportController;
