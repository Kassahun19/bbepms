import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Sparkles,
  Award,
  ChevronDown,
  Clock,
  CheckCircle2,
  Users,
  Smartphone,
  Globe,
  CreditCard,
  Store,
  DollarSign,
  Search,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { DailyPerformanceReport, User, getUserFullName, Language } from '../../types';
import { api } from '../../services/api';
import { DailyKpiEditModal } from './DailyKpiEditModal';
import { downloadReportCSV, downloadReportExcel, downloadReportWord, printOrDownloadPDF } from '../../utils/exportUtils';
import { translations } from '../../i18n/translations';

interface EmployeeDailyKpiHistoryTableProps {
  user?: User;
  employeeUser?: User;
  reports: DailyPerformanceReport[];
  onRefreshData: () => void;
  language?: Language;
}

type DatePreset = 'all' | 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';

// Day of week badge styling
const getDayBadgeColor = (day: string) => {
  const d = (day || '').toLowerCase();
  if (d.includes('monday')) return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
  if (d.includes('tuesday')) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
  if (d.includes('wednesday')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
  if (d.includes('thursday')) return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
  if (d.includes('friday')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  if (d.includes('saturday')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  if (d.includes('sunday')) return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
  return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
};

// Animated Number Counter Hook
const AnimatedCounter: React.FC<{ value: number; duration?: number; prefix?: string; suffix?: string }> = ({
  value,
  duration = 600,
  prefix = '',
  suffix = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = displayValue;
    const endVal = value;

    if (startVal === endVal) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(startVal + progress * (endVal - startVal));
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

export const EmployeeDailyKpiHistoryTable: React.FC<EmployeeDailyKpiHistoryTableProps> = ({
  user,
  employeeUser,
  reports,
  onRefreshData,
  language = 'en'
}) => {
  const activeUser = employeeUser || user || ({} as User);
  const t = translations[language] || translations['en'];

  // Filter States
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Pagination States
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset to page 1 on filter/limit change
  useEffect(() => {
    setCurrentPage(1);
  }, [datePreset, startDate, endDate, selectedDayOfWeek, searchTerm, rowsPerPage]);

  // Modals
  const [editingReport, setEditingReport] = useState<DailyPerformanceReport | null>(null);
  const [viewingReport, setViewingReport] = useState<DailyPerformanceReport | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Filter strictly to current employee's records
  const myReports = useMemo(() => {
    return reports.filter(r =>
      r.employeeId === activeUser.id ||
      r.employee_id === activeUser.id ||
      (activeUser.userId && (r.employeeUserId === activeUser.userId || (r as any).employee_user_id === activeUser.userId)) ||
      (r.employeeName && activeUser.firstName && r.employeeName.toLowerCase().includes(activeUser.firstName.toLowerCase()))
    );
  }, [reports, activeUser]);

  // Date Boundaries Calculation
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Start of this week (Monday)
  const currentDay = now.getDay();
  const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  const mondayDate = new Date(now.setDate(diffToMonday));
  const weekStartStr = mondayDate.toISOString().split('T')[0];

  // Start of this month
  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  // Start of this year
  const yearStartStr = `${now.getFullYear()}-01-01`;

  // Helper to extract values
  const getKpiValues = (r: DailyPerformanceReport) => ({
    onboarding: Number(r.customerOnboarding ?? r.customer_onboarding ?? r.accountOpenings ?? 0),
    mobile: Number(r.mobileBanking ?? r.mobile_banking ?? r.mobileBankingActivations ?? 0),
    internet: Number(r.internetBanking ?? r.internet_banking ?? r.internetBankingActivations ?? 0),
    atm: Number(r.atmDebitCards ?? r.atm_debit_cards ?? r.atmCardActivations ?? r.atmCardsIssued ?? 0),
    merchant: Number(r.merchantSolutions ?? r.merchant_solutions ?? r.merchantSolutionsActivations ?? 0),
    deposits: Number(r.depositsETB ?? r.deposits_etb ?? 0),
    fcy: Number(r.foreignCurrencyETB ?? r.foreign_currency_etb ?? 0)
  });

  // Calculate Metrics for Summary Cards
  const summaryMetrics = useMemo(() => {
    const calcTotals = (filterFn: (r: DailyPerformanceReport) => boolean) => {
      const subset = myReports.filter(filterFn);
      return subset.reduce(
        (acc, r) => {
          const v = getKpiValues(r);
          return {
            onboarding: acc.onboarding + v.onboarding,
            mobile: acc.mobile + v.mobile,
            internet: acc.internet + v.internet,
            atm: acc.atm + v.atm,
            merchant: acc.merchant + v.merchant,
            deposits: acc.deposits + v.deposits,
            fcy: acc.fcy + v.fcy,
            count: acc.count + 1
          };
        },
        { onboarding: 0, mobile: 0, internet: 0, atm: 0, merchant: 0, deposits: 0, fcy: 0, count: 0 }
      );
    };

    return {
      today: calcTotals(r => r.reportDate === todayStr || r.report_date === todayStr),
      thisWeek: calcTotals(r => (r.reportDate || r.report_date || '') >= weekStartStr),
      thisMonth: calcTotals(r => (r.reportDate || r.report_date || '') >= monthStartStr),
      thisYear: calcTotals(r => (r.reportDate || r.report_date || '') >= yearStartStr),
      allTime: calcTotals(() => true)
    };
  }, [myReports, todayStr, weekStartStr, monthStartStr, yearStartStr]);

  // Apply Active Filters to Table (Sorted Newest First)
  const filteredReports = useMemo(() => {
    let list = [...myReports];

    // Date Preset Filter
    if (datePreset === 'today') {
      list = list.filter(r => (r.reportDate || r.report_date) === todayStr);
    } else if (datePreset === 'this_week') {
      list = list.filter(r => (r.reportDate || r.report_date || '') >= weekStartStr);
    } else if (datePreset === 'this_month') {
      list = list.filter(r => (r.reportDate || r.report_date || '') >= monthStartStr);
    } else if (datePreset === 'this_year') {
      list = list.filter(r => (r.reportDate || r.report_date || '') >= yearStartStr);
    } else if (datePreset === 'custom') {
      if (startDate) {
        list = list.filter(r => (r.reportDate || r.report_date || '') >= startDate);
      }
      if (endDate) {
        list = list.filter(r => (r.reportDate || r.report_date || '') <= endDate);
      }
    }

    // Day of Week Filter
    if (selectedDayOfWeek !== 'all') {
      list = list.filter(r => {
        const day = (r.dayOfWeek || r.day_of_week || '').toLowerCase();
        return day.includes(selectedDayOfWeek.toLowerCase());
      });
    }

    // Search Term Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(r =>
        (r.reportDate || '').toLowerCase().includes(term) ||
        (r.dayOfWeek || '').toLowerCase().includes(term) ||
        (r.status || '').toLowerCase().includes(term) ||
        (r.managerComment || '').toLowerCase().includes(term)
      );
    }

    // Sort by reportDate descending (newest first)
    list.sort((a, b) => {
      const dateA = a.reportDate || a.report_date || '';
      const dateB = b.reportDate || b.report_date || '';
      return dateB.localeCompare(dateA);
    });

    return list;
  }, [myReports, datePreset, startDate, endDate, selectedDayOfWeek, searchTerm, todayStr, weekStartStr, monthStartStr, yearStartStr]);

  // Calculate Filtered Sums
  const filteredSums = useMemo(() => {
    return filteredReports.reduce(
      (acc, r) => {
        const v = getKpiValues(r);
        return {
          onboarding: acc.onboarding + v.onboarding,
          mobile: acc.mobile + v.mobile,
          internet: acc.internet + v.internet,
          atm: acc.atm + v.atm,
          merchant: acc.merchant + v.merchant,
          deposits: acc.deposits + v.deposits,
          fcy: acc.fcy + v.fcy
        };
      },
      { onboarding: 0, mobile: 0, internet: 0, atm: 0, merchant: 0, deposits: 0, fcy: 0 }
    );
  }, [filteredReports]);

  // Pagination calculations
  const totalRecords = filteredReports.length;
  const isAll = rowsPerPage === 'all';
  const limitNum = isAll ? totalRecords : Number(rowsPerPage);
  const totalPages = isAll ? 1 : Math.ceil(totalRecords / limitNum);

  const startRecordIndex = totalRecords === 0 ? 0 : (currentPage - 1) * limitNum + 1;
  const endRecordIndex = Math.min(currentPage * limitNum, totalRecords);

  const paginatedReports = useMemo(() => {
    if (isAll) return filteredReports;
    const startIndex = (currentPage - 1) * limitNum;
    return filteredReports.slice(startIndex, startIndex + limitNum);
  }, [filteredReports, currentPage, limitNum, isAll]);

  const paginationText = isAll
    ? `Showing all ${totalRecords} records`
    : `Showing ${startRecordIndex}–${endRecordIndex} of ${totalRecords} records`;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // Handle Delete Report
  const handleDelete = async (reportId: string, date: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the KPI report for ${date}?`)) {
      try {
        await api.deleteReport(reportId);
        onRefreshData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete KPI report.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. ANIMATED SUMMARY CARDS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[#C89A2B]" />
            <h3 className="text-base font-extrabold text-white">
              Permanent Daily KPI Summary Milestones
            </h3>
          </div>
          <span className="text-xs text-[#C89A2B] font-semibold bg-[#C89A2B]/10 px-3 py-1 rounded-full border border-[#C89A2B]/30">
            {myReports.length} Historical Daily Records Stored
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          {/* Card 1: Today */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4A2C17] to-[#2E1B0E] border border-[#C89A2B]/30 text-white shadow-lg space-y-2 hover:border-[#C89A2B]/60 transition-all">
            <div className="flex items-center justify-between text-[11px] text-gray-300 font-bold uppercase tracking-wider">
              <span>Today's Total</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-white">
              <AnimatedCounter value={summaryMetrics.today.mobile + summaryMetrics.today.onboarding + summaryMetrics.today.internet + summaryMetrics.today.atm + summaryMetrics.today.merchant} suffix=" KPIs" />
            </div>
            <div className="text-[11px] text-gray-300 space-y-0.5 pt-1 border-t border-white/10">
              <div className="flex justify-between">
                <span>Mobile Banking:</span>
                <strong className="text-emerald-400"><AnimatedCounter value={summaryMetrics.today.mobile} /></strong>
              </div>
              <div className="flex justify-between">
                <span>Onboarding:</span>
                <strong className="text-blue-300"><AnimatedCounter value={summaryMetrics.today.onboarding} /></strong>
              </div>
              <div className="flex justify-between">
                <span>Merchant Solutions:</span>
                <strong className="text-amber-300"><AnimatedCounter value={summaryMetrics.today.merchant} /></strong>
              </div>
            </div>
          </div>

          {/* Card 2: This Week */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4A2C17] to-[#2E1B0E] border border-[#C89A2B]/30 text-white shadow-lg space-y-2 hover:border-[#C89A2B]/60 transition-all">
            <div className="flex items-center justify-between text-[11px] text-[#C89A2B] font-bold uppercase tracking-wider">
              <span>This Week</span>
              <span className="text-[10px] bg-[#C89A2B]/20 px-2 py-0.5 rounded-full text-[#C89A2B]">{summaryMetrics.thisWeek.count} Days</span>
            </div>
            <div className="text-2xl font-black text-[#C89A2B]">
              <AnimatedCounter value={summaryMetrics.thisWeek.mobile + summaryMetrics.thisWeek.onboarding + summaryMetrics.thisWeek.internet + summaryMetrics.thisWeek.atm + summaryMetrics.thisWeek.merchant} suffix=" KPIs" />
            </div>
            <div className="text-[11px] text-gray-300 space-y-0.5 pt-1 border-t border-white/10">
              <div className="flex justify-between">
                <span>Mobile Banking:</span>
                <strong className="text-emerald-400"><AnimatedCounter value={summaryMetrics.thisWeek.mobile} /></strong>
              </div>
              <div className="flex justify-between">
                <span>ATM Cards:</span>
                <strong className="text-violet-300"><AnimatedCounter value={summaryMetrics.thisWeek.atm} /></strong>
              </div>
              <div className="flex justify-between">
                <span>Merchant:</span>
                <strong className="text-amber-300"><AnimatedCounter value={summaryMetrics.thisWeek.merchant} /></strong>
              </div>
            </div>
          </div>

          {/* Card 3: This Month */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4A2C17] to-[#2E1B0E] border border-[#C89A2B]/30 text-white shadow-lg space-y-2 hover:border-[#C89A2B]/60 transition-all">
            <div className="flex items-center justify-between text-[11px] text-cyan-400 font-bold uppercase tracking-wider">
              <span>This Month</span>
              <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded-full text-cyan-300">{summaryMetrics.thisMonth.count} Days</span>
            </div>
            <div className="text-2xl font-black text-cyan-300">
              <AnimatedCounter value={summaryMetrics.thisMonth.mobile + summaryMetrics.thisMonth.onboarding + summaryMetrics.thisMonth.internet + summaryMetrics.thisMonth.atm + summaryMetrics.thisMonth.merchant} suffix=" KPIs" />
            </div>
            <div className="text-[11px] text-gray-300 space-y-0.5 pt-1 border-t border-white/10">
              <div className="flex justify-between">
                <span>Mobile Banking:</span>
                <strong className="text-emerald-400"><AnimatedCounter value={summaryMetrics.thisMonth.mobile} /></strong>
              </div>
              <div className="flex justify-between">
                <span>Internet Banking:</span>
                <strong className="text-cyan-300"><AnimatedCounter value={summaryMetrics.thisMonth.internet} /></strong>
              </div>
              <div className="flex justify-between">
                <span>Deposits:</span>
                <strong className="text-emerald-400 font-mono">ETB <AnimatedCounter value={summaryMetrics.thisMonth.deposits} /></strong>
              </div>
            </div>
          </div>

          {/* Card 4: This Year */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4A2C17] to-[#2E1B0E] border border-[#C89A2B]/30 text-white shadow-lg space-y-2 hover:border-[#C89A2B]/60 transition-all">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
              <span>This Year</span>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300">{summaryMetrics.thisYear.count} Days</span>
            </div>
            <div className="text-2xl font-black text-emerald-300">
              <AnimatedCounter value={summaryMetrics.thisYear.mobile + summaryMetrics.thisYear.onboarding + summaryMetrics.thisYear.internet + summaryMetrics.thisYear.atm + summaryMetrics.thisYear.merchant} suffix=" KPIs" />
            </div>
            <div className="text-[11px] text-gray-300 space-y-0.5 pt-1 border-t border-white/10">
              <div className="flex justify-between">
                <span>Mobile Banking:</span>
                <strong className="text-emerald-400"><AnimatedCounter value={summaryMetrics.thisYear.mobile} /></strong>
              </div>
              <div className="flex justify-between">
                <span>ATM Cards:</span>
                <strong className="text-violet-300"><AnimatedCounter value={summaryMetrics.thisYear.atm} /></strong>
              </div>
              <div className="flex justify-between">
                <span>Merchant:</span>
                <strong className="text-amber-300"><AnimatedCounter value={summaryMetrics.thisYear.merchant} /></strong>
              </div>
            </div>
          </div>

          {/* Card 5: All Time */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6B3F1D] via-[#4A2C17] to-[#362011] border-2 border-[#C89A2B]/60 text-white shadow-xl space-y-2 hover:brightness-110 transition-all">
            <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#C89A2B]" />
                All Time Record
              </span>
              <span className="text-[10px] bg-[#C89A2B] text-[#6B3F1D] font-extrabold px-2 py-0.5 rounded-full">Permanent</span>
            </div>
            <div className="text-2xl font-black text-[#D8B45C]">
              <AnimatedCounter value={summaryMetrics.allTime.mobile + summaryMetrics.allTime.onboarding + summaryMetrics.allTime.internet + summaryMetrics.allTime.atm + summaryMetrics.allTime.merchant} suffix=" Total" />
            </div>
            <div className="text-[11px] text-gray-200 space-y-0.5 pt-1 border-t border-white/10">
              <div className="flex justify-between">
                <span>Total Mobile:</span>
                <strong className="text-emerald-400"><AnimatedCounter value={summaryMetrics.allTime.mobile} /></strong>
              </div>
              <div className="flex justify-between">
                <span>Total Merchants:</span>
                <strong className="text-amber-300"><AnimatedCounter value={summaryMetrics.allTime.merchant} /></strong>
              </div>
              <div className="flex justify-between">
                <span>Total Deposits:</span>
                <strong className="text-[#C89A2B] font-mono">ETB <AnimatedCounter value={summaryMetrics.allTime.deposits} /></strong>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. FILTER CONTROLS & DATE PRESETS */}
      <div className="p-5 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/40 shadow-xl text-white space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Quick Date Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#C89A2B] flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Date Filter:
            </span>

            {[
              { id: 'all', label: 'All Dates' },
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'this_year', label: 'This Year' },
              { id: 'custom', label: 'Custom Range' }
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setDatePreset(preset.id as DatePreset)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  datePreset === preset.id
                    ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Export & Actions Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B3F1D] to-[#4A2C17] border border-[#C89A2B]/50 text-white font-extrabold text-xs shadow-md hover:brightness-110 flex items-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4 text-[#C89A2B]" />
              <span>Export Filtered Table ({filteredReports.length})</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#C89A2B]" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#4A2C17] border border-[#C89A2B]/40 shadow-2xl z-30 p-2 space-y-1">
                <button
                  onClick={() => {
                    downloadReportExcel(filteredReports, getUserFullName(user), user);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 flex items-center space-x-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Excel Spreadsheet (.xlsx)</span>
                </button>
                <button
                  onClick={() => {
                    downloadReportCSV(filteredReports, getUserFullName(user));
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 flex items-center space-x-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  <span>CSV File (.csv)</span>
                </button>
                <button
                  onClick={() => {
                    printOrDownloadPDF(filteredReports, getUserFullName(user), user);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 flex items-center space-x-2.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>PDF Document / Print</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Secondary Filter Row: Custom Dates + Day of Week + Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 border-t border-white/10">
          
          {/* Custom Date Range Pickers (shown when custom is selected, or always as quick range) */}
          {datePreset === 'custom' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                />
              </div>
            </>
          )}

          {/* Day of Week Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1">Day of Week</label>
            <select
              value={selectedDayOfWeek}
              onChange={(e) => setSelectedDayOfWeek(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-[#C89A2B]"
            >
              <option value="all">All Days (Mon - Sat)</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>

          {/* Search Filter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-[11px] font-bold text-gray-300 mb-1">Quick Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by date, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#C89A2B]"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 3. HISTORICAL PERFORMANCE TABLE WITH FILTERED SUMS FOOTER */}
      <div className="p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/40 shadow-xl text-white space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#C89A2B]" />
              My Permanent Daily KPI Performance History
            </h3>
            <p className="text-xs text-gray-300">
              {paginationText} (sorted newest first). Every daily report remains permanently preserved.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
            {/* Rows per page selector dropdown */}
            <div className="flex items-center space-x-2 text-xs text-gray-300">
              <span>Rows per page:</span>
              <select
                id="rows-per-page-select"
                value={rowsPerPage}
                onChange={(e) => {
                  const val = e.target.value;
                  setRowsPerPage(val === 'all' ? 'all' : Number(val));
                }}
                className="bg-black/40 border border-white/20 text-white font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C89A2B] cursor-pointer"
              >
                <option value={5}>5 rows</option>
                <option value={10}>10 rows</option>
                <option value={15}>15 rows</option>
                <option value={20}>20 rows</option>
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
                <option value={100}>100 rows</option>
                <option value="all">All rows</option>
              </select>
            </div>

            <button
              onClick={onRefreshData}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors border border-white/10"
              title="Refresh KPI Records"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-2">
            <Calendar className="w-8 h-8 text-[#C89A2B] mx-auto opacity-60" />
            <p className="font-bold text-white text-sm">No Daily KPI Records Found for Selected Filter</p>
            <p className="text-gray-400 text-[11px]">
              Adjust your date filter presets or submit your daily performance using the form above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs text-gray-300 min-w-[900px]">
                
                {/* Sticky Header */}
                <thead className="bg-[#6B3F1D] text-[#C89A2B] font-bold uppercase text-[11px] sticky top-0 z-10">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Day of Week</th>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5 text-center">Customer Onboarding</th>
                  <th className="p-3.5 text-center">Mobile Banking</th>
                  <th className="p-3.5 text-center">Internet Banking</th>
                  <th className="p-3.5 text-center">ATM Debit Cards</th>
                  <th className="p-3.5 text-center">Merchant Solutions</th>
                  <th className="p-3.5 text-right">Deposit Mobilized (ETB)</th>
                  <th className="p-3.5 text-right">FCY (USD)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-white/10 bg-black/20">
                {paginatedReports.map((report) => {
                  const vals = getKpiValues(report);
                  const reportDateStr = report.reportDate || report.report_date || '';
                  const dayStr = report.dayOfWeek || report.day_of_week || 'Weekday';

                  return (
                    <tr key={report.id} className="hover:bg-white/5 transition-colors">
                      
                      {/* Date */}
                      <td className="p-3.5 font-mono font-bold text-[#C89A2B] whitespace-nowrap">
                        {reportDateStr}
                      </td>

                      {/* Day of Week Rounded Badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getDayBadgeColor(dayStr)}`}>
                          {dayStr}
                        </span>
                      </td>

                      {/* Employee */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-white text-xs">{report.employeeName || report.employee_name || getUserFullName(user)}</div>
                        <div className="text-[10px] text-gray-400">ID: {report.employeeUserId || report.employeeId || user.id} • SOL 360</div>
                      </td>

                      {/* Customer Onboarding */}
                      <td className="p-3.5 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-lg font-bold text-xs ${
                          vals.onboarding > 0 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-gray-500'
                        }`}>
                          {vals.onboarding}
                        </span>
                      </td>

                      {/* Mobile Banking */}
                      <td className="p-3.5 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[28px] px-2.5 py-0.5 rounded-lg font-black text-xs shadow ${
                          vals.mobile > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-gray-500'
                        }`}>
                          {vals.mobile}
                        </span>
                      </td>

                      {/* Internet Banking */}
                      <td className="p-3.5 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-lg font-bold text-xs ${
                          vals.internet > 0 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-gray-500'
                        }`}>
                          {vals.internet}
                        </span>
                      </td>

                      {/* ATM Debit Cards */}
                      <td className="p-3.5 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-lg font-bold text-xs ${
                          vals.atm > 0 ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-gray-500'
                        }`}>
                          {vals.atm}
                        </span>
                      </td>

                      {/* Merchant Solutions */}
                      <td className="p-3.5 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-lg font-bold text-xs ${
                          vals.merchant > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-gray-500'
                        }`}>
                          {vals.merchant}
                        </span>
                      </td>

                      {/* Deposits Mobilized ETB */}
                      <td className="p-3.5 text-right font-mono font-semibold text-emerald-300 whitespace-nowrap">
                        ETB {vals.deposits.toLocaleString()}
                      </td>

                      {/* Foreign Currency (FCY) */}
                      <td className="p-3.5 text-right font-mono font-semibold text-amber-300 whitespace-nowrap">
                        USD {vals.fcy.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          report.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          report.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          report.status === 'Returned' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {report.status || 'Pending'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingReport(report)}
                            title="View Full Report Details"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-cyan-300 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingReport(report)}
                            title="Edit KPI Values"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-[#C89A2B] transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(report.id, reportDateStr)}
                            title="Delete Daily Record"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

              {/* 4. STICKY FILTERED SUMS ROW AT BOTTOM */}
              <tfoot className="bg-gradient-to-r from-[#6B3F1D] via-[#4A2C17] to-[#362011] text-white font-extrabold border-t-2 border-[#C89A2B]">
                <tr>
                  <td colSpan={3} className="p-4 text-xs font-black text-[#D8B45C] uppercase tracking-wider">
                    FILTERED SUMS ({filteredReports.length} records)
                  </td>
                  <td className="p-4 text-center font-black text-blue-300 text-sm">
                    <AnimatedCounter value={filteredSums.onboarding} />
                  </td>
                  <td className="p-4 text-center font-black text-emerald-300 text-sm">
                    <AnimatedCounter value={filteredSums.mobile} />
                  </td>
                  <td className="p-4 text-center font-black text-cyan-300 text-sm">
                    <AnimatedCounter value={filteredSums.internet} />
                  </td>
                  <td className="p-4 text-center font-black text-violet-300 text-sm">
                    <AnimatedCounter value={filteredSums.atm} />
                  </td>
                  <td className="p-4 text-center font-black text-amber-300 text-sm">
                    <AnimatedCounter value={filteredSums.merchant} />
                  </td>
                  <td className="p-4 text-right font-mono font-black text-emerald-300 text-sm whitespace-nowrap">
                    ETB <AnimatedCounter value={filteredSums.deposits} />
                  </td>
                  <td className="p-4 text-right font-mono font-black text-amber-300 text-sm whitespace-nowrap">
                    ETB <AnimatedCounter value={filteredSums.fcy} />
                  </td>
                  <td colSpan={2} className="p-4 text-right text-[11px] text-gray-300 font-normal">
                    Permanent Records Saved
                  </td>
                </tr>
              </tfoot>

            </table>
          </div>

          {/* Pagination Controls */}
          {!isAll && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-gray-300">
              <div>
                Showing <strong className="text-white">{startRecordIndex}–{endRecordIndex}</strong> of <strong className="text-[#C89A2B]">{totalRecords}</strong> records
              </div>

              <div className="flex items-center space-x-1">
                {/* Previous Button */}
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 disabled:hover:bg-white/5 disabled:cursor-not-allowed border border-white/10 transition-colors"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((pageNum, idx) => {
                  if (pageNum === '...') {
                    return (
                      <span key={`dots-${idx}`} className="px-2 text-gray-500 font-bold">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={`page-${pageNum}`}
                      type="button"
                      onClick={() => setCurrentPage(Number(pageNum))}
                      className={`min-w-[32px] h-8 flex items-center justify-center rounded-xl font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md font-extrabold'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 disabled:hover:bg-white/5 disabled:cursor-not-allowed border border-white/10 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      </div>

      {/* 5. EDIT KPI MODAL */}
      {editingReport && (
        <DailyKpiEditModal
          report={editingReport}
          isOpen={!!editingReport}
          onClose={() => setEditingReport(null)}
          onSaved={() => {
            onRefreshData();
            setEditingReport(null);
          }}
        />
      )}

      {/* 6. VIEW DETAILS MODAL */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#4A2C17] border border-[#C89A2B]/40 rounded-3xl p-6 w-full max-w-lg text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C89A2B]/20 text-[#C89A2B] uppercase">
                  Daily Performance Entry Details
                </span>
                <h3 className="font-extrabold text-lg text-white mt-1">
                  {viewingReport.reportDate} ({viewingReport.dayOfWeek})
                </h3>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Customer Onboarding</span>
                <strong className="text-blue-300 text-sm font-bold">
                  {viewingReport.customerOnboarding ?? viewingReport.accountOpenings ?? 0} Accounts
                </strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Mobile Banking</span>
                <strong className="text-emerald-400 text-sm font-bold">
                  {viewingReport.mobileBanking ?? viewingReport.mobileBankingActivations ?? 0} Users
                </strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Internet Banking</span>
                <strong className="text-cyan-300 text-sm font-bold">
                  {viewingReport.internetBanking ?? viewingReport.internetBankingActivations ?? 0} Clients
                </strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">ATM Debit Cards</span>
                <strong className="text-violet-300 text-sm font-bold">
                  {viewingReport.atmDebitCards ?? viewingReport.atmCardsIssued ?? 0} Cards
                </strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Merchant Solutions</span>
                <strong className="text-amber-300 text-sm font-bold">
                  {viewingReport.merchantSolutions ?? viewingReport.merchantSolutionsActivations ?? 0} Merchants
                </strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Deposits Mobilized</span>
                <strong className="text-emerald-400 text-sm font-bold font-mono">
                  ETB {(viewingReport.depositsETB ?? viewingReport.deposits_etb ?? 0).toLocaleString()}
                </strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Foreign Currency (FCY)</span>
                <strong className="text-amber-300 text-sm font-bold font-mono">
                  USD {(viewingReport.foreignCurrencyETB ?? viewingReport.foreign_currency_etb ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            {viewingReport.managerComment && (
              <div className="p-3 bg-black/30 border border-[#C89A2B]/30 rounded-xl text-xs">
                <span className="text-[#C89A2B] font-bold block mb-0.5">Manager Feedback & Notes:</span>
                <p className="text-gray-200">{viewingReport.managerComment}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setEditingReport(viewingReport);
                  setViewingReport(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#C89A2B] font-bold text-xs flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit This Report</span>
              </button>

              <button
                onClick={() => setViewingReport(null)}
                className="px-5 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs hover:bg-[#D8B45C]"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
