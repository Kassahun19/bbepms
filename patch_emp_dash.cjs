const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/EmployeeDashboard.tsx', 'utf-8');

const importStatement = "import { EmployeePerformanceTable } from './EmployeePerformanceTable';\n";
content = content.replace("import { PersonalKpiProgressChart }", importStatement + "import { PersonalKpiProgressChart }");

const tableComponentStr = `
      {/* Comprehensive KPI Performance Calculation */}
      <EmployeePerformanceTable reports={reports} targets={targets} employeeId={user.id} />
`;

content = content.replace(/\{(\/\*\s*Targets &\s*Progress\s*Calculations\s*\*\/[\s\S]*?)return \(/, "return (");
// Wait, the above regex might break things. I'll just insert it below the PersonalKpiProgressChart.
// Let's find <PersonalKpiProgressChart ... />

content = content.replace(/(<PersonalKpiProgressChart[\s\S]*?\/>)/, "$1\n" + tableComponentStr);

fs.writeFileSync('src/components/dashboard/EmployeeDashboard.tsx', content);
console.log('patched employee dashboard');
