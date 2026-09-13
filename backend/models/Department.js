// backend/models/Department.js
import { getMySqlPool, loadPersistentData, savePersistentData, executeSqlQuery } from '../config/db.js';

export const Department = {
  async findAll() {
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.query(`SELECT * FROM departments ORDER BY name ASC`);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return store.departments || [];
  },

  async findById(deptId) {
    if (!deptId) return null;
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.execute(`SELECT * FROM departments WHERE department_id = ? LIMIT 1`, [deptId]);
        if (rows && rows.length > 0) return rows[0];
      } catch (err) {}
    }
    const store = loadPersistentData();
    return (store.departments || []).find(d => d.department_id === deptId || d.id === deptId) || null;
  },

  async create(data) {
    const deptId = data.department_id || data.id || `DEP-${Date.now().toString(36).toUpperCase()}`;
    const dept = {
      department_id: deptId,
      code: data.code || `DPT-${Math.floor(10 + Math.random() * 90)}`,
      name: data.name || '',
      description: data.description || null
    };

    const sql = `
      INSERT INTO departments (department_id, code, name, description)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);
    `;
    await executeSqlQuery(sql, [dept.department_id, dept.code, dept.name, dept.description]);

    const store = loadPersistentData();
    if (!store.departments) store.departments = [];
    const idx = store.departments.findIndex(d => d.department_id === dept.department_id || d.id === dept.department_id);
    if (idx >= 0) store.departments[idx] = { ...store.departments[idx], ...dept };
    else store.departments.push(dept);
    savePersistentData(store);

    return dept;
  },

  async update(deptId, updates) {
    const fields = [];
    const params = [];
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'department_id' && key !== 'id') {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length > 0) {
      params.push(deptId);
      const sql = `UPDATE departments SET ${fields.join(', ')} WHERE department_id = ?`;
      await executeSqlQuery(sql, params);
    }
    const store = loadPersistentData();
    if (store.departments) {
      const idx = store.departments.findIndex(d => d.department_id === deptId || d.id === deptId);
      if (idx >= 0) {
        store.departments[idx] = { ...store.departments[idx], ...updates };
        savePersistentData(store);
      }
    }
    return await this.findById(deptId);
  },

  async delete(deptId) {
    const sql = `DELETE FROM departments WHERE department_id = ?`;
    await executeSqlQuery(sql, [deptId]);
    const store = loadPersistentData();
    if (store.departments) {
      store.departments = store.departments.filter(d => d.department_id !== deptId && d.id !== deptId);
      savePersistentData(store);
    }
    return true;
  }
};

export default Department;
