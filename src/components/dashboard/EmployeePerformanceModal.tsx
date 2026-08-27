import React, { useState } from 'react';
import {
  UserCheck,
  TrendingUp,
  Coins,
  DollarSign,
  Smartphone,
  Globe,
  QrCode,
  CreditCard,
  UserPlus,
  Sparkles,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Printer,
  ChevronDown,
  Award,
  AlertTriangle,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { User, DailyPerformanceReport, PerformanceTarget, getUserFullName } from '../../types';
import { PeriodPerformanceDashboard } from './PeriodPerformanceDashboard';
import { ModalCloseButton } from '../common/ModalCloseButton';
import { useModalDismiss } from '../../hooks/useModalDismiss';

interface EmployeePerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: User[];
  reports: DailyPerformanceReport[];
  targets: PerformanceTarget[];
  initialEmployeeId?: string;
  onOpenAiSummary?: (employee: User) => void;
  onOpenDirectMessage?: (employeeId: string) => void;
}

const PRODUCT_DEFINITIONS = [
  {
    key: 'depositsETB',
    kpiId: 'KPI-001',
    name: 'Deposits Mobilized',
    code: 'DEP_ETB',
    category: 'Financial',
    unit: 'ETB',
    isCurrency: true,
    icon: Coins,
    color: 'emerald',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    barColor: 'bg-emerald-500'
  },
  {
    key: 'foreignCurrencyETB',
    kpiId: 'KPI-002',
    name: 'Foreign Currency Inflow',
    code: 'FCY_USD',
    category: 'Financial',
    unit: 'USD',
    isCurrency: true,
    icon: DollarSign,
    color: 'teal',
    badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    barColor: 'bg-teal-500'
  },
  {
    key: 'digitalFinancialServicesETB',
    kpiId: 'KPI-003',
    name: 'Digital Financial Services',
    code: 'DFS_ETB',
    category: 'Financial',
    unit: 'ETB',
    isCurrency: true,
    icon: TrendingUp,
    color: 'blue',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    barColor: 'bg-blue-500'
  },
  {
    key: 'accountOpenings',
    kpiId: 'KPI-004',
    name: 'Account Openings',
    code: 'ACC_OPEN',
    category: 'Customer Acquisition',
    unit: 'Accounts',
    isCurrency: false,
    icon: UserPlus,
    color: 'purple',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    barColor: 'bg-purple-500'
  },
  {
    key: 'mobileBankingActivations',
    kpiId: 'KPI-005',
    name: 'Mobile Banking Activations',
    code: 'MB_ACT',
    category: 'Digital Banking',
    unit: 'Users',
    isCurrency: false,
    icon: Smartphone,
    color: 'indigo',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    barColor: 'bg-indigo-500'
  },
  {
    key: 'internetBankingActivations',
    kpiId: 'KPI-006',
    name: 'Internet Banking Activations',
 code: 'IB_ACT',
    category: 'Digital Banking',
    unit: 'Users',
    isCurrency: false,
    icon: Globe,
    color: 'cyan',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    barColor: 'bg-cyan-500'
  },
  {
    key: 'merchantSolutions',
    kpiId: 'KPI-007',
    name: 'Merchant Solutions & QR',
    code: 'MERCH_SOL',
    category: 'Digital Banking',
    unit: 'Merchants',
    isCurrency: false,
    icon: QrCode,
    color: 'amber',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    barColor: 'bg-amber-500'
  },
  {
    key: 'atmCardActivations',
    kpiId: 'KPI-008',
    name: 'ATM Card Activations',
    code: 'ATM_CARD',
    category: 'Digital Banking',
    unit: 'Cards',
    isCurrency: false,
    icon: CreditCard,
    color: 'rose',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    barColor: 'bg-rose-500'
  }
];

export const EmployeePerformanceModal: React.FC<EmployeePerformanceModalProps> = ({
  isOpen,
  onClose,
  employees,
  reports,
  targets,
  initialEmployeeId,
  onOpenAiSummary,
  onOpenDirectMessage
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    initialEmployeeId || employees[0]?.id || ''
  );

  const { contentRef, handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose,
  });
  const [timePeriod, setTimePeriod] = useState<'AllTime' | 'ThisMonth' | 'ThisQuarter'>('AllTime');
  const [activeViewTab, setActiveViewTab] = useState<'calendar' | 'products' | 'submissions'>('calendar');

  if (!isOpen) return null;

  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  // Filter reports submitted by selected employee
  const employeeReports = reports.filter(r => {
    if (!selectedEmployee) return false;
    const isMatch = r.employeeId === selectedEmployee.id || 
      (selectedEmployee.userId && r.employeeUserId === selectedEmployee.userId) ||
      (r.employeeName && selectedEmployee.firstName && r.employeeName.toLowerCase().includes(selectedEmployee.firstName.toLowerCase()));
    
    if (!isMatch) return false;

    if (timePeriod === 'ThisMonth') {
      const reportDate = new Date(r.reportDate);
      const now = new Date();
      return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const approvedReports = employeeReports.filter(r => r.status === 'Approved');

  // Compute product achievements
  const productPerformance = PRODUCT_DEFINITIONS.map(prod => {
    // Calculate total actual from approved/submitted reports
    const actual = employeeReports.reduce((sum, r) => {
      let val = (r as any)[prod.key];
      if (val === undefined || val === null) {
        if (prod.key === 'merchantSolutions') val = r.merchantSolutionsActivations || 0;
        if (prod.key === 'atmCardActivations') val = r.atmCardsIssued || 0;
      }
      return sum + (Number(val) || 0);
    }, 0);

    // Find assigned target for employee or branch default
    const matchedTargetObj = targets.find(t =>
      (t.employeeId === selectedEmployee?.id || t.branchId === selectedEmployee?.branchId) &&
      (t.kpiId === prod.kpiId || (t.kpiName && prod.name && t.kpiName.toLowerCase().includes(prod.name.toLowerCase())))
    );

    const targetVal = matchedTargetObj ? matchedTargetObj.targetValue : 0;
    const achievementPercent = targetVal > 0 ? (actual / targetVal) * 100 : (actual > 0 ? 100 : 0);
    const gap = targetVal > actual ? targetVal - actual : 0;

    return {
      ...prod,
      actual,
      target: targetVal,
      achievementPercent: Math.round(achievementPercent * 10) / 10,
      gap
    };
  });

  // Compute Overall Weighted Achievement
  const validProductsWithTargets = productPerformance.filter(p => p.target > 0);
  const overallAchievementPercent = validProductsWithTargets.length > 0
    ? Math.round(
        (validProductsWithTargets.reduce((acc, p) => acc + Math.min(p.achievementPercent, 200), 0) /
          validProductsWithTargets.length) * 10
      ) / 10
    : Math.round(
        (productPerformance.reduce((acc, p) => acc + (p.actual > 0 ? 100 : 0), 0) /
          productPerformance.length) * 10
      ) / 10;

  // Performance Rating Badge
  let ratingLabel = 'On Track';
  let ratingBadgeStyle = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
  if (overallAchievementPercent >= 100) {
    ratingLabel = 'Exceeds Target (Excellent)';
    ratingBadgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  } else if (overallAchievementPercent >= 75) {
    ratingLabel = 'On Track (Good)';
    ratingBadgeStyle = 'bg-teal-500/20 text-teal-300 border-teal-500/40';
  } else if (overallAchievementPercent >= 50) {
    ratingLabel = 'Moderate Progress';
    ratingBadgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  } else {
    ratingLabel = 'Needs Manager Intervention';
    ratingBadgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
    >
      <div
        ref={contentRef}
        className="bg-[#4A2C17] border border-[#C89A2B]/40 rounded-3xl w-full max-w-6xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-[#6B3F1D] via-[#4A2C17] to-[#362011] border-b border-[#C89A2B]/30 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C89A2B]/20 border border-[#C89A2B]/50 flex items-center justify-center text-[#C89A2B] shadow-inner">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#C89A2B] text-[#6B3F1D] uppercase tracking-wider">
                  Manager Inspection Portal
                </span>
                <span className="text-xs text-gray-300 font-semibold">
                  Product & Cumulative Performance Analytics
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Employee Performance Dashboard
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
              title="Print Performance Sheet"
            >
              <Printer className="w-4 h-4 text-[#C89A2B]" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <ModalCloseButton onClose={onClose} ariaLabel="Close employee performance dashboard" />
          </div>
        </div>

        {/* Employee Selector Bar */}
        <div className="p-4 bg-[#6B3F1D] border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <label className="text-xs font-bold text-[#C89A2B] uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
              <UserCheck className="w-4 h-4" /> Select Employee:
            </label>
            <div className="relative flex-1 max-w-md">
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[#C89A2B]/50 text-xs text-white font-bold focus:outline-none focus:border-[#C89A2B] cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id} className="bg-[#6B3F1D] text-white">
                    {getUserFullName(emp)} — {emp.jobTitle || 'CSO'} ({emp.userId || emp.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setTimePeriod('AllTime')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timePeriod === 'AllTime' ? 'bg-[#C89A2B] text-[#6B3F1D]' : 'text-gray-300 hover:text-white'
              }`}
            >
              To Date (Cumulative)
            </button>
            <button
              onClick={() => setTimePeriod('ThisMonth')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timePeriod === 'ThisMonth' ? 'bg-[#C89A2B] text-[#6B3F1D]' : 'text-gray-300 hover:text-white'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Employee Overview & Summary Card */}
          {selectedEmployee && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#6B3F1D] to-[#362011] border border-[#C89A2B]/30 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Profile Details */}
              <div className="md:col-span-7 flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-[#C89A2B] text-[#6B3F1D] font-black text-2xl flex items-center justify-center shadow-lg uppercase">
                  {selectedEmployee.firstName?.[0] || 'E'}
                  {selectedEmployee.lastName?.[0] || 'M'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-white">
                      {getUserFullName(selectedEmployee)}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-[#C89A2B] border border-[#C89A2B]/30">
                      ID: {selectedEmployee.userId || selectedEmployee.id}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-300">
                    {selectedEmployee.jobTitle || 'Customer Service Officer'} • {selectedEmployee.branchName || 'Branch Unit'}
                  </p>
                  <p className="text-[11px] text-gray-300">
                    {selectedEmployee.email} • {selectedEmployee.phone || 'No Phone Registered'}
                  </p>
                </div>
              </div>

              {/* Overall Achievement Badge & Quick Action */}
              <div className="md:col-span-5 flex flex-col sm:flex-row items-center justify-end gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                <div className="text-center sm:text-right space-y-1">
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block">
                    Overall Performance to Date
                  </span>
                  <div className="flex items-center justify-center sm:justify-end gap-2">
                    <span className="text-3xl font-black text-[#C89A2B]">
                      {overallAchievementPercent}%
                    </span>
                    <Award className="w-7 h-7 text-[#C89A2B]" />
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${ratingBadgeStyle}`}>
                    {ratingLabel}
                  </span>
                </div>

                {onOpenAiSummary && (
                  <button
                    onClick={() => onOpenAiSummary(selectedEmployee)}
                    className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-[#C89A2B] hover:bg-[#D8B45C] text-[#6B3F1D] font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-[#6B3F1D]" />
                    <span>AI Evaluate</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#6B3F1D] border border-white/10 space-y-1">
              <span className="text-[10px] text-gray-300 font-bold uppercase">Submitted Daily Logs</span>
              <p className="text-2xl font-black text-white">{employeeReports.length}</p>
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {approvedReports.length} Approved Reports
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#6B3F1D] border border-white/10 space-y-1">
              <span className="text-[10px] text-gray-300 font-bold uppercase">Deposits Mobilized</span>
              <p className="text-xl font-black text-amber-400">
                ETB {(productPerformance.find(p => p.key === 'depositsETB')?.actual || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-300">
                Target: ETB {(productPerformance.find(p => p.key === 'depositsETB')?.target || 0).toLocaleString()}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#6B3F1D] border border-white/10 space-y-1">
              <span className="text-[10px] text-gray-300 font-bold uppercase">Foreign Inflow</span>
              <p className="text-xl font-black text-emerald-400">
                USD {(productPerformance.find(p => p.key === 'foreignCurrencyETB')?.actual || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-gray-300">
                Target: USD {(productPerformance.find(p => p.key === 'foreignCurrencyETB')?.target || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#6B3F1D] border border-white/10 space-y-1">
              <span className="text-[10px] text-gray-300 font-bold uppercase">Account Openings</span>
              <p className="text-2xl font-black text-purple-400">
                {(productPerformance.find(p => p.key === 'accountOpenings')?.actual || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-300">
                Target: {(productPerformance.find(p => p.key === 'accountOpenings')?.target || 0).toLocaleString()} Accounts
              </p>
            </div>
          </div>

          {/* Tab Navigation for Products vs Submissions */}
          <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-2">
            <button
              onClick={() => setActiveViewTab('calendar')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
                activeViewTab === 'calendar'
                  ? 'bg-[#C89A2B] text-[#6B3F1D] shadow'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Calendar-Based Target & Weight breakdowns</span>
            </button>

            <button
              onClick={() => setActiveViewTab('products')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
                activeViewTab === 'products'
                  ? 'bg-[#C89A2B] text-[#6B3F1D] shadow'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Each Product's Performance Breakdown (8 Core Products)</span>
            </button>

            <button
              onClick={() => setActiveViewTab('submissions')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
                activeViewTab === 'submissions'
                  ? 'bg-[#C89A2B] text-[#6B3F1D] shadow'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Daily Submissions History ({employeeReports.length})</span>
            </button>
          </div>

          {/* TAB 0: CALENDAR-BASED TARGET BREAKDOWNS */}
          {activeViewTab === 'calendar' && selectedEmployee && (
            <PeriodPerformanceDashboard employeeId={selectedEmployee.id} />
          )}

          {/* TAB 1: EACH PRODUCT'S PERFORMANCE BREAKDOWN */}
          {activeViewTab === 'products' && (
            <div className="space-y-6">
              
              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {productPerformance.map(prod => {
                  const IconComp = prod.icon;
                  return (
                    <div
                      key={prod.key}
                      className="p-5 rounded-2xl bg-[#6B3F1D] border border-white/10 shadow-lg flex flex-col justify-between space-y-4 hover:border-[#C89A2B]/50 transition-all"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-xl bg-white/10 text-[#C89A2B]">
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-xs leading-tight">
                                {prod.name}
                              </h4>
                              <span className="text-[10px] text-gray-400">
                                {prod.category}
                              </span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${prod.badgeBg}`}>
                            {prod.code}
                          </span>
                        </div>

                        {/* Numbers */}
                        <div className="mt-4 space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] text-gray-300 font-bold uppercase">Achieved To Date</span>
                            <span className="text-xs font-mono font-bold text-gray-300">
                              Target: {prod.isCurrency ? 'ETB ' : ''}{prod.target.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xl font-black text-[#C89A2B]">
                            {prod.isCurrency ? 'ETB ' : ''}{prod.actual.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar & Achievement % */}
                      <div className="space-y-1.5 pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-gray-300 text-[11px]">Achievement Rate:</span>
                          <span className={prod.achievementPercent >= 100 ? 'text-emerald-400' : 'text-amber-400'}>
                            {prod.achievementPercent}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/10">
                          <div
                            className={`h-full transition-all duration-500 ${
                              prod.achievementPercent >= 100 ? 'bg-emerald-500' :
                              prod.achievementPercent >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(prod.achievementPercent, 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-400 flex justify-between">
                          <span>
                            {prod.gap > 0 ? `Remaining: ${prod.isCurrency ? 'ETB ' : ''}${prod.gap.toLocaleString()}` : 'Target Met'}
                          </span>
                          <span className="font-semibold text-gray-300">{prod.unit}</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Comprehensive Product Performance Summary Table */}
              <div className="p-6 rounded-3xl bg-[#6B3F1D] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#C89A2B]" />
                    Product Achievement Matrix (Target vs Actual To Date)
                  </h4>
                  <span className="text-xs text-gray-300">
                    {selectedEmployee ? getUserFullName(selectedEmployee) : 'Employee'} Performance
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#4A2C17] text-[#C89A2B] font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Code</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-right">Target Goal</th>
                        <th className="p-3 text-right">Actual Achieved</th>
                        <th className="p-3 text-right">Gap / Surplus</th>
                        <th className="p-3 text-center">Achievement %</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {productPerformance.map(prod => {
                        const isSuccess = prod.achievementPercent >= 100;
                        const isWarning = prod.achievementPercent >= 70 && prod.achievementPercent < 100;
                        return (
                          <tr key={prod.key} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 font-bold text-white flex items-center gap-2">
                              <prod.icon className="w-4 h-4 text-[#C89A2B]" />
                              <span>{prod.name}</span>
                            </td>
                            <td className="p-3 font-mono text-[10px] text-gray-400">{prod.code}</td>
                            <td className="p-3 text-gray-300">{prod.category}</td>
                            <td className="p-3 text-right font-mono font-semibold text-white">
                              {prod.isCurrency ? 'ETB ' : ''}{prod.target.toLocaleString()}
                            </td>
                            <td className="p-3 text-right font-mono font-extrabold text-[#C89A2B]">
                              {prod.isCurrency ? 'ETB ' : ''}{prod.actual.toLocaleString()}
                            </td>
                            <td className="p-3 text-right font-mono text-xs">
                              {prod.gap > 0 ? (
                                <span className="text-rose-400">-{prod.isCurrency ? 'ETB ' : ''}{prod.gap.toLocaleString()}</span>
                              ) : (
                                <span className="text-emerald-400">Met (+{(prod.actual - prod.target).toLocaleString()})</span>
                              )}
                            </td>
                            <td className="p-3 text-center font-bold">
                              <span className={isSuccess ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-rose-400'}>
                                {prod.achievementPercent}%
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                isSuccess ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                isWarning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {isSuccess ? 'Exceeded' : isWarning ? 'On Track' : 'Behind'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DAILY SUBMISSIONS HISTORY */}
          {activeViewTab === 'submissions' && (
            <div className="p-6 rounded-3xl bg-[#6B3F1D] border border-white/10 shadow-xl space-y-4">
              <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C89A2B]" />
                Daily Reports Submitted by {selectedEmployee ? getUserFullName(selectedEmployee) : 'Employee'} ({employeeReports.length})
              </h4>

              {employeeReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400 bg-black/20 rounded-2xl">
                  No daily performance submissions found for this employee in the selected period.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#4A2C17] text-[#C89A2B] font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Report Date</th>
                        <th className="p-3">Deposits (ETB)</th>
                        <th className="p-3">FCY (USD)</th>
                        <th className="p-3">DFS (ETB)</th>
                        <th className="p-3">Accounts</th>
                        <th className="p-3">Mobile Banking</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {employeeReports.map(r => (
                        <tr key={r.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-bold text-[#C89A2B]">{r.reportDate} ({r.dayOfWeek})</td>
                          <td className="p-3 font-mono font-bold text-emerald-400">ETB {r.depositsETB?.toLocaleString()}</td>
                          <td className="p-3 font-mono">USD {r.foreignCurrencyETB?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="p-3 font-mono">ETB {r.digitalFinancialServicesETB?.toLocaleString()}</td>
                          <td className="p-3 font-bold">{r.accountOpenings}</td>
                          <td className="p-3 font-bold text-[#C89A2B]">{r.mobileBankingActivations}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              r.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' :
                              r.status === 'Pending' ? 'bg-amber-500/20 text-amber-300' :
                              r.status === 'Returned' ? 'bg-blue-500/20 text-blue-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="p-3 text-gray-400 text-[11px]">{r.submittedAt || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-[#6B3F1D] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Bunna Bank S.C. Performance Management System • Live Branch Sync</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {onOpenDirectMessage && selectedEmployee && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDirectMessage(selectedEmployee.id);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#C89A2B] font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Employee</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#C89A2B] hover:bg-[#D8B45C] text-[#6B3F1D] font-bold text-xs shadow-lg transition-all"
            >
              Close Performance Inspection
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
