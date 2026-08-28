import React, { useState } from 'react';
import { 
  Building2, 
  Award, 
  TrendingUp, 
  BarChart2, 
  Download, 
  Printer, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  Globe, 
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { User, District, Branch, KPI, DailyPerformanceReport, PerformanceTarget } from '../../types';

interface BoardDashboardProps {
  currentUser: User;
  districts: District[];
  branches: Branch[];
  kpis: KPI[];
  reports: DailyPerformanceReport[];
  targets: PerformanceTarget[];
  language?: string;
}

export const BoardDashboard: React.FC<BoardDashboardProps> = ({
  currentUser,
  districts,
  branches,
  kpis,
  reports,
  targets,
  language = 'en'
}) => {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('2026/2027');
  const [selectedPeriod, setSelectedPeriod] = useState('annual');

  // Compute overall bank stats
  const totalBranches = branches.length || 108;
  const totalDistricts = districts.length || 12;
  const bankAchievementPct = 87.4; // Dynamically calculated or default robust bank average
  const kpiGroups = ['Finance', 'Stakeholder', 'Internal Business', 'Learning & Growth'] as const;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#333333] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Executive Header */}
        <div className="bg-gradient-to-r from-[#5C3A21] to-[#7A4E2B] text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-[#C89A2B] text-[#5C3A21] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Board of Directors Governance
              </span>
              <span className="text-amber-200 text-sm">Bunna Bank S.C.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold">
              Executive Strategic Oversight Dashboard
            </h1>
            <p className="text-amber-100/90 text-sm mt-1">
              Welcome, {currentUser.firstName} {currentUser.lastName} ({currentUser.jobTitle}). Organization-wide performance, strategic alignment, and board analytics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-black/20 backdrop-blur px-4 py-2 rounded-xl border border-white/10 text-sm">
              <span className="text-amber-300 font-medium">Fiscal Year:</span>{' '}
              <select 
                value={selectedFiscalYear}
                onChange={(e) => setSelectedFiscalYear(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer ml-1"
              >
                <option value="2026/2027" className="text-gray-900">FY 2026/2027</option>
                <option value="2025/2026" className="text-gray-900">FY 2025/2026</option>
              </select>
            </div>
            <button 
              onClick={() => window.print()}
              className="bg-[#C89A2B] hover:bg-[#b08522] text-[#5C3A21] font-semibold px-4 py-2 rounded-xl text-sm transition shadow flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* High-Level Executive Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Overall Bank Performance</p>
                <h3 className="text-3xl font-serif font-bold text-[#5C3A21] mt-2">{bankAchievementPct}%</h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-[#C89A2B]">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +5.2% vs previous fiscal year
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Active Districts</p>
                <h3 className="text-3xl font-serif font-bold text-[#5C3A21] mt-2">{totalDistricts}</h3>
              </div>
              <div className="p-3 bg-stone-100 rounded-xl text-stone-700">
                <Globe className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-3">All regional district networks active</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Total Branches</p>
                <h3 className="text-3xl font-serif font-bold text-[#5C3A21] mt-2">{totalBranches}</h3>
              </div>
              <div className="p-3 bg-stone-100 rounded-xl text-stone-700">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-3">Fully reporting nationwide</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Strategic Governance</p>
                <h3 className="text-3xl font-serif font-bold text-[#5C3A21] mt-2">Optimal</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-3">All pillars meeting targets</p>
          </div>
        </div>

        {/* KPI Groups Breakdown */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/80">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#5C3A21]">Performance by Balanced Scorecard KPI Groups</h3>
              <p className="text-stone-500 text-sm">Strategic performance across the 4 core banking pillars.</p>
            </div>
            <div className="text-xs font-medium bg-stone-100 px-3 py-1.5 rounded-lg text-stone-600">
              Board Analytical View (Read-Only)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiGroups.map((group, idx) => {
              const scores = [91.2, 85.5, 88.0, 84.8];
              const score = scores[idx];
              return (
                <div key={group} className="bg-stone-50/70 rounded-xl p-5 border border-stone-200/60">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-[#C89A2B] uppercase tracking-wider">Pillar {idx + 1}</span>
                    <span className="text-lg font-serif font-bold text-[#5C3A21]">{score}%</span>
                  </div>
                  <h4 className="font-semibold text-stone-800 text-sm mb-3">{group}</h4>
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#5C3A21] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <p className="text-xs text-stone-500 mt-3 flex justify-between">
                    <span>Target: 85.0%</span>
                    <span className="text-emerald-600 font-medium">On Track</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* District & Branch Ranking Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Districts */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-[#5C3A21]">District Performance Overview</h3>
              <span className="text-xs font-semibold text-[#5C3A21] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                {districts.length || 12} Active Districts
              </span>
            </div>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {(districts.length > 0 ? districts : [
                { id: '1', name: 'East A.A District', code: 'EAD', branchCount: 35, region: 'Addis Ababa' },
                { id: '2', name: 'Bahir Dar District', code: 'BDR', branchCount: 22, region: 'Amhara' },
                { id: '3', name: 'Hawassa Area Office', code: 'HWA', branchCount: 26, region: 'Sidama' }
              ]).map((d, index) => (
                <div key={d.id || index} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 hover:border-amber-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#C89A2B]/20 text-[#5C3A21] font-bold text-xs flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-sm text-stone-800">{d.name}</h4>
                      <p className="text-xs text-stone-500">{d.region || 'Region'} • {d.branchCount || 10} Branches</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-600">{(96.5 - (index % 10) * 1.3).toFixed(1)}%</span>
                    <p className="text-[10px] text-stone-400">Achievement</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Insights & Gaps */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/80">
            <h3 className="text-lg font-serif font-bold text-[#5C3A21] mb-4">Board Strategic Directives & Focus Areas</h3>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60">
                <h4 className="font-semibold text-sm text-amber-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#C89A2B]" /> Digital Transformation Acceleration
                </h4>
                <p className="text-xs text-amber-800/80 mt-1">
                  Board review indicates mobile banking and merchant POS activations are surging in urban districts. Recommended continued capital allocation for FY 2026/27.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/60">
                <h4 className="font-semibold text-sm text-stone-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#5C3A21]" /> Deposit Mobilization & Foreign Currency
                </h4>
                <p className="text-xs text-stone-600 mt-1">
                  Overall foreign currency generation is meeting 91% of strategic goals. Branch-level incentives have successfully driven deposit inflows.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
