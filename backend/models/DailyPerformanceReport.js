// backend/models/DailyPerformanceReport.js
import { getMySqlPool, loadPersistentData, savePersistentData, executeSqlQuery } from '../config/db.js';

export const DailyPerformanceReport = {
  async findAll() {
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.query(`SELECT * FROM daily_performance_reports ORDER BY report_date DESC, created_at DESC`);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return store.reports || [];
  },

  async findById(reportId) {
    if (!reportId) return null;
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.execute(`SELECT * FROM daily_performance_reports WHERE report_id = ? LIMIT 1`, [reportId]);
        if (rows && rows.length > 0) return rows[0];
      } catch (err) {}
    }
    const store = loadPersistentData();
    return (store.reports || []).find(r => r.report_id === reportId || r.id === reportId) || null;
  },

  async findByEmployee(employeeId) {
    if (!employeeId) return [];
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.execute(`SELECT * FROM daily_performance_reports WHERE employee_id = ? ORDER BY report_date DESC`, [employeeId]);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return (store.reports || []).filter(r => r.employee_id === employeeId || r.employeeId === employeeId);
  },

  async findByBranch(branchId) {
    if (!branchId) return [];
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.execute(`SELECT * FROM daily_performance_reports WHERE branch_id = ? ORDER BY report_date DESC`, [branchId]);
        if (rows && rows.length > 0) return rows;
      } catch (err) {}
    }
    const store = loadPersistentData();
    return (store.reports || []).filter(r => r.branch_id === branchId || r.branchId === branchId);
  },

  async create(data) {
    const reportId = data.report_id || data.id || `REP-${Date.now().toString(36).toUpperCase()}`;
    const reportDate = data.report_date || data.reportDate || new Date().toISOString().split('T')[0];
    const dateObj = new Date(reportDate);
    const dayOfWeek = data.day_of_week || data.dayOfWeek || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];

    const report = {
      report_id: reportId,
      employee_id: data.employee_id || data.employeeId || '',
      employee_name: data.employee_name || data.employeeName || 'Staff Member',
      employee_user_id: data.employee_user_id || data.employeeUserId || null,
      branch_id: data.branch_id || data.branchId || '',
      branch_name: data.branch_name || data.branchName || '',
      sol_id: data.sol_id || data.solId || null,
      district_id: data.district_id || data.districtId || null,
      district_name: data.district_name || data.districtName || null,
      fiscal_year_id: data.fiscal_year_id || data.fiscalYearId || 'FY-2025-2026',
      report_date: reportDate,
      day_of_week: dayOfWeek,
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      status: data.status || 'Pending',
      customer_onboarding: Number(data.customer_onboarding || data.customerOnboarding || 0),
      mobile_banking: Number(data.mobile_banking || data.mobileBanking || 0),
      internet_banking: Number(data.internet_banking || data.internetBanking || 0),
      atm_debit_cards: Number(data.atm_debit_cards || data.atmDebitCards || 0),
      merchant_solutions: Number(data.merchant_solutions || data.merchantSolutions || 0),
      deposits_etb: Number(data.deposits_etb || data.depositsETB || 0),
      foreign_currency_etb: Number(data.foreign_currency_etb || data.foreignCurrencyETB || 0),
      digital_financial_services_etb: Number(data.digital_financial_services_etb || data.digitalFinancialServicesETB || 0),
      manager_comment: data.manager_comment || data.managerComment || null,
      submitted_at: data.submitted_at || new Date().toISOString(),
      reviewed_by: data.reviewed_by || data.reviewedBy || null,
      reviewed_at: data.reviewed_at || data.reviewedAt || null
    };

    const sql = `
      INSERT INTO daily_performance_reports (
        report_id, employee_id, employee_name, employee_user_id, branch_id,
        branch_name, sol_id, district_id, district_name, fiscal_year_id,
        report_date, day_of_week, year, month, status, customer_onboarding,
        mobile_banking, internet_banking, atm_debit_cards, merchant_solutions,
        deposits_etb, foreign_currency_etb, digital_financial_services_etb,
        manager_comment, submitted_at, reviewed_by, reviewed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        deposits_etb = VALUES(deposits_etb),
        foreign_currency_etb = VALUES(foreign_currency_etb),
        customer_onboarding = VALUES(customer_onboarding),
        mobile_banking = VALUES(mobile_banking),
        status = VALUES(status),
        manager_comment = VALUES(manager_comment);
    `;

    await executeSqlQuery(sql, [
      report.report_id, report.employee_id, report.employee_name, report.employee_user_id,
      report.branch_id, report.branch_name, report.sol_id, report.district_id,
      report.district_name, report.fiscal_year_id, report.report_date, report.day_of_week,
      report.year, report.month, report.status, report.customer_onboarding,
      report.mobile_banking, report.internet_banking, report.atm_debit_cards,
      report.merchant_solutions, report.deposits_etb, report.foreign_currency_etb,
      report.digital_financial_services_etb, report.manager_comment,
      report.submitted_at, report.reviewed_by, report.reviewed_at
    ]);

    const store = loadPersistentData();
    if (!store.reports) store.reports = [];
    const idx = store.reports.findIndex(r => r.report_id === report.report_id || r.id === report.report_id);
    if (idx >= 0) store.reports[idx] = { ...store.reports[idx], ...report };
    else store.reports.push(report);
    savePersistentData(store);

    return report;
  },

  async update(reportId, updates) {
    const report = await this.findById(reportId);
    if (!report) return null;

    const fields = [];
    const params = [];
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'report_id' && key !== 'id') {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length > 0) {
      params.push(reportId);
      const sql = `UPDATE daily_performance_reports SET ${fields.join(', ')} WHERE report_id = ?`;
      await executeSqlQuery(sql, params);
    }

    const store = loadPersistentData();
    if (store.reports) {
      const idx = store.reports.findIndex(r => r.report_id === reportId || r.id === reportId);
      if (idx >= 0) {
        store.reports[idx] = { ...store.reports[idx], ...updates };
        savePersistentData(store);
      }
    }
    return await this.findById(reportId);
  },

  async approve(reportId, reviewerName, comment = null) {
    return await this.update(reportId, {
      status: 'Approved',
      reviewed_by: reviewerName,
      reviewed_at: new Date().toISOString(),
      manager_comment: comment
    });
  },

  async reject(reportId, reviewerName, reason) {
    return await this.update(reportId, {
      status: 'Rejected',
      reviewed_by: reviewerName,
      reviewed_at: new Date().toISOString(),
      manager_comment: reason
    });
  },

  async delete(reportId) {
    const sql = `DELETE FROM daily_performance_reports WHERE report_id = ?`;
    await executeSqlQuery(sql, [reportId]);

    const store = loadPersistentData();
    if (store.reports) {
      store.reports = store.reports.filter(r => r.report_id !== reportId && r.id !== reportId);
      savePersistentData(store);
    }
    return true;
  }
};

export default DailyPerformanceReport;
