// backend/controllers/kpiController.js
import { KpiMetric } from '../models/KpiMetric.js';

export const kpiController = {
  async getKpis(req, res) {
    try {
      const kpis = await KpiMetric.findAll();
      return res.status(200).json({ success: true, count: kpis.length, data: kpis });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getKpiById(req, res) {
    try {
      const kpi = await KpiMetric.findById(req.params.id);
      if (!kpi) return res.status(404).json({ success: false, error: 'KPI Metric not found' });
      return res.status(200).json({ success: true, data: kpi });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createKpi(req, res) {
    try {
      const newKpi = await KpiMetric.create(req.body);
      return res.status(201).json({ success: true, data: newKpi });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateKpi(req, res) {
    try {
      const updated = await KpiMetric.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'KPI Metric not found' });
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteKpi(req, res) {
    try {
      await KpiMetric.delete(req.params.id);
      return res.status(200).json({ success: true, message: 'KPI Metric deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default kpiController;
