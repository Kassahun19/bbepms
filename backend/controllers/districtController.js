// backend/controllers/districtController.js
import { District } from '../models/District.js';
import { Branch } from '../models/Branch.js';
import { DailyPerformanceReport } from '../models/DailyPerformanceReport.js';
import { calculateDistrictRankings } from '../services/performanceAnalytics.js';

export const districtController = {
  async getDistricts(req, res) {
    try {
      const districts = await District.findAll();
      return res.status(200).json({ success: true, count: districts.length, data: districts });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getDistrictById(req, res) {
    try {
      const district = await District.findById(req.params.id);
      if (!district) return res.status(404).json({ success: false, error: 'District not found' });
      const branches = await Branch.findByDistrict(district.district_id || district.id);
      return res.status(200).json({ success: true, data: { ...district, branches } });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createDistrict(req, res) {
    try {
      const newDistrict = await District.create(req.body);
      return res.status(201).json({ success: true, data: newDistrict });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateDistrict(req, res) {
    try {
      const updated = await District.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'District not found' });
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteDistrict(req, res) {
    try {
      await District.delete(req.params.id);
      return res.status(200).json({ success: true, message: 'District deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getDistrictRankings(req, res) {
    try {
      const districts = await District.findAll();
      const branches = await Branch.findAll();
      const reports = await DailyPerformanceReport.findAll();
      const rankings = calculateDistrictRankings(districts, reports, branches);
      return res.status(200).json({ success: true, data: rankings });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default districtController;
