import { getMySqlPool } from '../config/mysqlDb';

export interface KpiMetricRow {
  kpi_id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  weight: number;
  description?: string;
  frequency: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export const kpiMetricModel = {
  async findAll(filters: { category?: string; status?: string } = {}): Promise<KpiMetricRow[]> {
    const pool = getMySqlPool();
    let sql = 'SELECT * FROM kpi_metrics WHERE 1=1';
    const params: any[] = [];

    if (filters.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    sql += ' ORDER BY weight DESC, created_at ASC';

    const [rows]: any = await pool.query(sql, params);
    return rows;
  },

  async findById(kpiId: string): Promise<KpiMetricRow | null> {
    const pool = getMySqlPool();
    const [rows]: any = await pool.query(
      'SELECT * FROM kpi_metrics WHERE kpi_id = ? OR code = ? LIMIT 1',
      [kpiId, kpiId]
    );
    return rows[0] || null;
  },

  async create(metric: Partial<KpiMetricRow>): Promise<KpiMetricRow> {
    const pool = getMySqlPool();
    const id = metric.kpi_id || `KPI-${metric.code?.toUpperCase()}`;
    await pool.query(
      `INSERT INTO kpi_metrics (kpi_id, code, name, category, unit, weight, description, frequency, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        metric.code!.toUpperCase(),
        metric.name!,
        metric.category!,
        metric.unit!,
        metric.weight ?? 10.0,
        metric.description || null,
        metric.frequency || 'Daily',
        metric.status || 'Active'
      ]
    );
    return (await this.findById(id))!;
  },

  async update(kpiId: string, updates: Partial<KpiMetricRow>): Promise<KpiMetricRow | null> {
    const pool = getMySqlPool();
    await pool.query(
      `UPDATE kpi_metrics
       SET name = COALESCE(?, name),
           category = COALESCE(?, category),
           unit = COALESCE(?, unit),
           weight = COALESCE(?, weight),
           description = COALESCE(?, description),
           frequency = COALESCE(?, frequency),
           status = COALESCE(?, status)
       WHERE kpi_id = ?`,
      [
        updates.name,
        updates.category,
        updates.unit,
        updates.weight !== undefined ? Number(updates.weight) : null,
        updates.description,
        updates.frequency,
        updates.status,
        kpiId
      ]
    );
    return this.findById(kpiId);
  },

  async delete(kpiId: string): Promise<boolean> {
    const pool = getMySqlPool();
    const [res]: any = await pool.query('DELETE FROM kpi_metrics WHERE kpi_id = ?', [kpiId]);
    return res.affectedRows > 0;
  }
};
