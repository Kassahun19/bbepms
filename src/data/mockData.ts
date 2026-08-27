import {
  District,
  Branch,
  Department,
  User,
  KPI,
  PerformanceTarget,
  DailyPerformanceReport,
  Announcement,
  Notification,
  BankHoliday,
  AuditLog
} from '../types';
import { bunnaDistrictsAndAreaOffices, bunnaBranchDirectory } from './bunnaBranchDirectory';

export const initialDistricts: District[] = bunnaDistrictsAndAreaOffices;

export const initialBranches: Branch[] = bunnaBranchDirectory;

export const initialDepartments: Department[] = [
  { id: 'DEP-01', name: 'Retail Banking & DFS', code: 'RB', description: 'Manages deposit mobilization, account opening, and digital banking activations.' },
  { id: 'DEP-02', name: 'International Banking (FCY)', code: 'IB', description: 'Handles foreign currency trade, remittances, and SWIFT services.' },
  { id: 'DEP-03', name: 'Credit & Loans', code: 'CL', description: 'Evaluates loan applications, SME finance, and credit monitoring.' },
  { id: 'DEP-04', name: 'Human Resource Management', code: 'HR', description: 'Oversees staff performance, training, payroll, and promotions.' },
  { id: 'DEP-05', name: 'Digital Banking & Innovation', code: 'DBI', description: 'Manages Bunna Mobile, Internet Banking, ATMs, and Merchant POS.' },
];

export const initialKPIs: KPI[] = [
  { id: 'KPI-DEP', code: 'KPI-DEP', name: 'Deposit Mobilization', category: 'Finance', unit: 'ETB', weight: 20, description: 'Deposit Mobilization target achievements (20% weight)' },
  { id: 'KPI-FCY', code: 'KPI-FCY', name: 'Foreign Currency Generation (FCY)', category: 'Finance', unit: 'ETB', weight: 15, description: 'Foreign Currency trade and remittance inflow (15% weight)' },
  { id: 'KPI-DFS', code: 'KPI-DFS', name: 'Digital Financing System (DFS)', category: 'Finance', unit: 'ETB', weight: 20, description: 'Digital financing and credit portfolio mobilization (20% weight)' },
  { id: 'KPI-CUST', code: 'KPI-CUST', name: 'Customer Base & Account Openings', category: 'Stakeholder', unit: 'Count', weight: 20, description: 'New customer onboarding and active account growth (20% weight)' },
  { id: 'KPI-DIG', code: 'KPI-DIG', name: 'Digitals (Mobile, ATM, Merchant, Internet)', category: 'Internal Business', unit: 'Count', weight: 25, description: 'Digital banking activations including Mobile Banking, ATMs, Merchant POS & Internet Banking (25% weight)' }
];

export const defaultUsers: User[] = [
  {
    id: 'USR-ADM-001',
    userId: 'ADM-4994',
    email: 'kassahunmulatu273@gmail.com',
    firstName: 'Kassahun',
    middleName: 'Mulatu',
    lastName: 'Mulatu',
    role: 'ADMINISTRATOR',
    jobTitle: 'EPMS System Architect & Enterprise Admin',
    districtId: 'DIST-EAD',
    districtName: 'East A.A District',
    branchId: 'BR-101',
    branchName: 'Main HQ Branch',
    gender: 'Male',
    age: 32,
    phone: '+251911002233',
    status: 'Active',
    createdAt: '2026-01-01',
    password: 'Admin@360'
  },
  {
    id: 'USR-1323',
    userId: '1323',
    password: 'Negash@360',
    email: 'negash.adugna@bunnabanksc.com',
    firstName: 'Negash',
    middleName: '',
    lastName: 'Adugna',
    role: 'MANAGER',
    roleType: 'Managerial',
    jobTitle: 'Branch Manager',
    districtId: 'DIST-BDR',
    districtName: 'Bahir Dar District',
    branchId: 'BR-360',
    branchName: 'Hamusit Branch',
    gender: 'Male',
    age: 41,
    phone: '+251911223344',
    status: 'Active',
    createdAt: '2026-01-01'
  },
  {
    id: 'USR-2213',
    userId: '2213',
    password: 'Mezgebu@360',
    email: 'mezgebu.ashebir@bunnabanksc.com',
    firstName: 'Mezgebu',
    middleName: '',
    lastName: 'Ashebir',
    role: 'EMPLOYEE',
    roleType: 'Non-Managerial',
    jobTitle: 'Branch Sales and Service Supervisor I',
    districtId: 'DIST-BDR',
    districtName: 'Bahir Dar District',
    branchId: 'BR-360',
    branchName: 'Hamusit Branch',
    managerId: '1323',
    gender: 'Male',
    age: 30,
    phone: '+251912221313',
    status: 'Active',
    createdAt: '2026-01-01'
  },
  {
    id: 'USR-2725',
    userId: '2725',
    password: 'Gedif@360',
    email: 'gedif.zewdu@bunnabanksc.com',
    firstName: 'Gedif',
    middleName: '',
    lastName: 'Zewdu',
    role: 'EMPLOYEE',
    roleType: 'Non-Managerial',
    jobTitle: 'Branch Sales and Service Supervisor I',
    districtId: 'DIST-BDR',
    districtName: 'Bahir Dar District',
    branchId: 'BR-360',
    branchName: 'Hamusit Branch',
    managerId: '1323',
    gender: 'Male',
    age: 29,
    phone: '+251912272525',
    status: 'Active',
    createdAt: '2026-01-01'
  },
  {
    id: 'USR-3189',
    userId: '3189',
    password: 'Habetam@360',
    email: 'habetam.abrham@bunnabanksc.com',
    firstName: 'Habetam',
    middleName: '',
    lastName: 'Abrham',
    role: 'EMPLOYEE',
    roleType: 'Non-Managerial',
    jobTitle: 'Branch Sales and Relationship Officer',
    districtId: 'DIST-BDR',
    districtName: 'Bahir Dar District',
    branchId: 'BR-360',
    branchName: 'Hamusit Branch',
    managerId: '1323',
    gender: 'Female',
    age: 27,
    phone: '+251912318989',
    status: 'Active',
    createdAt: '2026-01-01'
  },
  {
    id: 'USR-3870',
    userId: '3870',
    password: 'Getnet@360',
    email: 'getnet.abeje@bunnabanksc.com',
    firstName: 'Getnet',
    middleName: '',
    lastName: 'Abeje',
    role: 'EMPLOYEE',
    roleType: 'Non-Managerial',
    jobTitle: 'Branch Sales and Relationship Officer',
    districtId: 'DIST-BDR',
    districtName: 'Bahir Dar District',
    branchId: 'BR-360',
    branchName: 'Hamusit Branch',
    managerId: '1323',
    gender: 'Male',
    age: 28,
    phone: '+251912387070',
    status: 'Active',
    createdAt: '2026-01-01'
  },
  {
    id: 'USR-4994',
    userId: '4994',
    password: 'Kassahun@360',
    email: 'kassahun.mulatu@bunnabanksc.com',
    firstName: 'Kassahun',
    middleName: '',
    lastName: 'Mulatu',
    role: 'EMPLOYEE',
    roleType: 'Non-Managerial',
    jobTitle: 'Branch Sales and Relationship Officer',
    districtId: 'DIST-BDR',
    districtName: 'Bahir Dar District',
    branchId: 'BR-360',
    branchName: 'Hamusit Branch',
    managerId: '1323',
    gender: 'Male',
    age: 32,
    phone: '+251912499494',
    status: 'Active',
    createdAt: '2026-01-01'
  }
];

export const initialHolidays: BankHoliday[] = [
  { id: 'HOL-001', name: 'Ethiopian New Year (Enkutatash)', date: '2026-09-11', description: 'Official National & Banking Holiday', recurring: true },
  { id: 'HOL-002', name: 'Finding of the True Cross (Meskel)', date: '2026-09-27', description: 'Official Religious & Banking Holiday', recurring: true },
  { id: 'HOL-003', name: 'Ethiopian Christmas (Genna)', date: '2026-01-07', description: 'Official Religious & Banking Holiday', recurring: true },
  { id: 'HOL-004', name: 'Ethiopian Epiphany (Timkat)', date: '2026-01-19', description: 'Official Religious & Banking Holiday', recurring: true },
  { id: 'HOL-005', name: 'Victory of Adwa Day', date: '2026-03-02', description: 'Official National Holiday', recurring: true },
  { id: 'HOL-006', name: 'International Workers Day', date: '2026-05-01', description: 'Official Public & Banking Holiday', recurring: true },
  { id: 'HOL-007', name: 'Patriots Victory Day', date: '2026-05-05', description: 'Official National Holiday', recurring: true },
  { id: 'HOL-008', name: 'Eid al-Fitr', date: '2026-03-20', description: 'Islamic Public Holiday (Subject to moon sighting)', recurring: false },
  { id: 'HOL-009', name: 'Eid al-Adha (Arefa)', date: '2026-05-27', description: 'Islamic Public Holiday (Subject to moon sighting)', recurring: false },
];

export const initialAnnouncements: Announcement[] = [];

export const initialNotifications: Notification[] = [];

export const initialAuditLogs: AuditLog[] = [];

export const initialDailyReports: DailyPerformanceReport[] = [];

export const initialTargets: PerformanceTarget[] = [];
