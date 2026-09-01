import { getMySqlPool } from '../config/mysqlDb';

export interface PerformanceTargetRow {
  target_id: string;
  kpi_id: string;
  employee_id?: string;
  branch_id?: string;
  district_id?: string;
  fiscal_year_id: string;
  period: string;
  year: number;
  month?: number;
  target_value: number;
  annual_target: number;
  daily_target: number;
  weekly_target: number;
  monthly_target: number;
  quarterly_target: number;
  semi_annual_target: number;
  status: string;
  assigned_by?: string;
  employee_response?: string;
  rejection_reason?: string;
  created_at: Date;
  updated_at: Date;
  kpi_name?: string;
  kpi_category?: string;
  kpi_unit?: string;
  kpi_weight?: number;
}

export const performanceTargetModel = {
  async findAll(filters: { employeeId?: string; branchId?: string; districtId?: string; kpiId?: string; year?: number } = {}): Promise<PerformanceTargetRow[]> {
    const pool = getMySqlPool();
    let sql = `
      SELECT t.*, k.name AS kpi_name, k.category AS kpi_category, k.unit AS kpi_unit, k.weight AS kpi_weight
      FROM performance_targets t
      INNER JOIN kpi_metrics k ON t.kpi_id = k.kpi_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.employeeId) {
      sql += ' AND t.employee_id = ?';
      params.push(filters.employeeId);
    }
    if (filters.branchId) {
      sql += ' AND t.branch_id = ?';
      params.push(filters.branchId);
    }
    if (filters.districtId) {
      sql += ' AND t.district_id = ?';
      params.push(filters.districtId);
    }
    if (filters.kpiId) {
      sql += ' AND t.kpi_id = ?';
      params.push(filters.kpiId);
    }
    if (filters.year) {
      sql += ' AND t.year = ?';
      params.push(filters.year);
    }
    sql += ' ORDER BY t.created_at DESC';

    const [rows]: any = await pool.query(sql, params);
    return rows;
  },

  async findById(targetId: string): Promise<PerformanceTargetRow | null> {
    const pool = getMySqlPool();
    const [rows]: any = await pool.query(
      `SELECT t.*, k.name AS kpi_name, k.category AS kpi_category, k.unit AS kpi_unit, k.weight AS kpi_weight
       FROM performance_targets t
       INNER JOIN kpi_metrics k ON t.kpi_id = k.kpi_id
       WHERE t.target_id = ? LIMIT 1`,
      [targetId]
    );
    return rows[0] || null;
  },

  async create(target: Partial<PerformanceTargetRow>): Promise<PerformanceTargetRow> {
    const pool = getMySqlPool();
    const id = target.target_id || `TGT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tVal = Number(target.target_value || 0);
    const annTarget = target.annual_target !== undefined ? Number(target.annual_target) : tVal;
    const dailyTarget = target.daily_target || annTarget / 300;
    const weeklyTarget = target.weekly_target || annTarget / 52;
    const monthlyTarget = target.monthly_target || annTarget / 12;
    const quarterlyTarget = target.quarterly_target || annTarget / 4;
    const semiAnnualTarget = target.semi_annual_target || annTarget / 2;

    await pool.query(
      `INSERT INTO performance_targets 
        (target_id, kpi_id, employee_id, branch_id, district_id, fiscal_year_id, period, year, month, target_value, annual_target, daily_target, weekly_target, monthly_target, quarterly_target, semi_annual_target, status, assigned_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        target.kpi_id,
        target.employee_id || null,
        target.branch_id || null,
        target.district_id || null,
        target.fiscal_year_id || 'FY-2026-27',
        target.period || 'Annual',
        target.year || 2026,
        target.month || 8,
        tVal,
        annTarget,
        dailyTarget,
        weeklyTarget,
        monthlyTarget,
        quarterlyTarget,
        semiAnnualTarget,
        target.status || 'ACCEPTED',
        target.assigned_by || 'Supervisor'
      ]
    );
    return (await this.findById(id))!;
  }
};
