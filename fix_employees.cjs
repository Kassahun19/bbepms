const fs = require('fs');
const content = fs.readFileSync('src/components/dashboard/AdminDashboard.tsx', 'utf8');

const employeesTab = `
      {/* TAB 4: EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-xl text-white space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-white">Employee Staff Roster</h3>
            <span className="text-xs text-[#C89A2B]">{employees.length} Registered Users</span>
          </div>
          <ReusableDataTable
            fetchData={api.getPaginatedEmployees}
            columns={[
              { key: 'userId', header: 'Staff ID', render: (u) => <span className="font-extrabold text-[#C89A2B] font-mono">{u.userId}</span> },
              { key: 'name', header: 'Employee Name', render: (u) => <span className="font-semibold text-white">{u.firstName} {u.lastName}</span> },
              { key: 'role', header: 'System Role', render: (u) => <span className="bg-[#C89A2B]/20 text-[#C89A2B] px-2 py-0.5 rounded font-bold">{u.role}</span> },
              { key: 'jobTitle', header: 'Job Title' },
              { key: 'branchName', header: 'Assigned Branch' },
              { key: 'districtName', header: 'District' },
              { key: 'actions', header: 'Actions', render: (u) => (
                <div className="flex items-center justify-end space-x-1.5">
                  <button onClick={() => setViewingEmployee(u)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-cyan-300"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => setEditingEmployee({...u})} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-amber-400"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteEmployee(u.id, u.firstName)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-rose-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            ]}
            defaultSortBy="userId"
            filterState={{ role: employeeRoleFilter, status: employeeStatusFilter }}
            filters={
              <>
                <select value={employeeRoleFilter} onChange={(e) => setEmployeeRoleFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-[#6B3F1D] border border-white/20 text-xs text-white focus:outline-none">
                  <option value="All">All Roles</option>
                  {['BOARD_OF_DIRECTORS', 'CEO', 'CHIEF_OFFICER', 'DIRECTOR', 'DISTRICT_DIRECTOR', 'MANAGER', 'EMPLOYEE'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={employeeStatusFilter} onChange={(e) => setEmployeeStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-[#6B3F1D] border border-white/20 text-xs text-white focus:outline-none">
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <button onClick={() => setIsAddEmployeeModalOpen(true)} className="px-4 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs flex items-center space-x-1.5 hover:bg-[#D8B45C]">
                  <Plus className="w-4 h-4" /><span>Add Employee</span>
                </button>
              </>
            }
          />
        </div>
      )}
`;

const insertIndex = content.indexOf('{/* TAB 5: KPIS */}');
if (insertIndex !== -1) {
  const newContent = content.substring(0, insertIndex) + employeesTab + '\n      ' + content.substring(insertIndex);
  fs.writeFileSync('src/components/dashboard/AdminDashboard.tsx', newContent);
  console.log('Successfully restored employees tab!');
} else {
  console.error('Could not find TAB 5: KPIS to insert before.');
}
