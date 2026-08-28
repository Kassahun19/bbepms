const fs = require('fs');
const content = fs.readFileSync('src/components/dashboard/AdminDashboard.tsx', 'utf8');

const importStatement = `import { ReusableDataTable, Column } from '../ui/ReusableDataTable';\nimport * as api from '../../services/api';\n`;

// Find last import
const importMatch = content.match(/import [^;]+;\n/g);
const lastImport = importMatch[importMatch.length - 1];
let newContent = content.replace(lastImport, lastImport + importStatement);

// We need to inject the columns definition inside the component, before the return
const columnsDef = `
  const branchColumns: Column<Branch>[] = [
    { key: 'solId', header: 'SOL ID', render: (b) => <span className="font-extrabold text-[#C89A2B] font-mono">{b.solId || b.code}</span> },
    { key: 'name', header: 'Branch Name', render: (b) => <span className="font-semibold text-white">{b.name}</span> },
    { key: 'phone', header: 'Telephone Line(s)', render: (b) => <div className="flex items-center space-x-1"><Phone className="w-3 h-3 text-emerald-400 shrink-0" /><span>{b.phone || '+251 11 800 0000'}</span></div> },
    { key: 'districtName', header: 'Parent District / Area Office', render: (b) => <span className="font-medium text-white">{b.districtName}</span> },
    { key: 'region', header: 'Region', render: (b) => <span>{b.region || 'Addis Ababa'}</span> },
    { key: 'location', header: 'Branch Address / Location' },
    { key: 'type', header: 'Grade / Type', render: (b) => <span className="bg-[#C89A2B]/20 text-[#C89A2B] border border-[#C89A2B]/30 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap">{b.type || 'Grade I'}</span> },
    { key: 'status', header: 'Status', render: (b) => <span className={\`px-2 py-0.5 rounded text-[10px] font-bold \${(b.status || 'Active') === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}\`}>{b.status || 'Active'}</span> },
    { key: 'actions', header: 'Actions', render: (b) => (
      <div className="flex items-center justify-end space-x-1.5">
        <button onClick={() => setViewingBranch(b)} title="View" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-cyan-300"><Eye className="w-4 h-4" /></button>
        <button onClick={() => setEditingBranch({...b})} title="Edit" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-amber-400"><Edit2 className="w-4 h-4" /></button>
        <button onClick={() => handleDeleteBranch(b.id, b.name)} title="Delete" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-rose-400"><Trash2 className="w-4 h-4" /></button>
      </div>
    ) }
  ];
`;

newContent = newContent.replace('const [branchSortBy, setBranchSortBy] = useState<string>(\'name\');', 'const [branchSortBy, setBranchSortBy] = useState<string>(\'name\');\n' + columnsDef);


// Now replace the table block
const startIdx = newContent.indexOf('{/* Search, Filter, Sort Controls */}');
const endMarker = '{/* end Branch Pagination */}';
let endIdx = newContent.indexOf('</button>\n            </div>\n          </div>', startIdx);
endIdx = newContent.indexOf('</div>', endIdx + 45) + 6; // To cover the pagination div

const dataTableBlock = `
          {/* Server-Side Reusable Data Table */}
          <ReusableDataTable
            fetchData={api.getPaginatedBranches}
            columns={branchColumns}
            defaultSortBy="name"
            filterState={{ districtId: branchDistrictFilter, region: branchRegionFilter, status: branchStatusFilter }}
            filters={
              <>
                <select value={branchRegionFilter} onChange={(e) => setBranchRegionFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-[#6B3F1D] border border-white/20 text-xs text-white focus:outline-none">
                  <option value="All">All Regions</option>
                  {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={branchDistrictFilter} onChange={(e) => setBranchDistrictFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-[#6B3F1D] border border-white/20 text-xs text-white focus:outline-none">
                  <option value="All">All Districts</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select value={branchStatusFilter} onChange={(e) => setBranchStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-[#6B3F1D] border border-white/20 text-xs text-white focus:outline-none">
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </>
            }
          />
`;

if (startIdx !== -1 && endIdx !== -1) {
  newContent = newContent.substring(0, startIdx) + dataTableBlock + newContent.substring(endIdx);
  fs.writeFileSync('src/components/dashboard/AdminDashboard.tsx', newContent);
  console.log('Successfully refactored branches table.');
} else {
  console.error('Failed to find start/end bounds for branches table block');
}
