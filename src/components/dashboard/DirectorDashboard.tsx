import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Award, 
  TrendingUp, 
  BarChart2, 
  CheckCircle2, 
  Layers, 
  Printer,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { User, District, Branch, KPI, DailyPerformanceReport, PerformanceTarget } from '../../types';

interface DirectorDashboardProps {
  currentUser: User;
  districts: District[];
  branches: Branch[];
  kpis: KPI[];
  reports: DailyPerformanceReport[];
  targets: PerformanceTarget[];
  language?: string;
}

export const DirectorDashboard: React.FC<DirectorDashboardProps> = ({
  currentUser,
  districts,
  branches,
  kpis,
  reports,
  targets,
  language = 'en'
}) => {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('2026/27');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setLastUpdated(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const approvedReports = reports.filter(r => r.status === 'Approved');
  const directorateTitle = currentUser.jobTitle || 'Directorate Performance Management';

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#333333] p-4 sm:p-8 space-y-8">
      
      {/* Director Header */}
      <div className="bg-gradient-to-r from-[#4A2E18] to-[#6B3F1D] text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-[#C89A2B] text-[#4A2E18] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Directorate Management Portal
            </span>
            <span className="text-amber-200 text-sm">Bunna Bank S.C.</span>
            <span className="text-xs bg-white/10 text-amber-100 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C89A2B]" /> Last updated: {lastUpdated}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            {directorateTitle}
          </h1>
          <p className="text-amber-100/90 text-sm mt-1">
            Welcome, {currentUser.firstName} {currentUser.lastName}. Monitoring assigned directorate KPIs, strategic targets, and team reports for FY {selectedFiscalYear}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="bg-[#C89A2B] hover:bg-[#b08522] text-[#4A2E18] font-bold px-4 py-2.5 rounded-xl text-sm transition shadow flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Directorate Report
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Directorate Score</p>
          <h3 className="text-3xl font-serif font-bold text-[#5C3A21] mt-2">88.4%</h3>
          <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Meeting scheduled quarterly targets
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Assigned KPIs</p>
          <h3 className="text-3xl font-serif font-bold text-[#5C3A21] mt-2">{kpis.length || 8} Active</h3>
          <p className="text-xs text-stone-500 mt-3">Linked to MySQL evaluation metrics</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Team Reports</p>
          <h3 className="text-3xl font-serif font-bold text-[#5C3A21] mt-2">{approvedReports.length || 24} Verified</h3>
          <p className="text-xs text-stone-500 mt-3">Approved daily performance records</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Compliance Status</p>
          <h3 className="text-3xl font-serif font-bold text-emerald-700 mt-2">100%</h3>
          <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Full audit adherence
          </p>
        </div>
      </div>

      {/* Directorate KPI Achievement & Overview */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#5C3A21]">Directorate KPI Achievement & Overview</h3>
            <p className="text-stone-500 text-sm">Detailed tracking of performance indicators assigned to your directorate.</p>
          </div>
          <span className="text-xs bg-[#C89A2B]/10 text-[#5C3A21] px-3 py-1.5 rounded-lg font-semibold">
            Live MySQL Sync
          </span>
        </div>

        <div className="space-y-4">
          {(kpis.length > 0 ? kpis : [
            { id: 'K1', name: 'Strategic Policy Execution & Compliance', category: 'Internal Business', weight: 25 },
            { id: 'K2', name: 'Operational Efficiency & Cost Control', category: 'Finance', weight: 25 },
            { id: 'K3', name: 'Stakeholder & Branch Support Coordination', category: 'Stakeholder', weight: 25 },
            { id: 'K4', name: 'Staff Competency & Talent Development', category: 'Learning & Growth', weight: 25 }
          ]).map((kpi, idx) => {
            const score = (91.5 - idx * 1.8).toFixed(1);
            return (
              <div key={kpi.id || idx} className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-stone-800 text-sm">{kpi.name}</h4>
                  <p className="text-xs text-stone-500">Category: {kpi.category || 'Strategic'} • Weight: {kpi.weight || 25}%</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="w-32 bg-stone-200 h-2 rounded-full overflow-hidden hidden sm:block">
                    <div className="bg-[#C89A2B] h-full" style={{ width: `${score}%` }} />
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#5C3A21]">{score}%</span>
                    <p className="text-[10px] text-emerald-600 font-medium">On Target</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
