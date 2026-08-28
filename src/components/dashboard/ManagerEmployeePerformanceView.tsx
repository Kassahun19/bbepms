import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
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
  Search,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Target,
  Zap,
  MessageSquare,
  Clock,
  ChevronDown
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
  KpiPerformanceItem
} from '../../utils/performanceCalculations';
import { downloadReportExcel, printOrDownloadPDF } from '../../utils/exportUtils';
import { translations } from '../../i18n/translations';
import { PerformanceCard } from '../common/PerformanceCard';
import { PerformanceStatusBadge } from '../common/PerformanceStatusBadge';
import { formatPerformancePercentage, getPerformanceClassification } from '../../utils/performanceClassification';

interface ManagerEmployeePerformanceViewProps {
  currentUser: User;
  employees: User[];
  reports: DailyPerformanceReport[];
  targets: PerformanceTarget[];
  onRefreshData?: () => void;
  onOpenAiSummary?: (employee: User) => void;
  onOpenDirectMessage?: (employeeId: string) => void;
  language?: Language;
}

export const ManagerEmployeePerformanceView: React.FC<ManagerEmployeePerformanceViewProps> = ({
  currentUser,
  employees,
  reports,
  targets,
  onRefreshData,
  onOpenAiSummary,
  onOpenDirectMessage,
  language = 'en'
}) => {
  const t = translations[language] || translations['en'];

  // State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<'all' | 'exceeding' | 'on_track' | 'below'>('all');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<ReportingPeriodType>('monthly');
  const [customRangeActive, setCustomRangeActive] = useState<boolean>(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [chartMetric, setChartMetric] = useState<'overall' | 'financial' | 'digital' | 'customer'>('overall');

  // 1. Filter staff strictly by manager's branch
  const branchEmployees = useMemo(() => {
    const userBranch = (currentUser.branchName || '').toLowerCase().trim();
    const userDistrict = (currentUser.districtName || '').toLowerCase().trim();

    return employees.filter(emp => {
      // Exclude manager themselves if evaluating employee staff roster
      if (emp.id === currentUser.id) return false;
      if (emp.role === 'MANAGER' || emp.role === 'ADMINISTRATOR') return false;

      const empBranch = (emp.branchName || '').toLowerCase().trim();
      const empDistrict = (emp.districtName || '').toLowerCase().trim();
      
      const branchMatches = userBranch ? empBranch.includes(userBranch) || userBranch.includes(empBranch) : true;
      const districtMatches = userDistrict ? empDistrict.includes(userDistrict) || userDistrict.includes(empDistrict) : true;

      return branchMatches && districtMatches;
    });
  }, [employees, currentUser]);

  // Set default selected employee if none selected
  const activeSelectedEmpId = selectedEmpId || (branchEmployees[0]?.id || '');
  const selectedEmployee = branchEmployees.find(e => e.id === activeSelectedEmpId) || branchEmployees[0];

  // 2. Filter approved reports
  const approvedReports = useMemo(() => {
    return reports.filter(r => r.status === 'Approved' || (r as any).status === 'approved');
  }, [reports]);

  // 3. Compute Employee Summaries for Roster List & Ranking
  const employeeSummaries = useMemo(() => {
    return branchEmployees.map(emp => {
      const empReports = approvedReports.filter(r => {
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
  }, [branchEmployees, approvedReports, targets, selectedPeriod, customRangeActive, customEndDate]);

  // 4. Filter Roster by Search & Tier
  const filteredEmployeeSummaries = useMemo(() => {
    return employeeSummaries.filter(item => {
      const matchesSearch =
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.employee.userId && item.employee.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (tierFilter === 'exceeding') return item.overallScore >= 100;
      if (tierFilter === 'on_track') return item.overallScore >= 75 && item.overallScore < 100;
      if (tierFilter === 'below') return item.overallScore < 75;
      return true;
    });
  }, [employeeSummaries, searchTerm, tierFilter]);

  // 5. Selected Employee Detailed Performance
  const selectedEmpPerfResult = useMemo(() => {
    if (!selectedEmployee) return null;

    const empReports = approvedReports.filter(r => {
      const rEmpId = String(r.employeeId || r.employee_id || '').toLowerCase();
      const rUserId = String(r.employeeUserId || '').toLowerCase();
      return rEmpId === selectedEmployee.id.toLowerCase() || (selectedEmployee.userId && rUserId === selectedEmployee.userId.toLowerCase());
    });

    return calculatePeriodPerformance(
      empReports,
      targets,
      selectedEmployee.id,
      selectedPeriod,
      customRangeActive && customEndDate ? customEndDate : '2026-08-09'
    );
  }, [selectedEmployee, approvedReports, targets, selectedPeriod, customRangeActive, customEndDate]);

  // 6. Selected Employee Historical Trend (6 Months)
  const selectedEmpTrendData = useMemo(() => {
    if (!selectedEmployee) return [];

    const empReports = approvedReports.filter(r => {
      const rEmpId = String(r.employeeId || r.employee_id || '').toLowerCase();
      const rUserId = String(r.employeeUserId || '').toLowerCase();
      return rEmpId === selectedEmployee.id.toLowerCase() || (selectedEmployee.userId && rUserId === selectedEmployee.userId.toLowerCase());
    });

    const trend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const anchorDate = new Date(year, month, 0).toISOString().split('T')[0];

      const monthPerf = calculatePeriodPerformance(
        empReports,
        targets,
        selectedEmployee.id,
        'monthly',
        anchorDate
      );

      const depKpi = monthPerf.kpis.find(k => k.kpiId === 'KPI-001');
      const fcyKpi = monthPerf.kpis.find(k => k.kpiId === 'KPI-002');
      const dfsKpi = monthPerf.kpis.find(k => k.kpiId === 'KPI-003');
      const custKpi = monthPerf.kpis.find(k => k.kpiId === 'KPI-004');

      trend.push({
        month: monthLabel,
        score: monthPerf.overallPerformancePercentage,
        targetScore: 100,
        depositsAch: depKpi ? depKpi.performancePercentage : 0,
        fcyAch: fcyKpi ? fcyKpi.performancePercentage : 0,
        dfsAch: dfsKpi ? dfsKpi.performancePercentage : 0,
        customerAch: custKpi ? custKpi.performancePercentage : 0,
        digitalScore: monthPerf.categoryScores.digitalBanking,
        financialScore: monthPerf.categoryScores.financial
      });
    }
    return trend;
  }, [selectedEmployee, approvedReports, targets]);

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

  return (
    <div id="manager-employee-performance-view" className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B4228] via-[#08321E] to-[#051F13] border border-[#D4AF37]/40 shadow-2xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#D4AF37] text-[#0B4228] uppercase tracking-wider shadow">
                Branch Staff Performance Supervision
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Branch Supervision Oversight
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 flex items-center gap-2">
              <Users className="w-7 h-7 text-[#D4AF37]" />
              <span>Employee Performance & Evaluation</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-medium mt-1">
              Supervising <strong className="text-[#D4AF37]">{branchEmployees.length} Staff Members</strong> at <strong className="text-white">{currentUser.branchName || 'Branch'}</strong> • District: <strong className="text-white">{currentUser.districtName || 'District'}</strong>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => downloadReportExcel(approvedReports, `Staff_Performance_${currentUser.branchName || 'Branch'}`)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center space-x-1.5 transition-all cursor-pointer shadow"
              title="Export Staff Performance to Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Excel Export</span>
            </button>

            <button
              onClick={() => printOrDownloadPDF(`Staff_Performance_${currentUser.branchName || 'Branch'}`)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center space-x-1.5 transition-all cursor-pointer shadow"
              title="Print Staff Scorecards"
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              <span>Print Scorecards</span>
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
            Evaluation Period: <strong className="text-white font-bold">{selectedEmpPerfResult?.periodLabel || 'This Month'}</strong>
          </div>
        </div>
      </div>

      {/* 2. STAFF ROSTER RANKINGS & FILTER BAR */}
      <div className="p-6 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl text-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#D4AF37]" />
              <span>Branch Staff Performance Roster ({filteredEmployeeSummaries.length} Staff)</span>
            </h3>
            <p className="text-xs text-gray-300">
              Select an employee below to inspect their full target breakdown, realization metrics, and trajectory
            </p>
          </div>

          {/* Search & Tier Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff name or ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setTierFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tierFilter === 'all' ? 'bg-[#D4AF37] text-[#0B4228]' : 'text-gray-300 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTierFilter('exceeding')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tierFilter === 'exceeding' ? 'bg-emerald-500 text-black' : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                Exceeding
              </button>
              <button
                onClick={() => setTierFilter('on_track')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tierFilter === 'on_track' ? 'bg-amber-500 text-black' : 'text-amber-300 hover:text-amber-200'
                }`}
              >
                On Track
              </button>
              <button
                onClick={() => setTierFilter('below')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tierFilter === 'below' ? 'bg-rose-500 text-white' : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                Below Target
              </button>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0B4228] text-[#D4AF37] font-extrabold uppercase text-[11px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Officer</th>
                <th className="p-3.5">Job Title</th>
                <th className="p-3.5 text-center">Approved Logs</th>
                <th className="p-3.5 text-right">Deposits Mobilized</th>
                <th className="p-3.5 text-right">FCY (USD)</th>
                <th className="p-3.5 text-center">Accounts</th>
                <th className="p-3.5 text-center">Mobile Banking</th>
                <th className="p-3.5 text-center">Overall Score %</th>
                <th className="p-3.5 text-center">Grade</th>
                <th className="p-3.5 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredEmployeeSummaries.map(item => {
                const isSelected = selectedEmployee?.id === item.employee.id;
                return (
                  <tr
                    key={item.employee.id}
                    onClick={() => setSelectedEmpId(item.employee.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-white/15 border-l-4 border-[#D4AF37]' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="p-3.5">
                      <div className="font-extrabold text-white">{item.fullName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{item.employee.userId || item.employee.id}</div>
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
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5" onClick={e => e.stopPropagation()}>
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
                        {onOpenDirectMessage && (
                          <button
                            onClick={() => onOpenDirectMessage(item.employee.id)}
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            title="Send Direct Feedback"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. DEEP-DIVE INSPECTOR FOR SELECTED EMPLOYEE */}
      {selectedEmployee && selectedEmpPerfResult && (
        <div className="space-y-6 pt-2">
          
          {/* Selected Employee Scorecard Header - PerformanceCard */}
          <PerformanceCard
            entityType="employee"
            name={getUserFullName(selectedEmployee)}
            subtitle={`${selectedEmployee.jobTitle || 'Customer Service Officer'} • Joined: ${selectedEmployee.createdAt || '2026'}`}
            identifier={selectedEmployee.userId || selectedEmployee.id}
            roleOrDistrict={`Branch: ${currentUser.branchName || 'Branch'} • District: ${currentUser.districtName || 'District'}`}
            percentage={selectedEmpPerfResult.overallPerformancePercentage}
            achievement={`${selectedEmpPerfResult.overallPerformancePercentage}%`}
            target="100.0%"
            periodLabel={selectedEmpPerfResult.periodLabel}
            kpis={selectedEmpPerfResult.kpis.map(k => ({
              label: k.kpiName,
              value: k.isCurrency ? `${k.unit} ${k.actualAchievement.toLocaleString()}` : `${k.actualAchievement.toLocaleString()} ${k.unit}`,
              percentage: k.performancePercentage
            }))}
            trend={{
              value: Number((selectedEmpPerfResult.overallPerformancePercentage - 75.0).toFixed(1)),
              label: 'vs peer baseline standard'
            }}
          />

          {/* 8 KPI Target vs Actual Cards for Selected Employee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedEmpPerfResult.kpis.map(kpi => {
              const cfg = kpiIcons[kpi.kpiId] || { icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: 'bg-amber-500' };
              const Icon = cfg.icon;
              const remaining = Math.max(0, kpi.applicableTarget - kpi.actualAchievement);
              const isExceeded = kpi.performancePercentage >= 100;

              return (
                <div
                  key={kpi.kpiId}
                  className={`p-5 rounded-3xl bg-[#08321E] border ${cfg.border} shadow-lg flex flex-col justify-between space-y-3`}
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
                      <span className="text-[11px] text-gray-300 block">Actual Achieved:</span>
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

          {/* Monthly Trajectory Chart for Selected Employee */}
          <div className="p-6 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-lg font-black text-white">
                    {getUserFullName(selectedEmployee)}'s Performance Trajectory
                  </h3>
                </div>
                <p className="text-xs text-gray-300">
                  Monthly performance score progression and target achievement trend
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedEmpTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="managerEmpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 'auto']} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#051F13', borderColor: '#D4AF37', borderRadius: '1rem', color: '#fff' }}
                    formatter={(val: any) => [`${val}%`, 'Score']}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="score" name="Performance Score %" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#managerEmpGradient)" />
                  <Line type="monotone" dataKey="targetScore" name="Target (100%)" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
