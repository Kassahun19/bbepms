import { Router } from 'express';
import { getMySqlPool, checkMySqlConnection, initializeMySqlTables, seedRealEpmsData } from '../config/mysqlDb';

const router = Router();

// ============================================================================
// SYSTEM & HEALTH ENDPOINTS
// ============================================================================

// GET /api/mysql/status - Check MySQL connection status and credentials in use
router.get('/status', async (req, res) => {
  const status = await checkMySqlConnection();
  res.status(200).json({
    success: status.connected,
    message: status.message,
    config: status.config,
    timestamp: new Date().toISOString()
  });
});

// GET /api/mysql/install - Initialize and create all Daily KPI Performance Management tables
router.get('/install', async (req, res) => {
  const initResult = await initializeMySqlTables();
  if (initResult.success) {
    res.status(200).json({
      success: true,
      message: initResult.message,
      tables: initResult.tables,
      seededCounts: initResult.seededCounts
    });
  } else {
    res.status(500).json({
      success: false,
      message: initResult.message,
      error: initResult.error
    });
  }
});

// POST /api/mysql/seed - Re-seed live MySQL database from persistent EPMS store
router.post('/seed', async (req, res) => {
  try {
    const pool = getMySqlPool();
    const seededCounts = await seedRealEpmsData(pool);
    res.status(200).json({
      success: true,
      message: 'Successfully seeded Daily KPI Performance Management dataset into MySQL',
      seededCounts
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Error seeding database' });
  }
});

// ============================================================================
// 1. KPI METRICS CRUD
// ============================================================================

// GET /api/mysql/kpi-metrics (Read all)
router.get('/kpi-metrics', async (req, res) => {
  try {
    const { category, status } = req.query;
    let sql = 'SELECT * FROM kpi_metrics WHERE 1=1';
    const params: any[] = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY weight DESC, created_at ASC';

    const pool = getMySqlPool();
    const [rows]: any = await pool.query(sql, params);
    res.status(200).json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// GET /api/mysql/kpi-metrics/:id (Read one)
router.get('/kpi-metrics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getMySqlPool();
    const [rows]: any = await pool.query('SELECT * FROM kpi_metrics WHERE kpi_id = ? OR code = ?', [id, id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'KPI Metric not found' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// POST /api/mysql/kpi-metrics (Create)
router.post('/kpi-metrics', async (req, res) => {
  try {
    const { kpiId, code, name, category, unit, weight, description, frequency } = req.body;
    if (!code || !name || !category || !unit) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code, name, category, and unit are mandatory'
      });
    }

    const pool = getMySqlPool();
    const id = kpiId || `KPI-${code.toUpperCase()}`;
    const kpiWeight = weight !== undefined ? Number(weight) : 10.0;

    await pool.query(
      `INSERT INTO kpi_metrics (kpi_id, code, name, category, unit, weight, description, frequency, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [id, code.toUpperCase(), name, category, unit, kpiWeight, description || null, frequency || 'Daily']
    );

    const [rows]: any = await pool.query('SELECT * FROM kpi_metrics WHERE kpi_id = ?', [id]);
    res.status(201).json({ success: true, data: rows[0], message: 'KPI Metric created successfully' });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: 'A KPI metric with this code already exists' });
    }
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// PUT /api/mysql/kpi-metrics/:id (Update)
router.put('/kpi-metrics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, unit, weight, description, frequency, status } = req.body;
    const pool = getMySqlPool();

    const [existing]: any = await pool.query('SELECT * FROM kpi_metrics WHERE kpi_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'KPI Metric not found' });
    }

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
      [name, category, unit, weight !== undefined ? Number(weight) : null, description, frequency, status, id]
    );

    const [updated]: any = await pool.query('SELECT * FROM kpi_metrics WHERE kpi_id = ?', [id]);
    res.status(200).json({ success: true, data: updated[0], message: 'KPI Metric updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// DELETE /api/mysql/kpi-metrics/:id (Delete)
router.delete('/kpi-metrics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getMySqlPool();
    const [result]: any = await pool.query('DELETE FROM kpi_metrics WHERE kpi_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'KPI Metric not found' });
    }
    res.status(200).json({ success: true, message: 'KPI Metric deleted successfully' });
  } catch (err: any) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete KPI metric because it is referenced in performance targets or reports'
      });
    }
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// ============================================================================
// 2. DAILY PERFORMANCE REPORTS CRUD
// ============================================================================

// GET /api/mysql/daily-reports (Read all with rich filtering)
router.get('/daily-reports', async (req, res) => {
  try {
    const { date, employeeId, branchId, districtId, status, limit } = req.query;
    let sql = `
      SELECT 
        r.*,
        u.email AS employee_email, u.phone AS employee_phone, u.job_title AS employee_job_title,
        b.sol_id, b.grade AS branch_grade
      FROM daily_performance_reports r
      LEFT JOIN users u ON r.employee_id = u.user_id
      LEFT JOIN branches b ON r.branch_id = b.branch_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (date) {
      sql += ' AND r.report_date = ?';
      params.push(date);
    }
    if (employeeId) {
      sql += ' AND r.employee_id = ?';
      params.push(employeeId);
    }
    if (branchId) {
      sql += ' AND r.branch_id = ?';
      params.push(branchId);
    }
    if (districtId) {
      sql += ' AND r.district_id = ?';
      params.push(districtId);
    }
    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY r.report_date DESC, r.created_at DESC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(Number(limit));
    }

    const pool = getMySqlPool();
    const [rows]: any = await pool.query(sql, params);
    res.status(200).json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// GET /api/mysql/daily-reports/:id (Read one)
router.get('/daily-reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getMySqlPool();
    const [rows]: any = await pool.query(
      `SELECT r.*, u.email AS employee_email, u.job_title AS employee_job_title, b.sol_id, b.grade AS branch_grade
       FROM daily_performance_reports r
       LEFT JOIN users u ON r.employee_id = u.user_id
       LEFT JOIN branches b ON r.branch_id = b.branch_id
       WHERE r.report_id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Daily Performance Report not found' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// POST /api/mysql/daily-reports (Create)
router.post('/daily-reports', async (req, res) => {
  try {
    const {
      reportId,
      employeeId,
      employeeName,
      employeeUserId,
      branchId,
      branchName,
      solId,
      districtId,
      districtName,
      fiscalYearId,
      reportDate,
      dayOfWeek,
      customerOnboarding,
      mobileBanking,
      internetBanking,
      atmDebitCards,
      merchantSolutions,
      depositsETB,
      foreignCurrencyETB,
      digitalFinancialServicesETB,
      managerComment
    } = req.body;

    if (!employeeId || !branchId || !reportDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeId, branchId, and reportDate are mandatory'
      });
    }

    const pool = getMySqlPool();
    const id = reportId || `KPI-RPT-${reportDate.replace(/-/g, '')}-${employeeId.replace('USR-', '')}-${Math.random().toString(36).substring(2, 7)}`;
    const dateObj = new Date(reportDate);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const calculatedDay = dayOfWeek || days[dateObj.getDay()];

    await pool.query(
      `INSERT INTO daily_performance_reports 
        (report_id, employee_id, employee_name, employee_user_id, branch_id, branch_name, sol_id, district_id, district_name, fiscal_year_id, report_date, day_of_week, year, month, status, customer_onboarding, mobile_banking, internet_banking, atm_debit_cards, merchant_solutions, deposits_etb, foreign_currency_etb, digital_financial_services_etb, manager_comment, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id,
        employeeId,
        employeeName || 'Staff Member',
        employeeUserId || null,
        branchId,
        branchName || 'Branch',
        solId || null,
        districtId || null,
        districtName || null,
        fiscalYearId || 'FY-2026-27',
        reportDate,
        calculatedDay,
        year,
        month,
        Number(customerOnboarding) || 0,
        Number(mobileBanking) || 0,
        Number(internetBanking) || 0,
        Number(atmDebitCards) || 0,
        Number(merchantSolutions) || 0,
        Number(depositsETB) || 0,
        Number(foreignCurrencyETB) || 0,
        Number(digitalFinancialServicesETB) || 0,
        managerComment || null
      ]
    );

    const [created]: any = await pool.query('SELECT * FROM daily_performance_reports WHERE report_id = ?', [id]);
    res.status(201).json({ success: true, data: created[0], message: 'Daily KPI report recorded successfully' });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'A daily KPI report for this employee on this date has already been submitted'
      });
    }
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// PUT /api/mysql/daily-reports/:id (Update)
router.put('/daily-reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerOnboarding,
      mobileBanking,
      internetBanking,
      atmDebitCards,
      merchantSolutions,
      depositsETB,
      foreignCurrencyETB,
      digitalFinancialServicesETB,
      managerComment,
      status
    } = req.body;

    const pool = getMySqlPool();
    const [existing]: any = await pool.query('SELECT * FROM daily_performance_reports WHERE report_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Daily Performance Report not found' });
    }

    await pool.query(
      `UPDATE daily_performance_reports
       SET customer_onboarding = COALESCE(?, customer_onboarding),
           mobile_banking = COALESCE(?, mobile_banking),
           internet_banking = COALESCE(?, internet_banking),
           atm_debit_cards = COALESCE(?, atm_debit_cards),
           merchant_solutions = COALESCE(?, merchant_solutions),
           deposits_etb = COALESCE(?, deposits_etb),
           foreign_currency_etb = COALESCE(?, foreign_currency_etb),
           digital_financial_services_etb = COALESCE(?, digital_financial_services_etb),
           manager_comment = COALESCE(?, manager_comment),
           status = COALESCE(?, status)
       WHERE report_id = ?`,
      [
        customerOnboarding !== undefined ? Number(customerOnboarding) : null,
        mobileBanking !== undefined ? Number(mobileBanking) : null,
        internetBanking !== undefined ? Number(internetBanking) : null,
        atmDebitCards !== undefined ? Number(atmDebitCards) : null,
        merchantSolutions !== undefined ? Number(merchantSolutions) : null,
        depositsETB !== undefined ? Number(depositsETB) : null,
        foreignCurrencyETB !== undefined ? Number(foreignCurrencyETB) : null,
        digitalFinancialServicesETB !== undefined ? Number(digitalFinancialServicesETB) : null,
        managerComment,
        status,
        id
      ]
    );

    const [updated]: any = await pool.query('SELECT * FROM daily_performance_reports WHERE report_id = ?', [id]);
    res.status(200).json({ success: true, data: updated[0], message: 'Daily Performance Report updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// PUT /api/mysql/daily-reports/:id/review (Approve / Reject Workflow)
router.put('/daily-reports/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewedBy, managerComment } = req.body;

    if (!status || (status !== 'Approved' && status !== 'Rejected' && status !== 'Returned')) {
      return res.status(400).json({ success: false, error: "Valid status ('Approved', 'Rejected', 'Returned') is required" });
    }

    const pool = getMySqlPool();
    const [existing]: any = await pool.query('SELECT * FROM daily_performance_reports WHERE report_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Daily Performance Report not found' });
    }

    await pool.query(
      `UPDATE daily_performance_reports
       SET status = ?,
           reviewed_by = ?,
           reviewed_at = NOW(),
           manager_comment = COALESCE(?, manager_comment)
       WHERE report_id = ?`,
      [status, reviewedBy || 'Supervisor', managerComment || null, id]
    );

    const [updated]: any = await pool.query('SELECT * FROM daily_performance_reports WHERE report_id = ?', [id]);
    res.status(200).json({
      success: true,
      data: updated[0],
      message: `Daily Performance Report marked as ${status}`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// DELETE /api/mysql/daily-reports/:id (Delete)
router.delete('/daily-reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getMySqlPool();
    const [result]: any = await pool.query('DELETE FROM daily_performance_reports WHERE report_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Daily Performance Report not found' });
    }
    res.status(200).json({ success: true, message: 'Daily Performance Report deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// ============================================================================
// 3. PERFORMANCE TARGETS CRUD
// ============================================================================

// GET /api/mysql/performance-targets (Read all)
router.get('/performance-targets', async (req, res) => {
  try {
    const { employeeId, branchId, districtId, kpiId, year } = req.query;
    let sql = `
      SELECT t.*, k.name AS kpi_name, k.category AS kpi_category, k.unit AS kpi_unit, k.weight AS kpi_weight
      FROM performance_targets t
      INNER JOIN kpi_metrics k ON t.kpi_id = k.kpi_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      sql += ' AND t.employee_id = ?';
      params.push(employeeId);
    }
    if (branchId) {
      sql += ' AND t.branch_id = ?';
      params.push(branchId);
    }
    if (districtId) {
      sql += ' AND t.district_id = ?';
      params.push(districtId);
    }
    if (kpiId) {
      sql += ' AND t.kpi_id = ?';
      params.push(kpiId);
    }
    if (year) {
      sql += ' AND t.year = ?';
      params.push(Number(year));
    }
    sql += ' ORDER BY t.created_at DESC';

    const pool = getMySqlPool();
    const [rows]: any = await pool.query(sql, params);
    res.status(200).json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// POST /api/mysql/performance-targets (Create)
router.post('/performance-targets', async (req, res) => {
  try {
    const {
      targetId,
      kpiId,
      employeeId,
      branchId,
      districtId,
      fiscalYearId,
      period,
      year,
      month,
      targetValue,
      annualTarget,
      assignedBy
    } = req.body;

    if (!kpiId || !fiscalYearId || targetValue === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: kpiId, fiscalYearId, and targetValue are required'
      });
    }

    const pool = getMySqlPool();
    const id = targetId || `TGT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tVal = Number(targetValue);
    const annTarget = annualTarget !== undefined ? Number(annualTarget) : tVal;
    const dailyTarget = annTarget / 300;
    const monthlyTarget = annTarget / 12;
    const quarterlyTarget = annTarget / 4;
    const semiAnnualTarget = annTarget / 2;

    await pool.query(
      `INSERT INTO performance_targets 
        (target_id, kpi_id, employee_id, branch_id, district_id, fiscal_year_id, period, year, month, target_value, annual_target, daily_target, monthly_target, quarterly_target, semi_annual_target, status, assigned_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACCEPTED', ?)`,
      [
        id,
        kpiId,
        employeeId || null,
        branchId || null,
        districtId || null,
        fiscalYearId,
        period || 'Annual',
        year || 2026,
        month || 8,
        tVal,
        annTarget,
        dailyTarget,
        monthlyTarget,
        quarterlyTarget,
        semiAnnualTarget,
        assignedBy || 'Supervisor'
      ]
    );

    const [created]: any = await pool.query('SELECT * FROM performance_targets WHERE target_id = ?', [id]);
    res.status(201).json({ success: true, data: created[0], message: 'Performance Target allocated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// ============================================================================
// 4. BRANCHES CRUD
// ============================================================================

// GET /api/mysql/branches (Read all)
router.get('/branches', async (req, res) => {
  try {
    const { districtId, status } = req.query;
    let sql = `
      SELECT b.*, d.name AS district_name, d.region AS district_region
      FROM branches b
      LEFT JOIN districts d ON b.district_id = d.district_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (districtId) {
      sql += ' AND b.district_id = ?';
      params.push(districtId);
    }
    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY b.sol_id ASC';

    const pool = getMySqlPool();
    const [rows]: any = await pool.query(sql, params);
    res.status(200).json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// POST /api/mysql/branches (Create)
router.post('/branches', async (req, res) => {
  try {
    const { branchId, solId, code, name, districtId, districtName, grade, type, managerName, location, phone, region } = req.body;
    if (!solId || !code || !name || !districtId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: solId, code, name, and districtId are required'
      });
    }

    const id = branchId || `BR-${solId}`;
    const pool = getMySqlPool();

    await pool.query(
      `INSERT INTO branches (branch_id, sol_id, code, name, district_id, district_name, grade, type, manager_name, location, phone, region, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [id, solId, code.toUpperCase(), name, districtId, districtName || '', grade || 'Grade I', type || 'Branch', managerName || null, location || null, phone || null, region || null]
    );

    const [created]: any = await pool.query('SELECT * FROM branches WHERE branch_id = ?', [id]);
    res.status(201).json({ success: true, data: created[0], message: 'Branch created successfully' });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: 'A branch with this SOL ID or Code already exists' });
    }
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// ============================================================================
// 5. DISTRICTS CRUD
// ============================================================================

// GET /api/mysql/districts (Read all)
router.get('/districts', async (req, res) => {
  try {
    const pool = getMySqlPool();
    const [rows]: any = await pool.query('SELECT * FROM districts ORDER BY name ASC');
    res.status(200).json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// ============================================================================
// 6. USERS CRUD
// ============================================================================

// GET /api/mysql/users (Read all)
router.get('/users', async (req, res) => {
  try {
    const { role, branchId, districtId, status } = req.query;
    let sql = `
      SELECT u.user_id, u.system_username, u.first_name, u.middle_name, u.last_name, u.email, u.phone,
             u.role, u.role_type, u.job_title, u.branch_id, u.branch_name, u.district_id, u.district_name,
             u.gender, u.age, u.status, u.is_locked, u.created_at, u.updated_at
      FROM users u
      WHERE 1=1
    `;
    const params: any[] = [];
    if (role) {
      sql += ' AND u.role = ?';
      params.push(role);
    }
    if (branchId) {
      sql += ' AND u.branch_id = ?';
      params.push(branchId);
    }
    if (districtId) {
      sql += ' AND u.district_id = ?';
      params.push(districtId);
    }
    if (status) {
      sql += ' AND u.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY u.first_name ASC';

    const pool = getMySqlPool();
    const [rows]: any = await pool.query(sql, params);
    res.status(200).json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// ============================================================================
// 7. ANALYTICS & DASHBOARD STATS
// ============================================================================

// GET /api/mysql/analytics/dashboard-stats
router.get('/analytics/dashboard-stats', async (req, res) => {
  try {
    const pool = getMySqlPool();
    const [[userCount]]: any = await pool.query('SELECT COUNT(*) AS total FROM users WHERE status = "Active"');
    const [[branchCount]]: any = await pool.query('SELECT COUNT(*) AS total FROM branches WHERE status = "Active"');
    const [[districtCount]]: any = await pool.query('SELECT COUNT(*) AS total FROM districts WHERE status = "Active"');
    const [[kpiCount]]: any = await pool.query('SELECT COUNT(*) AS total FROM kpi_metrics WHERE status = "Active"');
    const [[reportTotals]]: any = await pool.query(`
      SELECT 
        COUNT(*) AS total_reports,
        COALESCE(SUM(customer_onboarding), 0) AS total_onboarding,
        COALESCE(SUM(mobile_banking), 0) AS total_mobile,
        COALESCE(SUM(internet_banking), 0) AS total_internet,
        COALESCE(SUM(atm_debit_cards), 0) AS total_atm,
        COALESCE(SUM(merchant_solutions), 0) AS total_merchant,
        COALESCE(SUM(deposits_etb), 0) AS total_deposits
      FROM daily_performance_reports
    `);

    res.status(200).json({
      success: true,
      data: {
        activeUsers: userCount.total,
        totalBranches: branchCount.total,
        totalDistricts: districtCount.total,
        activeKpis: kpiCount.total,
        reportMetrics: reportTotals
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

export default router;
