import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

export interface MySqlConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

export function getMySqlConfig(): MySqlConfig {
  return {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'mydb',
    password: process.env.MYSQL_PASSWORD || 'mydb',
    database: process.env.MYSQL_DATABASE || 'mydb',
    port: Number(process.env.MYSQL_PORT) || 3306
  };
}

let mysqlPool: mysql.Pool | null = null;

export function getMySqlPool(): mysql.Pool {
  if (!mysqlPool) {
    const config = getMySqlConfig();
    mysqlPool = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true
    });
  }
  return mysqlPool;
}

export async function checkMySqlConnection(): Promise<{ connected: boolean; message: string; config: { host: string; user: string; database: string; port: number } }> {
  const config = getMySqlConfig();
  try {
    const pool = getMySqlPool();
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return {
      connected: true,
      message: 'Successfully connected to MySQL database',
      config: { host: config.host, user: config.user, database: config.database, port: config.port }
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err.message || 'Could not connect to MySQL database',
      config: { host: config.host, user: config.user, database: config.database, port: config.port }
    };
  }
}

export async function initializeMySqlTables(): Promise<{ success: boolean; message: string; tables: string[]; seededCounts?: Record<string, number>; error?: string }> {
  try {
    const pool = getMySqlPool();

    // 1. Departments
    const createDepartments = `
      CREATE TABLE IF NOT EXISTS departments (
        department_id VARCHAR(50) NOT NULL,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (department_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // 2. Districts
    const createDistricts = `
      CREATE TABLE IF NOT EXISTS districts (
        district_id VARCHAR(50) NOT NULL,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        region VARCHAR(100) NOT NULL,
        manager_name VARCHAR(150) NULL,
        phone VARCHAR(50) NULL,
        email VARCHAR(150) NULL,
        sec_email VARCHAR(150) NULL,
        location VARCHAR(200) NULL,
        operation_manager VARCHAR(150) NULL,
        type VARCHAR(50) DEFAULT 'District',
        branch_count INT DEFAULT 0,
        total_employees INT DEFAULT 0,
        status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (district_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // 3. Branches
    const createBranches = `
      CREATE TABLE IF NOT EXISTS branches (
        branch_id VARCHAR(50) NOT NULL,
        sol_id VARCHAR(20) NOT NULL UNIQUE,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        district_id VARCHAR(50) NOT NULL,
        district_name VARCHAR(150) NULL,
        grade VARCHAR(50) NOT NULL DEFAULT 'Grade I',
        type VARCHAR(50) DEFAULT 'Branch',
        manager_name VARCHAR(150) NULL,
        location VARCHAR(200) NULL,
        phone VARCHAR(50) NULL,
        region VARCHAR(100) NULL,
        employee_count INT DEFAULT 0,
        status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (branch_id),
        CONSTRAINT fk_branches_district FOREIGN KEY (district_id) 
          REFERENCES districts (district_id) ON UPDATE CASCADE ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // 4. Fiscal Years
    const createFiscalYears = `
      CREATE TABLE IF NOT EXISTS fiscal_years (
        fiscal_year_id VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL UNIQUE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT FALSE,
        status ENUM('ACTIVE', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (fiscal_year_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // 5. Users
    const createUsers = `
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(50) NOT NULL,
        system_username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        middle_name VARCHAR(100) NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        phone VARCHAR(50) NULL,
        role ENUM('BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'BOARD_OF_DIRECTORS', 'CEO', 'CHIEF_OFFICER', 'DIRECTOR', 'DISTRICT_DIRECTOR', 'MANAGER', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
        role_type VARCHAR(100) NULL,
        job_title VARCHAR(150) NOT NULL,
        branch_id VARCHAR(50) NULL,
        branch_name VARCHAR(150) NULL,
        district_id VARCHAR(50) NULL,
        district_name VARCHAR(150) NULL,
        department_id VARCHAR(50) NULL,
        gender ENUM('Male', 'Female') NOT NULL DEFAULT 'Male',
        age INT DEFAULT 30,
        avatar_url VARCHAR(255) NULL,
        status ENUM('Active', 'Inactive', 'Suspended') NOT NULL DEFAULT 'Active',
        is_locked BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id),
        CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) 
          REFERENCES branches (branch_id) ON UPDATE CASCADE ON DELETE SET NULL,
        CONSTRAINT fk_users_district FOREIGN KEY (district_id) 
          REFERENCES districts (district_id) ON UPDATE CASCADE ON DELETE SET NULL,
        CONSTRAINT fk_users_department FOREIGN KEY (department_id) 
          REFERENCES departments (department_id) ON UPDATE CASCADE ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // 6. KPI Metrics
    const createKpiMetrics = `
      CREATE TABLE IF NOT EXISTS kpi_metrics (
        kpi_id VARCHAR(50) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        weight DECIMAL(5,2) NOT NULL DEFAULT 10.00,
        description TEXT NULL,
        frequency VARCHAR(50) DEFAULT 'Daily',
        status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (kpi_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // 7. Performance Targets
    const createPerformanceTargets = `
      CREATE TABLE IF NOT EXISTS performance_targets (
        target_id VARCHAR(50) NOT NULL,
        kpi_id VARCHAR(50) NOT NULL,
        employee_id VARCHAR(50) NULL,
        branch_id VARCHAR(50) NULL,
        district_id VARCHAR(50) NULL,
        fiscal_year_id VARCHAR(50) NOT NULL,
        period ENUM('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Semi-Annual', 'Annual') NOT NULL DEFAULT 'Annual',
        year INT NOT NULL,
        month INT NULL,
        target_value DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        annual_target DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        daily_target DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        weekly_target DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        monthly_target DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        quarterly_target DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        semi_annual_target DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        status ENUM('DRAFT', 'PENDING_ACCEPTANCE', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'ACCEPTED',
        assigned_by VARCHAR(150) NULL,
        employee_response VARCHAR(50) NULL,
        rejection_reason TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (target_id),
        CONSTRAINT fk_targets_kpi FOREIGN KEY (kpi_id) 
          REFERENCES kpi_metrics (kpi_id) ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT fk_targets_employee FOREIGN KEY (employee_id) 
          REFERENCES users (user_id) ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT fk_targets_branch FOREIGN KEY (branch_id) 
          REFERENCES branches (branch_id) ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT fk_targets_fiscal_year FOREIGN KEY (fiscal_year_id) 
          REFERENCES fiscal_years (fiscal_year_id) ON UPDATE CASCADE ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // 8. Daily Performance Reports
    const createDailyReports = `
      CREATE TABLE IF NOT EXISTS daily_performance_reports (
        report_id VARCHAR(60) NOT NULL,
        employee_id VARCHAR(50) NOT NULL,
        employee_name VARCHAR(150) NOT NULL,
        employee_user_id VARCHAR(50) NULL,
        branch_id VARCHAR(50) NOT NULL,
        branch_name VARCHAR(150) NOT NULL,
        sol_id VARCHAR(20) NULL,
        district_id VARCHAR(50) NULL,
        district_name VARCHAR(150) NULL,
        fiscal_year_id VARCHAR(50) NOT NULL,
        report_date DATE NOT NULL,
        day_of_week VARCHAR(20) NOT NULL,
        year INT NOT NULL,
        month INT NOT NULL,
        status ENUM('Draft', 'Submitted', 'Pending', 'Approved', 'Rejected', 'Returned', 'Suspended') NOT NULL DEFAULT 'Pending',
        customer_onboarding INT NOT NULL DEFAULT 0,
        mobile_banking INT NOT NULL DEFAULT 0,
        internet_banking INT NOT NULL DEFAULT 0,
        atm_debit_cards INT NOT NULL DEFAULT 0,
        merchant_solutions INT NOT NULL DEFAULT 0,
        deposits_etb DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        foreign_currency_etb DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        digital_financial_services_etb DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        manager_comment TEXT NULL,
        submitted_at DATETIME NULL,
        reviewed_by VARCHAR(150) NULL,
        reviewed_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (report_id),
        UNIQUE KEY uq_emp_report_date (employee_id, report_date),
        CONSTRAINT fk_reports_employee FOREIGN KEY (employee_id) 
          REFERENCES users (user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
        CONSTRAINT fk_reports_branch FOREIGN KEY (branch_id) 
          REFERENCES branches (branch_id) ON UPDATE CASCADE ON DELETE RESTRICT,
        CONSTRAINT fk_reports_fiscal_year FOREIGN KEY (fiscal_year_id) 
          REFERENCES fiscal_years (fiscal_year_id) ON UPDATE CASCADE ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // 9. Audit Logs
    const createAuditLogs = `
      CREATE TABLE IF NOT EXISTS audit_logs (
        log_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(150) NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        details TEXT NULL,
        ip_address VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (log_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // 10. Announcements
    const createAnnouncements = `
      CREATE TABLE IF NOT EXISTS announcements (
        announcement_id VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        priority ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
        target_audience VARCHAR(100) DEFAULT 'ALL',
        created_by VARCHAR(150) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (announcement_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // 11. System Settings
    const createSystemSettings = `
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) NOT NULL,
        setting_value JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (setting_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Execute table creation statements in order
    await pool.query(createDepartments);
    await pool.query(createDistricts);
    await pool.query(createBranches);
    await pool.query(createFiscalYears);
    await pool.query(createUsers);
    await pool.query(createKpiMetrics);
    await pool.query(createPerformanceTargets);
    await pool.query(createDailyReports);
    await pool.query(createAuditLogs);
    await pool.query(createAnnouncements);
    await pool.query(createSystemSettings);

    // Seed real Bunna Bank dataset from epms_persistent_data.json
    const seededCounts = await seedRealEpmsData(pool);

    return {
      success: true,
      message: 'All Daily KPI Performance Management tables and schemas created and verified successfully.',
      tables: [
        'departments',
        'districts',
        'branches',
        'fiscal_years',
        'users',
        'kpi_metrics',
        'performance_targets',
        'daily_performance_reports',
        'audit_logs',
        'announcements',
        'system_settings'
      ],
      seededCounts
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Failed to initialize MySQL tables',
      tables: [],
      error: err.message
    };
  }
}

export async function seedRealEpmsData(pool: mysql.Pool): Promise<Record<string, number>> {
  const counts: Record<string, number> = {
    districts: 0,
    branches: 0,
    fiscal_years: 0,
    users: 0,
    kpis: 0,
    targets: 0,
    reports: 0
  };

  try {
    const dataFilePath = path.join(process.cwd(), 'epms_persistent_data.json');
    if (!fs.existsSync(dataFilePath)) {
      return counts;
    }

    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    const data = JSON.parse(rawData);

    // 1. Seed Fiscal Years
    const fiscalYears = data.fiscal_years || [
      { id: 'FY-2026-27', name: 'FY 2026/27', startDate: '2026-07-08', endDate: '2027-07-07', isActive: true, status: 'ACTIVE' }
    ];
    for (const fy of fiscalYears) {
      await pool.query(
        `INSERT INTO fiscal_years (fiscal_year_id, name, start_date, end_date, is_active, status)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), is_active = VALUES(is_active), status = VALUES(status)`,
        [
          fy.id || fy.fiscal_year_id || 'FY-2026-27',
          fy.name || 'FY 2026/27',
          fy.startDate || fy.start_date || '2026-07-08',
          fy.endDate || fy.end_date || '2027-07-07',
          fy.isActive || fy.is_active ? 1 : 0,
          fy.status || 'ACTIVE'
        ]
      );
      counts.fiscal_years++;
    }

    // 2. Seed Districts
    if (Array.isArray(data.districts)) {
      for (const d of data.districts) {
        await pool.query(
          `INSERT INTO districts (district_id, code, name, region, manager_name, phone, email, branch_count, total_employees, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name), region = VALUES(region), manager_name = VALUES(manager_name), branch_count = VALUES(branch_count), total_employees = VALUES(total_employees)`,
          [
            d.id,
            d.code || d.id,
            d.name,
            d.region || 'Addis Ababa',
            d.managerName || null,
            d.phone || null,
            d.email || null,
            d.branchCount || 0,
            d.totalEmployees || 0,
            d.status || 'Active'
          ]
        );
        counts.districts++;
      }
    }

    // 3. Seed Branches
    if (Array.isArray(data.branches)) {
      for (const b of data.branches) {
        await pool.query(
          `INSERT INTO branches (branch_id, sol_id, code, name, district_id, district_name, grade, type, manager_name, location, phone, region, employee_count, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name), manager_name = VALUES(manager_name), employee_count = VALUES(employee_count)`,
          [
            b.id,
            b.solId || b.code || b.id.replace('BR-', ''),
            b.code || b.solId || b.id.replace('BR-', ''),
            b.name,
            b.districtId || 'DIST-001',
            b.districtName || '',
            b.grade || 'Grade I',
            b.type || 'Branch',
            b.managerName || null,
            b.location || null,
            b.phone || null,
            b.region || null,
            b.employeeCount || 0,
            b.status || 'Active'
          ]
        );
        counts.branches++;
      }
    }

    // 4. Seed Users
    if (Array.isArray(data.users)) {
      for (const u of data.users) {
        await pool.query(
          `INSERT INTO users (user_id, system_username, password_hash, first_name, middle_name, last_name, email, phone, role, role_type, job_title, branch_id, branch_name, district_id, district_name, gender, age, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), role = VALUES(role), job_title = VALUES(job_title), password_hash = VALUES(password_hash)`,
          [
            u.id || `USR-${u.userId}`,
            u.userId || u.system_username || u.email,
            u.password || 'NewPassword123!',
            u.firstName || 'User',
            u.middleName || null,
            u.lastName || 'Admin',
            u.email || `${u.userId}@bunnabanksc.com`,
            u.phone || null,
            u.role || 'EMPLOYEE',
            u.roleType || null,
            u.jobTitle || 'Officer',
            u.branchId || null,
            u.branchName || null,
            u.districtId || null,
            u.districtName || null,
            u.gender || 'Male',
            u.age || 30,
            u.status || 'Active'
          ]
        );
        counts.users++;
      }
    }

    // 5. Seed KPI Metrics
    if (Array.isArray(data.kpis)) {
      for (const k of data.kpis) {
        await pool.query(
          `INSERT INTO kpi_metrics (kpi_id, code, name, category, unit, weight, description, frequency, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name), category = VALUES(category), unit = VALUES(unit), weight = VALUES(weight), description = VALUES(description)`,
          [
            k.id,
            k.code || k.id,
            k.name,
            k.category || 'Deposit',
            k.unit || 'ETB',
            k.weight || 10,
            k.description || null,
            k.frequency || 'Daily',
            k.status || 'Active'
          ]
        );
        counts.kpis++;
      }
    }

    // 6. Seed Performance Targets
    if (Array.isArray(data.targets)) {
      for (const t of data.targets) {
        const periodTargets = t.periodTargets || {};
        await pool.query(
          `INSERT INTO performance_targets (target_id, kpi_id, employee_id, branch_id, district_id, fiscal_year_id, period, year, month, target_value, annual_target, daily_target, weekly_target, monthly_target, quarterly_target, semi_annual_target, status, assigned_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE target_value = VALUES(target_value), annual_target = VALUES(annual_target), daily_target = VALUES(daily_target)`,
          [
            t.id,
            t.kpiId || t.kpi_id || 'KPI-DEP',
            t.employeeId || t.employee_id || null,
            t.branchId || t.branch_id || null,
            t.districtId || t.district_id || null,
            t.fiscalYearId || t.fiscal_year_id || 'FY-2026-27',
            t.period || 'Annual',
            t.year || 2026,
            t.month || 8,
            t.targetValue || 0,
            t.annualTarget || t.targetValue || 0,
            periodTargets.daily || 0,
            periodTargets.weekly || 0,
            periodTargets.monthly || 0,
            periodTargets.quarterly || 0,
            periodTargets.semiAnnual || 0,
            t.status || 'ACCEPTED',
            t.assignedBy || 'Branch Manager'
          ]
        );
        counts.targets++;
      }
    }

    // 7. Seed Daily Reports
    const reports = data.reports || data.dailyReports || [];
    if (Array.isArray(reports)) {
      for (const r of reports) {
        await pool.query(
          `INSERT INTO daily_performance_reports 
            (report_id, employee_id, employee_name, employee_user_id, branch_id, branch_name, sol_id, district_id, district_name, fiscal_year_id, report_date, day_of_week, year, month, status, customer_onboarding, mobile_banking, internet_banking, atm_debit_cards, merchant_solutions, deposits_etb, foreign_currency_etb, digital_financial_services_etb, manager_comment, submitted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE customer_onboarding = VALUES(customer_onboarding), mobile_banking = VALUES(mobile_banking), internet_banking = VALUES(internet_banking), atm_debit_cards = VALUES(atm_debit_cards), merchant_solutions = VALUES(merchant_solutions), deposits_etb = VALUES(deposits_etb), foreign_currency_etb = VALUES(foreign_currency_etb), digital_financial_services_etb = VALUES(digital_financial_services_etb)`,
          [
            r.id,
            r.employeeId || r.employee_id || 'USR-ADM-001',
            r.employeeName || r.employee_name || 'Kassahun Mulatu',
            r.employeeUserId || null,
            r.branchId || r.branch_id || 'BR-101',
            r.branchName || r.branch_name || 'MAIN',
            r.solId || r.sol_id || '101',
            r.districtId || r.district_id || 'DIST-001',
            r.districtName || r.district_name || 'Addis Ababa North District',
            r.fiscalYearId || r.fiscal_year_id || 'FY-2026-27',
            r.reportDate || r.report_date || r.date || '2026-08-09',
            r.dayOfWeek || r.day_of_week || 'Sunday',
            r.year || 2026,
            r.month || 8,
            r.status || 'Pending',
            r.customerOnboarding || r.customer_onboarding || 0,
            r.mobileBanking || r.mobile_banking || 0,
            r.internetBanking || r.internet_banking || 0,
            r.atmDebitCards || r.atm_debit_cards || 0,
            r.merchantSolutions || r.merchant_solutions || 0,
            r.depositsETB || r.deposits_etb || 0,
            r.foreignCurrencyETB || r.foreign_currency_etb || 0,
            r.digitalFinancialServicesETB || r.digital_financial_services_etb || 0,
            r.managerComment || null,
            r.submittedAt || r.createdAt || new Date()
          ]
        );
        counts.reports++;
      }
    }
  } catch (err: any) {
    console.error('[MySQL Seeding Warning]:', err.message);
  }

  return counts;
}
