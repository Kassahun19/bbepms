// backend/models/AuditLog.js
import { getMySqlPool, loadPersistentData, savePersistentData, executeSqlQuery } from '../config/db.js';

export const AuditLog = {
  async findAll(limit = 100) {
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.query(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?`, [Number(limit) || 100]);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return (store.auditLogs || []).slice(0, limit);
  },

  async create(data) {
    const logId = data.log_id || data.id || `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const log = {
      log_id: logId,
      user_id: data.user_id || data.userId || 'SYSTEM',
      user_name: data.user_name || data.userName || null,
      action: data.action || 'GENERAL_ACTION',
      entity_type: data.entity_type || data.entityType || 'SYSTEM',
      entity_id: data.entity_id || data.entityId || logId,
      details: typeof data.details === 'object' ? JSON.stringify(data.details) : (data.details || null),
      ip_address: data.ip_address || data.ipAddress || null,
      created_at: new Date().toISOString()
    };

    const sql = `
      INSERT INTO audit_logs (log_id, user_id, user_name, action, entity_type, entity_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await executeSqlQuery(sql, [
      log.log_id, log.user_id, log.user_name, log.action,
      log.entity_type, log.entity_id, log.details, log.ip_address
    ]);

    const store = loadPersistentData();
    if (!store.auditLogs) store.auditLogs = [];
    store.auditLogs.unshift(log);
    if (store.auditLogs.length > 1000) store.auditLogs.pop();
    savePersistentData(store);

    return log;
  },

  async delete(logId) {
    const sql = `DELETE FROM audit_logs WHERE log_id = ?`;
    await executeSqlQuery(sql, [logId]);
    const store = loadPersistentData();
    if (store.auditLogs) {
      store.auditLogs = store.auditLogs.filter(l => l.log_id !== logId && l.id !== logId);
      savePersistentData(store);
    }
    return true;
  }
};

export default AuditLog;
