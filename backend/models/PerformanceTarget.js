// backend/models/PerformanceTarget.js
import { getMySqlPool, loadPersistentData, savePersistentData, executeSqlQuery } from '../config/db.js';

export const PerformanceTarget = {
  async findAll() {
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.query(`SELECT * FROM performance_targets ORDER BY created_at DESC`);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return store.targets || [];
  },

  async findById(targetId) {
    if (!targetId) return null;
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.execute(`SELECT * FROM performance_targets WHERE target_id = ? LIMIT 1`, [targetId]);
        if (rows && rows.length > 0) return rows[0];
      } catch (err) {}
    }
    const store = loadPersistentData();
    return (store.targets || []).find(t => t.target_id === targetId || t.id === targetId) || null;
  },

  async findByEmployee(employeeId) {
    if (!employeeId) return [];
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.execute(`SELECT * FROM performance_targets WHERE employee_id = ?`, [employeeId]);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return (store.targets || []).filter(t => t.employee_id === employeeId || t.employeeId === employeeId);
  },

  async findByBranch(branchId) {
    if (!branchId) return [];
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.execute(`SELECT * FROM performance_targets WHERE branch_id = ?`, [branchId]);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return (store.targets || []).filter(t => t.branch_id === branchId || t.branchId === branchId);
  },

  async create(data) {
    const targetId = data.target_id || data.id || `TGT-${Date.now().toString(36).toUpperCase()}`;
    const annual = Number(data.annual_target || data.annualTarget || data.target_value || 0);
    // Ethiopian banking standard: 300 active operational banking days per year
    const daily = Number(data.daily_target || data.dailyTarget || (annual / 300).toFixed(2));
    const weekly = Number(data.weekly_target || data.weeklyTarget || (annual / 52).toFixed(2));
    const monthly = Number(data.monthly_target || data.monthlyTarget || (annual / 12).toFixed(2));
    const quarterly = Number(data.quarterly_target || data.quarterlyTarget || (annual / 4).toFixed(2));
    const semiAnnual = Number(data.semi_annual_target || data.semiAnnualTarget || (annual / 2).toFixed(2));

    const target = {
      target_id: targetId,
      kpi_id: data.kpi_id || data.kpiId || '',
      employee_id: data.employee_id || data.employeeId || null,
      branch_id: data.branch_id || data.branchId || null,
      district_id: data.district_id || data.districtId || null,
      fiscal_year_id: data.fiscal_year_id || data.fiscalYearId || 'FY-2025-2026',
      period: data.period || 'Annual',
      year: Number(data.year) || new Date().getFullYear(),
      month: data.month ? Number(data.month) : null,
      target_value: annual,
      annual_target: annual,
      daily_target: daily,
      weekly_target: weekly,
      monthly_target: monthly,
      quarterly_target: quarterly,
      semi_annual_target: semiAnnual,
      status: data.status || 'ACCEPTED',
      assigned_by: data.assigned_by || data.assignedBy || null,
      employee_response: data.employee_response || data.employeeResponse || null,
      rejection_reason: data.rejection_reason || data.rejectionReason || null
    };

    const sql = `
      INSERT INTO performance_targets (
        target_id, kpi_id, employee_id, branch_id, district_id, fiscal_year_id,
        period, year, month, target_value, annual_target, daily_target,
        weekly_target, monthly_target, quarterly_target, semi_annual_target,
        status, assigned_by, employee_response, rejection_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        annual_target = VALUES(annual_target),
        daily_target = VALUES(daily_target),
        status = VALUES(status);
    `;

    await executeSqlQuery(sql, [
      target.target_id, target.kpi_id, target.employee_id, target.branch_id,
      target.district_id, target.fiscal_year_id, target.period, target.year,
      target.month, target.target_value, target.annual_target, target.daily_target,
      target.weekly_target, target.monthly_target, target.quarterly_target,
      target.semi_annual_target, target.status, target.assigned_by,
      target.employee_response, target.rejection_reason
    ]);

    const store = loadPersistentData();
    if (!store.targets) store.targets = [];
    const idx = store.targets.findIndex(t => t.target_id === target.target_id || t.id === target.target_id);
    if (idx >= 0) store.targets[idx] = { ...store.targets[idx], ...target };
    else store.targets.push(target);
    savePersistentData(store);

    return target;
  },

  async update(targetId, updates) {
    const target = await this.findById(targetId);
    if (!target) return null;

    const fields = [];
    const params = [];
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'target_id' && key !== 'id') {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length > 0) {
      params.push(targetId);
      const sql = `UPDATE performance_targets SET ${fields.join(', ')} WHERE target_id = ?`;
      await executeSqlQuery(sql, params);
    }

    const store = loadPersistentData();
    if (store.targets) {
      const idx = store.targets.findIndex(t => t.target_id === targetId || t.id === targetId);
      if (idx >= 0) {
        store.targets[idx] = { ...store.targets[idx], ...updates };
        savePersistentData(store);
      }
    }
    return await this.findById(targetId);
  },

  async delete(targetId) {
    const sql = `DELETE FROM performance_targets WHERE target_id = ?`;
    await executeSqlQuery(sql, [targetId]);

    const store = loadPersistentData();
    if (store.targets) {
      store.targets = store.targets.filter(t => t.target_id !== targetId && t.id !== targetId);
      savePersistentData(store);
    }
    return true;
  }
};

export default PerformanceTarget;
