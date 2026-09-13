// backend/models/District.js
import { getMySqlPool, loadPersistentData, savePersistentData, executeSqlQuery } from '../config/db.js';

export const District = {
  async findAll() {
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.query(`SELECT * FROM districts ORDER BY name ASC`);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return store.districts || [];
  },

  async findById(districtId) {
    if (!districtId) return null;
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.execute(`SELECT * FROM districts WHERE district_id = ? LIMIT 1`, [districtId]);
        if (rows && rows.length > 0) return rows[0];
      } catch (err) {}
    }
    const store = loadPersistentData();
    return (store.districts || []).find(d => d.district_id === districtId || d.id === districtId) || null;
  },

  async create(data) {
    const districtId = data.district_id || data.id || `DIST-${Date.now().toString(36).toUpperCase()}`;
    const district = {
      district_id: districtId,
      code: data.code || `DST-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name || '',
      region: data.region || 'Addis Ababa',
      manager_name: data.manager_name || data.managerName || null,
      phone: data.phone || null,
      email: data.email || null,
      sec_email: data.sec_email || data.secEmail || null,
      location: data.location || null,
      operation_manager: data.operation_manager || data.operationManager || null,
      type: data.type || 'District',
      branch_count: Number(data.branch_count) || 0,
      total_employees: Number(data.total_employees) || 0,
      status: data.status || 'Active'
    };

    const sql = `
      INSERT INTO districts (
        district_id, code, name, region, manager_name, phone, email,
        sec_email, location, operation_manager, type, branch_count,
        total_employees, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        region = VALUES(region),
        manager_name = VALUES(manager_name),
        status = VALUES(status);
    `;

    await executeSqlQuery(sql, [
      district.district_id, district.code, district.name, district.region,
      district.manager_name, district.phone, district.email, district.sec_email,
      district.location, district.operation_manager, district.type,
      district.branch_count, district.total_employees, district.status
    ]);

    const store = loadPersistentData();
    if (!store.districts) store.districts = [];
    const idx = store.districts.findIndex(d => d.district_id === district.district_id || d.id === district.district_id);
    if (idx >= 0) store.districts[idx] = { ...store.districts[idx], ...district };
    else store.districts.push(district);
    savePersistentData(store);

    return district;
  },

  async update(districtId, updates) {
    const district = await this.findById(districtId);
    if (!district) return null;

    const fields = [];
    const params = [];
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'district_id' && key !== 'id') {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length > 0) {
      params.push(districtId);
      const sql = `UPDATE districts SET ${fields.join(', ')} WHERE district_id = ?`;
      await executeSqlQuery(sql, params);
    }

    const store = loadPersistentData();
    if (store.districts) {
      const idx = store.districts.findIndex(d => d.district_id === districtId || d.id === districtId);
      if (idx >= 0) {
        store.districts[idx] = { ...store.districts[idx], ...updates };
        savePersistentData(store);
      }
    }
    return await this.findById(districtId);
  },

  async delete(districtId) {
    const sql = `DELETE FROM districts WHERE district_id = ?`;
    await executeSqlQuery(sql, [districtId]);

    const store = loadPersistentData();
    if (store.districts) {
      store.districts = store.districts.filter(d => d.district_id !== districtId && d.id !== districtId);
      savePersistentData(store);
    }
    return true;
  }
};

export default District;
