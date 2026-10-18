import { useState, useMemo } from "react";
import {
  Calendar,
  FileSpreadsheet,
  FileText,
  Printer,
  UserCheck,
  PlusCircle,
  Clock,
  Target,
  BarChart3,
  MessageSquare,
  Building2,
  ChevronDown
} from "lucide-react";
import { getUserFullName } from "../../types";
import { translations } from "../../i18n/translations";
import { downloadReportCSV, downloadReportExcel, printOrDownloadPDF } from "../../utils/exportUtils";
import { EmployeeDailyKpiHistoryTable } from "./EmployeeDailyKpiHistoryTable";
import { SubmitReportSection } from "../reports/SubmitReportSection";
import { EmployeeKpiAgreementPanel } from "./EmployeeKpiAgreementPanel";
import { MessagingCenter } from "../common/MessagingCenter";
import { BankMemoLibrary } from "../common/BankMemoLibrary";
import { MyPerformanceView } from "./MyPerformanceView";
import { BranchPerformanceView } from "./BranchPerformanceView";
export const EmployeeDashboard = ({
  user,
  reports,
  targets,
  holidays,
  onRefreshData,
  onOpenAiAssistant,
  onOpenProfile,
  language = "en"
}) => {
  const t = translations[language] || translations["en"];
  const [activeTab, setActiveTab] = useState("my_performance");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const userLower = user.id.toLowerCase();
  const myAssignedTargets = useMemo(() => {
    return targets.filter((t2) => {
      const tEmp = String(t2.employeeId || t2.employee_id || "").toLowerCase();
      return tEmp === userLower || user.userId && tEmp === user.userId.toLowerCase();
    });
  }, [targets, user, userLower]);
  const pendingKpiCount = useMemo(() => {
    return myAssignedTargets.filter((t2) => t2.status === "PENDING_ACCEPTANCE").length;
  }, [myAssignedTargets]);
  const myReports = useMemo(() => {
    return reports.filter(
      (r) => r.employeeId === user.id || user.userId && r.employeeUserId === user.userId || r.employeeName && user.firstName && r.employeeName.toLowerCase().includes(user.firstName.toLowerCase())
    );
  }, [reports, user]);
  const myPendingReports = useMemo(() => {
    return myReports.filter((r) => r.status === "Pending" || r.status === "Submitted");
  }, [myReports]);
  return <div id="employee-dashboard-container" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner with Employee Details & Actions */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-gray-900">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#541818]/10 text-[#541818] border border-[#541818]/20 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Employee Performance Portal
            </span>
            <span className="text-xs text-gray-500">{user.jobTitle || "Customer Service Officer"} • {user.branchName || "Bunna Branch"}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1">
            Welcome, {getUserFullName(user)}!
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Evaluate individual & branch KPI performance, record daily metrics, and track verified progress
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Download My Report Multi-Format Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2.5 rounded-xl bg-[#541818] hover:bg-[#3d1011] text-white font-bold text-xs flex items-center space-x-2 shadow-sm cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Export Performance</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1 text-white" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 text-gray-800">
                <button
                  onClick={() => {
                    downloadReportExcel(myReports, `EPMS_Performance_${getUserFullName(user)}`);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-gray-700 hover:bg-gray-100 flex items-center space-x-2.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Excel Workbook (.xlsx)</span>
                </button>
                <button
                  onClick={() => {
                    downloadReportCSV(myReports, `EPMS_Performance_${getUserFullName(user)}`);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-gray-700 hover:bg-gray-100 flex items-center space-x-2.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>CSV Spreadsheet (.csv)</span>
                </button>
                <button
                  onClick={() => {
                    printOrDownloadPDF(`EPMS_Performance_${getUserFullName(user)}`);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-gray-700 hover:bg-gray-100 flex items-center space-x-2.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-600" />
                  <span>PDF Document / Print</span>
                </button>
              </div>
            )}
          </div>

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-bold flex items-center space-x-2 text-gray-700 cursor-pointer transition-all"
            >
              <UserCheck className="w-4 h-4 text-[#541818]" />
              <span>{t.myRoleProfile || "My Role Profile"}</span>
            </button>
          )}
        </div>
      </div>

      {/* PENDING KPI TARGETS ALERT BANNER */}
      {pendingKpiCount > 0 && activeTab !== "my_targets" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-amber-400 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300 text-gray-900">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 flex-shrink-0 text-amber-700">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase tracking-wider">
                  Action Required
                </span>
                <span className="text-xs font-black text-amber-700">
                  Target Agreement Pending Sign-off
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-gray-900 mt-1">
                You have {pendingKpiCount} proposed KPI target(s) from your Branch Manager awaiting your agreement.
              </h4>
              <p className="text-xs text-gray-600 font-medium leading-relaxed mt-0.5">
                Review and either Accept to activate your official performance plan or Reject with feedback.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("my_targets")}
            className="px-5 py-2.5 rounded-xl bg-[#541818] hover:bg-[#3d1011] text-white text-xs font-bold shadow-sm flex items-center justify-center space-x-2 whitespace-nowrap active:scale-95 transition-all self-end sm:self-center cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>Review & Respond to Targets</span>
          </button>
        </div>
      )}

      {/* TOP DASHBOARD DEDICATED PERFORMANCE & WORKFLOW NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-200 shadow-sm">
        {/* Section 1: 📊 My Performance */}
        <button
          onClick={() => setActiveTab("my_performance")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === "my_performance"
              ? "bg-[#541818] text-white shadow-sm scale-[1.02]"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>📊 My Performance</span>
        </button>

        {/* Section 2: 🏢 Branch Performance */}
        <button
          onClick={() => setActiveTab("branch_performance")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === "branch_performance"
              ? "bg-[#541818] text-white shadow-sm scale-[1.02]"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>🏢 Branch Performance</span>
        </button>

        {/* Section 3: 📅 Daily KPI Logs */}
        <button
          onClick={() => setActiveTab("daily_kpi")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === "daily_kpi"
              ? "bg-[#541818] text-white shadow-sm scale-[1.02]"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily History & Submissions</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "daily_kpi" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {myReports.length}
          </span>
        </button>

        {/* Section 4: 📝 Create Daily Report */}
        <button
          onClick={() => setActiveTab("create_report")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === "create_report"
              ? "bg-[#541818] text-white shadow-sm scale-[1.02]"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Daily Report</span>
          {myPendingReports.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {myPendingReports.length} Pending
            </span>
          )}
        </button>

        {/* Section 5: 🎯 My KPI Targets */}
        <button
          onClick={() => setActiveTab("my_targets")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all relative cursor-pointer ${
            activeTab === "my_targets"
              ? "bg-[#541818] text-white shadow-sm scale-[1.02]"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>My KPI Targets</span>
          {pendingKpiCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
              {pendingKpiCount} Action Req.
            </span>
          ) : myAssignedTargets.length > 0 ? (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "my_targets" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {myAssignedTargets.length}
            </span>
          ) : null}
        </button>

        {/* Section 6: 💬 Messages */}
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === "messages"
              ? "bg-[#541818] text-white shadow-sm scale-[1.02]"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Messages & Inbox</span>
        </button>

        {/* Section 7: 📜 Memos */}
        <button
          onClick={() => setActiveTab("memos")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === "memos"
              ? "bg-[#541818] text-white shadow-sm scale-[1.02]"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Bank Memos</span>
        </button>
      </div>

      {
    /* TAB CONTENT: 1. 📊 DEDICATED MY PERFORMANCE SECTION */
  }
      {activeTab === "my_performance" && <MyPerformanceView
    currentUser={user}
    reports={reports}
    targets={targets}
    onRefreshData={onRefreshData}
    language={language}
  />}

      {
    /* TAB CONTENT: 2. 🏢 DEDICATED BRANCH PERFORMANCE SECTION */
  }
      {activeTab === "branch_performance" && <BranchPerformanceView
    currentUser={user}
    reports={reports}
    targets={targets}
    employees={[]}
    onRefreshData={onRefreshData}
    language={language}
  />}

      {
    /* TAB CONTENT: 3. 📅 DAILY KPI PERFORMANCE HISTORY */
  }
      {activeTab === "daily_kpi" && <div className="space-y-6">
          {
    /* Pending Submissions Warning / Status Banner */
  }
          {myPendingReports.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-gray-900">
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 tracking-wide">
                    {myPendingReports.length} Daily Report(s) Submitted & Pending Approval
                  </h4>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed mt-0.5">
                    Performance scores and achievement statistics only include verified, Approved reports. Once your branch manager approves these entries, your metrics will update automatically.
                  </p>
                </div>
              </div>
              <div className="flex items-center self-end sm:self-center">
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 whitespace-nowrap">
                  {myPendingReports.length} Pending
                </span>
              </div>
            </div>
          )}

          {
    /* PERMANENT DAILY KPI PERFORMANCE HISTORY TABLE WITH AGGREGATIONS & STATUS BADGES */
  }
          <EmployeeDailyKpiHistoryTable
    employeeUser={user}
    reports={myReports}
    onRefreshData={onRefreshData}
    language={language}
  />
        </div>}

      {
    /* TAB CONTENT: 4. 📝 CREATE DAILY REPORT */
  }
      {activeTab === "create_report" && <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4A017] animate-ping" />
              <h3 className="text-base font-extrabold text-[#D4A017] uppercase tracking-wider">
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
      setActiveTab("my_performance");
    }}
    language={language}
  />
        </div>}

      {
    /* TAB CONTENT: 5. 🎯 MY KPI TARGETS & AGREEMENT PANEL */
  }
      {activeTab === "my_targets" && <EmployeeKpiAgreementPanel
    user={user}
    targets={targets}
    onRefreshData={onRefreshData}
  />}

      {
    /* TAB CONTENT: 6. 💬 MESSAGES / INBOX */
  }
      {activeTab === "messages" && <MessagingCenter currentUser={user} employees={[]} />}

      {
    /* TAB CONTENT: 7. 📜 BANK MEMOS & DIGITAL LIBRARY */
  }
      {activeTab === "memos" && <BankMemoLibrary currentUser={user} />}

    </div>;
};
