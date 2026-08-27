import React, { useState, useMemo } from 'react';
import {
  Send,
  Save,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Award,
  TrendingUp,
  Award as Medal,
  Calendar,
  AlertCircle,
  Clock,
  Zap,
  DollarSign,
  Smartphone,
  Info,
  UserCheck,
  Download,
  FileSpreadsheet,
  FileText,
  File,
  Printer,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Filter,
  BarChart3,
  Globe,
  CreditCard,
  QrCode,
  UserPlus,
  Coins,
  MessageSquare,
  Target
} from 'lucide-react';
import { User, DailyPerformanceReport, PerformanceTarget, BankHoliday, getUserFullName, Language } from '../../types';
import { api } from '../../services/api';
import { AllProductsOverview } from './AllProductsOverview';
import { BranchCampaignWidget } from './BranchCampaignWidget';
import { SubmitReportSection } from '../reports/SubmitReportSection';
import { EmployeeDailyKpiHistoryTable } from './EmployeeDailyKpiHistoryTable';
import { MessagingCenter } from '../common/MessagingCenter';
import { BankMemoLibrary } from '../common/BankMemoLibrary';
import { EmployeeKpiAgreementPanel } from './EmployeeKpiAgreementPanel';
import { downloadReportCSV, downloadReportExcel, downloadReportWord, printOrDownloadPDF } from '../../utils/exportUtils';
import { translations } from '../../i18n/translations';

interface EmployeeDashboardProps {
  user: User;
  reports: DailyPerformanceReport[];
  targets: PerformanceTarget[];
  holidays: BankHoliday[];
  onRefreshData: () => void;
  onOpenAiAssistant: () => void;
  onOpenProfile?: () => void;
  language?: Language;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  user,
  reports,
  targets,
  holidays,
  onRefreshData,
  onOpenAiAssistant,
  onOpenProfile,
  language = 'en'
}) => {
  const t = translations[language] || translations['en'];
  const [activeTab, setActiveTab] = useState<'daily_kpi' | 'create_report' | 'my_targets' | 'analytics' | 'messages' | 'memos'>('daily_kpi');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'quarter' | 'semiannual' | 'year' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Count pending KPI targets specifically assigned to this employee
  const userLower = user.id.toLowerCase();
  const myAssignedTargets = useMemo(() => {
    return targets.filter(t => {
      const tEmp = String(t.employeeId || t.employee_id || '').toLowerCase();
      return tEmp === userLower || (user.userId && tEmp === user.userId.toLowerCase());
    });
  }, [targets, user, userLower]);

  const pendingKpiCount = useMemo(() => {
    return myAssignedTargets.filter(t => t.status === 'PENDING_ACCEPTANCE').length;
  }, [myAssignedTargets]);

  // 1. Strictly isolate Employee's Personal Reports (Enforcing Privacy Rule)
  const myReports = useMemo(() => {
    return reports.filter(r => 
      r.employeeId === user.id || 
      (user.userId && r.employeeUserId === user.userId) || 
      (r.employeeName && user.firstName && r.employeeName.toLowerCase().includes(user.firstName.toLowerCase()))
    );
  }, [reports, user]);

  // 2. Approved Reports Only (Strictly for official performance metrics & scores)
  const myApprovedReports = useMemo(() => {
    return myReports.filter(r => r.status === 'Approved');
  }, [myReports]);

  // 3. Pending & Draft Submissions Count
  const myPendingReports = useMemo(() => {
    return myReports.filter(r => r.status === 'Pending' || r.status === 'Submitted');
  }, [myReports]);

  const myDraftReports = useMemo(() => {
    return myReports.filter(r => r.status === 'Draft');
  }, [myReports]);

  // 4. Date-Filtered Approved Reports for Personal Performance Evaluation
  const filteredApprovedReports = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10);

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const currentQuarter = Math.floor(currentMonth / 3) + 1; // 1-4
    const currentHalf = currentMonth < 6 ? 1 : 2; // 1-2
    const firstDayOfQuarter = new Date(currentYear, (currentQuarter - 1) * 3, 1).toISOString().substring(0, 10);
    const firstDayOfHalf = new Date(currentYear, (currentHalf - 1) * 6, 1).toISOString().substring(0, 10);
    const firstDayOfYear = new Date(currentYear, 0, 1).toISOString().substring(0, 10);

    return myApprovedReports.filter(r => {
      const d = r.reportDate || r.report_date || '';
      if (!d) return false;

      if (dateFilter === 'today') return d === todayStr;
      if (dateFilter === 'week') return d >= oneWeekAgo && d <= todayStr;
      if (dateFilter === 'month') return d >= firstDayOfMonth && d <= todayStr;
      if (dateFilter === 'quarter') return d >= firstDayOfQuarter && d <= todayStr;
      if (dateFilter === 'semiannual') return d >= firstDayOfHalf && d <= todayStr;
      if (dateFilter === 'year') return d >= firstDayOfYear && d <= todayStr;
      if (dateFilter === 'custom') {
        if (customStartDate && d < customStartDate) return false;
        if (customEndDate && d > customEndDate) return false;
        return true;
      }
      return true;
    });
  }, [myApprovedReports, dateFilter, customStartDate, customEndDate]);

  // Targets & Progress Calculations (using Approved reports only)
  // 1. Deposits Mobilized (ETB)
  const depTargetObj = targets.find(t => (t.employeeId === user.id || t.branchId === user.branchId) && (t.kpiName && t.kpiName.toLowerCase().includes('deposit') || t.kpiId === 'KPI-001'));
  const depositTarget = depTargetObj ? depTargetObj.targetValue : 0;
  const actualDeposits = filteredApprovedReports.reduce((acc, r) => acc + (r.depositsETB || r.deposits_etb || 0), 0);
  const depositCompletionPct = depositTarget > 0 ? Math.min(Math.round((actualDeposits / depositTarget) * 100), 100) : 0;

  // 2. Mobile Banking Activations
  const mobileTargetObj = targets.find(t => (t.employeeId === user.id || t.branchId === user.branchId) && (t.kpiName && t.kpiName.toLowerCase().includes('mobile') || t.kpiId === 'KPI-005'));
  const mobileTarget = mobileTargetObj ? mobileTargetObj.targetValue : 0;
  const actualMobile = filteredApprovedReports.reduce((acc, r) => acc + (r.mobileBankingActivations || r.mobileBanking || r.mobile_banking || 0), 0);
  const mobileCompletionPct = mobileTarget > 0 ? Math.min(Math.round((actualMobile / mobileTarget) * 100), 100) : 0;

  // 3. Account Openings / Customer Onboarding
  const accTargetObj = targets.find(t => (t.employeeId === user.id || t.branchId === user.branchId) && (t.kpiName && (t.kpiName.toLowerCase().includes('account') || t.kpiName.toLowerCase().includes('onboard')) || t.kpiId === 'KPI-004'));
  const accTarget = accTargetObj ? accTargetObj.targetValue : 0;
  const actualAccountOpenings = filteredApprovedReports.reduce((acc, r) => acc + (r.accountOpenings || r.customerOnboarding || r.customer_onboarding || 0), 0);
  const accCompletionPct = accTarget > 0 ? Math.min(Math.round((actualAccountOpenings / accTarget) * 100), 100) : 0;

  // 4. Digital Financial Services Volume (ETB)
  const dfsTargetObj = targets.find(t => (t.employeeId === user.id || t.branchId === user.branchId) && (t.kpiName && (t.kpiName.toLowerCase().includes('digital') || t.kpiName.toLowerCase().includes('dfs')) || t.kpiId === 'KPI-003'));
  const dfsTarget = dfsTargetObj ? dfsTargetObj.targetValue : 0;
  const actualDigitalVol = filteredApprovedReports.reduce((acc, r) => acc + (r.digitalFinancialServicesETB || r.digital_financial_services_etb || 0), 0);
  const dfsCompletionPct = dfsTarget > 0 ? Math.min(Math.round((actualDigitalVol / dfsTarget) * 100), 100) : 0;

  // 5. Foreign Currency Inflow (FCY)
  const fcyTargetObj = targets.find(t => (t.employeeId === user.id || t.branchId === user.branchId) && (t.kpiName && (t.kpiName.toLowerCase().includes('foreign') || t.kpiName.toLowerCase().includes('fcy') || t.kpiName.toLowerCase().includes('currency')) || t.kpiId === 'KPI-002'));
  const fcyTarget = fcyTargetObj ? fcyTargetObj.targetValue : 0;
  const actualFcy = filteredApprovedReports.reduce((acc, r) => acc + (r.foreignCurrencyETB || r.foreign_currency_etb || 0), 0);
  const fcyCompletionPct = fcyTarget > 0 ? Math.min(Math.round((actualFcy / fcyTarget) * 100), 100) : 0;

  // 6. ATM / Debit Cards Issued
  const atmTargetObj = targets.find(t => (t.employeeId === user.id || t.branchId === user.branchId) && (t.kpiName && (t.kpiName.toLowerCase().includes('atm') || t.kpiName.toLowerCase().includes('card') || t.kpiName.toLowerCase().includes('debit')) || t.kpiId === 'KPI-008'));
  const atmTarget = atmTargetObj ? atmTargetObj.targetValue : 0;
  const actualAtm = filteredApprovedReports.reduce((acc, r) => acc + (r.atmCardActivations || r.atmCardsIssued || r.atmDebitCards || r.atm_debit_cards || 0), 0);
  const atmCompletionPct = atmTarget > 0 ? Math.min(Math.round((actualAtm / atmTarget) * 100), 100) : 0;

  // 7. Merchant Solutions & QR Acquisition
  const merchantTargetObj = targets.find(t => (t.employeeId === user.id || t.branchId === user.branchId) && (t.kpiName && (t.kpiName.toLowerCase().includes('merchant') || t.kpiName.toLowerCase().includes('pos') || t.kpiName.toLowerCase().includes('qr')) || t.kpiId === 'KPI-007'));
  const merchantTarget = merchantTargetObj ? merchantTargetObj.targetValue : 0;
  const actualMerchant = filteredApprovedReports.reduce((acc, r) => acc + (r.merchantSolutions || r.merchantSolutionsActivations || r.merchant_solutions || 0), 0);
  const merchantCompletionPct = merchantTarget > 0 ? Math.min(Math.round((actualMerchant / merchantTarget) * 100), 100) : 0;

  // 8. Internet / Corporate Banking
  const ibTargetObj = targets.find(t => (t.employeeId === user.id || t.branchId === user.branchId) && (t.kpiName && (t.kpiName.toLowerCase().includes('internet') || t.kpiName.toLowerCase().includes('corporate') || t.kpiName.toLowerCase().includes('web')) || t.kpiId === 'KPI-006'));
  const ibTarget = ibTargetObj ? ibTargetObj.targetValue : 0;
  const actualIb = filteredApprovedReports.reduce((acc, r) => acc + (r.internetBankingActivations || r.internetBanking || r.internet_banking || 0), 0);
  const ibCompletionPct = ibTarget > 0 ? Math.min(Math.round((actualIb / ibTarget) * 100), 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Employee Details & Actions */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#6B3F1D] via-[#4A2C17] to-[#362011] border border-[#C89A2B]/30 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#C89A2B] text-[#6B3F1D] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
              Employee Self-Service
            </span>
            <span className="text-xs text-gray-300">{user.jobTitle} • {user.branchName}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Welcome, {getUserFullName(user)}!
          </h2>
          <p className="text-xs text-gray-300 mt-0.5">
            Record daily performance metrics, track verified KPI progress & submit reports for approval
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Download My Report Multi-Format Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C89A2B] via-[#D8B45C] to-[#A37B1E] text-[#6B3F1D] font-black text-xs shadow-lg hover:brightness-110 flex items-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4 text-[#6B3F1D]" />
              <span>{t.downloadMyReport || 'Download My Report'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B3F1D]" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#4A2C17] border border-[#C89A2B]/40 shadow-2xl z-30 p-2 space-y-1">
                <div className="px-3 py-1.5 border-b border-white/10">
                  <p className="text-[10px] font-bold text-[#C89A2B] uppercase">Export Personal Data</p>
                </div>
                
                <button
                  onClick={() => {
                    downloadReportExcel(myReports, getUserFullName(user), user);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 flex items-center space-x-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Excel Spreadsheet (.xlsx)</span>
                </button>

                <button
                  onClick={() => {
                    downloadReportCSV(myReports, getUserFullName(user));
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 flex items-center space-x-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  <span>CSV File (.csv)</span>
                </button>

                <button
                  onClick={() => {
                    downloadReportWord(myReports, getUserFullName(user), user);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 flex items-center space-x-2.5 transition-colors"
                >
                  <File className="w-4 h-4 text-blue-400" />
                  <span>Word Document (.docx)</span>
                </button>

                <button
                  onClick={() => {
                    printOrDownloadPDF(myReports, getUserFullName(user), user);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 flex items-center space-x-2.5 transition-colors"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>PDF Document / Print</span>
                </button>
              </div>
            )}
          </div>

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="px-4 py-2.5 rounded-xl bg-[#4A2C17] hover:bg-white/10 border border-[#C89A2B]/40 text-xs font-bold flex items-center space-x-2 text-[#C89A2B]"
            >
              <UserCheck className="w-4 h-4 text-[#C89A2B]" />
              <span>{t.myRoleProfile || 'My Role Profile'}</span>
            </button>
          )}

          <button
            onClick={onOpenAiAssistant}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-[#C89A2B]" />
            <span>{t.askAiCoach || 'Ask AI Performance Coach'}</span>
          </button>
        </div>
      </div>

      {/* PENDING KPI TARGETS ALERT BANNER */}
      {pendingKpiCount > 0 && activeTab !== 'my_targets' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-[#4A2C17] to-[#3A1F0D] border-2 border-amber-400 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/50 flex-shrink-0 text-amber-300">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black uppercase tracking-wider">
                  Action Required
                </span>
                <span className="text-xs font-black text-amber-300">
                  Target Agreement Pending Sign-off
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-white mt-1">
                You have {pendingKpiCount} proposed KPI target(s) from your Branch Manager awaiting your agreement.
              </h4>
              <p className="text-xs text-amber-100 font-medium leading-relaxed mt-0.5">
                Review and either Accept to activate your official performance plan or Reject with feedback.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('my_targets')}
            className="px-5 py-2.5 rounded-xl bg-[#C89A2B] hover:bg-[#D8B45C] text-[#3A1F0D] text-xs font-black shadow-xl flex items-center justify-center space-x-2 whitespace-nowrap active:scale-95 transition-all self-end sm:self-center cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>Review & Respond to Targets</span>
          </button>
        </div>
      )}

      {/* TOP DASHBOARD NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-3 p-2 bg-[#4A2C17]/80 backdrop-blur-md rounded-2xl border border-[#C89A2B]/40 shadow-lg">
        
        {/* Tab 1: Daily KPI Performance */}
        <button
          onClick={() => setActiveTab('daily_kpi')}
          className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center space-x-2.5 transition-all shadow-md ${
            activeTab === 'daily_kpi'
              ? 'bg-[#C89A2B] text-[#6B3F1D] ring-2 ring-[#C89A2B]/50'
              : 'bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily KPI Performance</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeTab === 'daily_kpi' ? 'bg-[#6B3F1D] text-[#C89A2B]' : 'bg-white/10 text-gray-300'
          }`}>
            {myReports.length}
          </span>
        </button>

        {/* Tab 2: Create Daily Report */}
        <button
          onClick={() => setActiveTab('create_report')}
          className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center space-x-2.5 transition-all shadow-md ${
            activeTab === 'create_report'
              ? 'bg-[#C89A2B] text-[#6B3F1D] ring-2 ring-[#C89A2B]/50'
              : 'bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Daily Report</span>
          {myPendingReports.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-black">
              {myPendingReports.length} Pending
            </span>
          )}
        </button>

        {/* Tab 3: My KPI Targets & Agreement */}
        <button
          onClick={() => setActiveTab('my_targets')}
          className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center space-x-2.5 transition-all shadow-md relative ${
            activeTab === 'my_targets'
              ? 'bg-[#C89A2B] text-[#6B3F1D] ring-2 ring-[#C89A2B]/50'
              : 'bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>My KPI Targets</span>
          {pendingKpiCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-black animate-pulse">
              {pendingKpiCount} Action Req.
            </span>
          ) : myAssignedTargets.length > 0 ? (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'my_targets' ? 'bg-[#6B3F1D] text-[#C89A2B]' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {myAssignedTargets.length}
            </span>
          ) : null}
        </button>

        {/* Tab 4: Target & Progress Analytics */}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center space-x-2.5 transition-all shadow-md ${
            activeTab === 'analytics'
              ? 'bg-[#C89A2B] text-[#6B3F1D] ring-2 ring-[#C89A2B]/50'
              : 'bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Target & Progress Analytics</span>
        </button>

        {/* Tab 5: Messages / Inbox */}
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center space-x-2.5 transition-all shadow-md ${
            activeTab === 'messages'
              ? 'bg-[#C89A2B] text-[#6B3F1D] ring-2 ring-[#C89A2B]/50'
              : 'bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Messages & Inbox</span>
        </button>

        {/* Tab 6: Bank Memos & Digital Library */}
        <button
          onClick={() => setActiveTab('memos')}
          className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center space-x-2.5 transition-all shadow-md ${
            activeTab === 'memos'
              ? 'bg-[#C89A2B] text-[#6B3F1D] ring-2 ring-[#C89A2B]/50'
              : 'bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Bank Memos & Digital Library</span>
        </button>

      </div>

      {/* TAB CONTENT: MY KPI TARGETS & AGREEMENT PANEL */}
      {activeTab === 'my_targets' && (
        <EmployeeKpiAgreementPanel
          user={user}
          targets={targets}
          onRefreshData={onRefreshData}
        />
      )}

      {/* TAB CONTENT: 4. MESSAGES / INBOX */}
      {activeTab === 'messages' && (
        <MessagingCenter currentUser={user} employees={[]} />
      )}

      {/* TAB CONTENT: 5. BANK MEMOS & DIGITAL LIBRARY */}
      {activeTab === 'memos' && (
        <BankMemoLibrary currentUser={user} />
      )}

      {/* TAB CONTENT: 1. DAILY KPI PERFORMANCE */}
      {activeTab === 'daily_kpi' && (
        <div className="space-y-6">
          {/* Pending Submissions Warning / Status Banner */}
          {myPendingReports.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#3A1F0D] border-2 border-[#C89A2B]/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-[#C89A2B]/20 border border-[#C89A2B]/40 flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#C89A2B]" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white tracking-wide">
                    {myPendingReports.length} Daily Report(s) Submitted & Pending Approval
                  </h4>
                  <p className="text-xs text-amber-100 font-medium leading-relaxed mt-0.5">
                    Performance scores and achievement statistics only include verified, Approved reports. Once your branch manager approves these entries, your metrics will update automatically.
                  </p>
                </div>
              </div>
              <div className="flex items-center self-end sm:self-center">
                <span className="px-3.5 py-1.5 rounded-xl bg-[#C89A2B] text-[#3A1F0D] text-xs font-black shadow-md border border-[#E0B853] whitespace-nowrap">
                  {myPendingReports.length} Pending
                </span>
              </div>
            </div>
          )}

          {/* PERMANENT DAILY KPI PERFORMANCE HISTORY TABLE WITH AGGREGATIONS & STATUS BADGES */}
          <EmployeeDailyKpiHistoryTable
            employeeUser={user}
            reports={myReports}
            onRefreshData={onRefreshData}
            language={language}
          />
        </div>
      )}

      {/* TAB CONTENT: 2. CREATE DAILY REPORT */}
      {activeTab === 'create_report' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C89A2B] animate-ping" />
              <h3 className="text-base font-extrabold text-[#C89A2B] uppercase tracking-wider">
                Create Daily Performance Report
              </h3>
            </div>
            <span className="text-xs text-gray-400">Step 1: Enter Figures &rarr; Step 2: Submit for Approval &rarr; Step 3: Verified by Approver</span>
          </div>

          <SubmitReportSection
            user={user}
            reports={myReports}
            holidays={holidays}
            onRefreshData={() => {
              onRefreshData();
              setActiveTab('daily_kpi');
            }}
            language={language}
          />
        </div>
      )}

      {/* TAB CONTENT: 3. TARGET & PROGRESS ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* DEDICATED EMPLOYEE PERFORMANCE VIEW & DATE FILTERING */}
          <div className="p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/40 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-[#C89A2B]" />
                  <h3 className="text-lg font-black text-white">
                    My Performance & Achievements ({getUserFullName(user)})
                  </h3>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Verified individual performance metrics based on approved daily reports
                </p>
              </div>

              {/* Date Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: 'This Week' },
                  { id: 'month', label: 'This Month' },
                  { id: 'quarter', label: 'Quarterly' },
                  { id: 'semiannual', label: 'Semi-Annually' },
                  { id: 'year', label: 'Yearly' },
                  { id: 'custom', label: 'Custom Range' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setDateFilter(item.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      dateFilter === item.id
                        ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md font-black'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range Picker */}
            {dateFilter === 'custom' && (
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#C89A2B]" />
                  Select Date Range:
                </span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                />
                <span className="text-xs text-gray-400">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                />
                {(customStartDate || customEndDate) && (
                  <button
                    onClick={() => { setCustomStartDate(''); setCustomEndDate(''); }}
                    className="text-xs text-red-400 hover:underline ml-2"
                  >
                    Clear Range
                  </button>
                )}
              </div>
            )}

            {/* Speedometer & Target Gauge Cards - All 8 Bunna Bank Core KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1. Deposits */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-[#C89A2B]/40 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#C89A2B]" />
                    <span className="text-xs text-gray-300 font-semibold">Approved Deposits</span>
                  </div>
                  <span className="text-xs font-bold text-[#C89A2B]">
                    {depositTarget > 0 ? `${depositCompletionPct}%` : 'Verified'}
                  </span>
                </div>
                <h4 className="text-lg font-black text-white">
                  ETB {actualDeposits.toLocaleString()}
                </h4>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C89A2B] h-full transition-all duration-500"
                    style={{ width: `${depositTarget > 0 ? depositCompletionPct : (actualDeposits > 0 ? 100 : 0)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  {depositTarget > 0 ? `Target: ETB ${depositTarget.toLocaleString()}` : 'From approved daily reports'}
                </p>
              </div>

              {/* 2. Foreign Currency (FCY) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-emerald-500/40 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs text-gray-300 font-semibold">Foreign Currency (FCY)</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    {fcyTarget > 0 ? `${fcyCompletionPct}%` : 'Verified'}
                  </span>
                </div>
                <h4 className="text-lg font-black text-white">
                  USD {actualFcy.toLocaleString()}
                </h4>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${fcyTarget > 0 ? fcyCompletionPct : (actualFcy > 0 ? 100 : 0)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  {fcyTarget > 0 ? `Target: USD ${fcyTarget.toLocaleString()}` : 'Forex Inflow Mobilized'}
                </p>
              </div>

              {/* 3. Digital Financial Services Volume */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-purple-500/40 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-gray-300 font-semibold">Digital Volume (ETB)</span>
                  </div>
                  <span className="text-xs font-bold text-purple-400">
                    {dfsTarget > 0 ? `${dfsCompletionPct}%` : 'Verified'}
                  </span>
                </div>
                <h4 className="text-lg font-black text-white">
                  ETB {actualDigitalVol.toLocaleString()}
                </h4>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full transition-all duration-500"
                    style={{ width: `${dfsTarget > 0 ? dfsCompletionPct : (actualDigitalVol > 0 ? 100 : 0)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  {dfsTarget > 0 ? `Target: ETB ${dfsTarget.toLocaleString()}` : 'DFS Transaction Vol'}
                </p>
              </div>

              {/* 4. Accounts Opened / Onboarding */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-cyan-500/40 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs text-gray-300 font-semibold">Accounts Opened</span>
                  </div>
                  <span className="text-xs font-bold text-cyan-400">
                    {accTarget > 0 ? `${accCompletionPct}%` : 'Verified'}
                  </span>
                </div>
                <h4 className="text-lg font-black text-white">
                  {actualAccountOpenings} Accounts
                </h4>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full transition-all duration-500"
                    style={{ width: `${accTarget > 0 ? accCompletionPct : (actualAccountOpenings > 0 ? 100 : 0)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  {accTarget > 0 ? `Target: ${accTarget} Accounts` : 'Customer Onboarding'}
                </p>
              </div>

              {/* 5. Mobile Banking */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-blue-500/40 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs text-gray-300 font-semibold">Mobile Banking</span>
                  </div>
                  <span className="text-xs font-bold text-blue-400">
                    {mobileTarget > 0 ? `${mobileCompletionPct}%` : 'Verified'}
                  </span>
                </div>
                <h4 className="text-lg font-black text-white">
                  {actualMobile} Activations
                </h4>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-500"
                    style={{ width: `${mobileTarget > 0 ? mobileCompletionPct : (actualMobile > 0 ? 100 : 0)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  {mobileTarget > 0 ? `Target: ${mobileTarget} Users` : 'Bunna Mobile App Users'}
                </p>
              </div>

              {/* 6. Internet Banking */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-teal-500/40 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-xs text-gray-300 font-semibold">Internet Banking</span>
                  </div>
                  <span className="text-xs font-bold text-teal-400">
                    {ibTarget > 0 ? `${ibCompletionPct}%` : 'Verified'}
                  </span>
                </div>
                <h4 className="text-lg font-black text-white">
                  {actualIb} Activations
                </h4>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-500 h-full transition-all duration-500"
                    style={{ width: `${ibTarget > 0 ? ibCompletionPct : (actualIb > 0 ? 100 : 0)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  {ibTarget > 0 ? `Target: ${ibTarget} Users` : 'Retail & Corporate IB'}
                </p>
              </div>

              {/* 7. ATM / Debit Cards */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-rose-500/40 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-xs text-gray-300 font-semibold">ATM / Debit Cards</span>
                  </div>
                  <span className="text-xs font-bold text-rose-400">
                    {atmTarget > 0 ? `${atmCompletionPct}%` : 'Verified'}
                  </span>
                </div>
                <h4 className="text-lg font-black text-white">
                  {actualAtm} Cards
                </h4>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full transition-all duration-500"
                    style={{ width: `${atmTarget > 0 ? atmCompletionPct : (actualAtm > 0 ? 100 : 0)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  {atmTarget > 0 ? `Target: ${atmTarget} Cards` : 'Debit Cards Issued'}
                </p>
              </div>

              {/* 8. Merchant Solutions & QR */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-amber-500/40 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-1.5">
                    <QrCode className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs text-gray-300 font-semibold">Merchant & QR</span>
                  </div>
                  <span className="text-xs font-bold text-amber-400">
                    {merchantTarget > 0 ? `${merchantCompletionPct}%` : 'Verified'}
                  </span>
                </div>
                <h4 className="text-lg font-black text-white">
                  {actualMerchant} Merchants
                </h4>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-500"
                    style={{ width: `${merchantTarget > 0 ? merchantCompletionPct : (actualMerchant > 0 ? 100 : 0)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  {merchantTarget > 0 ? `Target: ${merchantTarget} Merchants` : 'POS & QR Acquired'}
                </p>
              </div>

            </div>
          </div>

          {/* Branch Aggregated Campaign Widget (Aggregated Branch Performance Context) */}
          <BranchCampaignWidget
            branchName={user.branchName || 'Headquarters Branch'}
            userRole={user.role}
            reports={reports}
            onReportSubmitted={onRefreshData}
          />

          {/* All 8 Core Products Overview & Target Tracking (Personal Data) */}
          <AllProductsOverview
            reports={myReports}
            targets={targets}
            title={`My Individual Performance & Evaluation (${getUserFullName(user)})`}
            subtitle="Track personal achievements, percentage progress, variance, and periodic performance score out of 100%"
          />
        </div>
      )}

    </div>
  );
};
