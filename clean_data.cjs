const fs = require('fs');

// 1. Rewrite bunnaBranchDirectory.ts
const officialBranches = require('./official_branches.json');
const currentDirTs = fs.readFileSync('./src/data/bunnaBranchDirectory.ts', 'utf-8');
const topPartMatch = currentDirTs.match(/[\s\S]*?export const bunnaBranchDirectory: Branch\[\] = \[\n/);

let newDirTs = topPartMatch[0];
newDirTs += officialBranches.map(b => JSON.stringify(b, null, 2)).join(',\n') + '\n];\n';
fs.writeFileSync('./src/data/bunnaBranchDirectory.ts', newDirTs);

// 2. Modify mockData.ts to empty out placeholder data
let mockDataTs = fs.readFileSync('./src/data/mockData.ts', 'utf-8');
// Remove initialKPIs
mockDataTs = mockDataTs.replace(/export const initialKPIs: KPI\[\] = \[[\s\S]*?\];/g, 'export const initialKPIs: KPI[] = [];');
// Remove initialDailyReports
mockDataTs = mockDataTs.replace(/export const initialDailyReports: DailyPerformanceReport\[\] = \[[\s\S]*?\];/g, 'export const initialDailyReports: DailyPerformanceReport[] = [];');
// Remove initialTargets
mockDataTs = mockDataTs.replace(/export const initialTargets: PerformanceTarget\[\] = \[[\s\S]*?\];/g, 'export const initialTargets: PerformanceTarget[] = [];');
// Modify defaultUsers to only contain the Administrator
const adminUserStr = `export const defaultUsers: User[] = [
  {
    id: 'USR-ADM-001',
    userId: '4994',
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
  }
];`;
mockDataTs = mockDataTs.replace(/export const defaultUsers: User\[\] = \[[\s\S]*?\];/g, adminUserStr);

fs.writeFileSync('./src/data/mockData.ts', mockDataTs);

// 3. Clear epms_persistent_data.json
let epms = {};
try {
  epms = require('./epms_persistent_data.json');
} catch (e) {}

epms.branches = officialBranches;
epms.kpis = [];
epms.dailyReports = [];
epms.targets = [];
epms.users = epms.users ? epms.users.filter(u => u.role === 'ADMINISTRATOR') : [];
if (epms.users.length === 0) {
  epms.users = [{
    id: 'USR-ADM-001',
    userId: '4994',
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
  }];
}

fs.writeFileSync('./epms_persistent_data.json', JSON.stringify(epms, null, 2));
console.log('Cleanup complete.');
