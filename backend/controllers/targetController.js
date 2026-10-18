// backend/controllers/targetController.js
import { PerformanceTarget } from '../models/PerformanceTarget.js';
import { decomposeAnnualTarget } from '../services/performanceAnalytics.js';
import { AuditLog } from '../models/AuditLog.js';

export const targetController = {
  async getTargets(req, res) {
    try {
      const { employeeId, branchId, districtId } = req.query;
      let targets = await PerformanceTarget.findAll();

      if (employeeId) {
        targets = targets.filter(t => t.employee_id === employeeId || t.employeeId === employeeId);
      } else if (branchId) {
        targets = targets.filter(t => t.branch_id === branchId || t.branchId === branchId);
      } else if (districtId) {
        targets = targets.filter(t => t.district_id === districtId || t.districtId === districtId);
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
      const annual = Number(req.body.annual_target || req.body.annualTarget || req.body.target_value || req.body.targetValue || 0);
      const decomposition = decomposeAnnualTarget(annual);
      const newTarget = await PerformanceTarget.create({
        ...req.body,
        annual_target: annual,
        target_value: annual,
        ...decomposition
      });

      await AuditLog.create({
        user_id: req.user?.userId || 'SYSTEM',
        user_name: req.user?.fullName || 'Target Manager',
        action: 'CREATE_TARGET',
        entity_type: 'PerformanceTarget',
        entity_id: newTarget.target_id,
        details: { annualTarget: annual }
      });

      return res.status(201).json({ success: true, data: newTarget });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateTarget(req, res) {
    try {
      const annual = req.body.annual_target || req.body.annualTarget || req.body.target_value || req.body.targetValue;
      let updates = { ...req.body };
      if (annual !== undefined) {
        const decomposition = decomposeAnnualTarget(Number(annual));
        updates = { ...updates, annual_target: Number(annual), target_value: Number(annual), ...decomposition };
      }
      const updated = await PerformanceTarget.update(req.params.id, updates);
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
      await AuditLog.create({
        user_id: req.user?.userId || 'EMPLOYEE',
        user_name: req.user?.fullName || 'Employee',
        action: 'ACCEPT_TARGET',
        entity_type: 'PerformanceTarget',
        entity_id: req.params.id
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
      await AuditLog.create({
        user_id: req.user?.userId || 'EMPLOYEE',
        user_name: req.user?.fullName || 'Employee',
        action: 'REJECT_TARGET',
        entity_type: 'PerformanceTarget',
        entity_id: req.params.id,
        details: { reason }
      });
      return res.status(200).json({ success: true, message: 'Target rejected with feedback', data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async respondToTarget(req, res) {
    try {
      const { response, reason } = req.body;
      const status = response === 'ACCEPTED' || response === 'Accept' ? 'ACCEPTED' : 'REJECTED';
      const updated = await PerformanceTarget.update(req.params.id, {
        status,
        employee_response: response,
        rejection_reason: reason || null
      });
      return res.status(200).json({ success: true, message: `Target ${status.toLowerCase()} successfully`, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async batchRespond(req, res) {
    try {
      const { targetIds, response, reason } = req.body;
      const ids = Array.isArray(targetIds) ? targetIds : [];
      const status = response === 'ACCEPTED' || response === 'Accept' ? 'ACCEPTED' : 'REJECTED';
      const results = [];
      for (const id of ids) {
        const updated = await PerformanceTarget.update(id, {
          status,
          employee_response: response,
          rejection_reason: reason || null
        });
        results.push(updated);
      }
      return res.status(200).json({ success: true, message: `Processed ${results.length} targets`, count: results.length, data: results });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async sendTargets(req, res) {
    try {
      const { targets, targetList } = req.body;
      const list = Array.isArray(targets) ? targets : (Array.isArray(targetList) ? targetList : [req.body]);
      const createdList = [];
      for (const t of list) {
        const annual = Number(t.annual_target || t.annualTarget || t.target_value || t.targetValue || 0);
        const decomposition = decomposeAnnualTarget(annual);
        const item = await PerformanceTarget.create({
          ...t,
          status: 'PENDING_ACCEPTANCE',
          annual_target: annual,
          target_value: annual,
          ...decomposition
        });
        createdList.push(item);
      }
      return res.status(201).json({ success: true, message: `Dispatched ${createdList.length} target agreements`, count: createdList.length, data: createdList });
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
