// backend/controllers/competitorController.js
import { Competitor } from '../models/Competitor.js';

export const competitorController = {
  async getBanks(req, res) {
    try {
      const banks = await Competitor.getBanks();
      return res.status(200).json({ success: true, count: banks.length, data: banks });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getBranches(req, res) {
    try {
      const { districtId } = req.query;
      const branches = await Competitor.getBranches(districtId);
      return res.status(200).json({ success: true, count: branches.length, data: branches });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getKpiMetrics(req, res) {
    try {
      const metrics = await Competitor.getKpiMetrics();
      return res.status(200).json({ success: true, count: metrics.length, data: metrics });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getBpiWeights(req, res) {
    try {
      const weights = await Competitor.getBpiWeights();
      return res.status(200).json({ success: true, data: weights });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateBpiWeights(req, res) {
    try {
      const { weights } = req.body;
      await Competitor.updateBpiWeights(weights || []);
      return res.status(200).json({ success: true, message: 'BPI weights updated' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getAiInsights(req, res) {
    try {
      const { districtId } = req.query;
      const insights = await Competitor.getAiInsights(districtId);
      return res.status(200).json({ success: true, count: insights.length, data: insights });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getCatchmentGaps(req, res) {
    try {
      const { districtId } = req.query;
      const gaps = await Competitor.getCatchmentGaps(districtId);
      return res.status(200).json({ success: true, count: gaps.length, data: gaps });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default competitorController;
