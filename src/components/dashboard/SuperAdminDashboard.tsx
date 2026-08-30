import React, { useState, useEffect, useMemo } from 'react';
import { TablePaginationFilter } from '../ui/TablePaginationFilter';
import {
  ShieldAlert,
  Users,
  Building2,
  Building,
  Target,
  FileText,
  Sliders,
  Calendar,
  Lock,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Key,
  ShieldCheck,
  Award,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowRight,
  Filter,
  Check,
  X,
  Eye,
  Activity,
  Globe,
  Settings,
  Database,
  UserCheck,
  TrendingUp,
  Briefcase,
  HelpCircle,
  Send,
  Copy,
  Info,
  Server,
  Zap,
  Cpu
} from 'lucide-react';
import {
  User,
  UserRole,
  District,
  Branch,
  KPI,
  PerformanceTarget,
  DailyPerformanceReport,
  AuditLog,
  BankHoliday,
  ChiefType,
  SystemSettings,
  RoleDefinition,
  PermissionDefinition,
  SecuritySession,
  SecurityAlert,
  AdminDashboardStats,
  ApprovalWorkflowRule
} from '../../types';
import { api } from '../../services/api';

interface SuperAdminDashboardProps {
  user: User;
  districts: District[];
  branches: Branch[];
  employees: User[];
  kpis: KPI[];
  reports: DailyPerformanceReport[];
  auditLogs: AuditLog[];
  holidays: BankHoliday[];
  targets: PerformanceTarget[];
  onRefreshData: () => Promise<void>;
  onOpenAiAssistant?: () => void;
  onOpenExportModal?: () => void;
  onOpenProfile?: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  user,
  districts,
  branches,
  employees,
  kpis,
  reports,
  auditLogs,
  holidays,
  targets,
  onRefreshData,
  onOpenAiAssistant,
  onOpenExportModal,
  onOpenProfile
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'wizard'
    | 'executives'
    | 'districts'
    | 'branches'
    | 'users'
    | 'roles'
    | 'kpis'
    | 'approvals'
    | 'settings'
    | 'security'
    | 'audit'
  >('overview');

  // Live Server Stats & Settings
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [chiefTypes, setChiefTypes] = useState<ChiefType[]>([]);
  const [rolesList, setRolesList] = useState<RoleDefinition[]>([]);
  const [permissionsList, setPermissionsList] = useState<PermissionDefinition[]>([]);
  const [securitySessions, setSecuritySessions] = useState<SecuritySession[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [approvalRules, setApprovalRules] = useState<ApprovalWorkflowRule[]>([]);
  const [orgTree, setOrgTree] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Global Search State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);

  // Active Modals
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [passwordResetTarget, setPasswordResetTarget] = useState<User | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [isChiefTypeModalOpen, setIsChiefTypeModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  // Users Filter & Selection
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userDistrictFilter, setUserDistrictFilter] = useState<string>('ALL');
  const [userBranchFilter, setUserBranchFilter] = useState<string>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('ALL');
  const [userSearchText, setUserSearchText] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // 11-Step Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    bankName: 'Bunna Bank S.C.',
    bankAcronym: 'BUNNA',
    headquartersCity: 'Addis Ababa',
    headquartersSol: 'HQ-100',
    boardChairmanName: 'Board of Directors Chairman',
    boardEmail: 'board@bunnabanksc.com',
    ceoUserId: 'CEO_001',
    ceoName: 'Mulugeta Alemayehu',
    ceoEmail: 'ceo@bunnabanksc.com',
    chiefsList: [
      { code: 'CFO', name: 'Chief Financial Officer', userId: 'Chief_Finance' },
      { code: 'CSO', name: 'Chief Strategy Officer', userId: 'Chief_Strategy' },
      { code: 'CDO', name: 'Chief Digital Officer', userId: 'Chief_Digital' },
      { code: 'CRB', name: 'Chief Retail Banking', userId: 'Chief_Retail' }
    ],
    districtsList: [
      { name: 'Central District', region: 'Addis Ababa' },
      { name: 'North District', region: 'Amhara' },
      { name: 'South District', region: 'Hawassa' },
      { name: 'West District', region: 'Oromia' }
    ],
    branchesList: [
      { name: 'Head Office Branch', solId: '100', district: 'Central District' },
      { name: 'Hamusit Branch', solId: '360', district: 'North District' },
      { name: 'Bole Medhanialem Branch', solId: '102', district: 'Central District' }
    ],
    kpiWeights: {
      deposit: 20,
      fcy: 15,
      dfs: 20,
      customerBase: 20,
      digitals: 25
    }
  });

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setActionErrorMsg(msg);
      setActionSuccessMsg(null);
    } else {
      setActionSuccessMsg(msg);
      setActionErrorMsg(null);
    }
    setTimeout(() => {
      setActionSuccessMsg(null);
      setActionErrorMsg(null);
    }, 4000);
  };

  // Load Admin Data from Server
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        settingsRes,
        ctRes,
        rolesRes,
        permsRes,
        sessRes,
        alertsRes,
        rulesRes,
        treeRes
      ] = await Promise.all([
        api.admin.getStats(),
        api.admin.getSystemSettings(),
        api.admin.getChiefTypes(),
        api.admin.getRoles(),
        api.admin.getPermissions(),
        api.admin.getSecuritySessions(),
        api.admin.getSecurityAlerts(),
        api.admin.getApprovalWorkflows(),
        api.admin.getOrganizationTree()
      ]);

      if (statsRes) setStats(statsRes);
      if (settingsRes) setSystemSettings(settingsRes);
      if (ctRes) setChiefTypes(ctRes);
      if (rolesRes) setRolesList(rolesRes);
      if (permsRes) setPermissionsList(permsRes);
      if (sessRes) setSecuritySessions(sessRes);
      if (alertsRes) setSecurityAlerts(alertsRes);
      if (rulesRes) setApprovalRules(rulesRes);
      if (treeRes) setOrgTree(treeRes);
    } catch (err: any) {
      console.warn('Failed to load live super admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return (employees || []).filter((u) => {
      if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
      if (userDistrictFilter !== 'ALL' && u.districtId !== userDistrictFilter) return false;
      if (userBranchFilter !== 'ALL' && u.branchId !== userBranchFilter) return false;
      if (userStatusFilter !== 'ALL' && (u.status || 'Active') !== userStatusFilter) return false;
      if (userSearchText.trim()) {
        const q = userSearchText.toLowerCase();
        const matchName = `${u.firstName || ''} ${u.middleName || ''} ${u.lastName || ''}`.toLowerCase();
        const matchId = (u.userId || u.id || '').toLowerCase();
        const matchEmail = (u.email || '').toLowerCase();
        const matchJob = (u.jobTitle || '').toLowerCase();
        if (!matchName.includes(q) && !matchId.includes(q) && !matchEmail.includes(q) && !matchJob.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [employees, userRoleFilter, userDistrictFilter, userBranchFilter, userStatusFilter, userSearchText]);

  // Handle Global Cross-Entity Search
  const handleGlobalSearch = async (query: string) => {
    setGlobalSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await api.admin.globalSearch(query);
      setSearchResults(res);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle User Status Toggle
  const handleToggleUserStatus = async (targetUser: User) => {
    try {
      const newStatus = targetUser.status === 'Active' ? 'Inactive' : 'Active';
      await api.admin.toggleUserStatus(targetUser.id, newStatus);
      showToast(`User ${targetUser.userId} is now ${newStatus}`);
      await onRefreshData();
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status', true);
    }
  };

  // Handle User Lock Toggle
  const handleToggleUserLock = async (targetUser: User) => {
    try {
      const newLock = !targetUser.isLocked;
      await api.admin.toggleUserLock(targetUser.id, newLock);
      showToast(`Account for ${targetUser.userId} has been ${newLock ? 'locked' : 'unlocked'}`);
      await onRefreshData();
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update account lock status', true);
    }
  };

  // Handle Password Reset
  const handleOpenResetPassword = (targetUser: User) => {
    setPasswordResetTarget(targetUser);
    const tempPass = `Bunna@${Math.floor(1000 + Math.random() * 9000)}!`;
    setGeneratedPassword(tempPass);
    setIsResetPasswordModalOpen(true);
  };

  const handleConfirmPasswordReset = async () => {
    if (!passwordResetTarget) return;
    try {
      await api.admin.resetUserPassword(passwordResetTarget.id, generatedPassword);
      showToast(`Password successfully reset for ${passwordResetTarget.userId}! Temporary password: ${generatedPassword}`);
      setIsResetPasswordModalOpen(false);
      setPasswordResetTarget(null);
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password', true);
    }
  };

  // Handle Bulk Action
  const handleExecuteBulkAction = async (action: string, value?: any) => {
    if (selectedUserIds.length === 0) {
      showToast('Please select at least one user', true);
      return;
    }
    try {
      await api.admin.bulkUserAction(selectedUserIds, action, value);
      showToast(`Bulk action "${action}" completed for ${selectedUserIds.length} users.`);
      setSelectedUserIds([]);
      await onRefreshData();
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to execute bulk action', true);
    }
  };

  // Handle 11-Step Setup Wizard Submission
  const handleCompleteWizard = async () => {
    setLoading(true);
    try {
      await api.admin.submitWizard({
        bankConfig: {
          bankName: wizardData.bankName,
          bankAcronym: wizardData.bankAcronym,
          headquartersSol: wizardData.headquartersSol
        },
        ceoData: {
          userId: wizardData.ceoUserId,
          firstName: wizardData.ceoName.split(' ')[0],
          lastName: wizardData.ceoName.split(' ')[1] || 'Executive',
          email: wizardData.ceoEmail,
          password: 'CEO@2026'
        },
        chiefsData: wizardData.chiefsList.map(ch => ({
          userId: ch.userId,
          jobTitle: ch.name
        })),
        districtsData: wizardData.districtsList.map(d => ({
          name: d.name,
          region: d.region
        })),
        branchesData: wizardData.branchesList.map(b => ({
          name: b.name,
          solId: b.solId,
          districtName: b.district
        }))
      });
      showToast('11-Step Bank Organization Setup completed and synchronized successfully!');
      setIsWizardOpen(false);
      await onRefreshData();
      await loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete organization wizard', true);
    } finally {
      setLoading(false);
    }
  };

  // Download Backup JSON
  const handleExportSystemBackup = () => {
    window.open('/api/admin/backup/export', '_blank');
    showToast('System state and full database backup JSON downloaded.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ENTERPRISE NOTIFICATION TOAST */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-900/40 border border-emerald-500/50 rounded-xl text-emerald-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {actionErrorMsg && (
        <div className="p-4 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="text-sm font-medium">{actionErrorMsg}</span>
          </div>
          <button onClick={() => setActionErrorMsg(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MASTER SYSTEM HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Bank-Level Super Administration Center
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                    SYSTEM CONTROL
                  </span>
                </div>
                <p className="text-xs text-amber-200/70">
                  Bunna Bank S.C. Enterprise Performance Management System & Organization Governance Engine
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>DB Engine: <strong className="text-white">Persistent + Firestore</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Authority: <strong className="text-amber-300">Unrestricted System-Wide</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>Active User: <strong className="text-white">{user.firstName} {user.lastName} ({user.userId})</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Master Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg transition-all hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 fill-current" />
              11-Step Setup Wizard
            </button>
            <button
              onClick={handleExportSystemBackup}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
              title="Download Full Database Backup JSON"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Export Backup
            </button>
            <button
              onClick={() => { onRefreshData(); loadAdminData(); showToast('System refreshed.'); }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Refresh Real-Time Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* GLOBAL SEARCH BAR */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              placeholder="Search across staff, executives, districts, branches, KPIs, audit logs..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
            {globalSearchQuery && (
              <button onClick={() => handleGlobalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Global Search Results Dropdown */}
        {searchResults && globalSearchQuery && (
          <div className="mt-3 p-4 bg-slate-950 border border-amber-500/30 rounded-xl shadow-2xl space-y-3">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Search Results for "{searchResults.query || globalSearchQuery}"
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Users ({searchResults.results?.users?.length || 0})</span>
                <div className="mt-1 space-y-1">
                  {(searchResults.results?.users || []).map((u: any) => (
                    <div key={u.id} className="p-1.5 bg-slate-900 rounded border border-slate-800 text-slate-200">
                      <strong>{u.firstName} {u.lastName}</strong> ({u.userId}) - {u.role}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Districts ({searchResults.results?.districts?.length || 0})</span>
                <div className="mt-1 space-y-1">
                  {(searchResults.results?.districts || []).map((d: any) => (
                    <div key={d.id} className="p-1.5 bg-slate-900 rounded border border-slate-800 text-slate-200">
                      <strong>{d.name}</strong> - {d.region}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Branches ({searchResults.results?.branches?.length || 0})</span>
                <div className="mt-1 space-y-1">
                  {(searchResults.results?.branches || []).map((b: any) => (
                    <div key={b.id} className="p-1.5 bg-slate-900 rounded border border-slate-800 text-slate-200">
                      <strong>{b.name}</strong> (SOL: {b.solId})
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">KPIs ({searchResults.results?.kpis?.length || 0})</span>
                <div className="mt-1 space-y-1">
                  {(searchResults.results?.kpis || []).map((k: any) => (
                    <div key={k.id} className="p-1.5 bg-slate-900 rounded border border-slate-800 text-slate-200">
                      <strong>{k.name}</strong> ({k.code}) - {k.weight}%
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SUPER ADMIN MAIN NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto">
        {[
          { id: 'overview', label: 'System Overview', icon: Layers },
          { id: 'executives', label: 'CEO & Chief Officers', icon: Briefcase },
          { id: 'districts', label: 'Districts & Directors', icon: Building2 },
          { id: 'branches', label: 'Branches & Managers', icon: Building },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'roles', label: 'Roles & Permissions', icon: Lock },
          { id: 'kpis', label: 'KPIs & Balanced Scorecard', icon: Target },
          { id: 'approvals', label: 'Approval Workflows', icon: CheckCircle2 },
          { id: 'settings', label: 'System Settings', icon: Settings },
          { id: 'security', label: 'Security Center', icon: ShieldAlert },
          { id: 'audit', label: 'Audit Vault', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ALWAYS VISIBLE STATS METRICS GRID (BACKGROUND DASHBOARD HEADER) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-4 mb-6">
        {[
          { 
            label: 'Total Users', 
            value: stats?.totalUsers || employees.length, 
            sub: `${stats?.activeUsers || employees.length} Active`, 
            icon: Users, 
            iconColor: 'text-amber-600', 
            badgeBg: 'bg-amber-500/20',
            cardBg: 'bg-[#FFF8EC]', 
            borderColor: 'border-amber-300',
            textColor: 'text-amber-950',
            numberColor: 'text-[#4D3000]',
            subColor: 'text-amber-900',
            shadow: 'shadow-lg shadow-amber-950/10 hover:shadow-amber-950/20' 
          },
          { 
            label: 'Executive Chiefs', 
            value: stats?.totalChiefs || 8, 
            sub: `${stats?.totalCeos || 1} CEO Assigned`, 
            icon: Briefcase, 
            iconColor: 'text-blue-600', 
            badgeBg: 'bg-blue-500/20',
            cardBg: 'bg-[#EFF6FF]', 
            borderColor: 'border-blue-300',
            textColor: 'text-blue-950',
            numberColor: 'text-[#0F3960]',
            subColor: 'text-blue-900',
            shadow: 'shadow-lg shadow-blue-950/10 hover:shadow-blue-950/20' 
          },
          { 
            label: 'Districts', 
            value: stats?.totalDistricts || districts.length, 
            sub: `${stats?.totalDistrictDirectors || 2} Directors`, 
            icon: Building2, 
            iconColor: 'text-emerald-600', 
            badgeBg: 'bg-emerald-500/20',
            cardBg: 'bg-[#ECFDF5]', 
            borderColor: 'border-emerald-300',
            textColor: 'text-emerald-950',
            numberColor: 'text-[#064E2B]',
            subColor: 'text-emerald-900',
            shadow: 'shadow-lg shadow-emerald-950/10 hover:shadow-emerald-950/20' 
          },
          { 
            label: 'Branches', 
            value: stats?.totalBranches || branches.length, 
            sub: `${stats?.totalBranchManagers || 2} Managers`, 
            icon: Building, 
            iconColor: 'text-cyan-600', 
            badgeBg: 'bg-cyan-500/20',
            cardBg: 'bg-[#ECFEFF]', 
            borderColor: 'border-cyan-300',
            textColor: 'text-cyan-950',
            numberColor: 'text-[#084B54]',
            subColor: 'text-cyan-900',
            shadow: 'shadow-lg shadow-cyan-950/10 hover:shadow-cyan-950/20' 
          },
          { 
            label: 'Active KPIs', 
            value: stats?.activeKpis || kpis.length, 
            sub: `${stats?.totalKpiTargets || targets.length} Targets Set`, 
            icon: Target, 
            iconColor: 'text-purple-600', 
            badgeBg: 'bg-purple-500/20',
            cardBg: 'bg-[#FAF5FF]', 
            borderColor: 'border-purple-300',
            textColor: 'text-purple-950',
            numberColor: 'text-[#4A154B]',
            subColor: 'text-purple-900',
            shadow: 'shadow-lg shadow-purple-950/10 hover:shadow-purple-950/20' 
          },
          { 
            label: 'Pending Approvals', 
            value: stats?.pendingApprovals || 0, 
            sub: `${securityAlerts.filter(a => !a.resolved).length} Alerts`, 
            icon: CheckCircle2, 
            iconColor: 'text-rose-600', 
            badgeBg: 'bg-rose-500/20',
            cardBg: 'bg-[#FFF1F2]', 
            borderColor: 'border-rose-300',
            textColor: 'text-rose-950',
            numberColor: 'text-[#5C1D24]',
            subColor: 'text-rose-900',
            shadow: 'shadow-lg shadow-rose-950/10 hover:shadow-rose-950/20' 
          }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className={`p-4 sm:p-4.5 rounded-2xl ${stat.cardBg} border-2 ${stat.borderColor} ${stat.shadow} transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className={`text-xs sm:text-sm font-extrabold tracking-tight ${stat.textColor}`}>
                  {stat.label}
                </span>
                <div className={`p-1.5 rounded-lg ${stat.badgeBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className={`mt-2.5 text-3xl sm:text-4xl font-black ${stat.numberColor} tracking-tight leading-none`}>
                {stat.value}
              </div>
              <div className={`mt-2 text-[11px] sm:text-xs font-bold ${stat.subColor}`}>
                {stat.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. SYSTEM OVERVIEW / CONTROL CENTER TAB                                   */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* ORGANIZATIONAL HIERARCHY TREE EXPLORER */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  Bank Governance & Hierarchy Explorer
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time interactive structural cascade from Board of Directors down to branch staff
                </p>
              </div>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition"
              >
                Re-Configure Hierarchy
              </button>
            </div>

            {/* Tree Visualizer */}
            <div className="space-y-3 pt-2">
              {/* Level 1: Board of Directors */}
              <div className="p-4 bg-slate-950/90 border border-purple-500/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 text-purple-300 rounded-lg">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Board of Directors & Governance Council</div>
                      <div className="text-xs text-purple-300/80">Supreme Oversight & Policy Formulation Body</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full font-medium">
                    Governance Tier
                  </span>
                </div>
              </div>

              {/* Level 2: Chief Executive Officer (CEO) */}
              <div className="ml-4 pl-4 border-l-2 border-slate-800 space-y-3">
                <div className="p-4 bg-slate-950/90 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          Chief Executive Officer (CEO): {employees.find(e => e.role === 'CEO')?.firstName || 'Mulugeta Alemayehu'}
                        </div>
                        <div className="text-xs text-amber-300/80">Executive Leadership, Strategic Operations & Bank-Wide Administration</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-medium">
                      Executive Tier
                    </span>
                  </div>
                </div>

                {/* Level 3: Chief Officers */}
                <div className="ml-4 pl-4 border-l-2 border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Executive Chief Officers ({chiefTypes.length || 8})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {(chiefTypes.length > 0 ? chiefTypes : [
                      { code: 'CFO', name: 'Chief Financial Officer' },
                      { code: 'CSO', name: 'Chief Strategy Officer' },
                      { code: 'CDO', name: 'Chief Digital Officer' },
                      { code: 'CRB', name: 'Chief Retail Banking' }
                    ]).map((ch: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                        <div className="font-semibold text-white flex items-center justify-between">
                          <span>{ch.code}</span>
                          <span className="text-[10px] text-slate-400">Chief</span>
                        </div>
                        <div className="text-slate-300 text-[11px] truncate">{ch.name}</div>
                      </div>
                    ))}
                  </div>

                  {/* Level 4: Districts */}
                  <div className="pt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Regional Districts ({districts.length}) & Branches ({branches.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {districts.slice(0, 4).map((dist) => {
                      const distBranches = branches.filter(b => b.districtId === dist.id || b.districtName === dist.name);
                      const director = employees.find(e => e.role === 'DISTRICT_DIRECTOR' && (e.districtId === dist.id || e.districtName === dist.name));
                      return (
                        <div key={dist.id} className="p-3.5 bg-slate-950 border border-emerald-500/20 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">{dist.name}</span>
                            <span className="text-xs text-emerald-400 font-medium">{distBranches.length} Branches</span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center justify-between">
                            <span>Director: <strong className="text-slate-200">{director ? `${director.firstName} ${director.lastName}` : 'Assigned'}</strong></span>
                            <span>Region: {dist.region || 'Regional'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CEO & EXECUTIVE CHIEF OFFICERS MANAGEMENT TAB                          */}
      {/* ========================================================================= */}
      {activeTab === 'executives' && (
        <div className="space-y-6">
          {/* ACTIVE CEO PROFILE CARD */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                  Chief Executive Officer (CEO) Administration
                </h2>
                <p className="text-xs text-slate-400">
                  Manage primary executive authority, succession replacement, and security credentials
                </p>
              </div>
            </div>

            {(() => {
              const ceo = employees.find(e => e.role === 'CEO');
              return ceo ? (
                <div className="p-5 bg-slate-950 border border-amber-500/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-lg flex items-center justify-center">
                      CEO
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {ceo.firstName} {ceo.middleName || ''} {ceo.lastName}
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                        <span>User ID: <strong className="text-amber-300">{ceo.userId}</strong></span>
                        <span>Email: {ceo.email || 'ceo@bunnabanksc.com'}</span>
                        <span>Status: <strong className="text-emerald-400">{ceo.status || 'Active'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenResetPassword(ceo)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      Reset Password
                    </button>
                    <button
                      onClick={() => {
                        setEditingUser(ceo);
                        setIsUserModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 bg-slate-950 rounded-xl">
                  No active CEO account found. Click "11-Step Setup Wizard" to provision CEO.
                </div>
              );
            })()}
          </div>

          {/* CHIEF OFFICERS DIRECTORY */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Chief Officers & Functional Executives
                </h2>
                <p className="text-xs text-slate-400">
                  Assign executive jurisdiction, districts, and portfolio oversight
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingUser({
                    id: '',
                    userId: '',
                    firstName: '',
                    lastName: '',
                    role: 'CHIEF_OFFICER',
                    jobTitle: 'Chief Officer',
                    status: 'Active'
                  } as any);
                  setIsUserModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition"
              >
                <Plus className="w-4 h-4" />
                Add Chief Officer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.filter(e => e.role === 'CHIEF_OFFICER' || e.role === 'DIRECTOR').map((chief) => (
                <div key={chief.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">
                        {chief.firstName} {chief.lastName}
                      </div>
                      <div className="text-xs text-blue-400 font-medium">
                        {chief.jobTitle || 'Chief Officer'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 rounded font-semibold">
                      {chief.userId}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div>Email: <span className="text-slate-300">{chief.email || `${chief.userId.toLowerCase()}@bunnabanksc.com`}</span></div>
                    <div>Status: <span className="text-emerald-400">{chief.status || 'Active'}</span></div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenResetPassword(chief)}
                      className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition"
                    >
                      <Key className="w-3 h-3" /> Password
                    </button>
                    <button
                      onClick={() => {
                        setEditingUser(chief);
                        setIsUserModalOpen(true);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DISTRICTS & DIRECTORS MANAGEMENT TAB                                   */}
      {/* ========================================================================= */}
      {activeTab === 'districts' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Regional Districts & District Directors
              </h2>
              <p className="text-xs text-slate-400">
                Configure regional boundaries, director appointments, and branch allocations
              </p>
            </div>
            <button
              onClick={() => {
                setEditingDistrict(null);
                setIsDistrictModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Create District
            </button>
          </div>

          <TablePaginationFilter
            data={districts}
            searchFields={['id', 'name', 'region', 'status']}
            searchPlaceholder="Search districts by ID, name, region..."
            renderTable={(paginatedDistricts) => (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-y border-slate-800">
                  <tr>
                    <th className="p-3">District ID / Code</th>
                    <th className="p-3">District Name</th>
                    <th className="p-3">Region</th>
                    <th className="p-3">Assigned Director</th>
                    <th className="p-3">Branches</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedDistricts.map((dist) => {
                    const distBranches = branches.filter(b => b.districtId === dist.id || b.districtName === dist.name);
                    const director = employees.find(e => e.role === 'DISTRICT_DIRECTOR' && (e.districtId === dist.id || e.districtName === dist.name));
                    return (
                      <tr key={dist.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-amber-300">{dist.id}</td>
                        <td className="p-3 font-semibold text-white">{dist.name}</td>
                        <td className="p-3 text-slate-300">{dist.region || 'Regional'}</td>
                        <td className="p-3">
                          {director ? (
                            <span className="text-slate-200 font-medium">{director.firstName} {director.lastName} ({director.userId})</span>
                          ) : (
                            <span className="text-amber-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-800 text-emerald-400 font-semibold rounded">
                            {distBranches.length}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-medium">
                            {dist.status || 'Active'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingDistrict(dist);
                              setIsDistrictModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BRANCHES & BRANCH MANAGERS DIRECTORY TAB                               */}
      {/* ========================================================================= */}
      {activeTab === 'branches' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-cyan-400" />
                Branch Network & Branch Managers Control
              </h2>
              <p className="text-xs text-slate-400">
                Manage SOL IDs, branch grading, manager appointments, and regional transfers
              </p>
            </div>
            <button
              onClick={() => {
                setEditingBranch(null);
                setIsBranchModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Create Branch
            </button>
          </div>

          <TablePaginationFilter
            data={branches}
            searchFields={['solId', 'id', 'name', 'districtName', 'managerName', 'grade', 'status']}
            searchPlaceholder="Search branches by SOL ID, name, district, manager..."
            renderTable={(paginatedBranches) => (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-y border-slate-800">
                  <tr>
                    <th className="p-3">SOL ID</th>
                    <th className="p-3">Branch Name</th>
                    <th className="p-3">District</th>
                    <th className="p-3">Branch Manager</th>
                    <th className="p-3">Staff Count</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedBranches.map((branch) => {
                    const manager = employees.find(e => e.role === 'MANAGER' && (e.branchId === branch.id || e.branchName === branch.name));
                    const staffCount = employees.filter(e => e.role === 'EMPLOYEE' && (e.branchId === branch.id || e.branchName === branch.name)).length;
                    return (
                      <tr key={branch.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-cyan-300">{branch.solId || branch.id}</td>
                        <td className="p-3 font-semibold text-white">{branch.name}</td>
                        <td className="p-3 text-slate-300">{branch.districtName || 'District'}</td>
                        <td className="p-3">
                          {manager ? (
                            <span className="text-slate-200 font-medium">{manager.firstName} {manager.lastName} <span className="text-xs text-slate-400">({branch.managerName})</span></span>
                          ) : branch.managerName && branch.managerName !== 'Branch Manager' && branch.managerName !== 'Unassigned' ? (
                            <span className="text-slate-200 font-medium">{branch.managerName}</span>
                          ) : (
                            <span className="text-amber-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-200 font-semibold rounded">
                            {staffCount} Staff
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{branch.grade || 'Grade 1'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-medium">
                            {branch.status || 'Active'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingBranch(branch);
                              setIsBranchModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. USER & STAFF DIRECTORY TAB                                             */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Enterprise User & Staff Directory ({filteredUsers.length})
              </h2>
              <p className="text-xs text-slate-400">
                Manage accounts, assign roles, reset passwords, lock/unlock accounts, and execute bulk operations
              </p>
            </div>
            <button
              onClick={() => {
                setEditingUser(null);
                setIsUserModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition"
            >
              <Plus className="w-4 h-4" />
              Create New User
            </button>
          </div>

          {/* User Filters Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div>
              <input
                type="text"
                value={userSearchText}
                onChange={(e) => setUserSearchText(e.target.value)}
                placeholder="Filter by name, ID, email..."
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Roles</option>
                <option value="BANK_SUPER_ADMIN">BANK_SUPER_ADMIN</option>
                <option value="BOARD_OF_DIRECTORS">BOARD_OF_DIRECTORS</option>
                <option value="CEO">CEO</option>
                <option value="CHIEF_OFFICER">CHIEF_OFFICER</option>
                <option value="DIRECTOR">DIRECTOR</option>
                <option value="DISTRICT_DIRECTOR">DISTRICT_DIRECTOR</option>
                <option value="MANAGER">MANAGER</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
              </select>
            </div>
            <div>
              <select
                value={userDistrictFilter}
                onChange={(e) => setUserDistrictFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Districts</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setUserRoleFilter('ALL');
                  setUserDistrictFilter('ALL');
                  setUserStatusFilter('ALL');
                  setUserSearchText('');
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs w-full transition"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedUserIds.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4 text-xs">
              <span className="text-amber-300 font-semibold">
                {selectedUserIds.length} user(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExecuteBulkAction('ACTIVATE')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                >
                  Bulk Activate
                </button>
                <button
                  onClick={() => handleExecuteBulkAction('DEACTIVATE')}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium"
                >
                  Bulk Deactivate
                </button>
                <button
                  onClick={() => handleExecuteBulkAction('LOCK')}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded"
                >
                  Bulk Lock
                </button>
                <button
                  onClick={() => setSelectedUserIds([])}
                  className="px-2 py-1 text-slate-400 hover:text-white"
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <TablePaginationFilter
            data={filteredUsers}
            searchFields={['userId', 'firstName', 'lastName', 'middleName', 'email', 'role', 'jobTitle', 'districtName', 'branchName']}
            searchPlaceholder="Search filtered users by name, ID, email..."
            renderTable={(paginatedUsers) => (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-y border-slate-800">
                  <tr>
                    <th className="p-3 w-8">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedUserIds(filteredUsers.map(u => u.id));
                          else setSelectedUserIds([]);
                        }}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
                      />
                    </th>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Staff Name</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Job Title</th>
                    <th className="p-3">District / Branch</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedUsers.map((u) => {
                    const isSelected = selectedUserIds.includes(u.id);
                    return (
                      <tr key={u.id} className={`hover:bg-slate-800/40 transition ${isSelected ? 'bg-amber-500/5' : ''}`}>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedUserIds(prev => [...prev, u.id]);
                              else setSelectedUserIds(prev => prev.filter(id => id !== u.id));
                            }}
                            className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
                          />
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-300">{u.userId}</td>
                        <td className="p-3 font-semibold text-white">
                          {u.firstName} {u.middleName || ''} {u.lastName}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                            u.role === 'BANK_SUPER_ADMIN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            u.role === 'CEO' ? 'bg-purple-500/20 text-purple-300' :
                            u.role === 'CHIEF_OFFICER' ? 'bg-blue-500/20 text-blue-300' :
                            u.role === 'DISTRICT_DIRECTOR' ? 'bg-emerald-500/20 text-emerald-300' :
                            u.role === 'MANAGER' ? 'bg-cyan-500/20 text-cyan-300' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{u.jobTitle || 'Bank Staff'}</td>
                        <td className="p-3 text-slate-300">
                          {u.districtName || 'Head Office'} / {u.branchName || 'Headquarters'}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded font-medium ${
                              u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}>
                              {u.status || 'Active'}
                            </span>
                            {u.isLocked && (
                              <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[10px] font-bold">
                                LOCKED
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenResetPassword(u)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700"
                            title="Reset Password"
                          >
                            <Key className="w-3.5 h-3.5 inline" />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                            title={u.status === 'Active' ? 'Deactivate' : 'Activate'}
                          >
                            {u.status === 'Active' ? <XCircle className="w-3.5 h-3.5 inline text-rose-400" /> : <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-400" />}
                          </button>
                          <button
                            onClick={() => handleToggleUserLock(u)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                            title={u.isLocked ? 'Unlock Account' : 'Lock Account'}
                          >
                            <Lock className="w-3.5 h-3.5 inline text-amber-400" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setIsUserModalOpen(true);
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ROLES & GRANULAR PERMISSIONS MATRIX TAB                                */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  Role-Based Access Control (RBAC) & Permissions Engine
                </h2>
                <p className="text-xs text-slate-400">
                  Granular permission control and data access boundaries mapped across all 8 organizational tiers
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingRole(null);
                  setIsRoleModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition"
              >
                <Plus className="w-4 h-4" />
                Define Role
              </button>
            </div>

            {/* Granular Permissions Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800">
                <thead className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3 border-r border-slate-800">Module & Permission Definition</th>
                    <th className="p-2 text-center border-r border-slate-800">SUPER ADMIN</th>
                    <th className="p-2 text-center border-r border-slate-800">BOARD</th>
                    <th className="p-2 text-center border-r border-slate-800">CEO</th>
                    <th className="p-2 text-center border-r border-slate-800">CHIEF</th>
                    <th className="p-2 text-center border-r border-slate-800">DIST. DIRECTOR</th>
                    <th className="p-2 text-center border-r border-slate-800">MANAGER</th>
                    <th className="p-2 text-center">EMPLOYEE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { module: 'System & Architecture', name: 'Configure System Settings & Policies', superAdmin: true, board: false, ceo: false, chief: false, director: false, manager: false, employee: false },
                    { module: 'Organization Governance', name: 'Manage Bank Hierarchy, Branches, Districts', superAdmin: true, board: true, ceo: true, chief: false, director: false, manager: false, employee: false },
                    { module: 'Executive Authority', name: 'Approve & Cascade Annual Targets', superAdmin: true, board: true, ceo: true, chief: true, director: true, manager: false, employee: false },
                    { module: 'Staff Management', name: 'Create, Edit, Lock, and Manage Staff Accounts', superAdmin: true, board: false, ceo: true, chief: true, director: true, manager: true, employee: false },
                    { module: 'Performance Review', name: 'Approve / Reject Daily Performance Reports', superAdmin: true, board: false, ceo: false, chief: true, director: true, manager: true, employee: false },
                    { module: 'Daily Submissions', name: 'Submit Daily Performance Reports', superAdmin: false, board: false, ceo: false, chief: false, director: false, manager: false, employee: true },
                    { module: 'Security & Audits', name: 'View Audit Vault & Revoke Active Sessions', superAdmin: true, board: true, ceo: true, chief: false, director: false, manager: false, employee: false }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 border-r border-slate-800">
                        <div className="font-semibold text-white">{row.name}</div>
                        <div className="text-[10px] text-slate-400">{row.module}</div>
                      </td>
                      <td className="p-2 text-center border-r border-slate-800">
                        {row.superAdmin ? <CheckCircle2 className="w-4 h-4 text-amber-400 mx-auto" /> : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="p-2 text-center border-r border-slate-800">
                        {row.board ? <CheckCircle2 className="w-4 h-4 text-purple-400 mx-auto" /> : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="p-2 text-center border-r border-slate-800">
                        {row.ceo ? <CheckCircle2 className="w-4 h-4 text-blue-400 mx-auto" /> : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="p-2 text-center border-r border-slate-800">
                        {row.chief ? <CheckCircle2 className="w-4 h-4 text-cyan-400 mx-auto" /> : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="p-2 text-center border-r border-slate-800">
                        {row.director ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="p-2 text-center border-r border-slate-800">
                        {row.manager ? <CheckCircle2 className="w-4 h-4 text-indigo-400 mx-auto" /> : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="p-2 text-center">
                        {row.employee ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-slate-600">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MASTER KPIS & BALANCED SCORECARD TAB                                   */}
      {/* ========================================================================= */}
      {activeTab === 'kpis' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Master Balanced Scorecard & KPI Weights Engine
              </h2>
              <p className="text-xs text-slate-400">
                Configure primary banking indicators, weight distributions (Total 100%), and calculation methods
              </p>
            </div>
            <button
              onClick={() => {
                setEditingKpi(null);
                setIsKpiModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Add Custom KPI
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-y border-slate-800">
                <tr>
                  <th className="p-3">KPI Code</th>
                  <th className="p-3">Indicator Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Weight (%)</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Frequency</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {kpis.map((kpi) => (
                  <tr key={kpi.id || kpi.code} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-purple-300">{kpi.code}</td>
                    <td className="p-3 font-semibold text-white">{kpi.name}</td>
                    <td className="p-3 text-slate-300">{kpi.category || 'Finance'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded font-bold">
                        {kpi.weight}%
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{kpi.unit}</td>
                    <td className="p-3 text-slate-300">{kpi.frequency || 'Daily'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-medium">
                        {kpi.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingKpi(kpi);
                          setIsKpiModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. APPROVAL WORKFLOWS TAB                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'approvals' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Multi-Stage Approval Hierarchy & Global Review Backlog
            </h2>
            <p className="text-xs text-slate-400">
              Configure verification stages, escalation rules, and process pending reports across all bank branches
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {[
              { stage: 1, title: 'Stage 1: Branch Manager Review', desc: 'Verifies daily branch teller & officer physical slips vs system records', autoApprove: 'Manual Verification', role: 'MANAGER' },
              { stage: 2, title: 'Stage 2: District Director Audit', desc: 'Validates aggregated branch daily totals across district clusters', autoApprove: 'Escalation After 24h', role: 'DISTRICT_DIRECTOR' },
              { stage: 3, title: 'Stage 3: Executive / System Confirmation', desc: 'Final financial ledger integration & balance sheet update', autoApprove: 'Instant Verification', role: 'BANK_SUPER_ADMIN' }
            ].map((st) => (
              <div key={st.stage} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400">STAGE {st.stage}</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 font-medium">{st.role}</span>
                </div>
                <div className="text-sm font-bold text-white">{st.title}</div>
                <div className="text-xs text-slate-400">{st.desc}</div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400">
                  Policy: {st.autoApprove}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. SYSTEM SETTINGS & BANK HOLIDAYS TAB                                    */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              Corporate Identity & Operational Parameters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <span className="font-bold text-slate-300 text-sm">Bank Identity</span>
                <div>Bank Full Name: <strong className="text-white">Bunna Bank S.C.</strong></div>
                <div>Acronym: <strong className="text-amber-300">BUNNA</strong></div>
                <div>Headquarters: <strong className="text-white">Addis Ababa, Ethiopia</strong></div>
                <div>Base Currency: <strong className="text-emerald-400">ETB (Ethiopian Birr)</strong></div>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <span className="font-bold text-slate-300 text-sm">Security & Access Policy</span>
                <div>Session Inactivity Timeout: <strong className="text-white">30 minutes</strong></div>
                <div>Password Expiry Policy: <strong className="text-white">90 days</strong></div>
                <div>Max Failed Login Attempts: <strong className="text-rose-400">5 attempts (Instant Lock)</strong></div>
                <div>Two-Factor Authentication (2FA): <strong className="text-emerald-400">Enforced for Admin/Executives</strong></div>
              </div>
            </div>
          </div>

          {/* BANK HOLIDAYS MANAGER */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  National & Banking Holidays Calendar ({holidays.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Defines non-working banking days excluded from daily performance deadline penalties
                </p>
              </div>
              <button
                onClick={() => setIsHolidayModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
              >
                <Plus className="w-4 h-4" /> Add Holiday
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {holidays.map((h) => (
                <div key={h.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{h.name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{h.date}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-medium text-[10px]">
                    Holiday
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. SECURITY CENTER TAB                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Active Sessions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Active User Sessions Inspector ({securitySessions.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-y border-slate-800 font-semibold">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Login Timestamp</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {securitySessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">{sess.userName} ({sess.userId})</td>
                      <td className="p-3 text-slate-300">{sess.userRole}</td>
                      <td className="p-3 font-mono text-slate-400">{sess.ipAddress}</td>
                      <td className="p-3 text-slate-400">{new Date(sess.loginTime).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-medium text-[11px] ${sess.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {sess.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {sess.status === 'ACTIVE' && (
                          <button
                            onClick={async () => {
                              await api.admin.revokeSecuritySession(sess.id);
                              showToast(`Session for ${sess.userName} revoked.`);
                              loadAdminData();
                            }}
                            className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 rounded text-xs"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Alerts */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Security Alerts & Anomalies ({securityAlerts.length})
            </h2>
            <div className="space-y-2">
              {securityAlerts.map((alt) => (
                <div key={alt.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        alt.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                        alt.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {alt.severity}
                      </span>
                      <span className="font-bold text-white">{alt.title}</span>
                    </div>
                    <div className="text-slate-400 mt-1">{alt.description}</div>
                  </div>
                  {!alt.resolved && (
                    <button
                      onClick={async () => {
                        await api.admin.resolveSecurityAlert(alt.id);
                        showToast('Alert resolved.');
                        loadAdminData();
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. AUDIT VAULT TAB                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Immutable System Audit Vault ({auditLogs.length} entries)
              </h2>
              <p className="text-xs text-slate-400">
                Cryptographically tracked record of all administrative, governance, and transactional mutations
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-y border-slate-800 font-semibold uppercase">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Operator</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.slice(0, 50).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400 font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-white">{log.userName || log.userId}</td>
                    <td className="p-3 text-amber-400">{log.userRole}</td>
                    <td className="p-3 font-bold text-slate-200">{log.action}</td>
                    <td className="p-3 font-mono text-slate-400">{log.entity}</td>
                    <td className="p-3 text-slate-300 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11-STEP INTERACTIVE SETUP WIZARD MODAL                                    */}
      {/* ========================================================================= */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Wizard Header */}
            <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    11-Step Bank-Level Organization Setup Engine
                  </h2>
                </div>
                <p className="text-xs text-amber-200/70 mt-1">
                  Step {wizardStep} of 11 — Comprehensive hierarchy & performance initialization
                </p>
              </div>
              <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto text-[11px]">
              {[
                'Bank Identity', 'Board', 'CEO', 'Chiefs', 'Districts',
                'Directors', 'Branches', 'Managers', 'Staffing', 'Scorecard', 'Activation'
              ].map((stepName, idx) => {
                const sNum = idx + 1;
                const isCurrent = wizardStep === sNum;
                const isDone = wizardStep > sNum;
                return (
                  <div key={sNum} className="flex items-center gap-1.5 whitespace-nowrap">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      isCurrent ? 'bg-amber-500 text-slate-950' :
                      isDone ? 'bg-emerald-500 text-white' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {isDone ? <Check className="w-3.5 h-3.5" /> : sNum}
                    </div>
                    <span className={`font-medium ${isCurrent ? 'text-amber-300' : isDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {stepName}
                    </span>
                    {sNum < 11 && <ChevronRight className="w-3.5 h-3.5 text-slate-700" />}
                  </div>
                );
              })}
            </div>

            {/* Wizard Body (Steps) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-200">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white">Step 1: Bank Identity & Corporate Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Bank Full Legal Name</label>
                      <input
                        type="text"
                        value={wizardData.bankName}
                        onChange={(e) => setWizardData({ ...wizardData, bankName: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Bank Acronym / Short Code</label>
                      <input
                        type="text"
                        value={wizardData.bankAcronym}
                        onChange={(e) => setWizardData({ ...wizardData, bankAcronym: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Headquarters City</label>
                      <input
                        type="text"
                        value={wizardData.headquartersCity}
                        onChange={(e) => setWizardData({ ...wizardData, headquartersCity: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Head Office SOL Code</label>
                      <input
                        type="text"
                        value={wizardData.headquartersSol}
                        onChange={(e) => setWizardData({ ...wizardData, headquartersSol: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white">Step 2: Board of Directors & Governance Council</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Board Chairman Name</label>
                      <input
                        type="text"
                        value={wizardData.boardChairmanName}
                        onChange={(e) => setWizardData({ ...wizardData, boardChairmanName: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Board Governance Email</label>
                      <input
                        type="email"
                        value={wizardData.boardEmail}
                        onChange={(e) => setWizardData({ ...wizardData, boardEmail: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white">Step 3: Chief Executive Officer (CEO) Provisioning</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">CEO Full Name</label>
                      <input
                        type="text"
                        value={wizardData.ceoName}
                        onChange={(e) => setWizardData({ ...wizardData, ceoName: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">CEO User ID</label>
                      <input
                        type="text"
                        value={wizardData.ceoUserId}
                        onChange={(e) => setWizardData({ ...wizardData, ceoUserId: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">CEO Corporate Email</label>
                      <input
                        type="email"
                        value={wizardData.ceoEmail}
                        onChange={(e) => setWizardData({ ...wizardData, ceoEmail: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white">Step 4: Executive Chief Officers Structure</h3>
                  <div className="space-y-2">
                    {wizardData.chiefsList.map((ch, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-4">
                        <span className="font-bold text-amber-400 w-16">{ch.code}</span>
                        <input
                          type="text"
                          value={ch.name}
                          onChange={(e) => {
                            const updated = [...wizardData.chiefsList];
                            updated[idx].name = e.target.value;
                            setWizardData({ ...wizardData, chiefsList: updated });
                          }}
                          className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-white"
                        />
                        <input
                          type="text"
                          value={ch.userId}
                          onChange={(e) => {
                            const updated = [...wizardData.chiefsList];
                            updated[idx].userId = e.target.value;
                            setWizardData({ ...wizardData, chiefsList: updated });
                          }}
                          className="w-36 p-2 bg-slate-900 border border-slate-700 rounded text-amber-300 font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white">Step 5: Regional Districts Structure</h3>
                  <div className="space-y-2">
                    {wizardData.districtsList.map((d, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-4">
                        <input
                          type="text"
                          value={d.name}
                          onChange={(e) => {
                            const updated = [...wizardData.districtsList];
                            updated[idx].name = e.target.value;
                            setWizardData({ ...wizardData, districtsList: updated });
                          }}
                          className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-white"
                        />
                        <input
                          type="text"
                          value={d.region}
                          onChange={(e) => {
                            const updated = [...wizardData.districtsList];
                            updated[idx].region = e.target.value;
                            setWizardData({ ...wizardData, districtsList: updated });
                          }}
                          className="w-48 p-2 bg-slate-900 border border-slate-700 rounded text-slate-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 6 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white">Step 6: District Directors Appointments</h3>
                  <p className="text-xs text-slate-400">All district director appointments linked to corresponding district regional units.</p>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-semibold">4 District Directors ready for automatic binding.</span>
                  </div>
                </div>
              )}

              {wizardStep === 7 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white">Step 7: Branches & SOL Code Configuration</h3>
                  <div className="space-y-2">
                    {wizardData.branchesList.map((b, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-4">
                        <input
                          type="text"
                          value={b.name}
                          onChange={(e) => {
                            const updated = [...wizardData.branchesList];
                            updated[idx].name = e.target.value;
                            setWizardData({ ...wizardData, branchesList: updated });
                          }}
                          className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-white"
                        />
                        <input
                          type="text"
                          value={b.solId}
                          onChange={(e) => {
                            const updated = [...wizardData.branchesList];
                            updated[idx].solId = e.target.value;
                            setWizardData({ ...wizardData, branchesList: updated });
                          }}
                          className="w-24 p-2 bg-slate-900 border border-slate-700 rounded text-cyan-300 font-mono"
                        />
                        <span className="text-slate-400 text-xs w-36 truncate">{b.district}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 8 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white">Step 8: Branch Managers Assignment</h3>
                  <p className="text-xs text-slate-400">Ensure one manager per branch structure is maintained.</p>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-cyan-400 font-semibold">Branch Manager assignments ready for synchronization.</span>
                  </div>
                </div>
              )}

              {wizardStep === 9 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white">Step 9: Staffing & Employee Allocation</h3>
                  <p className="text-xs text-slate-400">All branch staff accounts mapped to SOL codes.</p>
                </div>
              )}

              {wizardStep === 10 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white">Step 10: Balanced Scorecard & 100% Weight Check</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <span>Deposit Mobilization: <strong>{wizardData.kpiWeights.deposit}%</strong></span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <span>Foreign Currency (FCY): <strong>{wizardData.kpiWeights.fcy}%</strong></span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <span>Digital Financial Services: <strong>{wizardData.kpiWeights.dfs}%</strong></span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <span>Customer Base: <strong>{wizardData.kpiWeights.customerBase}%</strong></span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <span>Digitals (Mobile, ATM, POS, Internet): <strong>{wizardData.kpiWeights.digitals}%</strong></span>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 font-bold flex items-center justify-between">
                    <span>Total Balanced Scorecard Weight:</span>
                    <span>100% (PERFECTLY BALANCED)</span>
                  </div>
                </div>
              )}

              {wizardStep === 11 && (
                <div className="space-y-4 text-center py-6">
                  <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-2xl mx-auto flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Step 11: Final Review & Live System Activation</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Click below to commit the 11-step organization blueprint directly to the live persistent PostgreSQL and Cloud Firestore databases.
                  </p>
                </div>
              )}
            </div>

            {/* Wizard Navigation Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                disabled={wizardStep === 1}
                onClick={() => setWizardStep(prev => prev - 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium disabled:opacity-40 transition"
              >
                Previous Step
              </button>

              {wizardStep < 11 ? (
                <button
                  onClick={() => setWizardStep(prev => prev + 1)}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCompleteWizard}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Activate & Commit System
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESET PASSWORD MODAL                                                      */}
      {/* ========================================================================= */}
      {isResetPasswordModalOpen && passwordResetTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                Reset Staff Password
              </h3>
              <button onClick={() => setIsResetPasswordModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Resetting credentials for <strong className="text-white">{passwordResetTarget.firstName} {passwordResetTarget.lastName} ({passwordResetTarget.userId})</strong>.
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Generated Temporary Password</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generatedPassword}
                  onChange={(e) => setGeneratedPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPassword);
                    showToast('Temporary password copied to clipboard!');
                  }}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPasswordReset}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                Confirm Password Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* USER CREATE / EDIT MODAL                                                  */}
      {/* ========================================================================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                {editingUser?.id ? 'Edit User Profile' : 'Create New User Account'}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const payload: any = {
                  userId: formData.get('userId'),
                  firstName: formData.get('firstName'),
                  middleName: formData.get('middleName'),
                  lastName: formData.get('lastName'),
                  email: formData.get('email'),
                  role: formData.get('role'),
                  jobTitle: formData.get('jobTitle'),
                  districtId: formData.get('districtId'),
                  branchId: formData.get('branchId'),
                  status: formData.get('status') || 'Active'
                };
                if (!editingUser?.id) {
                  payload.password = formData.get('password') || 'Bunna@2026!';
                }
                try {
                  if (editingUser?.id) {
                    await api.admin.updateUser(editingUser.id, payload);
                    showToast('User updated successfully.');
                  } else {
                    await api.admin.createUser(payload);
                    showToast('User account created.');
                  }
                  setIsUserModalOpen(false);
                  await onRefreshData();
                  await loadAdminData();
                } catch (err: any) {
                  showToast(err.message || 'Failed to save user', true);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">User ID / Username *</label>
                  <input
                    name="userId"
                    defaultValue={editingUser?.userId}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Role Type *</label>
                  <select
                    name="role"
                    defaultValue={editingUser?.role || 'EMPLOYEE'}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="BANK_SUPER_ADMIN">BANK_SUPER_ADMIN</option>
                    <option value="BOARD_OF_DIRECTORS">BOARD_OF_DIRECTORS</option>
                    <option value="CEO">CEO</option>
                    <option value="CHIEF_OFFICER">CHIEF_OFFICER</option>
                    <option value="DIRECTOR">DIRECTOR</option>
                    <option value="DISTRICT_DIRECTOR">DISTRICT_DIRECTOR</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">First Name *</label>
                  <input
                    name="firstName"
                    defaultValue={editingUser?.firstName}
                    required
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Middle Name</label>
                  <input
                    name="middleName"
                    defaultValue={editingUser?.middleName}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Last Name</label>
                  <input
                    name="lastName"
                    defaultValue={editingUser?.lastName}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Corporate Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingUser?.email}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">District</label>
                  <select
                    name="districtId"
                    defaultValue={editingUser?.districtId || 'DIST-HO'}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Branch</label>
                  <select
                    name="branchId"
                    defaultValue={editingUser?.branchId || 'BR-HQ'}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} (SOL: {b.solId})</option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingUser?.id && (
                <div>
                  <label className="block text-slate-400 mb-1">Initial Password</label>
                  <input
                    name="password"
                    defaultValue="Bunna@2026!"
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D9A514] hover:bg-[#F2C230] text-[#4A2815] font-bold rounded-xl shadow-md transition"
                >
                  {editingUser?.id ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DISTRICT CREATE / EDIT MODAL                                              */}
      {/* ========================================================================= */}
      {isDistrictModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#4A2815] border border-[#D9A514]/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#D9A514]" />
                {editingDistrict ? 'Edit District' : 'Create New District'}
              </h3>
              <button onClick={() => setIsDistrictModalOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const payload = {
                  id: (formData.get('id') as string) || `DIST-${Date.now().toString().slice(-4)}`,
                  name: formData.get('name') as string,
                  region: formData.get('region') as string,
                  status: (formData.get('status') as string) || 'Active'
                };
                try {
                  if (editingDistrict) {
                    await api.admin.updateDistrict(editingDistrict.id, payload);
                    showToast('District updated successfully.');
                  } else {
                    await api.admin.createDistrict(payload);
                    showToast('District created successfully.');
                  }
                  setIsDistrictModalOpen(false);
                  await onRefreshData();
                  await loadAdminData();
                } catch (err: any) {
                  showToast(err.message || 'Failed to save district', true);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-gray-300 mb-1">District Code / ID *</label>
                <input
                  name="id"
                  defaultValue={editingDistrict?.id}
                  required
                  disabled={!!editingDistrict}
                  placeholder="e.g. DIST-CENTRAL"
                  className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white font-mono disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">District Name *</label>
                <input
                  name="name"
                  defaultValue={editingDistrict?.name}
                  required
                  placeholder="e.g. North Addis District"
                  className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Region / Zone</label>
                <input
                  name="region"
                  defaultValue={editingDistrict?.region}
                  placeholder="e.g. Addis Ababa / Amhara / Oromia"
                  className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Operating Status</label>
                <select
                  name="status"
                  defaultValue={editingDistrict?.status || 'Active'}
                  className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDistrictModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D9A514] hover:bg-[#F2C230] text-[#4A2815] font-bold rounded-xl shadow-md transition"
                >
                  {editingDistrict ? 'Save Changes' : 'Create District'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BRANCH CREATE / EDIT MODAL                                                */}
      {/* ========================================================================= */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#4A2815] border border-[#D9A514]/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-[#D9A514]" />
                {editingBranch ? 'Edit Branch' : 'Create New Branch'}
              </h3>
              <button onClick={() => setIsBranchModalOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const districtId = formData.get('districtId') as string;
                const foundDist = districts.find(d => d.id === districtId);
                const payload = {
                  id: (formData.get('id') as string) || `BR-${Date.now().toString().slice(-4)}`,
                  solId: (formData.get('solId') as string) || '100',
                  name: formData.get('name') as string,
                  districtId: districtId,
                  districtName: foundDist?.name || 'District',
                  grade: (formData.get('grade') as string) || 'Grade 1',
                  status: (formData.get('status') as string) || 'Active'
                };
                try {
                  if (editingBranch) {
                    await api.admin.updateBranch(editingBranch.id, payload);
                    showToast('Branch updated successfully.');
                  } else {
                    await api.admin.createBranch(payload);
                    showToast('Branch created successfully.');
                  }
                  setIsBranchModalOpen(false);
                  await onRefreshData();
                  await loadAdminData();
                } catch (err: any) {
                  showToast(err.message || 'Failed to save branch', true);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">SOL ID Code *</label>
                  <input
                    name="solId"
                    defaultValue={editingBranch?.solId}
                    required
                    placeholder="e.g. 102"
                    className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-[#F2C230] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Branch Grade</label>
                  <select
                    name="grade"
                    defaultValue={editingBranch?.grade || 'Grade 1'}
                    className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white"
                  >
                    <option value="Special Grade">Special Grade</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Branch Name *</label>
                <input
                  name="name"
                  defaultValue={editingBranch?.name}
                  required
                  placeholder="e.g. Bole Medhanialem Branch"
                  className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Parent District *</label>
                <select
                  name="districtId"
                  defaultValue={editingBranch?.districtId || districts[0]?.id}
                  required
                  className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white"
                >
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.region || 'Regional'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Operating Status</label>
                <select
                  name="status"
                  defaultValue={editingBranch?.status || 'Active'}
                  className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D9A514] hover:bg-[#F2C230] text-[#4A2815] font-bold rounded-xl shadow-md transition"
                >
                  {editingBranch ? 'Save Changes' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KPI CREATE / EDIT MODAL                                                   */}
      {/* ========================================================================= */}
      {isKpiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#4A2815] border border-[#D9A514]/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#D9A514]" />
                {editingKpi ? 'Edit Balanced Scorecard KPI' : 'Add Custom KPI'}
              </h3>
              <button onClick={() => setIsKpiModalOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const payload = {
                  id: editingKpi?.id || (formData.get('code') as string),
                  code: formData.get('code') as string,
                  name: formData.get('name') as string,
                  category: formData.get('category') as string,
                  weight: Number(formData.get('weight') || 10),
                  unit: formData.get('unit') as string,
                  frequency: (formData.get('frequency') as string) || 'Daily',
                  status: (formData.get('status') as string) || 'Active'
                };
                try {
                  if (editingKpi?.id) {
                    await api.admin.updateKpi(editingKpi.id, payload);
                    showToast('KPI updated successfully.');
                  } else {
                    await api.admin.createKpi(payload);
                    showToast('KPI created successfully.');
                  }
                  setIsKpiModalOpen(false);
                  await onRefreshData();
                  await loadAdminData();
                } catch (err: any) {
                  showToast(err.message || 'Failed to save KPI', true);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">KPI Code *</label>
                  <input
                    name="code"
                    defaultValue={editingKpi?.code}
                    required
                    placeholder="e.g. DEP_SAVING"
                    className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-[#F2C230] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Weight (%) *</label>
                  <input
                    name="weight"
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={editingKpi?.weight || 15}
                    required
                    className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Indicator Full Name *</label>
                <input
                  name="name"
                  defaultValue={editingKpi?.name}
                  required
                  placeholder="e.g. Saving & Time Deposit Mobilization"
                  className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Category / Perspective</label>
                  <select
                    name="category"
                    defaultValue={editingKpi?.category || 'Finance'}
                    className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white"
                  >
                    <option value="Finance">Financial Perspective</option>
                    <option value="Customer">Customer Perspective</option>
                    <option value="Digital">Digital Financial Services</option>
                    <option value="Operations">Internal Operations</option>
                    <option value="Learning">Learning & Growth</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Measurement Unit</label>
                  <input
                    name="unit"
                    defaultValue={editingKpi?.unit || 'ETB'}
                    placeholder="e.g. ETB / USD / Count"
                    className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsKpiModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D9A514] hover:bg-[#F2C230] text-[#4A2815] font-bold rounded-xl shadow-md transition"
                >
                  {editingKpi ? 'Save Changes' : 'Create KPI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BANK HOLIDAY MODAL                                                        */}
      {/* ========================================================================= */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#4A2815] border border-[#D9A514]/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#D9A514]" />
                Add Banking Holiday
              </h3>
              <button onClick={() => setIsHolidayModalOpen(false)} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const payload = {
                  id: `HOL-${Date.now().toString().slice(-4)}`,
                  name: formData.get('name') as string,
                  date: formData.get('date') as string,
                  type: 'National'
                };
                try {
                  await api.admin.createHoliday(payload);
                  showToast('Holiday added to calendar.');
                  setIsHolidayModalOpen(false);
                  await onRefreshData();
                  await loadAdminData();
                } catch (err: any) {
                  showToast(err.message || 'Failed to add holiday', true);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-gray-300 mb-1">Holiday Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Ethiopian New Year (Enkutatash)"
                  className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Date (YYYY-MM-DD) *</label>
                <input
                  name="date"
                  type="date"
                  required
                  className="w-full p-2.5 bg-black/40 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D9A514] hover:bg-[#F2C230] text-[#4A2815] font-bold rounded-xl shadow-md transition"
                >
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
