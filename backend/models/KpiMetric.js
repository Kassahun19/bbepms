// backend/models/KpiMetric.js
import { getMySqlPool, loadPersistentData, savePersistentData, executeSqlQuery } from '../config/db.js';

export const KpiMetric = {
  async findAll() {
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.query(`SELECT * FROM kpi_metrics ORDER BY weight DESC`);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return store.kpiMetrics || [];
  },

  async findById(kpiId) {
    if (!kpiId) return null;
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.execute(`SELECT * FROM kpi_metrics WHERE kpi_id = ? OR code = ? LIMIT 1`, [kpiId, kpiId]);
        if (rows && rows.length > 0) return rows[0];
      } catch (err) {}
    }
    const store = loadPersistentData();
    return (store.kpiMetrics || []).find(k => k.kpi_id === kpiId || k.id === kpiId || k.code === kpiId) || null;
  },

  async create(data) {
    const kpiId = data.kpi_id || data.id || `KPI-${Date.now().toString(36).toUpperCase()}`;
    const kpi = {
      kpi_id: kpiId,
      code: data.code || `KPI_${kpiId.slice(-4)}`,
      name: data.name || '',
      category: data.category || 'Financial',
      unit: data.unit || 'ETB',
      weight: Number(data.weight) || 10.0,
      description: data.description || null,
      frequency: data.frequency || 'Daily',
      status: data.status || 'Active'
    };

    const sql = `
      INSERT INTO kpi_metrics (
        kpi_id, code, name, category, unit, weight, description, frequency, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        weight = VALUES(weight),
        status = VALUES(status);
    `;

    await executeSqlQuery(sql, [
      kpi.kpi_id, kpi.code, kpi.name, kpi.category,
      kpi.unit, kpi.weight, kpi.description, kpi.frequency, kpi.status
    ]);

    const store = loadPersistentData();
    if (!store.kpiMetrics) store.kpiMetrics = [];
    const idx = store.kpiMetrics.findIndex(k => k.kpi_id === kpi.kpi_id || k.id === kpi.kpi_id);
    if (idx >= 0) store.kpiMetrics[idx] = { ...store.kpiMetrics[idx], ...kpi };
    else store.kpiMetrics.push(kpi);
    savePersistentData(store);

    return kpi;
  },

  async update(kpiId, updates) {
    const kpi = await this.findById(kpiId);
    if (!kpi) return null;

    const fields = [];
    const params = [];
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'kpi_id' && key !== 'id') {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length > 0) {
      params.push(kpiId);
      const sql = `UPDATE kpi_metrics SET ${fields.join(', ')} WHERE kpi_id = ?`;
      await executeSqlQuery(sql, params);
    }

    const store = loadPersistentData();
    if (store.kpiMetrics) {
      const idx = store.kpiMetrics.findIndex(k => k.kpi_id === kpiId || k.id === kpiId);
      if (idx >= 0) {
        store.kpiMetrics[idx] = { ...store.kpiMetrics[idx], ...updates };
        savePersistentData(store);
      }
    }
    return await this.findById(kpiId);
  },

  async delete(kpiId) {
    const sql = `DELETE FROM kpi_metrics WHERE kpi_id = ?`;
    await executeSqlQuery(sql, [kpiId]);

    const store = loadPersistentData();
    if (store.kpiMetrics) {
      store.kpiMetrics = store.kpiMetrics.filter(k => k.kpi_id !== kpiId && k.id !== kpiId);
      savePersistentData(store);
    }
    return true;
  }
};

export default KpiMetric;
