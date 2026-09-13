// backend/services/seedService.js
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { District } from '../models/District.js';
import { Branch } from '../models/Branch.js';
import { KpiMetric } from '../models/KpiMetric.js';
import { PerformanceTarget } from '../models/PerformanceTarget.js';
import { DailyPerformanceReport } from '../models/DailyPerformanceReport.js';
import { getMySqlPool, executeSqlQuery, loadPersistentData, savePersistentData } from '../config/db.js';

export async function seedInitialDatabase() {
  console.log('[Seed Service] Starting Bunna Bank EPMS database seeding...');
  const pool = getMySqlPool();
  const store = loadPersistentData();

  // 1. Seed KPI Metrics
  const kpis = [
    { kpi_id: 'KPI-DEP', code: 'DEP_ETB', name: 'Deposits Mobilized', category: 'Financial', unit: 'ETB', weight: 20.0, description: 'Net fresh deposits mobilized' },
    { kpi_id: 'KPI-FCY', code: 'FCY_USD', name: 'Foreign Currency Inflow', category: 'Financial', unit: 'USD', weight: 15.0, description: 'Remittances and export proceeds' },
    { kpi_id: 'KPI-DFS', code: 'DFS_ETB', name: 'Digital Financial Services', category: 'Digital', unit: 'ETB', weight: 20.0, description: 'Transaction volume across digital channels' },
    { kpi_id: 'KPI-ACC', code: 'ACC_OPEN', name: 'New Account Openings', category: 'Customer', unit: 'Accounts', weight: 20.0, description: 'CASA customer onboarding' },
    { kpi_id: 'KPI-MB', code: 'MB_ACT', name: 'Mobile Banking Activations', category: 'Digital', unit: 'Users', weight: 6.25, description: 'Bunna Mobile App activations' },
    { kpi_id: 'KPI-IB', code: 'IB_ACT', name: 'Internet Banking Registrations', category: 'Digital', unit: 'Users', weight: 6.25, description: 'Corporate and retail internet banking' },
    { kpi_id: 'KPI-ATM', code: 'ATM_CARD', name: 'ATM Debit Cards Issued', category: 'Customer', unit: 'Cards', weight: 6.25, description: 'Debit card issuance and PIN setup' },
    { kpi_id: 'KPI-POS', code: 'MERCH_POS', name: 'Merchant Solutions & POS', category: 'Business', unit: 'Merchants', weight: 6.25, description: 'POS terminals and QR merchant onboarding' }
  ];

  for (const kpi of kpis) {
    await KpiMetric.create(kpi);
  }

  // 2. Seed Official Branches and Districts from official_branches.json if available
  const backendBranchesPath = path.resolve(process.cwd(), 'backend/data/official_branches.json');
  const rootBranchesPath = path.resolve(process.cwd(), 'official_branches.json');
  const branchesJsonPath = fs.existsSync(backendBranchesPath) ? backendBranchesPath : rootBranchesPath;
  let branchDataList = [];
  if (fs.existsSync(branchesJsonPath)) {
    try {
      branchDataList = JSON.parse(fs.readFileSync(branchesJsonPath, 'utf8'));
    } catch (e) {
      console.warn('[Seed] Could not read official_branches.json:', e.message);
    }
  }

  // Extract unique districts
  const districtMap = new Map();
  if (branchDataList.length > 0) {
    for (const b of branchDataList) {
      const dName = b.district || b.district_name || 'Central Addis District';
      if (!districtMap.has(dName)) {
        districtMap.set(dName, {
          district_id: `DIST-${dName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25)}`,
          code: `DST-${Math.floor(100 + Math.random() * 900)}`,
          name: dName,
          region: dName.includes('Addis') ? 'Addis Ababa' : 'Regional Outlying',
          branch_count: 0
        });
      }
      districtMap.get(dName).branch_count++;
    }
  } else {
    // Default 5 key districts
    const defaultDistricts = [
      { district_id: 'DIST-CENTRAL-ADDIS', code: 'DST-101', name: 'Central Addis District', region: 'Addis Ababa', branch_count: 32 },
      { district_id: 'DIST-SOUTH-ADDIS', code: 'DST-102', name: 'South Addis District', region: 'Addis Ababa', branch_count: 28 },
      { district_id: 'DIST-NORTH-ADDIS', code: 'DST-103', name: 'North Addis District', region: 'Addis Ababa', branch_count: 24 },
      { district_id: 'DIST-HAWASSA', code: 'DST-201', name: 'Hawassa District', region: 'Sidama', branch_count: 22 },
      { district_id: 'DIST-BAHIR-DAR', code: 'DST-202', name: 'Bahir Dar District', region: 'Amhara', branch_count: 26 }
    ];
    for (const d of defaultDistricts) districtMap.set(d.name, d);
  }

  for (const d of districtMap.values()) {
    await District.create(d);
  }

  // Seed Branches
  if (branchDataList.length > 0) {
    for (let i = 0; i < Math.min(branchDataList.length, 500); i++) {
      const item = branchDataList[i];
      const dName = item.district || item.district_name || 'Central Addis District';
      const dObj = districtMap.get(dName);
      await Branch.create({
        branch_id: item.sol_id ? `BR-${item.sol_id}` : `BR-${i + 1}`,
        sol_id: item.sol_id || String(1000 + i),
        code: `BRC-${item.sol_id || (1000 + i)}`,
        name: item.name || item.branch_name || `Branch ${i + 1}`,
        district_id: dObj ? dObj.district_id : 'DIST-CENTRAL-ADDIS',
        district_name: dName,
        grade: item.grade || 'Grade I',
        region: dObj ? dObj.region : 'Addis Ababa',
        employee_count: 8,
        status: 'Active'
      });
    }
  }

  // 3. Seed Default Users across all 9 roles
  const defaultPasswordHash = await bcrypt.hash('SuperAdmin@2026!', 10);
  const employeePasswordHash = await bcrypt.hash('Employee@2026!', 10);

  const defaultUsers = [
    {
      user_id: 'USR-SUPERADMIN',
      system_username: 'kassahun.m',
      password_hash: defaultPasswordHash,
      first_name: 'Kassahun',
      middle_name: 'Mulatu',
      last_name: 'Tech',
      email: 'kassahun.m@bunnabanksc.com',
      role: 'BANK_SUPER_ADMIN',
      job_title: 'Head of Enterprise Engineering',
      status: 'Active'
    },
    {
      user_id: 'USR-ADMIN',
      system_username: 'admin.user',
      password_hash: defaultPasswordHash,
      first_name: 'Eleni',
      middle_name: 'Gebre',
      last_name: 'Wolde',
      email: 'admin.epms@bunnabanksc.com',
      role: 'ADMINISTRATOR',
      job_title: 'System Administrator',
      status: 'Active'
    },
    {
      user_id: 'USR-BOARD',
      system_username: 'board.chair',
      password_hash: defaultPasswordHash,
      first_name: 'Dr. Berhanu',
      middle_name: 'Tsegaye',
      last_name: 'Board',
      email: 'board.chair@bunnabanksc.com',
      role: 'BOARD_OF_DIRECTORS',
      job_title: 'Board Chairperson',
      status: 'Active'
    },
    {
      user_id: 'USR-CEO',
      system_username: 'ceo.bunna',
      password_hash: defaultPasswordHash,
      first_name: 'Mulugeta',
      middle_name: 'Alemayehu',
      last_name: 'Executive',
      email: 'ceo@bunnabanksc.com',
      role: 'CEO',
      job_title: 'Chief Executive Officer',
      status: 'Active'
    },
    {
      user_id: 'USR-CHIEF-RETAIL',
      system_username: 'chief.retail',
      password_hash: defaultPasswordHash,
      first_name: 'Hiwot',
      middle_name: 'Tesfaye',
      last_name: 'Kassa',
      email: 'chief.retail@bunnabanksc.com',
      role: 'CHIEF_OFFICER',
      job_title: 'Chief Retail Banking Officer',
      status: 'Active'
    },
    {
      user_id: 'USR-DIR-BAHIR-DAR',
      system_username: 'director.bahirdar',
      password_hash: defaultPasswordHash,
      first_name: 'Dawit',
      middle_name: 'Mekonnen',
      last_name: 'Haile',
      email: 'dir.bahirdar@bunnabanksc.com',
      role: 'DISTRICT_DIRECTOR',
      job_title: 'District Director - Bahir Dar',
      district_id: 'DIST-BAHIR-DAR',
      district_name: 'Bahir Dar District',
      status: 'Active'
    },
    {
      user_id: 'USR-MGR-BOLE',
      system_username: 'manager.bole',
      password_hash: defaultPasswordHash,
      first_name: 'Yared',
      middle_name: 'Bekele',
      last_name: 'Tilahun',
      email: 'mgr.bole@bunnabanksc.com',
      role: 'MANAGER',
      job_title: 'Branch Manager - Bole Medhanialem',
      branch_id: 'BR-1001',
      branch_name: 'Bole Medhanialem Branch',
      status: 'Active'
    },
    {
      user_id: 'USR-EMP-TELLER1',
      system_username: 'employee.kassahun',
      password_hash: employeePasswordHash,
      first_name: 'Kassahun',
      middle_name: 'M.',
      last_name: 'CSO',
      email: 'kassahun.cso@bunnabanksc.com',
      role: 'EMPLOYEE',
      job_title: 'Customer Service Officer (CSO)',
      branch_id: 'BR-1001',
      branch_name: 'Bole Medhanialem Branch',
      status: 'Active'
    }
  ];

  for (const u of defaultUsers) {
    await User.create(u);
  }

  // 4. Seed Sample Target and Daily Reports for immediate dashboard activity
  await PerformanceTarget.create({
    target_id: 'TGT-SAMPLE-DEP',
    kpi_id: 'KPI-DEP',
    employee_id: 'USR-EMP-TELLER1',
    branch_id: 'BR-1001',
    fiscal_year_id: 'FY-2025-2026',
    annual_target: 6000000.00, // 6M ETB
    daily_target: 20000.00,    // 20k ETB per banking day (6M / 300)
    status: 'ACCEPTED'
  });

  const today = new Date().toISOString().split('T')[0];
  await DailyPerformanceReport.create({
    report_id: 'REP-SAMPLE-TODAY',
    employee_id: 'USR-EMP-TELLER1',
    employee_name: 'Kassahun M. CSO',
    branch_id: 'BR-1001',
    branch_name: 'Bole Medhanialem Branch',
    fiscal_year_id: 'FY-2025-2026',
    report_date: today,
    status: 'Approved',
    customer_onboarding: 5,
    mobile_banking: 8,
    internet_banking: 3,
    atm_debit_cards: 6,
    merchant_solutions: 1,
    deposits_etb: 45000.00,
    foreign_currency_etb: 1500.00,
    digital_financial_services_etb: 22000.00,
    manager_comment: 'Approved against Finacle batch totals.'
  });

  console.log('[Seed Service] Seeding complete! MySQL tables and persistent store are populated.');
  return {
    kpisCount: kpis.length,
    districtsCount: districtMap.size,
    branchesCount: branchDataList.length || 5,
    usersCount: defaultUsers.length
  };
}

export default {
  seedInitialDatabase
};
