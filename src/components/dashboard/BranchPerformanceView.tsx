import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Award,
  TrendingUp,
  Coins,
  DollarSign,
  Smartphone,
  Globe,
  QrCode,
  CreditCard,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Filter,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Target,
  Zap,
  Percent
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { User, DailyPerformanceReport, PerformanceTarget, getUserFullName, Language } from '../../types';
import {
  ReportingPeriodType,
  calculatePeriodPerformance,
  CORE_KPIS,
  KpiPerformanceItem
} from '../../utils/performanceCalculations';
import { downloadReportExcel, printOrDownloadPDF } from '../../utils/exportUtils';
import { translations } from '../../i18n/translations';
import { PerformanceCard } from '../common/PerformanceCard';
import { PerformanceStatusBadge } from '../common/PerformanceStatusBadge';
import { formatPerformancePercentage, getPerformanceClassification } from '../../utils/performanceClassification';

interface BranchPerformanceViewProps {
  currentUser: User;
  reports: DailyPerformanceReport[];
  targets: PerformanceTarget[];
  employees: User[];
  onRefreshData?: () => void;
  onOpenEmployeeDeepDive?: (employeeId: string) => void;
  onOpenAiSummary?: (employee: User) => void;
  language?: Language;
}

export const BranchPerformanceView: React.FC<BranchPerformanceViewProps> = ({
  currentUser,
  reports,
  targets,
  employees,
  onRefreshData,
  onOpenEmployeeDeepDive,
  onOpenAiSummary,
  language = 'en'
}) => {
  const t = translations[language] || translations['en'];

  // State
  const [selectedPeriod, setSelectedPeriod] = useState<ReportingPeriodType>('monthly');
  const [customRangeActive, setCustomRangeActive] = useState<boolean>(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedKpiFilter, setSelectedKpiFilter] = useState<string>('all');

  const isManager = currentUser.role === 'MANAGER' || currentUser.role === 'ADMINISTRATOR';

  // 1. Filter branch staff based on currentUser's branch
  const branchEmployees = useMemo(() => {
    const userBranch = (currentUser.branchName || '').toLowerCase().trim();
    const userDistrict = (currentUser.districtName || '').toLowerCase().trim();

    return employees.filter(emp => {
      // Exclude managers if evaluating employee staff roster
      const empBranch = (emp.branchName || '').toLowerCase().trim();
      const empDistrict = (emp.districtName || '').toLowerCase().trim();
      
      const branchMatches = userBranch ? empBranch.includes(userBranch) || userBranch.includes(empBranch) : true;
      const districtMatches = userDistrict ? empDistrict.includes(userDistrict) || userDistrict.includes(empDistrict) : true;

      return branchMatches && districtMatches;
    });
  }, [employees, currentUser]);

  // 2. Filter branch reports (Approved only for official scorecard)
  const branchReports = useMemo(() => {
    const userBranch = (currentUser.branchName || '').toLowerCase().trim();
    const branchEmpIds = new Set(branchEmployees.map(e => e.id.toLowerCase()));
    const branchUserIds = new Set(branchEmployees.map(e => (e.userId || '').toLowerCase()).filter(Boolean));

    return reports.filter(r => {
      const rBranch = (r.branchName || '').toLowerCase().trim();
      const rEmpId = String(r.employeeId || r.employee_id || '').toLowerCase();
      const rUserId = String(r.employeeUserId || '').toLowerCase();

      const matchesBranchName = userBranch && (rBranch.includes(userBranch) || userBranch.includes(rBranch));
      const matchesBranchEmp = branchEmpIds.has(rEmpId) || branchUserIds.has(rUserId);

      return matchesBranchName || matchesBranchEmp;
    });
  }, [reports, currentUser, branchEmployees]);

  const approvedBranchReports = useMemo(() => {
    return branchReports.filter(r => r.status === 'Approved' || (r as any).status === 'approved');
  }, [branchReports]);

  // 3. Calculate Overall Branch Performance
  const branchPerformance = useMemo(() => {
    const baseAnchor = customRangeActive && customEndDate ? customEndDate : '2026-08-09';
    return calculatePeriodPerformance(
      approvedBranchReports,
      targets,
      undefined, // undefined employeeId = aggregate branch calculations
      selectedPeriod,
      baseAnchor
    );
  }, [approvedBranchReports, targets, selectedPeriod, customRangeActive, customEndDate]);

  // 4. Calculate Individual Employee Performance and Contributions within the Branch
  const employeeContributions = useMemo(() => {
    const nonManagerStaff = branchEmployees.filter(e => e.role === 'EMPLOYEE' || !e.role || (e.role as any) === 'employee');
    const staffList = nonManagerStaff.length > 0 ? nonManagerStaff : branchEmployees;

    return staffList.map(emp => {
      const empReports = approvedBranchReports.filter(r => {
        const rEmpId = String(r.employeeId || r.employee_id || '').toLowerCase();
        const rUserId = String(r.employeeUserId || '').toLowerCase();
        return rEmpId === emp.id.toLowerCase() || (emp.userId && rUserId === emp.userId.toLowerCase());
      });

      const empPerf = calculatePeriodPerformance(
        empReports,
        targets,
        emp.id,
        selectedPeriod,
        customRangeActive && customEndDate ? customEndDate : '2026-08-09'
      );

      const depKpi = empPerf.kpis.find(k => k.kpiId === 'KPI-001');
      const fcyKpi = empPerf.kpis.find(k => k.kpiId === 'KPI-002');
      const dfsKpi = empPerf.kpis.find(k => k.kpiId === 'KPI-003');
      const accKpi = empPerf.kpis.find(k => k.kpiId === 'KPI-004');
      const mbKpi = empPerf.kpis.find(k => k.kpiId === 'KPI-005');

      return {
        employee: emp,
        fullName: getUserFullName(emp),
        jobTitle: emp.jobTitle || 'Customer Service Officer',
        submissionsCount: empReports.length,
        overallScore: empPerf.overallPerformancePercentage,
        grade: empPerf.grade,
        depositsAch: depKpi ? depKpi.actualAchievement : 0,
        fcyAch: fcyKpi ? fcyKpi.actualAchievement : 0,
        dfsAch: dfsKpi ? dfsKpi.actualAchievement : 0,
        accountsAch: accKpi ? accKpi.actualAchievement : 0,
        mobileAch: mbKpi ? mbKpi.actualAchievement : 0
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }, [branchEmployees, approvedBranchReports, targets, selectedPeriod, customRangeActive, customEndDate]);

  // Aggregate Branch Totals
  const branchTotals = useMemo(() => {
    const totalDeposits = employeeContributions.reduce((s, e) => s + e.depositsAch, 0);
    const totalFcy = employeeContributions.reduce((s, e) => s + e.fcyAch, 0);
    const totalDfs = employeeContributions.reduce((s, e) => s + e.dfsAch, 0);
    const totalAccounts = employeeContributions.reduce((s, e) => s + e.accountsAch, 0);
    const totalMobile = employeeContributions.reduce((s, e) => s + e.mobileAch, 0);

    return { totalDeposits, totalFcy, totalDfs, totalAccounts, totalMobile };
  }, [employeeContributions]);

  const periodOptions: { id: ReportingPeriodType; label: string; sub: string }[] = [
    { id: 'daily', label: 'Daily', sub: 'Today' },
    { id: 'weekly', label: 'Weekly', sub: 'This Week' },
    { id: 'monthly', label: 'Monthly', sub: 'This Month' },
    { id: 'quarterly', label: 'Quarterly', sub: 'Q-to-Date' },
    { id: 'semiAnnual', label: 'Semi-Annual', sub: 'Half-Year' },
    { id: 'annual', label: 'Year-to-Date', sub: 'Annual FY 2026' }
  ];

  const kpiIcons: Record<string, any> = {
    'KPI-001': { icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: 'bg-amber-500' },
    'KPI-002': { icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', bar: 'bg-emerald-500' },
    'KPI-003': { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', bar: 'bg-blue-500' },
    'KPI-004': { icon: UserPlus, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', bar: 'bg-purple-500' },
    'KPI-005': { icon: Smartphone, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', bar: 'bg-indigo-500' },
    'KPI-006': { icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', bar: 'bg-cyan-500' },
    'KPI-007': { icon: QrCode, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', bar: 'bg-orange-500' },
    'KPI-008': { icon: CreditCard, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30', bar: 'bg-teal-500' }
  };

  const contributionPieColors = ['#C89A2B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B', '#64748B'];

  return (
    <div id="branch-performance-view" className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP BRANCH HEADER & PERIOD BAR */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B4228] via-[#08321E] to-[#051F13] border border-[#D4AF37]/40 shadow-2xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#D4AF37] text-[#0B4228] uppercase tracking-wider shadow">
                Branch Performance Dashboard
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> {currentUser.branchName || 'Hamusit Branch'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-[#D4AF37]" />
              <span>{currentUser.branchName || 'Branch'} Performance & Target Realization</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-medium mt-1">
              District: <strong className="text-white">{currentUser.districtName || 'Bahir Dar District'}</strong> • Branch Staff: <strong className="text-[#D4AF37]">{branchEmployees.length} Assigned Members</strong> • Approved Entries: <strong className="text-emerald-400">{approvedBranchReports.length}</strong>
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => downloadReportExcel(approvedBranchReports, `Branch_Performance_${currentUser.branchName || 'Branch'}`)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center space-x-1.5 transition-all cursor-pointer shadow"
              title="Export Branch Performance Data to Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Excel Export</span>
            </button>

            <button
              onClick={() => printOrDownloadPDF(`Branch_Performance_${currentUser.branchName || 'Branch'}`)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center space-x-1.5 transition-all cursor-pointer shadow"
              title="Print Branch Scorecard"
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              <span>Print Scorecard</span>
            </button>
          </div>
        </div>

        {/* PERIOD SELECTOR BUTTONS */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {periodOptions.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPeriod(p.id);
                  setCustomRangeActive(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center sm:flex-row sm:space-x-1.5 ${
                  selectedPeriod === p.id && !customRangeActive
                    ? 'bg-[#D4AF37] text-[#0B4228] font-black shadow-lg scale-105 ring-2 ring-[#D4AF37]/40'
                    : 'bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <span>{p.label}</span>
                <span className="text-[10px] opacity-75 font-normal">({p.sub})</span>
              </button>
            ))}

            <button
              onClick={() => setCustomRangeActive(!customRangeActive)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                customRangeActive
                  ? 'bg-[#D4AF37] text-[#0B4228] font-black shadow-lg ring-2 ring-[#D4AF37]/40'
                  : 'bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Custom Date</span>
            </button>
          </div>

          <div className="text-right text-xs text-amber-200/90 font-medium">
            Branch Window: <strong className="text-white font-bold">{branchPerformance.periodLabel}</strong> ({branchPerformance.validWorkingDays} Working Days)
          </div>
        </div>

        {/* Custom Range Inputs */}
        {customRangeActive && (
          <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-[#D4AF37]/30 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Custom Range:
            </span>
            <div className="flex items-center space-x-2">
              <label className="text-[11px] text-gray-400">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-[11px] text-gray-400">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            {(customStartDate || customEndDate) && (
              <button
                onClick={() => { setCustomStartDate(''); setCustomEndDate(''); }}
                className="text-xs text-rose-400 hover:underline ml-2 cursor-pointer font-semibold"
              >
                Reset Range
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. EXECUTIVE BRANCH SCORECARD STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Modern Animated Floating Branch Performance Card */}
        <div className="lg:col-span-2">
          <PerformanceCard
            entityType="branch"
            name={currentUser.branchName || 'Bunna Bank Branch'}
            subtitle={`District: ${currentUser.districtName || 'Addis Ababa Central'}`}
            identifier={currentUser.branchId || 'BR-0102'}
            roleOrDistrict={`${branchEmployees.length} active registered banking officers`}
            percentage={branchPerformance.overallPerformancePercentage}
            achievement={`${branchPerformance.overallPerformancePercentage}%`}
            target="100.0%"
            periodLabel={branchPerformance.periodLabel}
            kpis={branchPerformance.kpis.map(k => ({
              label: k.kpiName,
              value: k.isCurrency ? `${k.unit} ${k.actualAchievement.toLocaleString()}` : `${k.actualAchievement.toLocaleString()} ${k.unit}`,
              percentage: k.performancePercentage
            }))}
            trend={{
              value: Number((branchPerformance.overallPerformancePercentage - 80.0).toFixed(1)),
              label: 'vs branch target standard'
            }}
          />
        </div>

        {/* Supporting Branch KPI & Distribution Sidepanel */}
        <div className="flex flex-col justify-between space-y-4">
          
          {/* Branch Team Performance Distribution */}
          <div className="p-5 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl flex-1 flex flex-col justify-between text-white">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-xs font-black text-[#D4AF37] uppercase tracking-wider">
                  Branch Team Roster
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1">Staff Distribution</p>
            </div>

            <div className="my-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-white">
                  {employeeContributions.length}
                </span>
                <span className="text-sm text-gray-400 font-bold">Active Staff</span>
              </div>
              <p className="text-[11px] text-emerald-300 mt-0.5 font-semibold">
                {employeeContributions.filter(e => e.overallScore >= 100).length} staff exceeding target threshold
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 text-xs text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>Exceeding (≥100%):</span>
                <strong className="text-emerald-400">{employeeContributions.filter(e => e.overallScore >= 100).length}</strong>
              </div>
              <div className="flex justify-between">
                <span>On Track (75-99%):</span>
                <strong className="text-amber-300">{employeeContributions.filter(e => e.overallScore >= 75 && e.overallScore < 100).length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Needs Boost (&lt;75%):</span>
                <strong className="text-rose-400">{employeeContributions.filter(e => e.overallScore < 75).length}</strong>
              </div>
            </div>
          </div>

          {/* Branch Total Deposits & FCY Mobilized */}
          <div className="p-5 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl flex-1 flex flex-col justify-between text-white">
            <div>
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  Volume Mobilized
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1">Total Branch Achievements</p>
            </div>

            <div className="my-2 space-y-1">
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Deposits (ETB):</span>
                <div className="text-lg font-black text-amber-300 font-mono">
                  ETB {branchTotals.totalDeposits.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">FCY Inflow:</span>
                <div className="text-base font-black text-emerald-400 font-mono">
                  USD {branchTotals.totalFcy.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-xs text-gray-300 flex justify-between">
              <span>Accounts: <strong className="text-purple-300">{branchTotals.totalAccounts}</strong></span>
              <span>Mobile Banking: <strong className="text-cyan-300">{branchTotals.totalMobile}</strong></span>
            </div>
          </div>

        </div>

      </div>

      {/* 3. BRANCH CORE PRODUCTS COMPARATIVE MATRIX */}
      <div className="p-6 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#D4AF37]" />
              <span>Branch KPI Target Realization Breakdown</span>
            </h3>
            <p className="text-xs text-gray-300">
              Branch-level cumulative targets, actual volume achieved, achievement percentage, and variance
            </p>
          </div>
          <span className="text-xs text-[#D4AF37] font-extrabold bg-black/40 px-3 py-1 rounded-xl border border-white/10">
            Window: {branchPerformance.periodLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {branchPerformance.kpis.map(kpi => {
            const cfg = kpiIcons[kpi.kpiId] || { icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: 'bg-amber-500' };
            const Icon = cfg.icon;
            const remaining = Math.max(0, kpi.applicableTarget - kpi.actualAchievement);
            const isExceeded = kpi.performancePercentage >= 100;

            return (
              <div
                key={kpi.kpiId}
                className={`p-5 rounded-3xl bg-[#0B4228] border ${cfg.border} shadow-lg flex flex-col justify-between space-y-3`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-white line-clamp-1">
                          {kpi.kpiName}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-mono">{kpi.kpiCode}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isExceeded
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : kpi.performancePercentage >= 75
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {kpi.performancePercentage}%
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="text-[11px] text-gray-300 block">Branch Achieved:</span>
                    <h3 className="text-xl font-black text-white">
                      {kpi.isCurrency ? `${kpi.unit} ` : ''}
                      {kpi.actualAchievement.toLocaleString()}
                      {!kpi.isCurrency ? ` ${kpi.unit}` : ''}
                    </h3>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cfg.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, kpi.performancePercentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-300">
                    <span>Target: <strong className="text-white">{kpi.isCurrency ? `${kpi.unit} ` : ''}{kpi.applicableTarget.toLocaleString()}</strong></span>
                    {remaining > 0 ? (
                      <span className="text-amber-300">Rem: {remaining.toLocaleString()}</span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Met
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. EMPLOYEE CONTRIBUTION TO BRANCH PERFORMANCE (FOR MANAGERS & SUMMARIZED FOR EMPLOYEES) */}
      <div className="p-6 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-lg font-black text-white">
                Branch Staff Contribution & Performance Rankings
              </h3>
            </div>
            <p className="text-xs text-gray-300">
              Individual staff performance scores, volume contributions, and target achievement standing
            </p>
          </div>

          <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-black/40 px-3.5 py-1.5 rounded-xl border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{employeeContributions.length} Staff Contributing</span>
          </div>
        </div>

        {employeeContributions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            No branch staff reports recorded for the selected window.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0B4228] text-[#D4AF37] font-extrabold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Rank & Officer</th>
                  <th className="p-3.5">Job Title</th>
                  <th className="p-3.5 text-center">Approved Logs</th>
                  <th className="p-3.5 text-right">Deposits Mobilized</th>
                  <th className="p-3.5 text-right">FCY Inflow</th>
                  <th className="p-3.5 text-center">Accounts</th>
                  <th className="p-3.5 text-center">Mobile Banking</th>
                  <th className="p-3.5 text-center">Overall Score %</th>
                  <th className="p-3.5 text-center">Grade</th>
                  {isManager && <th className="p-3.5 text-right rounded-r-xl">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {employeeContributions.map((item, idx) => {
                  const isTop = idx === 0;
                  return (
                    <tr key={item.employee.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                            idx === 0 ? 'bg-[#D4AF37] text-[#0B4228]' :
                            idx === 1 ? 'bg-gray-300 text-gray-900' :
                            idx === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-gray-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-extrabold text-white">{item.fullName}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{item.employee.userId || item.employee.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-emerald-300">
                          {item.jobTitle}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold">
                        {item.submissionsCount}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-amber-300">
                        ETB {item.depositsAch.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                        USD {item.fcyAch.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-center font-bold text-purple-300">
                        {item.accountsAch}
                      </td>
                      <td className="p-3.5 text-center font-bold text-cyan-300">
                        {item.mobileAch}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full font-black text-xs font-mono ${
                          item.overallScore >= 100
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : item.overallScore >= 75
                            ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                            : item.overallScore >= 50
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : item.overallScore >= 0
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                            : 'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}>
                          {formatPerformancePercentage(item.overallScore, 1)}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <PerformanceStatusBadge
                          percentage={item.overallScore}
                          size="xs"
                          showPercentage={false}
                        />
                      </td>
                      {isManager && (
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {onOpenEmployeeDeepDive && (
                              <button
                                onClick={() => onOpenEmployeeDeepDive(item.employee.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#0B4228] hover:bg-[#0e5232] border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                title="View In-Depth Performance Scorecard"
                              >
                                <BarChart3 className="w-3.5 h-3.5" />
                                <span>Deep Dive</span>
                              </button>
                            )}
                            {onOpenAiSummary && (
                              <button
                                onClick={() => onOpenAiSummary(item.employee)}
                                className="px-2.5 py-1 rounded-lg bg-[#D4AF37] hover:bg-[#e0be4d] text-[#0B4228] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                title="AI Performance Summary"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>AI</span>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
