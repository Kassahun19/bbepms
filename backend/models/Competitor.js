// backend/models/Competitor.js
import { getMySqlPool, loadPersistentData, savePersistentData, executeSqlQuery } from '../config/db.js';

export const Competitor = {
  async getBanks() {
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.query(`SELECT * FROM competitor_banks ORDER BY name ASC`);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return store.competitorBanks || [];
  },

  async getBranches(districtId = null) {
    const pool = getMySqlPool();
    if (pool) {
      try {
        let sql = `SELECT * FROM competitor_branches`;
        const params = [];
        if (districtId) {
          sql += ` WHERE district_id = ? OR district_name = ?`;
          params.push(districtId, districtId);
        }
        sql += ` ORDER BY branch_name ASC`;
        const [rows] = await pool.execute(sql, params);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    let branches = store.competitorBranches || [];
    if (districtId) {
      branches = branches.filter(b => b.district_id === districtId || b.districtId === districtId || b.district_name === districtId || b.districtName === districtId);
    }
    return branches;
  },

  async getKpiMetrics() {
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.query(`SELECT * FROM competitor_kpi_metrics ORDER BY bpi_weight DESC`);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return store.competitorKpiMetrics || [];
  },

  async getBpiWeights() {
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.query(`SELECT * FROM competitor_bpi_weights`);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return store.competitorBpiWeights || [];
  },

  async updateBpiWeights(weights) {
    const pool = getMySqlPool();
    for (const w of weights) {
      const sql = `
        INSERT INTO competitor_bpi_weights (weight_id, dimension, weight_percentage, description)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE weight_percentage = VALUES(weight_percentage), description = VALUES(description);
      `;
      await executeSqlQuery(sql, [w.weight_id || `W-${Date.now()}`, w.dimension, w.weight_percentage || w.weight, w.description || '']);
    }
    const store = loadPersistentData();
    store.competitorBpiWeights = weights;
    savePersistentData(store);
    return true;
  },

  async getAiInsights(districtId = null) {
    const pool = getMySqlPool();
    if (pool) {
      try {
        let sql = `SELECT * FROM competitor_ai_insights`;
        const params = [];
        if (districtId) {
          sql += ` WHERE district_id = ?`;
          params.push(districtId);
        }
        sql += ` ORDER BY created_at DESC`;
        const [rows] = await pool.execute(sql, params);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    let insights = store.competitorAiInsights || [];
    if (districtId) {
      insights = insights.filter(i => i.district_id === districtId || i.districtId === districtId);
    }
    return insights;
  },

  async getCatchmentGaps(districtId = null) {
    const pool = getMySqlPool();
    if (pool) {
      try {
        let sql = `SELECT * FROM competitor_catchment_gaps`;
        const params = [];
        if (districtId) {
          sql += ` WHERE district_id = ?`;
          params.push(districtId);
        }
        sql += ` ORDER BY opportunity_score DESC`;
        const [rows] = await pool.execute(sql, params);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    let gaps = store.competitorCatchmentGaps || [];
    if (districtId) {
      gaps = gaps.filter(g => g.district_id === districtId || g.districtId === districtId);
    }
    return gaps;
  }
};

export default Competitor;
