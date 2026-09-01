-- ============================================================================
-- BUNNA BANK S.C. - DAILY KPI PERFORMANCE MANAGEMENT SYSTEM (EPMS)
-- 02_seed.sql: Initial Core Seed Data
-- ============================================================================

-- Fiscal Years
INSERT INTO fiscal_years (fiscal_year_id, name, start_date, end_date, is_active, status)
VALUES 
  ('FY-2025-26', 'FY 2025/26', '2025-07-01', '2026-06-30', 0, 'CLOSED'),
  ('FY-2026-27', 'FY 2026/27', '2026-07-01', '2027-06-30', 1, 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name), is_active=VALUES(is_active), status=VALUES(status);

-- Departments
INSERT INTO departments (department_id, code, name, description)
VALUES
  ('DEP-001', 'RETAIL', 'Retail Banking Department', 'Retail banking operations and deposit mobilization'),
  ('DEP-002', 'DIGITAL', 'Digital Banking & FinTech Department', 'Mobile banking, ATM, internet banking and merchant solutions'),
  ('DEP-003', 'CREDIT', 'Credit & Loans Department', 'Credit underwriting, loan appraisal and portfolio monitoring'),
  ('DEP-004', 'HR', 'Human Capital Department', 'Staffing, appraisals and organizational talent performance')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Districts
INSERT INTO districts (district_id, code, name, region, manager_name, branch_count, total_employees, status)
VALUES
  ('DIST-001', 'AAN', 'Addis Ababa North District', 'Addis Ababa', 'Abebe Kebede', 42, 850, 'Active'),
  ('DIST-002', 'AAS', 'Addis Ababa South District', 'Addis Ababa', 'Tewodros Bekele', 38, 790, 'Active'),
  ('DIST-EAD', 'EAD', 'East A.A District', 'Addis Ababa', 'Almaz Haile', 45, 920, 'Active'),
  ('DIST-BDR', 'BDR', 'Bahir Dar District', 'Amhara', 'Getachew Mengistu', 35, 620, 'Active'),
  ('DIST-HAW', 'HAW', 'Hawassa District', 'Sidama', 'Mulugeta Tadesse', 30, 540, 'Active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Branches
INSERT INTO branches (branch_id, sol_id, code, name, district_id, district_name, grade, type, manager_name, location, status)
VALUES
  ('BR-101', '101', '101', 'MAIN', 'DIST-EAD', 'East A.A District', 'Special Branch', 'Main Branch', 'Ato Zena Asefa', 'MAIN, Addis Ababa', 'Active'),
  ('BR-360', '360', '360', 'Hamusit Branch', 'DIST-BDR', 'Bahir Dar District', 'Grade I', 'Branch', 'Ato Yohannes Alemu', 'Hamusit, Amhara', 'Active'),
  ('BR-001', '001', '001', 'Bole Headquarters Branch', 'DIST-001', 'Addis Ababa North District', 'Special Branch', 'Headquarters', 'Ato Daniel Girma', 'Bole, Addis Ababa', 'Active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- KPI Metrics
INSERT INTO kpi_metrics (kpi_id, code, name, category, unit, weight, description, frequency, status)
VALUES
  ('KPI-DEP', 'KPI-DEP', 'Deposit Mobilization', 'Deposit', 'ETB', 20.00, 'Mobilization of fresh individual and corporate deposits', 'Daily', 'Active'),
  ('KPI-FCY', 'KPI-FCY', 'Foreign Currency (FCY)', 'Foreign Currency', 'ETB', 15.00, 'FCY generation through remittances and exports', 'Daily', 'Active'),
  ('KPI-DFS', 'KPI-DFS', 'Digital Financing System (DFS)', 'Digital Banking', 'ETB', 20.00, 'Volume disbursed and processed through digital financing channels', 'Daily', 'Active'),
  ('KPI-CUST', 'KPI-CUST', 'Customer Base Expansion', 'Customer Acquisition', 'Count', 20.00, 'New customer onboarding and active savings accounts', 'Daily', 'Active'),
  ('KPI-DIG', 'KPI-DIG', 'Digital Channels Subscriptions', 'Digitals', 'Count', 25.00, 'Mobile Banking, ATM Debit Card, Merchant QR and Internet Banking', 'Daily', 'Active')
ON DUPLICATE KEY UPDATE name=VALUES(name), weight=VALUES(weight);

-- Default Super Admin & Key Users
INSERT INTO users (user_id, system_username, password_hash, first_name, middle_name, last_name, email, phone, role, job_title, district_id, district_name, branch_id, branch_name, status)
VALUES
  ('USR-SUPER-ADMIN-001', 'super_admin', '$2a$10$w09aJ3B2eCvh9lY0v32gUuO17H4w6n6m7eO98p7y1m3n5b8v9c2x1', 'Bank Super', 'System', 'Admin', 'admin@bunnabanksc.com', '+251911000001', 'BANK_SUPER_ADMIN', 'Bank Super Administrator (System Control Center)', 'DIST-001', 'Addis Ababa North District', 'BR-001', 'Bole Headquarters Branch', 'Active'),
  ('USR-ADM-001', 'ADM-4994', '$2a$10$w09aJ3B2eCvh9lY0v32gUuO17H4w6n6m7eO98p7y1m3n5b8v9c2x1', 'Kassahun', 'Mulatu', 'Mulatu', 'kassahunmulatu273@gmail.com', '+251911002233', 'ADMINISTRATOR', 'EPMS System Architect & Enterprise Admin', 'DIST-001', 'Addis Ababa North District', 'BR-001', 'Bole Headquarters Branch', 'Active')
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), role=VALUES(role);
