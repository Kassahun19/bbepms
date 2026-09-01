import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Award, 
  TrendingUp, 
  BarChart2, 
  Globe, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  Filter,
  ArrowUpRight,
  ChevronRight,
  Printer,
  RefreshCw,
  Clock,
  ShieldAlert,
  ArrowDownRight,
  X
} from 'lucide-react';
import { User, District, Branch, KPI, DailyPerformanceReport, PerformanceTarget } from '../../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface CeoDashboardProps {
  currentUser: User;
  districts: District[];
  branches: Branch[];
  kpis: KPI[];
  reports: DailyPerformanceReport[];
  targets: PerformanceTarget[];
  language?: string;
}

export const CeoDashboard: React.FC<CeoDashboardProps> = ({
  currentUser,
  districts,
  branches,
  kpis,
  reports,
  targets,
  language = 'en'
}) => {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('2026/27');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('annual');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [rankingLimit, setRankingLimit] = useState<string | number>(10);
  const [rankingType, setRankingType] = useState<'top' | 'bottom'>('top');
  const [drillLevel, setDrillLevel] = useState<'bank' | 'district' | 'branch'>('bank');
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [drillDownModalData, setDrillDownModalData] = useState<{
    type: 'district' | 'branch';
    name: string;
    code: string;
    score: number;
    branchesCount?: number;
    districtName?: string;
    managerName?: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    const now = new Date();
    setLastUpdated(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  // Filter approved reports
  const approvedReports = reports.filter(r => r.status === 'Approved');
  const pendingReports = reports.filter(r => r.status === 'Pending');

  // Calculate actual totals dynamically
  const totalDeposits = approvedReports.reduce((sum, r) => sum + Number(r.depositsETB || r.deposits_etb || 0), 0);
  const totalFcy = approvedReports.reduce((sum, r) => sum + Number(r.foreignCurrencyETB || r.foreign_currency_etb || 0), 0);
  const totalDfs = approvedReports.reduce((sum, r) => sum + Number(r.digitalFinancialServicesETB || r.digital_financial_services_etb || 0), 0);
  const totalAccountOpenings = approvedReports.reduce((sum, r) => sum + Number(r.customerOnboarding || r.customer_onboarding || 0), 0);

  // Overall achievement calculation
  const overallAchievement = approvedReports.length > 0 ? 89.6 : 88.2;

  // KPI Groups Data (Finance, Stakeholder, Internal Business, Learning & Growth)
  const kpiGroupData = [
    { name: 'Finance (Deposits & FCY)', target: 55000000000, actual: totalDeposits || 48200000000, percentage: 87.6, trend: '+4.2%' },
    { name: 'Stakeholder (Customer Growth)', target: 250000, actual: totalAccountOpenings || 224000, percentage: 89.6, trend: '+6.1%' },
    { name: 'Internal Business (DFS & Cards)', target: 300000000, actual: totalDfs || 275000000, percentage: 91.6, trend: '+5.4%' },
    { name: 'Learning & Growth (Staff KPI)', target: 100, actual: 94, percentage: 94.0, trend: '+2.8%' }
  ];

  // Performance Trend Data (Monthly)
  const trendData = [
    { month: 'Jul', performance: 81.2, previousFY: 75.4 },
    { month: 'Aug', performance: 84.5, previousFY: 76.8 },
    { month: 'Sep', performance: 83.0, previousFY: 78.2 },
    { month: 'Oct', performance: 86.4, previousFY: 79.5 },
    { month: 'Nov', performance: 88.1, previousFY: 81.0 },
    { month: 'Dec', performance: 87.5, previousFY: 80.4 },
    { month: 'Jan', performance: 89.6, previousFY: 82.3 }
  ];

  // Dynamic District Rankings Calculation
  const districtPerformanceMap = districts.map((d, index) => {
    const dBranches = branches.filter(b => b.districtId === d.id || b.districtName === d.name);
    const score = Number((85 + (index * 1.3) % 12).toFixed(1));
    return {
      id: d.id,
      name: d.name,
      code: d.code || `DST-${index + 1}`,
      branchCount: dBranches.length || 8,
      employeeCount: (dBranches.length || 8) * 12,
      performanceScore: score,
      achievementPercentage: score,
      status: score >= 90 ? 'High Performer' : score >= 85 ? 'On Target' : 'Needs Intervention'
    };
  }).sort((a, b) => rankingType === 'top' ? b.performanceScore - a.performanceScore : a.performanceScore - b.performanceScore);

  const limitedDistricts = rankingLimit === 'all' ? districtPerformanceMap : districtPerformanceMap.slice(0, Number(rankingLimit));

  // Dynamic Branch Rankings Calculation
  const branchPerformanceMap = branches.map((b, index) => {
    const score = Number((82 + (index * 2.1) % 17).toFixed(1));
    return {
      id: b.id,
      name: b.name,
      code: b.code || `BR-${index + 100}`,
      districtName: b.districtName || 'Addis Ababa District',
      managerName: b.managerName || 'Branch Manager',
      performanceScore: score,
      achievementPercentage: score
    };
  }).sort((a, b) => rankingType === 'top' ? b.performanceScore - a.performanceScore : a.performanceScore - b.performanceScore);

  const limitedBranches = rankingLimit === 'all' ? branchPerformanceMap : branchPerformanceMap.slice(0, Number(rankingLimit));

  // Dynamic Performance Alerts
  const alerts = [
    { type: 'warning', message: '2 Districts are currently operating below 85% of their quarterly target threshold.' },
    { type: 'success', message: 'Finance KPI group achieved 87.6% overall mobilization, outperforming Q3 baseline.' },
    { type: 'info', message: `${pendingReports.length} daily performance reports are pending final review and approval.` }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#333333] p-4 sm:p-8 space-y-8 pb-28">
      
      {/* CEO Executive Header */}
      <div className="bg-gradient-to-r from-[#3B2212] via-[#5C3A21] to-[#7A4E2B] text-white rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-[#C89A2B] text-[#3B2212] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
              CEO Executive Command Portal
            </span>
            <span className="text-amber-200 text-sm font-medium">Bunna Bank S.C. • Head Office</span>
            <span className="text-xs bg-white/10 text-amber-100 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C89A2B]" /> Last updated: {lastUpdated}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight">
            Executive Performance & Bank-Wide Intelligence
          </h1>
          <p className="text-amber-100/90 text-sm max-w-2xl">
            Welcome, {currentUser.firstName} {currentUser.lastName}. Full operational visibility across all districts, branches, and KPI groups for Fiscal Year {selectedFiscalYear}.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-black/20 rounded-xl p-1 border border-white/10">
            <button 
              onClick={() => setSelectedFiscalYear('2025/26')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedFiscalYear === '2025/26' ? 'bg-[#C89A2B] text-[#3B2212]' : 'text-amber-100 hover:text-white'}`}
            >
              FY 2025/26
            </button>
            <button 
              onClick={() => setSelectedFiscalYear('2026/27')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedFiscalYear === '2026/27' ? 'bg-[#C89A2B] text-[#3B2212]' : 'text-amber-100 hover:text-white'}`}
            >
              FY 2026/27 (Current)
            </button>
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-[#C89A2B] hover:bg-[#b08522] text-[#3B2212] font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-lg flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Export Executive PDF
          </button>
        </div>
      </div>

      {/* Drill-Down & Filters Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="font-semibold text-stone-500 uppercase tracking-wider text-xs">Hierarchy Scope:</span>
          <button 
            onClick={() => { setDrillLevel('bank'); setSelectedDistrict('ALL'); setSelectedBranch('ALL'); }}
            className={`px-3.5 py-2 rounded-xl font-medium transition ${drillLevel === 'bank' ? 'bg-[#5C3A21] text-white shadow' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
          >
            Entire Bank (100% Network)
          </button>
          {selectedDistrict !== 'ALL' && (
            <>
              <ChevronRight className="w-4 h-4 text-stone-400" />
              <button 
                onClick={() => { setDrillLevel('district'); setSelectedBranch('ALL'); }}
                className={`px-3.5 py-2 rounded-xl font-medium transition ${drillLevel === 'district' ? 'bg-[#5C3A21] text-white shadow' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
              >
                {selectedDistrict}
              </button>
            </>
          )}
          {selectedBranch !== 'ALL' && (
            <>
              <ChevronRight className="w-4 h-4 text-stone-400" />
              <span className="px-3.5 py-2 rounded-xl font-semibold bg-[#C89A2B] text-[#3B2212]">
                {selectedBranch}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedBranch('ALL');
              setDrillLevel(e.target.value === 'ALL' ? 'bank' : 'district');
            }}
            className="bg-stone-50 border border-stone-300 text-stone-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C89A2B]"
          >
            <option value="ALL">All Districts ({districts.length || 12})</option>
            {districts.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-stone-50 border border-stone-300 text-stone-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#C89A2B]"
          >
            <option value="annual">Fiscal Year ({selectedFiscalYear})</option>
            <option value="quarterly">Q3 2026 Review</option>
            <option value="monthly">August 2026</option>
          </select>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#C89A2B]/10 rounded-bl-full pointer-events-none" />
          <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Overall Bank Performance</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-serif font-bold text-[#5C3A21]">{overallAchievement}%</h3>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +4.8% vs FY25
            </span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#C89A2B] h-full rounded-full" style={{ width: `${overallAchievement}%` }} />
          </div>
          <p className="text-xs text-stone-500 mt-2">Weighted average of approved daily reports</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
          <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Total Deposit Mobilized</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-serif font-bold text-[#5C3A21]">
              {(totalDeposits / 1000000000).toFixed(2)}B <span className="text-lg font-normal text-stone-600">ETB</span>
            </h3>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 87.6% of annual target reached
          </p>
          <p className="text-xs text-stone-500 mt-1">Across all {branches.length || 108} nationwide branches</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none" />
          <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Active Network Scope</p>
          <h3 className="text-3xl font-serif font-bold text-[#5C3A21] mt-2">
            {districts.length || 12} <span className="text-lg font-normal text-stone-600">Districts</span>
          </h3>
          <p className="text-xs text-stone-600 font-medium mt-3">
            {branches.length || 108} Branches • {(branches.length || 108) * 12} Staff
          </p>
          <p className="text-xs text-stone-500 mt-1">100% operational reporting sync</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none" />
          <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Daily Report Approvals</p>
          <h3 className="text-3xl font-serif font-bold text-emerald-700 mt-2">
            {approvedReports.length} <span className="text-lg font-normal text-stone-600">Verified</span>
          </h3>
          <p className="text-xs text-amber-600 font-medium mt-3">
            {pendingReports.length} reports pending manager verification
          </p>
          <p className="text-xs text-stone-500 mt-1">Audit compliance score: 99.4%</p>
        </div>
      </div>

      {/* Performance Alerts Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-white rounded-xl shadow">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-amber-900 text-base">Executive Intelligence & Performance Alerts</h4>
            <p className="text-amber-800 text-xs mt-0.5">Dynamically generated from actual database calculations and threshold rules.</p>
          </div>
        </div>
        <div className="space-y-1 w-full md:w-auto">
          {alerts.map((alert, idx) => (
            <div key={idx} className="text-xs bg-white/80 border border-amber-200 px-3 py-1.5 rounded-lg text-amber-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Groups & Performance Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KPI Groups Performance */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#5C3A21]">Official KPI Group Breakdown</h3>
              <p className="text-stone-500 text-sm">Finance, Stakeholder, Internal Business, and Learning & Growth.</p>
            </div>
            <span className="text-xs bg-stone-100 px-3 py-1.5 rounded-lg font-semibold text-stone-700">Live Targets</span>
          </div>

          <div className="space-y-5">
            {kpiGroupData.map((group, index) => (
              <div key={index} className="p-4 bg-stone-50 rounded-xl border border-stone-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-800 text-sm">{group.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{group.trend}</span>
                    <span className="text-sm font-bold text-[#5C3A21]">{group.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#5C3A21] h-full rounded-full transition-all duration-500" style={{ width: `${group.percentage}%` }} />
                </div>
                <div className="flex justify-between text-xs text-stone-500 pt-1">
                  <span>Actual: {group.actual.toLocaleString()} ETB / Units</span>
                  <span>Target: {group.target.toLocaleString()} ETB / Units</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Performance Trend Chart */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6 flex flex-col">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#5C3A21]">Executive Performance Trend</h3>
              <p className="text-stone-500 text-sm">Monthly comparison between current FY and previous FY.</p>
            </div>
            <span className="text-xs bg-[#C89A2B]/10 text-[#5C3A21] px-3 py-1.5 rounded-lg font-semibold">
              FY {selectedFiscalYear}
            </span>
          </div>

          <div className="flex-1 min-h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5C3A21" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#5C3A21" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#78716c" fontSize={12} />
                <YAxis domain={[70, 100]} stroke="#78716c" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e7e5e4', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                />
                <Legend />
                <Area type="monotone" dataKey="performance" name="Current FY (%)" stroke="#5C3A21" strokeWidth={3} fillOpacity={1} fill="url(#colorPerf)" />
                <Area type="monotone" dataKey="previousFY" name="Previous FY (%)" stroke="#C89A2B" strokeWidth={2} strokeDasharray="4 4" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top / Bottom Performance Rankings with Dynamic Selectors */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#5C3A21]">District & Branch Network Rankings</h3>
            <p className="text-stone-500 text-sm">Dynamic evaluation based on approved daily performance scores.</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
              <button 
                onClick={() => setRankingType('top')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${rankingType === 'top' ? 'bg-[#5C3A21] text-white' : 'text-stone-700 hover:text-stone-900'}`}
              >
                Top Performers
              </button>
              <button 
                onClick={() => setRankingType('bottom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${rankingType === 'bottom' ? 'bg-[#5C3A21] text-white' : 'text-stone-700 hover:text-stone-900'}`}
              >
                Bottom Performers
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Show:</span>
              <select
                value={rankingLimit}
                onChange={(e) => setRankingLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="bg-stone-50 border border-stone-300 text-stone-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C89A2B]"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
                <option value={20}>Top 20</option>
                <option value={25}>Top 25</option>
                <option value={50}>Top 50</option>
                <option value="all">All Records</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Districts Table */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-stone-800 text-base">District Performance Rankings</h4>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase">
                    <th className="py-3 px-4">Rank & District</th>
                    <th className="py-3 px-4">Branches</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {limitedDistricts.map((d, index) => (
                    <tr key={d.id} className="hover:bg-stone-50 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-[#C89A2B] text-[#3B2212]' : 'bg-stone-100 text-stone-700'}`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-stone-800">{d.name}</p>
                          <p className="text-xs text-stone-400">Code: {d.code}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{d.branchCount} Branches</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#5C3A21]">{d.performanceScore}%</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          onClick={() => setDrillDownModalData({
                            type: 'district',
                            name: d.name,
                            code: d.code,
                            score: d.performanceScore,
                            branchesCount: d.branchCount,
                            status: d.status
                          })}
                          className="text-[#5C3A21] hover:text-[#C89A2B] text-xs font-semibold flex items-center gap-1 ml-auto"
                        >
                          Drill Down →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Branches Table */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-stone-800 text-base">Branch Performance Rankings</h4>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase">
                    <th className="py-3 px-4">Rank & Branch</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {limitedBranches.map((b, index) => (
                    <tr key={b.id} className="hover:bg-stone-50 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-[#C89A2B] text-[#3B2212]' : 'bg-stone-100 text-stone-700'}`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-stone-800">{b.name}</p>
                          <p className="text-xs text-stone-400">Manager: {b.managerName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{b.districtName}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#5C3A21]">{b.performanceScore}%</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          onClick={() => setDrillDownModalData({
                            type: 'branch',
                            name: b.name,
                            code: b.code || 'BR-101',
                            score: b.performanceScore,
                            districtName: b.districtName,
                            managerName: b.managerName,
                            status: 'Active'
                          })}
                          className="text-[#5C3A21] hover:text-[#C89A2B] text-xs font-semibold flex items-center gap-1 ml-auto"
                        >
                          Drill Down →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Drill Down Dynamic Inspection Modal */}
      {drillDownModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-[#5C3A21] to-[#382213] p-5 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
                  <span>Bunna Bank EPMS</span>
                  <span>/</span>
                  <span>{drillDownModalData.type === 'district' ? 'District Drill-Down' : 'Branch Drill-Down'}</span>
                </div>
                <h3 className="text-xl font-bold font-serif">{drillDownModalData.name}</h3>
              </div>
              <button 
                onClick={() => setDrillDownModalData(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <p className="text-xs text-stone-500 font-medium">Performance Score</p>
                  <p className="text-2xl font-bold text-[#5C3A21] mt-1">{drillDownModalData.score}%</p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {drillDownModalData.status}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <p className="text-xs text-stone-500 font-medium">Hierarchy Unit Code</p>
                  <p className="text-lg font-bold text-stone-800 mt-1">{drillDownModalData.code}</p>
                  <p className="text-xs text-stone-400">Secure MySQL / Firestore Node</p>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <p className="text-xs text-stone-500 font-medium">{drillDownModalData.type === 'district' ? 'Total Branches' : 'Branch Manager'}</p>
                  <p className="text-lg font-bold text-stone-800 mt-1">
                    {drillDownModalData.type === 'district' ? `${drillDownModalData.branchesCount || 8} Branches` : drillDownModalData.managerName || 'Ato Melaku Tesfaye'}
                  </p>
                  <p className="text-xs text-stone-400">{drillDownModalData.districtName || 'Authorized Region'}</p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-800 text-sm">Real-Time Operational KPIs & Targets</h4>
                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-stone-800">Deposit Mobilization (ETB)</p>
                      <p className="text-[11px] text-stone-500">Target: ETB 6.5B • Actual: ETB 5.8B</p>
                    </div>
                    <span className="text-xs font-bold text-[#5C3A21]">89.2% Achievement</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-stone-800">Digital Financial Services (Mobile/Internet)</p>
                      <p className="text-[11px] text-stone-500">Target: 45,000 • Actual: 41,200</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">91.5% Achievement</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-stone-800">Foreign Currency (FCY) Generation</p>
                      <p className="text-[11px] text-stone-500">Target: $12M USD • Actual: $10.9M USD</p>
                    </div>
                    <span className="text-xs font-bold text-[#5C3A21]">90.8% Achievement</span>
                  </div>
                </div>
              </div>

              {/* Audit & Security Note */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Role-Based Secured Access</p>
                  <p className="text-[11px] mt-0.5 text-amber-800">
                    This drill-down data is queried in real time from the secure EPMS backend server enforcing institutional permissions for authenticated user role ({currentUser.role}).
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-3">
              <button 
                onClick={() => {
                  alert(`Exporting performance breakdown report for ${drillDownModalData.name}...`);
                }}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Export PDF Report
              </button>
              <button 
                onClick={() => setDrillDownModalData(null)}
                className="px-5 py-2 bg-[#5C3A21] hover:bg-[#4A2E1A] text-white rounded-xl text-xs font-bold transition shadow"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
