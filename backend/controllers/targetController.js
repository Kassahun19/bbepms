// backend/controllers/targetController.js
import { PerformanceTarget } from '../models/PerformanceTarget.js';
import { decomposeAnnualTarget } from '../services/performanceAnalytics.js';

export const targetController = {
  async getTargets(req, res) {
    try {
      const { employeeId, branchId } = req.query;
      let targets;
      if (employeeId) {
        targets = await PerformanceTarget.findByEmployee(employeeId);
      } else if (branchId) {
        targets = await PerformanceTarget.findByBranch(branchId);
      } else {
        targets = await PerformanceTarget.findAll();
      }
      return res.status(200).json({ success: true, count: targets.length, data: targets });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getTargetById(req, res) {
    try {
      const target = await PerformanceTarget.findById(req.params.id);
      if (!target) return res.status(404).json({ success: false, error: 'Target not found' });
      return res.status(200).json({ success: true, data: target });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createTarget(req, res) {
    try {
      const annual = Number(req.body.annual_target || req.body.annualTarget || req.body.target_value || 0);
      const decomposition = decomposeAnnualTarget(annual);
      const newTarget = await PerformanceTarget.create({
        ...req.body,
        ...decomposition
      });
      return res.status(201).json({ success: true, data: newTarget });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateTarget(req, res) {
    try {
      const updated = await PerformanceTarget.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'Target not found' });
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async acceptTarget(req, res) {
    try {
      const updated = await PerformanceTarget.update(req.params.id, {
        status: 'ACCEPTED',
        employee_response: 'Accepted by Employee'
      });
      return res.status(200).json({ success: true, message: 'Target agreement confirmed', data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async rejectTarget(req, res) {
    try {
      const { reason } = req.body;
      const updated = await PerformanceTarget.update(req.params.id, {
        status: 'REJECTED',
        employee_response: 'Rejected',
        rejection_reason: reason || 'Target requires adjustment'
      });
      return res.status(200).json({ success: true, message: 'Target rejected with feedback', data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteTarget(req, res) {
    try {
      await PerformanceTarget.delete(req.params.id);
      return res.status(200).json({ success: true, message: 'Target deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default targetController;
