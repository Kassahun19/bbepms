const fs = require('fs');
const content = fs.readFileSync('src/components/dashboard/AdminDashboard.tsx', 'utf8');

const startIdx = content.indexOf('          {/* Server-Side Reusable Data Table */}');
const endMarker = '{/* end Branch Pagination */}'; // wait, it's missing. Let's find where the original table ended.

const nextTabStart = content.indexOf('{/* Employees Tab */}');

if (startIdx !== -1 && nextTabStart !== -1) {
  // we want to keep everything up to <ReusableDataTable ... />
  const tableEnd = content.indexOf('/>\n', startIdx) + 3;
  
  // now we just want to remove everything between tableEnd and nextTabStart, EXCEPT the closing div for the Branches Tab.
  // The Branches tab probably ended with:
  //       </div>
  //     )}
  //     {/* Employees Tab */}
  
  const originalEnd = `
        </div>
      )}

      {/* Employees Tab */}
`;
  
  const newContent = content.substring(0, tableEnd) + originalEnd + content.substring(nextTabStart + 24);
  fs.writeFileSync('src/components/dashboard/AdminDashboard.tsx', newContent);
  console.log('Fixed syntax error!');
}
