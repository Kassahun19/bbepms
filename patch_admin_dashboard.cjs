const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/AdminDashboard.tsx', 'utf-8');

// Add import
const importStatement = "import { BranchPerformanceDetailsModal } from './BranchPerformanceDetailsModal';\n";
content = content.replace("import React, { useState", importStatement + "import React, { useState");

// Replace the viewingBranch inline modal
const oldModalPattern = /\{viewingBranch && \([\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;
const newModalStr = `{viewingBranch && (
        <BranchPerformanceDetailsModal
          branch={viewingBranch}
          onClose={() => setViewingBranch(null)}
          users={users}
          reports={reports}
          kpis={kpis}
          targets={targets}
        />
      )}`;

content = content.replace(oldModalPattern, newModalStr);
fs.writeFileSync('src/components/dashboard/AdminDashboard.tsx', content);
console.log('patched admin dashboard');
