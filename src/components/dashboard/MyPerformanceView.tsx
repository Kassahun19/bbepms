import React, { useState, useMemo } from 'react';
import {
  Calendar,
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
  ArrowDownRight,
  BarChart3,
  Filter,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Clock,
  ChevronRight,
  Target,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { User, DailyPerformanceReport, PerformanceTarget, getUserFullName, Language } from '../../types';
import {
  ReportingPeriodType,
  calculatePeriodPerformance,
  CORE_KPIS,
  KpiPerformanceItem,
  getReportingPeriodDateRange
} from '../../utils/performanceCalculations';
import { downloadReportCSV, downloadReportExcel, printOrDownloadPDF } from '../../utils/exportUtils';
import { translations } from '../../i18n/translations';
import { PerformanceCard } from '../common/PerformanceCard';
import { PerformanceStatusBadge } from '../common/PerformanceStatusBadge';
import { formatPerformancePercentage, getPerformanceClassification } from '../../utils/performanceClassification';

interface MyPerformanceViewProps {
  currentUser: User;
  reports: DailyPerformanceReport[];
  targets: PerformanceTarget[];
  onRefreshData?: () => void;
  language?: Language;
}

export const MyPerformanceView: React.FC<MyPerformanceViewProps> = ({
  currentUser,
  reports,
  targets,
  onRefreshData,
  language = 'en'
}) => {
  const t = translations[language] || translations['en'];

  // State
  const [selectedPeriod, setSelectedPeriod] = useState<ReportingPeriodType>('monthly');
  const [customRangeActive, setCustomRangeActive] = useState<boolean>(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [chartMetric, setChartMetric] = useState<'overall' | 'financial' | 'digital' | 'customer'>('overall');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // 1. STRICT PRIVACY ENFORCEMENT: Filter strictly by logged-in employee ID
  const myReports = useMemo(() => {
    const userLower = currentUser.id.toLowerCase();
    const userNumId = currentUser.userId ? currentUser.userId.toLowerCase() : '';
    const userFirstName = currentUser.firstName ? currentUser.firstName.toLowerCase() : '';

    return reports.filter(r => {
      const rEmpId = String(r.employeeId || r.employee_id || '').toLowerCase();
      const rUserId = String(r.employeeUserId || '').toLowerCase();
      const rEmpName = String(r.employeeName || '').toLowerCase();

      return (
        rEmpId === userLower ||
        (userNumId && (rUserId === userNumId || rEmpId === userNumId)) ||
        (userFirstName && rEmpName.includes(userFirstName))
      );
    });
  }, [reports, currentUser]);

  // 2. Approved Reports Only for official score calculation
  const approvedReports = useMemo(() => {
    return myReports.filter(r => r.status === 'Approved' || (r as any).status === 'approved');
  }, [myReports]);

  // 3. Pending Reports for information status
  const pendingReports = useMemo(() => {
    return myReports.filter(r => r.status === 'Pending' || r.status === 'Submitted');
  }, [myReports]);

  // 4. Calculate Comprehensive Performance for the Selected Period
  const performanceResult = useMemo(() => {
    if (customRangeActive && customStartDate && customEndDate) {
      // Custom date range calculation
      return calculatePeriodPerformance(
        approvedReports,
        targets,
        currentUser.id,
        'annual', // base for annual targets
        customEndDate
      );
    }
    return calculatePeriodPerformance(
      approvedReports,
      targets,
      currentUser.id,
      selectedPeriod
    );
  }, [approvedReports, targets, currentUser.id, selectedPeriod, customRangeActive, customStartDate, customEndDate]);

  // 5. Dynamic Monthly Trend Data for Charts (Past 6 Months)
  const monthlyTrendData = useMemo(() => {
    const trend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-12
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const anchorDate = new Date(year, month, 0).toISOString().split('T')[0];

      // Calculate monthly performance for that specific month
      const monthPerf = calculatePeriodPerformance(
        approvedReports,
        targets,
        currentUser.id,
        'monthly',
        anchorDate
      );

      const depKpi = monthPerf.kpis.find(k => k.kpiId === 'KPI-001');
      const fcyKpi = monthPerf.kpis.find(k => k.kpiId === 'KPI-002');
      const dfsKpi = monthPerf.kpis.find(k => k.kpiId === 'KPI-003');
      const custKpi = monthPerf.kpis.find(k => k.kpiId === 'KPI-004');
      const mbKpi = monthPerf.kpis.find(k => k.kpiId === 'KPI-005');

      trend.push({
        month: monthLabel,
        score: monthPerf.overallPerformancePercentage,
        targetScore: 100,
        depositsAch: depKpi ? depKpi.performancePercentage : 0,
        fcyAch: fcyKpi ? fcyKpi.performancePercentage : 0,
        dfsAch: dfsKpi ? dfsKpi.performancePercentage : 0,
        customerAch: custKpi ? custKpi.performancePercentage : 0,
        digitalScore: monthPerf.categoryScores.digitalBanking,
        financialScore: monthPerf.categoryScores.financial,
        submissions: monthPerf.recordCount
      });
    }
    return trend;
  }, [approvedReports, targets, currentUser.id]);

  // KPI Card Config
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

  const periodOptions: { id: ReportingPeriodType; label: string; sub: string }[] = [
    { id: 'daily', label: 'Daily', sub: 'Today' },
    { id: 'weekly', label: 'Weekly', sub: 'This Week' },
    { id: 'monthly', label: 'Monthly', sub: 'This Month' },
    { id: 'quarterly', label: 'Quarterly', sub: 'Q-to-Date' },
    { id: 'semiAnnual', label: 'Semi-Annual', sub: 'Half-Year' },
    { id: 'annual', label: 'Year-to-Date', sub: 'Annual FY 2026' }
  ];

  return (
    <div id="my-performance-view" className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER & PERIOD NAVIGATION BAR */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#4A2C17] via-[#3A1F0D] to-[#251205] border border-[#C89A2B]/40 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#C89A2B] text-[#3A1F0D] uppercase tracking-wider shadow">
                Employee Performance Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Confidential & Verified
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-[#C89A2B]" />
              <span>My Performance & KPI Achievements</span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/80 font-medium mt-1">
              Officer: <strong className="text-white">{getUserFullName(currentUser)}</strong> ({currentUser.jobTitle || 'Customer Service Officer'}) • Branch: <strong className="text-[#C89A2B]">{currentUser.branchName || 'Bunna Branch'}</strong>
            </p>
          </div>

          {/* Quick Export & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => downloadReportExcel(approvedReports, `My_Performance_${currentUser.userId || currentUser.id}`)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center space-x-1.5 transition-all cursor-pointer shadow"
              title="Export Verified Performance to Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Excel Export</span>
            </button>

            <button
              onClick={() => printOrDownloadPDF(`My_Performance_${currentUser.userId || currentUser.id}`)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center space-x-1.5 transition-all cursor-pointer shadow"
              title="Print Performance Scorecard"
            >
              <Printer className="w-4 h-4 text-[#C89A2B]" />
              <span>Print Scorecard</span>
            </button>
          </div>
        </div>

        {/* DEDICATED PERIOD SWITCHER BUTTONS */}
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
                    ? 'bg-[#C89A2B] text-[#3A1F0D] font-black shadow-lg scale-105 ring-2 ring-[#C89A2B]/40'
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
                  ? 'bg-[#C89A2B] text-[#3A1F0D] font-black shadow-lg ring-2 ring-[#C89A2B]/40'
                  : 'bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Custom Date</span>
            </button>
          </div>

          <div className="text-right text-xs text-amber-200/90 font-medium">
            Active Evaluation Window: <strong className="text-white font-bold">{performanceResult.periodLabel}</strong> ({performanceResult.validWorkingDays} Working Days)
          </div>
        </div>

        {/* Custom Date Range Selector Bar */}
        {customRangeActive && (
          <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-[#C89A2B]/30 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-[#C89A2B] flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Custom Range:
            </span>
            <div className="flex items-center space-x-2">
              <label className="text-[11px] text-gray-400">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-[11px] text-gray-400">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
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

      {/* PENDING LOGS NOTICE BANNER */}
      {pendingReports.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 animate-pulse" />
            <div className="text-xs">
              <strong className="text-white font-bold">{pendingReports.length} Submitted Report(s) Awaiting Manager Approval.</strong>{' '}
              Official metrics reflect approved submissions. Upon manager approval, your performance scores and graphs update instantly.
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-black text-[11px] font-black whitespace-nowrap">
            {pendingReports.length} Pending
          </span>
        </div>
      )}

      {/* 2. EXECUTIVE PERFORMANCE SCORECARD SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Modern Animated Floating Performance Card */}
        <div className="lg:col-span-2">
          <PerformanceCard
            entityType="employee"
            name={getUserFullName(currentUser)}
            subtitle={currentUser.jobTitle || 'Relationship & Sales Officer'}
            identifier={currentUser.userId || currentUser.id}
            roleOrDistrict={`${currentUser.branchName || 'Bunna Branch'} • ${currentUser.districtName || 'District'}`}
            percentage={performanceResult.overallPerformancePercentage}
            achievement={`${performanceResult.overallPerformancePercentage}%`}
            target="100.0%"
            periodLabel={performanceResult.periodLabel}
            lastUpdated={approvedReports.length > 0 ? (approvedReports[0].reportDate || approvedReports[0].report_date) : undefined}
            kpis={performanceResult.kpis.map(k => ({
              label: k.kpiName,
              value: k.isCurrency ? `${k.unit} ${k.actualAchievement.toLocaleString()}` : `${k.actualAchievement.toLocaleString()} ${k.unit}`,
              percentage: k.performancePercentage
            }))}
            trend={{
              value: Number((performanceResult.overallPerformancePercentage - 85.0).toFixed(1)),
              label: 'vs benchmark target'
            }}
          />
        </div>

        {/* Supporting KPI & Category Balance Sidepanel */}
        <div className="flex flex-col justify-between space-y-4">
          
          {/* Target Realization & Daily Submission Rate */}
          <div className="p-5 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/40 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  KPI Targets Met
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1">Exceeding or On-Track Products</p>
            </div>

            <div className="my-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-white">
                  {performanceResult.kpis.filter(k => k.performancePercentage >= 100).length}
                </span>
                <span className="text-sm text-gray-400 font-bold">/ {performanceResult.kpis.length} Products</span>
              </div>
              <p className="text-[11px] text-emerald-300 mt-0.5 font-semibold">
                {performanceResult.kpis.filter(k => k.performancePercentage >= 100).length} core products reaching &ge; 100%
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 text-xs text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>On-Track (75-99%):</span>
                <strong className="text-amber-300">
                  {performanceResult.kpis.filter(k => k.performancePercentage >= 75 && k.performancePercentage < 100).length} KPIs
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Below Target (&lt;75%):</span>
                <strong className="text-rose-400">
                  {performanceResult.kpis.filter(k => k.performancePercentage < 75).length} KPIs
                </strong>
              </div>
            </div>
          </div>

          {/* Reporting Consistency & History Overview */}
          <div className="p-5 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/40 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-[#C89A2B]" />
                <span className="text-xs font-black text-[#C89A2B] uppercase tracking-wider">
                  Reporting Verification Log
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1">Daily Log Submissions</p>
            </div>

            <div className="my-3">
              <div className="text-3xl font-black text-white">
                {approvedReports.length}
              </div>
              <p className="text-[11px] text-gray-300 mt-0.5 font-semibold">
                Approved Daily Performance Entries
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 text-xs text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>Approved Submissions:</span>
                <strong className="text-emerald-400">{approvedReports.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Pending Review:</span>
                <strong className="text-amber-400">{pendingReports.length}</strong>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. TARGET VS. ACTUAL PERFORMANCE CARDS (ALL 8 CORE BUNNA BANK PRODUCTS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[#C89A2B]" />
            <h3 className="text-lg font-black text-white">
              Core KPI Performance Breakdown ({performanceResult.periodLabel})
            </h3>
          </div>
          <span className="text-xs text-gray-400">Target vs Actual Realization</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceResult.kpis.map(kpi => {
            const cfg = kpiIcons[kpi.kpiId] || { icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: 'bg-amber-500' };
            const Icon = cfg.icon;
            const remaining = Math.max(0, kpi.applicableTarget - kpi.actualAchievement);
            const isExceeded = kpi.performancePercentage >= 100;

            return (
              <div
                key={kpi.kpiId}
                className={`p-5 rounded-3xl bg-[#4A2C17] border ${cfg.border} shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-3 group`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-white group-hover:text-[#C89A2B] transition-colors line-clamp-1">
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

                  {/* Actual Value */}
                  <div className="mt-3">
                    <span className="text-[11px] text-gray-300 block">Actual Achieved:</span>
                    <h3 className="text-xl font-black text-white">
                      {kpi.isCurrency ? `${kpi.unit} ` : ''}
                      {kpi.actualAchievement.toLocaleString()}
                      {!kpi.isCurrency ? ` ${kpi.unit}` : ''}
                    </h3>
                  </div>
                </div>

                {/* Progress Bar */}
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
                  <div className="text-[10px] text-gray-400 text-right">
                    Annual Target: {kpi.isCurrency ? `${kpi.unit} ` : ''}{kpi.annualTarget.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PERFORMANCE COMPARISON MATRIX TABLE */}
      <div className="p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C89A2B]" />
              <span>Target vs. Actual Comparative Matrix</span>
            </h3>
            <p className="text-xs text-gray-300">
              Detailed breakdown of periodic targets, actuals, achievement variance, and completion status
            </p>
          </div>
          <span className="text-xs text-[#C89A2B] font-extrabold bg-black/40 px-3 py-1 rounded-xl border border-white/10">
            Window: {performanceResult.periodLabel}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-black/40 text-[#C89A2B] font-extrabold uppercase text-[11px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">KPI Name & Code</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-right">Applicable Target</th>
                <th className="p-3.5 text-right">Actual Achieved</th>
                <th className="p-3.5 text-center">Achievement %</th>
                <th className="p-3.5 text-right">Variance (+ / -)</th>
                <th className="p-3.5 text-right">Remaining Target</th>
                <th className="p-3.5 text-center rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {performanceResult.kpis.map(kpi => {
                const isExceeded = kpi.performancePercentage >= 100;
                const remaining = Math.max(0, kpi.applicableTarget - kpi.actualAchievement);
                return (
                  <tr key={kpi.kpiId} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5">
                      <div className="font-extrabold text-white">{kpi.kpiName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{kpi.kpiCode} • {kpi.kpiId}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-amber-200">
                        {kpi.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-gray-200">
                      {kpi.isCurrency ? `${kpi.unit} ` : ''}{kpi.applicableTarget.toLocaleString()} {!kpi.isCurrency ? kpi.unit : ''}
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-white">
                      {kpi.isCurrency ? `${kpi.unit} ` : ''}{kpi.actualAchievement.toLocaleString()} {!kpi.isCurrency ? kpi.unit : ''}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-black text-xs font-mono ${
                        kpi.performancePercentage >= 100
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : kpi.performancePercentage >= 75
                          ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                          : kpi.performancePercentage >= 50
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : kpi.performancePercentage >= 0
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {formatPerformancePercentage(kpi.performancePercentage, 1)}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold">
                      <span className={kpi.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {kpi.variance >= 0 ? `+${kpi.variance.toLocaleString()}` : kpi.variance.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-gray-300">
                      {remaining > 0 ? (
                        <span>{kpi.isCurrency ? `${kpi.unit} ` : ''}{remaining.toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">0 (Completed)</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <PerformanceStatusBadge
                        percentage={kpi.performancePercentage}
                        size="xs"
                        showPercentage={false}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. INTERACTIVE PERFORMANCE PROGRESS TREND GRAPH */}
      <div className="p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/40 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#C89A2B]" />
              <h3 className="text-lg font-black text-white">
                Monthly Performance Trajectory & Target Realization
              </h3>
            </div>
            <p className="text-xs text-gray-300">
              6-Month historical performance progression based on verified approved daily reports
            </p>
          </div>

          {/* Metric Selector for Graph */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'overall', label: 'Overall Score %' },
              { id: 'financial', label: 'Financial (ETB/USD)' },
              { id: 'customer', label: 'Customer Acquisition' },
              { id: 'digital', label: 'Digital Channels' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setChartMetric(m.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chartMetric === m.id
                    ? 'bg-[#C89A2B] text-[#3A1F0D] font-black shadow'
                    : 'bg-black/30 text-gray-300 hover:bg-white/10'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === 'overall' ? (
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C89A2B" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#C89A2B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 'auto']} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#251205', borderColor: '#C89A2B', borderRadius: '1rem', color: '#fff' }}
                  formatter={(val: any) => [`${val}%`, 'Score']}
                />
                <Legend />
                <Area type="monotone" dataKey="score" name="Achieved Score %" stroke="#C89A2B" strokeWidth={3} fillOpacity={1} fill="url(#scoreGradient)" />
                <Line type="monotone" dataKey="targetScore" name="Target (100%)" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              </AreaChart>
            ) : chartMetric === 'financial' ? (
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#251205', borderColor: '#C89A2B', borderRadius: '1rem', color: '#fff' }} />
                <Legend />
                <Bar dataKey="depositsAch" name="Deposits %" fill="#C89A2B" radius={[6, 6, 0, 0]} />
                <Bar dataKey="fcyAch" name="FCY Inflow %" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="dfsAch" name="Digital Financial Services %" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : chartMetric === 'customer' ? (
              <LineChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#251205', borderColor: '#C89A2B', borderRadius: '1rem', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="customerAch" name="Account Openings %" stroke="#a855f7" strokeWidth={3} />
                <Line type="monotone" dataKey="targetScore" name="Target (100%)" stroke="#10b981" strokeDasharray="5 5" />
              </LineChart>
            ) : (
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#251205', borderColor: '#C89A2B', borderRadius: '1rem', color: '#fff' }} />
                <Legend />
                <Bar dataKey="digitalScore" name="Digital Banking Channels (MB, IB, QR, ATM) Weighted Score %" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
