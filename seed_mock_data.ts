import fs from 'fs';
import { bunnaDistrictsAndAreaOffices } from './src/data/bunnaBranchDirectory';

const mockDataPath = './src/data/mockData.ts';
let mockDataContent = fs.readFileSync(mockDataPath, 'utf-8');

const execs = [
  { userId: "Board", password: "Board@2026", role: "BOARD_OF_DIRECTORS", jobTitle: "Board Chairman" },
  { userId: "CEO", password: "CEO@2026", role: "CEO", jobTitle: "Chief Executive Officer (CEO)" },
  { userId: "Finance", password: "Finance@2026", role: "CHIEF_OFFICER", jobTitle: "Chief Finance Officer" },
  { userId: "Strategy", password: "Strategy@2026", role: "CHIEF_OFFICER", jobTitle: "Chief Strategy Officer" },
  { userId: "Digital", password: "Digital@2026", role: "CHIEF_OFFICER", jobTitle: "Chief Digital Officer" },
  { userId: "Corporate", password: "Corporate@2026", role: "CHIEF_OFFICER", jobTitle: "Chief Corporate Banking Officer" },
  { userId: "People", password: "People@2026", role: "CHIEF_OFFICER", jobTitle: "Chief People & Culture Officer" },
  { userId: "Product", password: "Product@2026", role: "CHIEF_OFFICER", jobTitle: "Chief Product & Innovation Officer" },
  { userId: "Transformation", password: "Transformation@2026", role: "CHIEF_OFFICER", jobTitle: "Chief Transformation Officer" },
  { userId: "Retail", password: "Retail@2026", role: "CHIEF_OFFICER", jobTitle: "Chief Retail Banking Officer" },
  { userId: "Planning", password: "Planning@2026", role: "DIRECTOR", jobTitle: "Director (Strategic Planning)" }
];

let generatedUsersStr = '';

execs.forEach((u, i) => {
  generatedUsersStr += `
  {
    id: 'USR-EXEC-PREDEF-${i}',
    userId: '${u.userId}',
    email: '${u.userId.toLowerCase()}@bunnabanksc.com',
    firstName: '${u.userId}',
    middleName: '',
    lastName: 'User',
    password: '${u.password}',
    role: '${u.role}',
    jobTitle: '${u.jobTitle}',
    districtId: 'DIST-HO',
    districtName: 'Head Office',
    branchId: 'BR-HQ',
    branchName: 'Head Office',
    gender: 'Male',
    age: 45,
    phone: '+251900000000',
    status: 'Active',
    createdAt: '2026-01-01'
  },`;
});

bunnaDistrictsAndAreaOffices.forEach((d, i) => {
  const username = d.name;
  const password = d.name + '@2026';
  generatedUsersStr += `
  {
    id: 'USR-DIST-PREDEF-${i}',
    userId: '${username}',
    email: '${username.replace(/\s+/g, '').toLowerCase()}@bunnabanksc.com',
    firstName: '${username}',
    middleName: 'District',
    lastName: 'Director',
    password: '${password}',
    role: 'DISTRICT_DIRECTOR',
    jobTitle: 'District Director',
    districtId: '${d.id}',
    districtName: '${d.name}',
    branchId: 'BR-HQ',
    branchName: 'District Office',
    gender: 'Male',
    age: 45,
    phone: '+251900000000',
    status: 'Active',
    createdAt: '2026-01-01'
  },`;
});

mockDataContent = mockDataContent.replace(
  'export const defaultUsers: User[] = [',
  'export const defaultUsers: User[] = [' + generatedUsersStr
);

fs.writeFileSync(mockDataPath, mockDataContent, 'utf-8');
console.log('Updated src/data/mockData.ts successfully');
