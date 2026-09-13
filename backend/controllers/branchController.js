// backend/controllers/branchController.js
import { Branch } from '../models/Branch.js';
import { User } from '../models/User.js';

export const branchController = {
  async getBranches(req, res) {
    try {
      const { districtId } = req.query;
      let branches;
      if (districtId) {
        branches = await Branch.findByDistrict(districtId);
      } else {
        branches = await Branch.findAll();
      }
      return res.status(200).json({ success: true, count: branches.length, data: branches });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getBranchById(req, res) {
    try {
      const branch = await Branch.findById(req.params.id);
      if (!branch) return res.status(404).json({ success: false, error: 'Branch not found' });
      const employees = (await User.findAll()).filter(u => u.branch_id === branch.branch_id || u.branchId === branch.branch_id);
      return res.status(200).json({ success: true, data: { ...branch, employees } });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createBranch(req, res) {
    try {
      const newBranch = await Branch.create(req.body);
      return res.status(201).json({ success: true, data: newBranch });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateBranch(req, res) {
    try {
      const updated = await Branch.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'Branch not found' });
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteBranch(req, res) {
    try {
      await Branch.delete(req.params.id);
      return res.status(200).json({ success: true, message: 'Branch deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default branchController;
