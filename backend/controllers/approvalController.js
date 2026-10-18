// backend/controllers/approvalController.js
import { DailyPerformanceReport } from '../models/DailyPerformanceReport.js';
import { AuditLog } from '../models/AuditLog.js';

export const approvalController = {
  async executeAction(req, res) {
    try {
      const { reportIds, action, managerId, commentText } = req.body;
      const ids = Array.isArray(reportIds) ? reportIds : (reportIds ? [reportIds] : []);

      if (ids.length === 0) {
        return res.status(400).json({ success: false, error: 'No report IDs provided for approval action.' });
      }

      const reviewer = req.user?.fullName || 'Authorized Reviewer';
      const results = [];

      for (const id of ids) {
        if (action === 'delete') {
          await DailyPerformanceReport.delete(id);
          await AuditLog.create({
            user_id: req.user?.userId || 'SYSTEM',
            user_name: reviewer,
            action: 'DELETE_DAILY_REPORT',
            entity_type: 'DailyPerformanceReport',
            entity_id: id,
            details: { comment: commentText }
          });
          results.push({ id, status: 'Deleted' });
        } else if (action === 'approve') {
          const updated = await DailyPerformanceReport.approve(id, reviewer, commentText);
          await AuditLog.create({
            user_id: req.user?.userId || 'SYSTEM',
            user_name: reviewer,
            action: 'APPROVE_DAILY_REPORT',
            entity_type: 'DailyPerformanceReport',
            entity_id: id,
            details: { comment: commentText }
          });
          results.push(updated);
        } else if (action === 'reject') {
          const updated = await DailyPerformanceReport.reject(id, reviewer, commentText || 'Report rejected by reviewer');
          await AuditLog.create({
            user_id: req.user?.userId || 'SYSTEM',
            user_name: reviewer,
            action: 'REJECT_DAILY_REPORT',
            entity_type: 'DailyPerformanceReport',
            entity_id: id,
            details: { reason: commentText }
          });
          results.push(updated);
        } else if (action === 'return') {
          const updated = await DailyPerformanceReport.update(id, {
            status: 'Returned',
            reviewed_by: reviewer,
            reviewed_at: new Date().toISOString(),
            manager_comment: commentText || 'Returned for correction'
          });
          await AuditLog.create({
            user_id: req.user?.userId || 'SYSTEM',
            user_name: reviewer,
            action: 'RETURN_DAILY_REPORT',
            entity_type: 'DailyPerformanceReport',
            entity_id: id,
            details: { comment: commentText }
          });
          results.push(updated);
        } else if (action === 'suspend') {
          const updated = await DailyPerformanceReport.update(id, {
            status: 'Suspended',
            reviewed_by: reviewer,
            reviewed_at: new Date().toISOString(),
            manager_comment: commentText || 'Suspended by reviewer'
          });
          await AuditLog.create({
            user_id: req.user?.userId || managerId || 'SYSTEM',
            user_name: reviewer,
            action: 'SUSPEND_DAILY_REPORT',
            entity_type: 'DailyPerformanceReport',
            entity_id: id,
            details: { comment: commentText }
          });
          results.push(updated);
        } else {
          return res.status(400).json({ success: false, error: `Unsupported approval action: ${action}` });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Successfully executed '${action}' on ${results.length} report(s).`,
        count: results.length,
        data: results
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default approvalController;
