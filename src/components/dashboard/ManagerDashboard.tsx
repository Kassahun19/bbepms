import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Target,
  UserCheck,
  Settings,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Ban,
  Trash2,
  Sparkles,
  Download,
  Clock,
  CheckSquare,
  Square,
  ChevronRight,
  Send,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  FileText,
  Building2,
  Briefcase,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { User, DailyPerformanceReport, PerformanceTarget, Notification, getUserFullName, Language } from '../../types';
import { api } from '../../services/api';
import { AllProductsOverview } from './AllProductsOverview';
import { BranchCampaignWidget } from './BranchCampaignWidget';
import { BranchEmployeeTargetManager } from './BranchEmployeeTargetManager';
import { BranchEmployeeManagementPanel } from './BranchEmployeeManagementPanel';
import { EmployeePerformanceModal } from './EmployeePerformanceModal';
import { ManagerDailyKpiReportsTable } from './ManagerDailyKpiReportsTable';
import { ManagerProfileView } from './ManagerProfileView';
import { ManagerSettingsView } from './ManagerSettingsView';
import { ManagerMessagesNotificationsView } from './ManagerMessagesNotificationsView';
import { ManagerEmployeePerformanceView } from './ManagerEmployeePerformanceView';
import { BranchPerformanceView } from './BranchPerformanceView';

export type ManagerTab = 'dashboard' | 'employee_performance' | 'branch_performance' | 'kpis' | 'employees' | 'messages' | 'profiles' | 'settings';

interface ManagerDashboardProps {
  user: User;
  reports: DailyPerformanceReport[];
  employees: User[];
  targets: PerformanceTarget[];
  notifications?: Notification[];
  activeTab?: ManagerTab;
  onTabChange?: (tab: ManagerTab) => void;
  onRefreshData: () => void;
  onOpenAiAssistant: () => void;
  onOpenExportModal: () => void;
  onOpenProfile?: () => void;
  onOpenAiSummary?: (employee: User) => void;
  onUserUpdated?: (updatedUser: User) => void;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  user,
  reports,
  employees,
  targets,
  notifications = [],
  activeTab: controlledActiveTab,
  onTabChange,
  onRefreshData,
  onOpenAiAssistant,
  onOpenExportModal,
  onOpenProfile,
  onOpenAiSummary,
  onUserUpdated,
  language = 'en',
  onLanguageChange
}) => {
  const [internalTab, setInternalTab] = useState<ManagerTab>('employee_performance');
  const currentTab = controlledActiveTab || internalTab;

  const handleTabClick = (tab: ManagerTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  // Submissions selection & filter states
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('Pending');
  const [commentText, setCommentText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Employee Performance Modal State
  const [isPerfModalOpen, setIsPerfModalOpen] = useState(false);
  const [perfModalSelectedEmpId, setPerfModalSelectedEmpId] = useState<string | undefined>(undefined);

  // Filter employees belonging to manager's branch
  const branchEmployees = employees.filter(e => {
    if (e.role === 'ADMINISTRATOR' || e.role === 'MANAGER') return false;
    if (!user.branchId && !user.branchName) return true;
    const sameBranchId = user.branchId && e.branchId && user.branchId === e.branchId;
    const sameBranchName = user.branchName && e.branchName && user.branchName.trim().toLowerCase() === e.branchName.trim().toLowerCase();
    return Boolean(sameBranchId || sameBranchName);
  });

  // Filter reports for manager's branch
  const branchReports = reports.filter(r => {
    if (!user.branchId && !user.branchName) return true;
    const sameBranchId = user.branchId && r.branchId && user.branchId === r.branchId;
    const sameBranchName = user.branchName && r.branchName && user.branchName.trim().toLowerCase() === r.branchName.trim().toLowerCase();
    return Boolean(sameBranchId || sameBranchName);
  });

  const filteredReports = branchReports.filter(r => {
    if (activeFilter === 'All') return true;
    return r.status === activeFilter;
  });

  const pendingCount = branchReports.filter(r => r.status === 'Pending' || r.status === 'Submitted').length;

  const toggleSelectReport = (id: string) => {
    if (selectedReportIds.includes(id)) {
      setSelectedReportIds(selectedReportIds.filter(i => i !== id));
    } else {
      setSelectedReportIds([...selectedReportIds, id]);
    }
  };

  const selectAllReports = () => {
    if (selectedReportIds.length === filteredReports.length) {
      setSelectedReportIds([]);
    } else {
      setSelectedReportIds(filteredReports.map(r => r.id));
    }
  };

  const handleExecuteAction = async (action: 'approve' | 'reject' | 'return' | 'suspend' | 'delete') => {
    if (selectedReportIds.length === 0) {
      alert("Please select at least one daily performance report.");
      return;
    }

    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete the ${selectedReportIds.length} selected report(s)? This action cannot be undone.`)) {
        return;
      }
    }

    setActionLoading(true);
    try {
      await api.managerAction(selectedReportIds, action, user.id, commentText);
      setSelectedReportIds([]);
      setCommentText('');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || "Failed to execute manager action.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* CONSOLIDATED MANAGER NAVIGATION PRIMARY TABS */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-[#08321E] rounded-2xl border border-[#D4AF37]/40 shadow-xl">
        
        {/* Section 1: 👥 Employee Performance */}
        <button
          onClick={() => handleTabClick('employee_performance')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            currentTab === 'employee_performance'
              ? 'bg-[#D4AF37] text-[#0B4228] shadow-md scale-[1.02]'
              : 'bg-black/30 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>👥 Employee Performance</span>
        </button>

        {/* Section 2: 🏢 Branch Performance */}
        <button
          onClick={() => handleTabClick('branch_performance')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            currentTab === 'branch_performance'
              ? 'bg-[#D4AF37] text-[#0B4228] shadow-md scale-[1.02]'
              : 'bg-black/30 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>🏢 Branch Performance</span>
        </button>

        {/* Section 3: 📋 Submissions Queue */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            currentTab === 'dashboard'
              ? 'bg-[#D4AF37] text-[#0B4228] shadow-md scale-[1.02]'
              : 'bg-black/30 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>📋 Submissions Queue</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black">
              {pendingCount}
            </span>
          )}
        </button>

        {/* Section 4: 🎯 KPI Management */}
        <button
          onClick={() => handleTabClick('kpis')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            currentTab === 'kpis'
              ? 'bg-[#D4AF37] text-[#0B4228] shadow-md scale-[1.02]'
              : 'bg-black/30 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>🎯 KPI Management</span>
        </button>

        {/* Section 5: 👥 Employee Management */}
        <button
          onClick={() => handleTabClick('employees')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            currentTab === 'employees'
              ? 'bg-[#D4AF37] text-[#0B4228] shadow-md scale-[1.02]'
              : 'bg-black/30 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Roster</span>
        </button>

        {/* Section 6: 💬 Messages */}
        <button
          onClick={() => handleTabClick('messages')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            currentTab === 'messages'
              ? 'bg-[#D4AF37] text-[#0B4228] shadow-md scale-[1.02]'
              : 'bg-black/30 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Messages</span>
        </button>

        {/* Section 7: 👤 Profiles */}
        <button
          onClick={() => handleTabClick('profiles')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            currentTab === 'profiles'
              ? 'bg-[#D4AF37] text-[#0B4228] shadow-md scale-[1.02]'
              : 'bg-black/30 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>My Profile</span>
        </button>

        {/* Section 8: ⚙️ Settings */}
        <button
          onClick={() => handleTabClick('settings')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-[#D4AF37] text-[#0B4228] shadow-md scale-[1.02]'
              : 'bg-black/30 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. DEDICATED TAB: 👥 EMPLOYEE PERFORMANCE */}
      {/* ========================================================================= */}
      {currentTab === 'employee_performance' && (
        <ManagerEmployeePerformanceView
          currentUser={user}
          employees={employees}
          reports={reports}
          targets={targets}
          onRefreshData={onRefreshData}
          onOpenAiSummary={onOpenAiSummary}
          onOpenDirectMessage={() => handleTabClick('messages')}
          language={language}
        />
      )}

      {/* ========================================================================= */}
      {/* 2. DEDICATED TAB: 🏢 BRANCH PERFORMANCE */}
      {/* ========================================================================= */}
      {currentTab === 'branch_performance' && (
        <BranchPerformanceView
          currentUser={user}
          reports={reports}
          targets={targets}
          employees={employees}
          onRefreshData={onRefreshData}
          language={language}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: 📋 SUBMISSIONS QUEUE & APPROVALS */}
      {/* ========================================================================= */}
      {currentTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B4228] via-[#08321E] to-[#051F13] border border-[#D4AF37]/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
            <div>
              <span className="bg-[#D4AF37] text-[#0B4228] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                Branch Operations Manager
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                {user.branchName || 'Branch'} Submissions & Approval Desk
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                Approve, Return, Reject, and Audit Daily Performance Submissions from Branch Staff
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenExportModal}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center space-x-2 text-white cursor-pointer transition-all"
              >
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span>Export Reports</span>
              </button>
            </div>
          </div>

          {/* Product Achievements & Reports Summary */}
          <AllProductsOverview
            reports={reports}
            targets={targets}
            title={`${user.branchName || 'Branch'} Products Achievement Overview`}
            subtitle="Live totals, percentage achievements against targets, remaining targets, and product breakdown"
          />

          {/* Branch Daily Campaign Analytics Engine */}
          <BranchCampaignWidget
            branchName={user.branchName || 'Branch Unit'}
            userRole={user.role}
            reports={reports}
            onReportSubmitted={onRefreshData}
          />

          {/* Live Submissions Approval Queue & Bulk Actions */}
          <div className="p-6 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                  <span>Daily KPI Submissions Review Queue</span>
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Verify branch employee entries, inspect attachments, provide return comments, and approve verified metrics
                </p>
              </div>

              {/* Status Filter Badges */}
              <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                {['Pending', 'Approved', 'Returned', 'Rejected', 'All'].map((st) => {
                  const count = st === 'All' ? branchReports.length : branchReports.filter(r => r.status === st).length;
                  return (
                    <button
                      key={st}
                      onClick={() => setActiveFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeFilter === st
                          ? 'bg-[#D4AF37] text-[#0B4228] shadow-md font-black'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {st} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bulk Action Controls */}
            {selectedReportIds.length > 0 && (
              <div className="p-4 rounded-2xl bg-black/50 border border-[#D4AF37]/40 space-y-3 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    {selectedReportIds.length} Report(s) Selected for Action
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleExecuteAction('approve')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Selected</span>
                    </button>

                    <button
                      disabled={actionLoading}
                      onClick={() => handleExecuteAction('return')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Return for Correction</span>
                    </button>

                    <button
                      disabled={actionLoading}
                      onClick={() => handleExecuteAction('reject')}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      disabled={actionLoading}
                      onClick={() => handleExecuteAction('delete')}
                      className="px-3.5 py-1.5 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Optional feedback / return reason message for employee..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            )}

            {/* Submissions Table Component */}
            <ManagerDailyKpiReportsTable
              managerUser={user}
              reports={filteredReports}
              employees={employees}
              onRefreshData={onRefreshData}
              language={language}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: 🎯 KPI MANAGEMENT */}
      {/* ========================================================================= */}
      {currentTab === 'kpis' && (
        <div className="space-y-8">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B4228] via-[#08321E] to-[#051F13] border border-[#D4AF37]/30 shadow-xl text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="bg-[#D4AF37] text-[#0B4228] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                  Two-Party Target Agreement Engine
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  Branch KPI Target Management
                </h2>
                <p className="text-xs text-gray-300 mt-0.5">
                  Define annual and period KPI targets, dispatch to branch employees for acceptance, review rejection feedback, and monitor live target vs. actual achievements
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Enforced Active Targets Policy</span>
                </span>
              </div>
            </div>
          </div>

          <BranchEmployeeTargetManager
            currentUser={user}
            employees={employees}
            targets={targets}
            onTargetsUpdated={onRefreshData}
            onOpenAiSummary={onOpenAiSummary}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: 👥 EMPLOYEE MANAGEMENT */}
      {/* ========================================================================= */}
      {currentTab === 'employees' && (
        <div className="space-y-8">
          <BranchEmployeeManagementPanel
            currentUser={user}
            employees={employees}
            onRefreshData={onRefreshData}
            onOpenAiSummary={onOpenAiSummary}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB: 💬 MESSAGES */}
      {/* ========================================================================= */}
      {currentTab === 'messages' && (
        <ManagerMessagesNotificationsView
          currentUser={user}
          employees={employees}
          notifications={notifications}
          onRefreshData={onRefreshData}
        />
      )}

      {/* ========================================================================= */}
      {/* 7. TAB: 👤 PROFILES */}
      {/* ========================================================================= */}
      {currentTab === 'profiles' && (
        <ManagerProfileView
          user={user}
          employees={employees}
          reports={reports}
          targets={targets}
          onUserUpdated={onUserUpdated}
          onOpenAiSummary={onOpenAiSummary}
        />
      )}

      {/* ========================================================================= */}
      {/* 8. TAB: ⚙️ SETTINGS */}
      {/* ========================================================================= */}
      {currentTab === 'settings' && (
        <ManagerSettingsView
          user={user}
          onUserUpdated={onUserUpdated}
          language={language}
          onLanguageChange={onLanguageChange}
        />
      )}

      {/* Employee Performance Analytics Modal */}
      <EmployeePerformanceModal
        isOpen={isPerfModalOpen}
        onClose={() => setIsPerfModalOpen(false)}
        employees={branchEmployees.length > 0 ? branchEmployees : employees}
        reports={reports}
        targets={targets}
        initialEmployeeId={perfModalSelectedEmpId}
        onOpenAiSummary={onOpenAiSummary}
      />

    </div>
  );
};
