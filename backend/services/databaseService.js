// backend/services/databaseService.js
import { getMySqlPool, loadPersistentData, savePersistentData, isMySqlConnected } from '../config/db.js';
import bcrypt from 'bcryptjs';

// Helper to normalize id vs userId/branchId/districtId/kpiId/reportId
function normalizeUser(u) {
  if (!u) return null;
  const id = u.user_id || u.id || u.userId;
  return {
    id,
    userId: id,
    systemUsername: u.system_username || u.systemUsername || u.username,
    username: u.system_username || u.systemUsername || u.username,
    firstName: u.first_name || u.firstName || '',
    middleName: u.middle_name || u.middleName || '',
    lastName: u.last_name || u.lastName || '',
    email: u.email || '',
    phone: u.phone || '',
    role: u.role || 'EMPLOYEE',
    roleType: u.role_type || u.roleType || '',
    jobTitle: u.job_title || u.jobTitle || 'Customer Service Officer',
    branchId: u.branch_id || u.branchId || null,
    branchName: u.branch_name || u.branchName || null,
    districtId: u.district_id || u.districtId || null,
    districtName: u.district_name || u.districtName || null,
    departmentId: u.department_id || u.departmentId || null,
    status: u.status || 'Active',
    isLocked: !!(u.is_locked ?? u.isLocked),
    failedAttempts: Number(u.failed_attempts ?? u.failedAttempts ?? 0),
    createdAt: u.created_at || u.createdAt || new Date().toISOString(),
    passwordHash: u.password_hash || u.passwordHash
  };
}

class DatabaseService {
  constructor() {
    this.pool = getMySqlPool();
  }

  // Raw SQL execution helper
  async executeSql(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return { success: true, rows };
    } catch (err) {
      console.warn(`[SQL Execution Note]: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  // --- USERS CRUD ---
  async getUsers(filter = {}) {
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      let query = `SELECT * FROM users WHERE 1=1`;
      const params = [];

      if (filter.role) {
        query += ` AND role = ?`;
        params.push(filter.role);
      }
      if (filter.branchId) {
        query += ` AND branch_id = ?`;
        params.push(filter.branchId);
      }
      if (filter.districtId) {
        query += ` AND district_id = ?`;
        params.push(filter.districtId);
      }
      query += ` ORDER BY first_name ASC`;

      const [rows] = await pool.execute(query, params);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map(normalizeUser);
      }
    } catch (e) {
      // Fallback
    }

    const data = loadPersistentData();
    let users = (data.users || []).map(normalizeUser);
    if (filter.role) users = users.filter(u => u.role === filter.role);
    if (filter.branchId) users = users.filter(u => u.branchId === filter.branchId);
    if (filter.districtId) users = users.filter(u => u.districtId === filter.districtId);
    return users;
  }

  async getUserById(userId) {
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      const [rows] = await pool.execute(`SELECT * FROM users WHERE user_id = ? LIMIT 1`, [userId]);
      if (Array.isArray(rows) && rows.length > 0) {
        return normalizeUser(rows[0]);
      }
    } catch (e) {}

    const data = loadPersistentData();
    const u = (data.users || []).find(x => (x.id || x.userId || x.user_id) === userId);
    return normalizeUser(u);
  }

  async getUserByUsername(identifier) {
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      const [rows] = await pool.execute(
        `SELECT * FROM users WHERE system_username = ? OR email = ? LIMIT 1`,
        [identifier, identifier]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        return normalizeUser(rows[0]);
      }
    } catch (e) {}

    const data = loadPersistentData();
    const u = (data.users || []).find(x => 
      (x.systemUsername || x.username || x.system_username) === identifier ||
      x.email === identifier
    );
    return normalizeUser(u);
  }

  async createUser(userData) {
    const id = userData.id || userData.userId || userData.user_id || `usr_${Date.now()}`;
    const hash = userData.passwordHash || (userData.password ? bcrypt.hashSync(userData.password, 10) : bcrypt.hashSync('Bunna@2026', 10));

    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      await pool.execute(`
        INSERT INTO users (
          user_id, system_username, password_hash, first_name, middle_name, last_name,
          email, phone, role, job_title, branch_id, branch_name, district_id, district_name, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          role = VALUES(role),
          branch_id = VALUES(branch_id),
          district_id = VALUES(district_id)
      `, [
        id,
        userData.systemUsername || userData.username || id,
        hash,
        userData.firstName || '',
        userData.middleName || '',
        userData.lastName || '',
        userData.email || `${id}@bunnabank.et`,
        userData.phone || '',
        userData.role || 'EMPLOYEE',
        userData.jobTitle || 'Bank Officer',
        userData.branchId || null,
        userData.branchName || null,
        userData.districtId || null,
        userData.districtName || null,
        userData.status || 'Active'
      ]);
    } catch (e) {}

    const data = loadPersistentData();
    data.users = data.users || [];
    const existingIdx = data.users.findIndex(x => (x.id || x.userId) === id);
    const newRecord = { ...userData, id, userId: id, passwordHash: hash };
    if (existingIdx >= 0) {
      data.users[existingIdx] = { ...data.users[existingIdx], ...newRecord };
    } else {
      data.users.push(newRecord);
    }
    savePersistentData(data);
    return normalizeUser(newRecord);
  }

  async updateUser(userId, updates) {
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      await pool.execute(`
        UPDATE users SET 
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          role = COALESCE(?, role),
          job_title = COALESCE(?, job_title),
          branch_id = COALESCE(?, branch_id),
          district_id = COALESCE(?, district_id),
          status = COALESCE(?, status),
          is_locked = COALESCE(?, is_locked),
          failed_attempts = COALESCE(?, failed_attempts)
        WHERE user_id = ?
      `, [
        updates.firstName ?? null,
        updates.lastName ?? null,
        updates.email ?? null,
        updates.phone ?? null,
        updates.role ?? null,
        updates.jobTitle ?? null,
        updates.branchId ?? null,
        updates.districtId ?? null,
        updates.status ?? null,
        updates.isLocked !== undefined ? (updates.isLocked ? 1 : 0) : null,
        updates.failedAttempts ?? null,
        userId
      ]);
    } catch (e) {}

    const data = loadPersistentData();
    data.users = data.users || [];
    const idx = data.users.findIndex(x => (x.id || x.userId) === userId);
    if (idx >= 0) {
      data.users[idx] = { ...data.users[idx], ...updates };
      savePersistentData(data);
      return normalizeUser(data.users[idx]);
    }
    return null;
  }

  async unlockUser(userId) {
    return this.updateUser(userId, { isLocked: false, failedAttempts: 0 });
  }

  async deleteUser(userId) {
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      await pool.execute(`DELETE FROM users WHERE user_id = ?`, [userId]);
    } catch (e) {}

    const data = loadPersistentData();
    data.users = (data.users || []).filter(x => (x.id || x.userId) !== userId);
    savePersistentData(data);
    return { success: true, deletedId: userId };
  }

  // --- BRANCHES CRUD ---
  async getBranches(filter = {}) {
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      let query = `SELECT * FROM branches WHERE 1=1`;
      const params = [];
      if (filter.districtId) {
        query += ` AND district_id = ?`;
        params.push(filter.districtId);
      }
      query += ` ORDER BY name ASC`;
      const [rows] = await pool.execute(query, params);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map(b => ({
          id: b.branch_id,
          branchId: b.branch_id,
          name: b.name,
          code: b.code,
          solId: b.sol_id,
          districtId: b.district_id,
          districtName: b.district_name,
          grade: b.grade,
          managerName: b.manager_name,
          status: b.status,
          region: b.region
        }));
      }
    } catch (e) {}

    const data = loadPersistentData();
    let branches = data.branches || [];
    if (filter.districtId) {
      branches = branches.filter(b => b.districtId === filter.districtId);
    }
    return branches;
  }

  async createBranch(branchData) {
    const id = branchData.id || branchData.branchId || `br_${Date.now()}`;
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      await pool.execute(`
        INSERT INTO branches (branch_id, sol_id, code, name, district_id, district_name, grade, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), grade = VALUES(grade)
      `, [
        id,
        branchData.solId || id,
        branchData.code || id,
        branchData.name || 'New Branch',
        branchData.districtId || 'D-001',
        branchData.districtName || 'Addis Ababa',
        branchData.grade || 'Grade I',
        branchData.status || 'Active'
      ]);
    } catch (e) {}

    const data = loadPersistentData();
    data.branches = data.branches || [];
    const newBranch = { ...branchData, id, branchId: id };
    data.branches.push(newBranch);
    savePersistentData(data);
    return newBranch;
  }

  // --- DISTRICTS CRUD ---
  async getDistricts() {
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      const [rows] = await pool.execute(`SELECT * FROM districts ORDER BY name ASC`);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map(d => ({
          id: d.district_id,
          districtId: d.district_id,
          name: d.name,
          code: d.code,
          region: d.region,
          managerName: d.manager_name,
          status: d.status
        }));
      }
    } catch (e) {}

    const data = loadPersistentData();
    return data.districts || [];
  }

  // --- KPI METRICS CRUD ---
  async getKpis() {
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      const [rows] = await pool.execute(`SELECT * FROM kpi_metrics WHERE status = 'Active' ORDER BY weight DESC`);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map(k => ({
          id: k.kpi_id,
          kpiId: k.kpi_id,
          code: k.code,
          name: k.name,
          category: k.category,
          unit: k.unit,
          weight: Number(k.weight),
          frequency: k.frequency,
          status: k.status
        }));
      }
    } catch (e) {}

    const data = loadPersistentData();
    return data.kpis || [];
  }

  // --- PERFORMANCE TARGETS CRUD ---
  async getTargets(filter = {}) {
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      let query = `SELECT * FROM performance_targets WHERE 1=1`;
      const params = [];
      if (filter.employeeId) {
        query += ` AND employee_id = ?`;
        params.push(filter.employeeId);
      }
      if (filter.branchId) {
        query += ` AND branch_id = ?`;
        params.push(filter.branchId);
      }
      if (filter.districtId) {
        query += ` AND district_id = ?`;
        params.push(filter.districtId);
      }
      query += ` ORDER BY created_at DESC`;
      const [rows] = await pool.execute(query, params);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map(t => ({
          id: t.target_id,
          targetId: t.target_id,
          kpiId: t.kpi_id,
          employeeId: t.employee_id,
          branchId: t.branch_id,
          districtId: t.district_id,
          targetValue: Number(t.target_value),
          annualTarget: Number(t.annual_target),
          dailyTarget: Number(t.daily_target),
          status: t.status,
          employeeResponse: t.employee_response
        }));
      }
    } catch (e) {}

    const data = loadPersistentData();
    let targets = data.targets || [];
    if (filter.employeeId) targets = targets.filter(t => t.employeeId === filter.employeeId);
    if (filter.branchId) targets = targets.filter(t => t.branchId === filter.branchId);
    return targets;
  }

  async createTarget(targetData) {
    const id = targetData.id || targetData.targetId || `tgt_${Date.now()}`;
    const annual = Number(targetData.annualTarget || targetData.targetValue || 0);
    const daily = Number((annual / 300).toFixed(2));

    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      await pool.execute(`
        INSERT INTO performance_targets (
          target_id, kpi_id, employee_id, branch_id, district_id, fiscal_year_id,
          period, year, target_value, annual_target, daily_target, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        targetData.kpiId || 'KPI-001',
        targetData.employeeId || null,
        targetData.branchId || null,
        targetData.districtId || null,
        targetData.fiscalYearId || 'FY-2026',
        targetData.period || 'Annual',
        targetData.year || 2026,
        annual,
        annual,
        daily,
        targetData.status || 'ACCEPTED'
      ]);
    } catch (e) {}

    const data = loadPersistentData();
    data.targets = data.targets || [];
    const newTarget = { ...targetData, id, targetId: id, annualTarget: annual, dailyTarget: daily };
    data.targets.push(newTarget);
    savePersistentData(data);
    return newTarget;
  }

  // --- DAILY PERFORMANCE REPORTS CRUD ---
  async getReports(filter = {}) {
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      let query = `SELECT * FROM daily_performance_reports WHERE 1=1`;
      const params = [];
      if (filter.employeeId) {
        query += ` AND employee_id = ?`;
        params.push(filter.employeeId);
      }
      if (filter.branchId) {
        query += ` AND branch_id = ?`;
        params.push(filter.branchId);
      }
      if (filter.status) {
        query += ` AND status = ?`;
        params.push(filter.status);
      }
      if (filter.reportDate) {
        query += ` AND report_date = ?`;
        params.push(filter.reportDate);
      }
      query += ` ORDER BY report_date DESC LIMIT 1000`;
      const [rows] = await pool.execute(query, params);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map(r => ({
          id: r.report_id,
          reportId: r.report_id,
          employeeId: r.employee_id,
          employeeName: r.employee_name,
          branchId: r.branch_id,
          branchName: r.branch_name,
          districtId: r.district_id,
          districtName: r.district_name,
          reportDate: r.report_date ? r.report_date.toISOString().split('T')[0] : '',
          status: r.status,
          depositsETB: Number(r.deposits_etb),
          foreignCurrencyETB: Number(r.foreign_currency_etb),
          digitalFinancialServicesETB: Number(r.digital_financial_services_etb),
          customerOnboarding: Number(r.customer_onboarding),
          mobileBanking: Number(r.mobile_banking),
          atmDebitCards: Number(r.atm_debit_cards),
          merchantSolutions: Number(r.merchant_solutions),
          internetBanking: Number(r.internet_banking),
          overallAchievementRate: Number(r.overall_achievement_rate),
          managerComment: r.manager_comment,
          reviewedBy: r.reviewed_by
        }));
      }
    } catch (e) {}

    const data = loadPersistentData();
    let reports = data.dailyReports || [];
    if (filter.employeeId) reports = reports.filter(r => r.employeeId === filter.employeeId);
    if (filter.branchId) reports = reports.filter(r => r.branchId === filter.branchId);
    if (filter.status) reports = reports.filter(r => r.status === filter.status);
    return reports;
  }

  async createReport(reportData) {
    const id = reportData.id || reportData.reportId || `rep_${Date.now()}`;
    const date = reportData.reportDate || new Date().toISOString().split('T')[0];

    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      await pool.execute(`
        INSERT INTO daily_performance_reports (
          report_id, employee_id, employee_name, branch_id, branch_name,
          district_id, fiscal_year_id, report_date, day_of_week, year, month,
          status, customer_onboarding, mobile_banking, internet_banking,
          atm_debit_cards, merchant_solutions, deposits_etb, foreign_currency_etb,
          digital_financial_services_etb, overall_achievement_rate, manager_comment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          deposits_etb = VALUES(deposits_etb),
          foreign_currency_etb = VALUES(foreign_currency_etb),
          status = VALUES(status)
      `, [
        id,
        reportData.employeeId || 'USR-001',
        reportData.employeeName || 'Employee',
        reportData.branchId || 'BR-001',
        reportData.branchName || 'Finfine Branch',
        reportData.districtId || 'D-001',
        reportData.fiscalYearId || 'FY-2026',
        date,
        reportData.dayOfWeek || 'Monday',
        new Date(date).getFullYear(),
        new Date(date).getMonth() + 1,
        reportData.status || 'Pending',
        Number(reportData.customerOnboarding || 0),
        Number(reportData.mobileBanking || 0),
        Number(reportData.internetBanking || 0),
        Number(reportData.atmDebitCards || 0),
        Number(reportData.merchantSolutions || 0),
        Number(reportData.depositsETB || 0),
        Number(reportData.foreignCurrencyETB || 0),
        Number(reportData.digitalFinancialServicesETB || 0),
        Number(reportData.overallAchievementRate || 0),
        reportData.managerComment || ''
      ]);
    } catch (e) {}

    const data = loadPersistentData();
    data.dailyReports = data.dailyReports || [];
    const newReport = { ...reportData, id, reportId: id, reportDate: date };
    data.dailyReports.push(newReport);
    savePersistentData(data);
    return newReport;
  }

  async approveReport(reportId, reviewerName = 'Branch Manager') {
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      await pool.execute(`
        UPDATE daily_performance_reports
        SET status = 'Approved', reviewed_by = ?, reviewed_at = NOW()
        WHERE report_id = ?
      `, [reviewerName, reportId]);
    } catch (e) {}

    const data = loadPersistentData();
    data.dailyReports = data.dailyReports || [];
    const rep = data.dailyReports.find(r => (r.id || r.reportId) === reportId);
    if (rep) {
      rep.status = 'Approved';
      rep.reviewedBy = reviewerName;
      rep.reviewedAt = new Date().toISOString();
      savePersistentData(data);
      return rep;
    }
    return null;
  }

  async rejectReport(reportId, reviewerName = 'Branch Manager', comment = 'Rejected by reviewer') {
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      await pool.execute(`
        UPDATE daily_performance_reports
        SET status = 'Rejected', reviewed_by = ?, manager_comment = ?, reviewed_at = NOW()
        WHERE report_id = ?
      `, [reviewerName, comment, reportId]);
    } catch (e) {}

    const data = loadPersistentData();
    data.dailyReports = data.dailyReports || [];
    const rep = data.dailyReports.find(r => (r.id || r.reportId) === reportId);
    if (rep) {
      rep.status = 'Rejected';
      rep.reviewedBy = reviewerName;
      rep.managerComment = comment;
      rep.reviewedAt = new Date().toISOString();
      savePersistentData(data);
      return rep;
    }
    return null;
  }

  // --- AUDIT LOGS ---
  async logAction(actionData) {
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      await pool.execute(`
        INSERT INTO audit_logs (log_id, user_id, user_name, action, entity_type, entity_id, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        actionData.userId || 'system',
        actionData.userName || 'System',
        actionData.action || 'ACTION',
        actionData.entityType || 'SYSTEM',
        actionData.entityId || id,
        actionData.details || '',
        actionData.ipAddress || '127.0.0.1'
      ]);
    } catch (e) {}

    const data = loadPersistentData();
    data.auditLogs = data.auditLogs || [];
    const log = { ...actionData, id, logId: id, timestamp: new Date().toISOString() };
    data.auditLogs.unshift(log);
    if (data.auditLogs.length > 500) data.auditLogs = data.auditLogs.slice(0, 500);
    savePersistentData(data);
    return log;
  }

  async getAuditLogs() {
    try {
      const pool = isMySqlConnected() ? getMySqlPool() : null;
      const [rows] = await pool.execute(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200`);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map(r => ({
          id: r.log_id,
          userId: r.user_id,
          userName: r.user_name,
          action: r.action,
          entityType: r.entity_type,
          entityId: r.entity_id,
          details: r.details,
          timestamp: r.created_at
        }));
      }
    } catch (e) {}

    const data = loadPersistentData();
    return data.auditLogs || [];
  }
}

export const dbService = new DatabaseService();
export default dbService;
