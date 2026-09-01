import { getMySqlPool } from '../config/mysqlDb';

export interface DailyReportRow {
  report_id: string;
  employee_id: string;
  employee_name: string;
  employee_user_id?: string;
  branch_id: string;
  branch_name: string;
  sol_id?: string;
  district_id?: string;
  district_name?: string;
  fiscal_year_id: string;
  report_date: string;
  day_of_week: string;
  year: number;
  month: number;
  status: string;
  customer_onboarding: number;
  mobile_banking: number;
  internet_banking: number;
  atm_debit_cards: number;
  merchant_solutions: number;
  deposits_etb: number;
  foreign_currency_etb: number;
  digital_financial_services_etb: number;
  manager_comment?: string;
  submitted_at?: Date;
  reviewed_by?: string;
  reviewed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export const dailyReportModel = {
  async findAll(filters: {
    employeeId?: string;
    branchId?: string;
    districtId?: string;
    fiscalYearId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  } = {}): Promise<DailyReportRow[]> {
    const pool = getMySqlPool();
    let sql = 'SELECT * FROM daily_performance_reports WHERE 1=1';
    const params: any[] = [];

    if (filters.employeeId) {
      sql += ' AND employee_id = ?';
      params.push(filters.employeeId);
    }
    if (filters.branchId) {
      sql += ' AND branch_id = ?';
      params.push(filters.branchId);
    }
    if (filters.districtId) {
      sql += ' AND district_id = ?';
      params.push(filters.districtId);
    }
    if (filters.fiscalYearId) {
      sql += ' AND fiscal_year_id = ?';
      params.push(filters.fiscalYearId);
    }
    if (filters.startDate) {
      sql += ' AND report_date >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      sql += ' AND report_date <= ?';
      params.push(filters.endDate);
    }
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    sql += ' ORDER BY report_date DESC, created_at DESC';

    const [rows]: any = await pool.query(sql, params);
    return rows;
  },

  async findById(reportId: string): Promise<DailyReportRow | null> {
    const pool = getMySqlPool();
    const [rows]: any = await pool.query(
      'SELECT * FROM daily_performance_reports WHERE report_id = ? LIMIT 1',
      [reportId]
    );
    return rows[0] || null;
  },

  async createOrUpdate(report: Partial<DailyReportRow>): Promise<DailyReportRow> {
    const pool = getMySqlPool();
    const id = report.report_id || `KPI-RPT-${report.report_date?.replace(/-/g, '')}-${report.employee_id}-${Date.now().toString(36)}`;
    
    await pool.query(
      `INSERT INTO daily_performance_reports (
        report_id, employee_id, employee_name, employee_user_id, branch_id, branch_name,
        sol_id, district_id, district_name, fiscal_year_id, report_date, day_of_week,
        year, month, status, customer_onboarding, mobile_banking, internet_banking,
        atm_debit_cards, merchant_solutions, deposits_etb, foreign_currency_etb,
        digital_financial_services_etb, manager_comment, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        customer_onboarding = VALUES(customer_onboarding),
        mobile_banking = VALUES(mobile_banking),
        internet_banking = VALUES(internet_banking),
        atm_debit_cards = VALUES(atm_debit_cards),
        merchant_solutions = VALUES(merchant_solutions),
        deposits_etb = VALUES(deposits_etb),
        foreign_currency_etb = VALUES(foreign_currency_etb),
        digital_financial_services_etb = VALUES(digital_financial_services_etb),
        status = VALUES(status),
        manager_comment = VALUES(manager_comment),
        updated_at = NOW()`,
      [
        id,
        report.employee_id,
        report.employee_name,
        report.employee_user_id || report.employee_id,
        report.branch_id,
        report.branch_name,
        report.sol_id || null,
        report.district_id || null,
        report.district_name || null,
        report.fiscal_year_id || 'FY-2026-27',
        report.report_date,
        report.day_of_week || 'Monday',
        report.year || 2026,
        report.month || 8,
        report.status || 'Pending',
        report.customer_onboarding || 0,
        report.mobile_banking || 0,
        report.internet_banking || 0,
        report.atm_debit_cards || 0,
        report.merchant_solutions || 0,
        report.deposits_etb || 0,
        report.foreign_currency_etb || 0,
        report.digital_financial_services_etb || 0,
        report.manager_comment || null
      ]
    );

    return (await this.findById(id))!;
  },

  async updateStatus(reportId: string, status: string, reviewerName: string, comment?: string): Promise<DailyReportRow | null> {
    const pool = getMySqlPool();
    await pool.query(
      `UPDATE daily_performance_reports
       SET status = ?, reviewed_by = ?, manager_comment = COALESCE(?, manager_comment), reviewed_at = NOW()
       WHERE report_id = ?`,
      [status, reviewerName, comment || null, reportId]
    );
    return this.findById(reportId);
  }
};
