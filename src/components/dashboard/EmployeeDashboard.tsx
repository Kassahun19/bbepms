import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Award,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Printer,
  Sparkles,
  UserCheck,
  PlusCircle,
  Clock,
  Target,
  BarChart3,
  MessageSquare,
  Building2,
  ChevronDown,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { User, DailyPerformanceReport, PerformanceTarget, BankHoliday, getUserFullName, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { downloadReportCSV, downloadReportExcel, printOrDownloadPDF } from '../../utils/exportUtils';
import { EmployeeDailyKpiHistoryTable } from './EmployeeDailyKpiHistoryTable';
import { SubmitReportSection } from '../reports/SubmitReportSection';
import { EmployeeKpiAgreementPanel } from './EmployeeKpiAgreementPanel';
import { MessagingCenter } from '../common/MessagingCenter';
import { BankMemoLibrary } from '../common/BankMemoLibrary';
import { MyPerformanceView } from './MyPerformanceView';
import { BranchPerformanceView } from './BranchPerformanceView';

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

export type EmployeeTab = 'my_performance' | 'branch_performance' | 'daily_kpi' | 'create_report' | 'my_targets' | 'messages' | 'memos';

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
  const [activeTab, setActiveTab] = useState<EmployeeTab>('my_performance');
  const [showExportMenu, setShowExportMenu] = useState(false);

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

  // 2. Pending Submissions Count
  const myPendingReports = useMemo(() => {
    return myReports.filter(r => r.status === 'Pending' || r.status === 'Submitted');
  }, [myReports]);

  return (
    <div id="employee-dashboard-container" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner with Employee Details & Actions */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#6B3F1D] via-[#4A2C17] to-[#362011] border border-[#C89A2B]/30 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#C89A2B] text-[#6B3F1D] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
              Employee Performance Portal
            </span>
            <span className="text-xs text-gray-300">{user.jobTitle || 'Customer Service Officer'} • {user.branchName || 'Bunna Branch'}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Welcome, {getUserFullName(user)}!
          </h2>
          <p className="text-xs text-gray-300 mt-0.5">
            Evaluate individual & branch KPI performance, record daily metrics, and track verified progress
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Download My Report Multi-Format Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center space-x-2 shadow-lg cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Export Performance</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-[#362011] border border-[#C89A2B]/40 rounded-2xl shadow-2xl z-50 p-2 space-y-1">
                <button
                  onClick={() => {
                    downloadReportExcel(myReports, `EPMS_Performance_${getUserFullName(user)}`);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 flex items-center space-x-2.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Excel Workbook (.xlsx)</span>
                </button>
                <button
                  onClick={() => {
                    downloadReportCSV(myReports, `EPMS_Performance_${getUserFullName(user)}`);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 flex items-center space-x-2.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>CSV Spreadsheet (.csv)</span>
                </button>
                <button
                  onClick={() => {
                    printOrDownloadPDF(`EPMS_Performance_${getUserFullName(user)}`);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 flex items-center space-x-2.5 transition-colors cursor-pointer"
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
              className="px-4 py-2.5 rounded-xl bg-[#4A2C17] hover:bg-white/10 border border-[#C89A2B]/40 text-xs font-bold flex items-center space-x-2 text-[#C89A2B] cursor-pointer transition-all"
            >
              <UserCheck className="w-4 h-4 text-[#C89A2B]" />
              <span>{t.myRoleProfile || 'My Role Profile'}</span>
            </button>
          )}

          <button
            onClick={onOpenAiAssistant}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center space-x-2 cursor-pointer transition-all"
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

      {/* TOP DASHBOARD DEDICATED PERFORMANCE & WORKFLOW NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2.5 p-2 bg-[#4A2C17]/90 backdrop-blur-md rounded-2xl border border-[#C89A2B]/40 shadow-lg">
        
        {/* Section 1: 📊 My Performance */}
        <button
          onClick={() => setActiveTab('my_performance')}
          className={`px-4 py-3 rounded-xl font-black text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
            activeTab === 'my_performance'
              ? 'bg-[#C89A2B] text-[#3A1F0D] ring-2 ring-[#C89A2B]/50 scale-105'
              : 'bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>📊 My Performance</span>
        </button>

        {/* Section 2: 🏢 Branch Performance */}
        <button
          onClick={() => setActiveTab('branch_performance')}
          className={`px-4 py-3 rounded-xl font-black text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
            activeTab === 'branch_performance'
              ? 'bg-[#C89A2B] text-[#3A1F0D] ring-2 ring-[#C89A2B]/50 scale-105'
              : 'bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>🏢 Branch Performance</span>
        </button>

        {/* Section 3: 📅 Daily KPI Logs */}
        <button
          onClick={() => setActiveTab('daily_kpi')}
          className={`px-4 py-3 rounded-xl font-black text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
            activeTab === 'daily_kpi'
              ? 'bg-[#C89A2B] text-[#3A1F0D] ring-2 ring-[#C89A2B]/50 scale-105'
              : 'bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily History & Submissions</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeTab === 'daily_kpi' ? 'bg-[#3A1F0D] text-[#C89A2B]' : 'bg-white/10 text-gray-300'
          }`}>
            {myReports.length}
          </span>
        </button>

        {/* Section 4: 📝 Create Daily Report */}
        <button
          onClick={() => setActiveTab('create_report')}
          className={`px-4 py-3 rounded-xl font-black text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
            activeTab === 'create_report'
              ? 'bg-[#C89A2B] text-[#3A1F0D] ring-2 ring-[#C89A2B]/50 scale-105'
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

        {/* Section 5: 🎯 My KPI Targets */}
        <button
          onClick={() => setActiveTab('my_targets')}
          className={`px-4 py-3 rounded-xl font-black text-xs flex items-center space-x-2 transition-all shadow-md relative cursor-pointer ${
            activeTab === 'my_targets'
              ? 'bg-[#C89A2B] text-[#3A1F0D] ring-2 ring-[#C89A2B]/50 scale-105'
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
              activeTab === 'my_targets' ? 'bg-[#3A1F0D] text-[#C89A2B]' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {myAssignedTargets.length}
            </span>
          ) : null}
        </button>

        {/* Section 6: 💬 Messages */}
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-3 rounded-xl font-black text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
            activeTab === 'messages'
              ? 'bg-[#C89A2B] text-[#3A1F0D] ring-2 ring-[#C89A2B]/50 scale-105'
              : 'bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Messages & Inbox</span>
        </button>

        {/* Section 7: 📜 Memos */}
        <button
          onClick={() => setActiveTab('memos')}
          className={`px-4 py-3 rounded-xl font-black text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
            activeTab === 'memos'
              ? 'bg-[#C89A2B] text-[#3A1F0D] ring-2 ring-[#C89A2B]/50 scale-105'
              : 'bg-black/30 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Bank Memos</span>
        </button>

      </div>

      {/* TAB CONTENT: 1. 📊 DEDICATED MY PERFORMANCE SECTION */}
      {activeTab === 'my_performance' && (
        <MyPerformanceView
          currentUser={user}
          reports={reports}
          targets={targets}
          onRefreshData={onRefreshData}
          language={language}
        />
      )}

      {/* TAB CONTENT: 2. 🏢 DEDICATED BRANCH PERFORMANCE SECTION */}
      {activeTab === 'branch_performance' && (
        <BranchPerformanceView
          currentUser={user}
          reports={reports}
          targets={targets}
          employees={[]}
          onRefreshData={onRefreshData}
          language={language}
        />
      )}

      {/* TAB CONTENT: 3. 📅 DAILY KPI PERFORMANCE HISTORY */}
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

      {/* TAB CONTENT: 4. 📝 CREATE DAILY REPORT */}
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
              setActiveTab('my_performance');
            }}
            language={language}
          />
        </div>
      )}

      {/* TAB CONTENT: 5. 🎯 MY KPI TARGETS & AGREEMENT PANEL */}
      {activeTab === 'my_targets' && (
        <EmployeeKpiAgreementPanel
          user={user}
          targets={targets}
          onRefreshData={onRefreshData}
        />
      )}

      {/* TAB CONTENT: 6. 💬 MESSAGES / INBOX */}
      {activeTab === 'messages' && (
        <MessagingCenter currentUser={user} employees={[]} />
      )}

      {/* TAB CONTENT: 7. 📜 BANK MEMOS & DIGITAL LIBRARY */}
      {activeTab === 'memos' && (
        <BankMemoLibrary currentUser={user} />
      )}

    </div>
  );
};
