import { getMySqlPool } from '../config/mysqlDb';

export interface AuditLogEntry {
  userId: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  ipAddress?: string;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const pool = getMySqlPool();
    const logId = `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await pool.query(
      `INSERT INTO audit_logs (log_id, user_id, user_name, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logId,
        entry.userId,
        entry.userName || null,
        entry.action,
        entry.entityType,
        entry.entityId,
        entry.details || null,
        entry.ipAddress || null
      ]
    );
  } catch (err: any) {
    console.warn('[Audit Log Warning]:', err.message);
  }
}
