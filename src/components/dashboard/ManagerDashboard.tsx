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
  Briefcase
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

export type ManagerTab = 'dashboard' | 'messages' | 'employees' | 'kpis' | 'profiles' | 'settings';

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
  const [internalTab, setInternalTab] = useState<ManagerTab>('dashboard');
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
    if (e.role !== 'EMPLOYEE') return false;
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
    <div className="space-y-8">
      
      {/* 6 CONSOLIDATED MANAGER NAVIGATION PRIMARY TABS */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-[#08321E] rounded-2xl border border-[#D4AF37]/40 shadow-xl">
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            currentTab === 'dashboard'
              ? 'bg-[#D4AF37] text-[#0B4228] shadow-md scale-[1.02]'
              : 'bg-black/30 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Manager Dashboard</span>
        </button>

        <button
          onClick={() => handleTabClick('messages')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            currentTab === 'messages'
              ? 'bg-[#D4AF37] text-[#0B4228] shadow-md scale-[1.02]'
              : 'bg-black/30 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Messages & Notifications</span>
        </button>

        <button
          onClick={() => handleTabClick('employees')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            currentTab === 'employees'
              ? 'bg-[#D4AF37] text-[#0B4228] shadow-md scale-[1.02]'
              : 'bg-black/30 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employee Management</span>
        </button>

        <button
          onClick={() => handleTabClick('kpis')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            currentTab === 'kpis'
              ? 'bg-[#D4AF37] text-[#0B4228] shadow-md scale-[1.02]'
              : 'bg-black/30 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>KPI Management</span>
        </button>

        <button
          onClick={() => handleTabClick('profiles')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            currentTab === 'profiles'
              ? 'bg-[#D4AF37] text-[#0B4228] shadow-md scale-[1.02]'
              : 'bg-black/30 text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Profiles</span>
        </button>

        <button
          onClick={() => handleTabClick('settings')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
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
      {/* 1. TAB: MANAGER DASHBOARD */}
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
                {user.branchName} Manager Portal
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                Approve, Return, Reject, and Monitor Daily Performance Reports & Target Realization
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setPerfModalSelectedEmpId(branchEmployees[0]?.id || employees[0]?.id);
                  setIsPerfModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#0B4228] hover:bg-[#0e5232] border border-[#D4AF37]/60 text-xs font-bold flex items-center space-x-2 text-white shadow-lg transition-all"
              >
                <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
                <span>View Employee Performance</span>
              </button>

              <button
                onClick={onOpenExportModal}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center space-x-2 text-white"
              >
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span>Export Reports</span>
              </button>

              <button
                onClick={onOpenAiAssistant}
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B4228] font-bold text-xs shadow-lg hover:bg-[#e0be4d] flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-[#0B4228]" />
                <span>AI Manager Assistant</span>
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

          {/* Status Filter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['Pending', 'Approved', 'Returned', 'Rejected', 'All'].map(st => {
              const count = st === 'All' ? reports.length : reports.filter(r => r.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setActiveFilter(st)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    activeFilter === st
                      ? 'bg-[#D4AF37] text-[#0B4228] border-[#D4AF37] shadow-xl font-extrabold'
                      : 'bg-[#08321E] text-white border-white/10 hover:border-[#D4AF37]'
                  }`}
                >
                  <p className="text-xs opacity-80 uppercase tracking-wider">{st} Reports</p>
                  <h3 className="text-xl font-black mt-1">{count}</h3>
                </button>
              );
            })}
          </div>

          {/* Bulk Action Controls Bar */}
          <div className="p-5 rounded-2xl bg-[#08321E] border border-[#D4AF37]/30 shadow-lg text-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={selectAllReports}
                className="flex items-center space-x-2 text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer"
              >
                {selectedReportIds.length === filteredReports.length && filteredReports.length > 0 ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>Select All ({selectedReportIds.length} Selected)</span>
              </button>
            </div>

            {/* Manager Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={actionLoading}
                onClick={() => handleExecuteAction('approve')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Selected</span>
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleExecuteAction('return')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Return for Correction</span>
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleExecuteAction('reject')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleExecuteAction('suspend')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow cursor-pointer"
              >
                <Ban className="w-4 h-4" />
                <span>Suspend</span>
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleExecuteAction('delete')}
                className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Optional Manager Review Comment Input */}
          {selectedReportIds.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#0B4228] border border-[#D4AF37]/30 text-white">
              <label className="block text-xs font-bold text-[#D4AF37] mb-1">Add Manager Review Comment / Correction Note:</label>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="e.g. Please verify account opening numbers against physical records before re-submitting."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          )}

          {/* Reports Table List */}
          <div className="p-6 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl text-white">
            <h3 className="font-bold text-lg text-white mb-4">
              Daily Performance Submissions Queue ({filteredReports.length})
            </h3>

            {filteredReports.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No reports found matching status filter "{activeFilter}".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#0B4228] text-[#D4AF37] font-bold uppercase">
                    <tr>
                      <th className="p-3 w-10">Select</th>
                      <th className="p-3">Report Date</th>
                      <th className="p-3">Employee</th>
                      <th className="p-3">Deposits (ETB)</th>
                      <th className="p-3">FCY (USD)</th>
                      <th className="p-3">Digital Services (ETB)</th>
                      <th className="p-3">Accounts</th>
                      <th className="p-3">Mobile Banking</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredReports.map(r => (
                      <tr key={r.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedReportIds.includes(r.id)}
                            onChange={() => toggleSelectReport(r.id)}
                            className="rounded border-white/20 bg-white/5 text-[#D4AF37]"
                          />
                        </td>
                        <td className="p-3 font-bold text-[#D4AF37]">{r.reportDate} ({r.dayOfWeek})</td>
                        <td className="p-3 font-semibold text-white">{r.employeeName}</td>
                        <td className="p-3 font-bold text-emerald-400">ETB {r.depositsETB?.toLocaleString()}</td>
                        <td className="p-3 font-semibold">USD {r.foreignCurrencyETB?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="p-3 font-semibold">ETB {r.digitalFinancialServicesETB?.toLocaleString()}</td>
                        <td className="p-3 font-bold">{r.accountOpenings}</td>
                        <td className="p-3 font-bold text-[#D4AF37]">{r.mobileBankingActivations}</td>
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

          {/* BRANCH PERMANENT DAILY KPI PERFORMANCE LOGS & SUMMARY */}
          <ManagerDailyKpiReportsTable
            managerUser={user}
            reports={reports}
            employees={employees}
            onRefreshData={onRefreshData}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: MESSAGES & NOTIFICATIONS */}
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
      {/* 3. TAB: EMPLOYEE MANAGEMENT */}
      {/* ========================================================================= */}
      {currentTab === 'employees' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B4228] via-[#08321E] to-[#051F13] border border-[#D4AF37]/30 shadow-xl text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="bg-[#D4AF37] text-[#0B4228] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                  Staff Supervision & Performance Oversight
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  Branch Employee Management
                </h2>
                <p className="text-xs text-gray-300 mt-0.5">
                  View assigned branch staff, evaluate individual performance records, adjust employee account profiles, and manage branch roster
                </p>
              </div>

              <button
                onClick={() => {
                  setPerfModalSelectedEmpId(branchEmployees[0]?.id || employees[0]?.id);
                  setIsPerfModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B4228] font-bold text-xs shadow-lg hover:bg-[#e0be4d] flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4 text-[#0B4228]" />
                <span>Launch Performance Analytics</span>
              </button>
            </div>
          </div>

          {/* Assigned Branch Team Roster Section */}
          <div className="p-6 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl text-white space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] uppercase tracking-wider">
                    Organizational Hierarchy
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Automatic Branch Staff Assignment
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#D4AF37]" />
                  Assigned Branch Team Roster ({branchEmployees.length} Staff Assigned)
                </h3>
                <p className="text-xs text-gray-300">
                  Employees registering for <strong className="text-[#D4AF37]">{user.branchName || 'this Branch'}</strong> under <strong className="text-white">{user.districtName || 'District'}</strong> are automatically assigned under your managerial supervision.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs bg-black/40 px-4 py-2 rounded-2xl border border-white/10 text-gray-300">
                <span>Branch Manager:</span>
                <strong className="text-[#D4AF37]">{getUserFullName(user)}</strong>
              </div>
            </div>

            {/* Staff Table / Cards */}
            {branchEmployees.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-2">
                <Users className="w-8 h-8 text-[#D4AF37] mx-auto opacity-60" />
                <p className="font-bold text-white text-sm">No Non-Managerial Employees Assigned Yet</p>
                <p className="max-w-md mx-auto text-gray-400 text-[11px]">
                  When new employees register selecting <strong>{user.branchName || 'this Branch'}</strong> during registration, they will automatically appear in this roster under your managerial oversight.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#0B4228] text-[#D4AF37] font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Staff Member</th>
                      <th className="p-3">Staff ID</th>
                      <th className="p-3">Job Title</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Daily Submissions</th>
                      <th className="p-3 text-right">Manager Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {branchEmployees.map(emp => {
                      const empReports = branchReports.filter(r => 
                        r.employeeId === emp.id || 
                        (emp.userId && r.employeeUserId === emp.userId) || 
                        (r.employeeName && emp.firstName && r.employeeName.toLowerCase().includes(emp.firstName.toLowerCase()))
                      );
                      return (
                        <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-white text-sm">{getUserFullName(emp)}</div>
                            <div className="text-[10px] text-gray-400">{emp.gender} • Age: {emp.age || 28} • Joined: {emp.createdAt || '2026'}</div>
                          </td>
                          <td className="p-3 font-mono font-bold text-[#D4AF37]">{emp.userId || emp.id}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-emerald-300 border border-white/10">
                              {emp.jobTitle || 'Customer Service Officer'}
                            </span>
                          </td>
                          <td className="p-3 text-[11px]">
                            <div>{emp.email}</div>
                            <div className="text-gray-400">{emp.phone}</div>
                          </td>
                          <td className="p-3">
                            <span className="font-extrabold text-white bg-[#0B4228] px-2.5 py-1 rounded-lg border border-[#D4AF37]/30">
                              {empReports.length} Logs
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setPerfModalSelectedEmpId(emp.id);
                                  setIsPerfModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-[#0B4228] hover:bg-[#0e5232] border border-[#D4AF37]/50 text-white font-bold text-[11px] flex items-center gap-1 shadow cursor-pointer"
                                title="View Product & Overall Performance"
                              >
                                <BarChart3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>Performance</span>
                              </button>

                              {onOpenAiSummary && (
                                <button
                                  onClick={() => onOpenAiSummary(emp)}
                                  className="px-2.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#e0be4d] text-[#0B4228] font-bold text-[11px] flex items-center gap-1 shadow cursor-pointer"
                                  title="AI Performance Summary"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>AI Evaluate</span>
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
            )}
          </div>

          {/* Branch Employee Management & Profile Operations Panel */}
          <BranchEmployeeManagementPanel
            currentUser={user}
            employees={employees}
            onRefreshData={onRefreshData}
            onOpenAiSummary={onOpenAiSummary}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: KPI MANAGEMENT */}
      {/* ========================================================================= */}
      {currentTab === 'kpis' && (
        <div className="space-y-8">
          {/* Header Banner */}
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

          {/* Branch Employee Target & KPI Assignment Feed Engine */}
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
      {/* 5. TAB: PROFILES */}
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
      {/* 6. TAB: SETTINGS */}
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
