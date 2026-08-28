import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  TrendingUp, 
  Award, 
  BarChart2, 
  Printer, 
  ChevronRight,
  CheckCircle2,
  Users
} from 'lucide-react';
import { User, District, Branch, KPI, DailyPerformanceReport, PerformanceTarget } from '../../types';
import { BranchPerformanceDetailsModal } from './BranchPerformanceDetailsModal';

interface DistrictManagementDashboardProps {
  currentUser: User;
  districts: District[];
  branches: Branch[];
  kpis: KPI[];
  reports: DailyPerformanceReport[];
  targets: PerformanceTarget[];
  language?: string;
  users?: User[];
}

export const DistrictManagementDashboard: React.FC<DistrictManagementDashboardProps> = ({
  currentUser,
  districts,
  branches,
  kpis,
  reports,
  targets,
  language = 'en',
  users = []
}) => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const userDistrictId = currentUser.districtId || 'DIST-BDR';
  const userDistrictName = currentUser.districtName || 'Bahir Dar District';

  // Filter branches belonging to this district
  const districtBranches = branches.filter(b => 
    b.districtId === userDistrictId || 
    b.districtName?.toLowerCase() === userDistrictName.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#333333] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* District Director Header */}
        <div className="bg-gradient-to-r from-[#4A2E18] to-[#6B3F1D] text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#C89A2B] text-[#4A2E18] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                District Management Portal
              </span>
              <span className="text-amber-200 text-sm">{userDistrictName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold">
              District Operational & Branch Performance
            </h1>
            <p className="text-amber-100/90 text-sm mt-1">
              Welcome, {currentUser.firstName} {currentUser.lastName} ({currentUser.jobTitle}). Monitoring all branches under {userDistrictName}.
            </p>
          </div>
          <div>
            <button 
              onClick={() => window.print()}
              className="bg-[#C89A2B] hover:bg-[#b08522] text-[#4A2E18] font-semibold px-4 py-2 rounded-xl text-sm transition shadow flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print District Report
            </button>
          </div>
        </div>

        {/* District Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
            <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">District Achievement</p>
            <h3 className="text-3xl font-serif font-bold text-[#5C3A21] mt-2">90.8%</h3>
            <p className="text-xs text-emerald-600 font-medium mt-3">Top tier regional performance</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
            <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Managed Branches</p>
            <h3 className="text-3xl font-serif font-bold text-[#5C3A21] mt-2">{districtBranches.length || 10}</h3>
            <p className="text-xs text-stone-500 mt-3">Fully active & reporting</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
            <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Total Branch Employees</p>
            <h3 className="text-3xl font-serif font-bold text-[#5C3A21] mt-2">145</h3>
            <p className="text-xs text-stone-500 mt-3">Active staff members</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
            <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">District Ranking</p>
            <h3 className="text-3xl font-serif font-bold text-[#C89A2B] mt-2">#2 Nationwide</h3>
            <p className="text-xs text-stone-500 mt-3">Among all bank districts</p>
          </div>
        </div>

        {/* Branches under this district */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#5C3A21]">Branches in {userDistrictName}</h3>
              <p className="text-stone-500 text-sm">Real-time performance rankings and branch manager oversight.</p>
            </div>
            <span className="text-xs bg-stone-100 text-stone-700 px-3 py-1.5 rounded-lg font-medium">
              District Scope Restricted
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase">
                  <th className="py-3 px-4">Branch Name</th>
                  <th className="py-3 px-4">Branch Code / Type</th>
                  <th className="py-3 px-4">Branch Manager</th>
                  <th className="py-3 px-4">Staff Count</th>
                  <th className="py-3 px-4">Achievement</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {(districtBranches.length > 0 ? districtBranches : [
                  { id: 'BR-360', name: 'Hamusit Branch', code: '360', type: 'Grade I', managerName: 'Negash Adugna', employeeCount: 12 },
                  { id: 'BR-361', name: 'Bahir Dar Main Branch', code: '361', type: 'Main Branch', managerName: 'Alemayehu Tadesse', employeeCount: 25 },
                  { id: 'BR-362', name: 'Tis Abay Branch', code: '362', type: 'Grade II', managerName: 'Meseret Bekele', employeeCount: 8 }
                ]).map((b: any, i) => {
                  const score = (93.0 - i * 2.5).toFixed(1);
                  return (
                    <tr key={b.id} className="hover:bg-stone-50 transition">
                      <td className="py-3 px-4 font-semibold text-stone-800">{b.name}</td>
                      <td className="py-3 px-4 text-stone-600">SOL: {b.solId || b.code || 'N/A'} ({b.type || 'Standard'})</td>
                      <td className="py-3 px-4 text-stone-600">{b.managerName || 'Assigned Manager'}</td>
                      <td className="py-3 px-4 text-stone-600">{b.employeeCount || 10}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#5C3A21]">{score}%</span>
                          <div className="w-20 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#C89A2B] h-full" style={{ width: `${score}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          onClick={() => setSelectedBranch(b as Branch)}
                          className="text-[#5C3A21] hover:text-[#C89A2B] font-semibold text-xs flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {selectedBranch && (
        <BranchPerformanceDetailsModal
          branch={selectedBranch}
          onClose={() => setSelectedBranch(null)}
          users={users}
          reports={reports}
          kpis={kpis}
          targets={targets}
        />
      )}
    </div>
  );
};
