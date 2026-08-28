const fs = require('fs');
const content = fs.readFileSync('src/components/dashboard/AdminDashboard.tsx', 'utf8');

const stateInjection = `
  const [employeeRoleFilter, setEmployeeRoleFilter] = useState('All');
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState('All');
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
`;

const insertIndex = content.indexOf('const branchColumns: Column<Branch>[] = [');

if (insertIndex !== -1) {
  const newContent = content.substring(0, insertIndex) + stateInjection + '\n  ' + content.substring(insertIndex);
  fs.writeFileSync('src/components/dashboard/AdminDashboard.tsx', newContent);
  console.log('Successfully injected state variables!');
} else {
  console.error('Could not find injection point.');
}
