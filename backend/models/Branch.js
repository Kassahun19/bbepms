// backend/models/Branch.js
import { getMySqlPool, loadPersistentData, savePersistentData, executeSqlQuery } from '../config/db.js';

export const Branch = {
  async findAll() {
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.query(`SELECT * FROM branches ORDER BY name ASC`);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return store.branches || [];
  },

  async findById(branchId) {
    if (!branchId) return null;
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.execute(`SELECT * FROM branches WHERE branch_id = ? OR sol_id = ? LIMIT 1`, [branchId, branchId]);
        if (rows && rows.length > 0) return rows[0];
      } catch (err) {}
    }
    const store = loadPersistentData();
    return (store.branches || []).find(b => b.branch_id === branchId || b.id === branchId || b.sol_id === branchId || b.solId === branchId) || null;
  },

  async findByDistrict(districtId) {
    if (!districtId) return [];
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.execute(`SELECT * FROM branches WHERE district_id = ? ORDER BY name ASC`, [districtId]);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return (store.branches || []).filter(b => b.district_id === districtId || b.districtId === districtId);
  },

  async create(data) {
    const branchId = data.branch_id || data.id || `BR-${Date.now().toString(36).toUpperCase()}`;
    const branch = {
      branch_id: branchId,
      sol_id: data.sol_id || data.solId || `SOL-${Math.floor(1000 + Math.random() * 9000)}`,
      code: data.code || `BRC-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name || '',
      district_id: data.district_id || data.districtId || '',
      district_name: data.district_name || data.districtName || '',
      grade: data.grade || 'Grade I',
      type: data.type || 'Branch',
      manager_name: data.manager_name || data.managerName || null,
      location: data.location || null,
      phone: data.phone || null,
      region: data.region || null,
      employee_count: Number(data.employee_count || data.employeeCount) || 0,
      status: data.status || 'Active'
    };

    const sql = `
      INSERT INTO branches (
        branch_id, sol_id, code, name, district_id, district_name,
        grade, type, manager_name, location, phone, region,
        employee_count, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        district_id = VALUES(district_id),
        district_name = VALUES(district_name),
        manager_name = VALUES(manager_name),
        status = VALUES(status);
    `;

    await executeSqlQuery(sql, [
      branch.branch_id, branch.sol_id, branch.code, branch.name,
      branch.district_id, branch.district_name, branch.grade, branch.type,
      branch.manager_name, branch.location, branch.phone, branch.region,
      branch.employee_count, branch.status
    ]);

    const store = loadPersistentData();
    if (!store.branches) store.branches = [];
    const idx = store.branches.findIndex(b => b.branch_id === branch.branch_id || b.id === branch.branch_id);
    if (idx >= 0) store.branches[idx] = { ...store.branches[idx], ...branch };
    else store.branches.push(branch);
    savePersistentData(store);

    return branch;
  },

  async update(branchId, updates) {
    const branch = await this.findById(branchId);
    if (!branch) return null;

    const fields = [];
    const params = [];
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'branch_id' && key !== 'id') {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length > 0) {
      params.push(branchId);
      const sql = `UPDATE branches SET ${fields.join(', ')} WHERE branch_id = ?`;
      await executeSqlQuery(sql, params);
    }

    const store = loadPersistentData();
    if (store.branches) {
      const idx = store.branches.findIndex(b => b.branch_id === branchId || b.id === branchId);
      if (idx >= 0) {
        store.branches[idx] = { ...store.branches[idx], ...updates };
        savePersistentData(store);
      }
    }
    return await this.findById(branchId);
  },

  async delete(branchId) {
    const sql = `DELETE FROM branches WHERE branch_id = ?`;
    await executeSqlQuery(sql, [branchId]);

    const store = loadPersistentData();
    if (store.branches) {
      store.branches = store.branches.filter(b => b.branch_id !== branchId && b.id !== branchId);
      savePersistentData(store);
    }
    return true;
  }
};

export default Branch;
