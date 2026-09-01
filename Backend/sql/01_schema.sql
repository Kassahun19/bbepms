-- ============================================================================
-- BUNNA BANK S.C. - DAILY KPI PERFORMANCE MANAGEMENT SYSTEM (EPMS)
-- 01_schema.sql: Production Relational Database Schema (MySQL 8.0+)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  department_id VARCHAR(50) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Districts Table
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

-- 3. Branches Table
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

-- 4. Fiscal Years Table
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

-- 5. Users Table
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

-- 6. KPI Metrics Table
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

-- 7. Performance Targets Table
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

-- 8. Daily Performance Reports Table
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

-- 9. Audit Logs Table
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

SET FOREIGN_KEY_CHECKS = 1;
