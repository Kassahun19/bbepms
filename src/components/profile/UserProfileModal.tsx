import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  X,
  Building2,
  Shield,
  Briefcase,
  UserCheck,
  Award,
  Calendar,
  Mail,
  Phone,
  FileText,
  Lock,
  CheckCircle2,
  Sparkles,
  Download,
  Key,
  BellRing,
  Activity,
  Zap,
  Star,
  AlertCircle,
  KeyRound,
  LayoutDashboard,
  MapPin,
  Users,
  Target,
  Megaphone,
  BarChart3,
  UserCog,
  ShieldCheck,
  Settings,
  TrendingUp,
  MessageSquare,
  Bell,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { User, UserRole, PerformanceTarget, DailyPerformanceReport, getUserFullName, Language } from '../../types';
import { api } from '../../services/api';
import { BranchEmployeeTargetManager } from '../dashboard/BranchEmployeeTargetManager';
import { SubmitReportSection } from '../reports/SubmitReportSection';
import { translations } from '../../i18n/translations';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  targets?: PerformanceTarget[];
  reports?: DailyPerformanceReport[];
  employees?: User[];
  onRefreshData?: () => void;
  onOpenAiSummary?: (employee: User) => void;
  onNavigateTab?: (itemId: string, roleGroup: UserRole) => void;
  onLogout?: () => void;
  language?: Language;
  onUserUpdated?: (updatedUser: User) => void;
  initialTab?: 'profile' | 'createReport' | 'navigation' | 'targets' | 'badges' | 'security' | 'activity';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  targets = [],
  reports = [],
  employees = [],
  onRefreshData,
  onOpenAiSummary,
  onNavigateTab,
  onLogout,
  language = 'en',
  onUserUpdated,
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'createReport' | 'navigation' | 'targets' | 'badges' | 'security' | 'activity'>(initialTab || 'profile');
  const t = translations[language] || translations['en'];
  const [selectedUser, setSelectedUser] = useState<User>(user);

  useEffect(() => {
    setSelectedUser(user);
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [user, initialTab]);

  const activeEmployee = selectedUser || user;

  const [firstName, setFirstName] = useState(activeEmployee.firstName || '');
  const [middleName, setMiddleName] = useState(activeEmployee.middleName || '');
  const [lastName, setLastName] = useState(activeEmployee.lastName || '');
  const [userIdInput, setUserIdInput] = useState(activeEmployee.userId || '');
  const [phone, setPhone] = useState(activeEmployee.phone || '');
  const [email, setEmail] = useState(activeEmployee.email || 'employee@bunnabanksc.com');
  const [emergencyContact, setEmergencyContact] = useState('+251 912 345 678');
  const [isSaved, setIsSaved] = useState(false);

  // Security & Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  if (!isOpen || !activeEmployee) return null;

  // Filter reports submitted by or managed by this user
  const userReports = reports.filter(r => r.employeeName === getUserFullName(activeEmployee) || r.employeeId === activeEmployee.id);
  const approvedCount = userReports.filter(r => r.status === 'Approved').length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/employees/${activeEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          userId: userIdInput,
          email,
          phone,
        })
      });
      if (res.ok) {
        const updated = await res.json();
        if (onUserUpdated) onUserUpdated(updated);
        localStorage.setItem('bunna_user', JSON.stringify(updated));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Password requirement flags
  const pwdCriteria = {
    minLen: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNum: /[0-9]/.test(newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(newPassword)
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentPassword) {
      setPwdError('Please enter your current account password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwdError('New Password and Confirm New Password do not match.');
      return;
    }

    if (!Object.values(pwdCriteria).every(Boolean)) {
      setPwdError('New password does not fulfill all security complexity requirements (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special symbol).');
      return;
    }

    setPwdLoading(true);

    try {
      const res = await api.changePassword({
        userId: user.id || activeEmployee.id,
        currentPassword,
        newPassword
      });

      const updatedUser = res.user || { ...activeEmployee, password: newPassword };
      setPwdSuccess(res.message || '✓ Password updated successfully! Use your new password for future logins.');
      
      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }
      localStorage.setItem('bunna_user', JSON.stringify(updatedUser));

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPwdError(err.message || 'Failed to update password. Please check your current password and try again.');
    } finally {
      setPwdLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMINISTRATOR':
        return { label: 'System Administrator', icon: Shield, bg: 'bg-rose-500/20 text-rose-400 border-rose-500/40' };
      case 'MANAGER':
        return { label: 'Branch / District Manager', icon: Briefcase, bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      default:
        return { label: 'Professional Banking Officer', icon: UserCheck, bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
    }
  };

  const badgeInfo = getRoleBadge(user.role);
  const RoleIcon = badgeInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto pt-4 sm:pt-8 md:pt-10">
      <div className="bg-[#4A2C17] border border-[#C89A2B]/40 rounded-3xl w-full max-w-4xl shadow-2xl text-white overflow-hidden mb-8 transform transition-all">
        
        {/* Banner & Header */}
        <div className="relative p-6 bg-gradient-to-r from-[#6B3F1D] via-[#4A2C17] to-[#6B3F1D] border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C89A2B] to-[#6B3F1D] p-1 shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-[#6B3F1D] rounded-[14px] flex items-center justify-center text-2xl font-black text-[#C89A2B]">
                {activeEmployee.firstName[0]}{(activeEmployee.middleName || activeEmployee.lastName || '')[0]}
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black text-white">{getUserFullName(activeEmployee)}</h2>
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${badgeInfo.bg}`}>
                  <RoleIcon className="w-3.5 h-3.5" />
                  {badgeInfo.label}
                </span>
              </div>

              <p className="text-xs text-[#C89A2B] font-semibold">{activeEmployee.jobTitle || 'Banking Professional'} • Bunna Bank S.C.</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] text-gray-300 pt-1">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-[#C89A2B]" /> {activeEmployee.branchName || 'Head Office'}</span>
                <span>•</span>
                <span>Staff ID: <strong className="text-white">{activeEmployee.id}</strong></span>
                <span>•</span>
                <span>Status: <strong className="text-emerald-400">Active</strong></span>
              </div>

              {/* AI Natural Language Performance Summary Trigger */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAiSummary) {
                      onOpenAiSummary(activeEmployee);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] text-[#6B3F1D] font-extrabold text-xs flex items-center space-x-1.5 shadow-lg hover:brightness-110 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#6B3F1D]" />
                  <span>AI Performance Summary in Drawer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto mt-6 pt-4 border-t border-white/10 text-xs font-bold">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'profile' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {t.personalProfile || 'Personal Profile'}
            </button>

            <button
              onClick={() => setActiveTab('createReport')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 shadow-lg border ${
                activeTab === 'createReport' 
                  ? 'bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] text-[#6B3F1D] border-[#C89A2B] font-black' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>{t.createReportMenu || 'Create Daily Report'}</span>
            </button>

            <button
              onClick={() => setActiveTab('navigation')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'navigation' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t.roleNavigation || 'Role Navigation Menus'}</span>
            </button>

            <button
              onClick={() => setActiveTab('targets')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'targets' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              Target & KPI Assignments
            </button>

            <button
              onClick={() => setActiveTab('badges')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'badges' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              Badges & Recognition
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'security' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              Security & Permissions
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'activity' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              Audit Trail
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          
          {/* TAB: CREATE DAILY REPORT */}
          {activeTab === 'createReport' && (
            <SubmitReportSection
              user={activeEmployee}
              reports={reports}
              onRefreshData={onRefreshData}
              language={language}
              isInsideModal={true}
            />
          )}

          {/* TAB: ROLE NAVIGATION MENUS */}
          {activeTab === 'navigation' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#6B3F1D]/50 border border-[#C89A2B]/30 text-white">
                <h3 className="font-bold text-base text-[#C89A2B] mb-1 flex items-center space-x-2">
                  <LayoutDashboard className="w-5 h-5 text-[#C89A2B]" />
                  <span>System Navigation & Role Menus</span>
                </h3>
                <p className="text-xs text-gray-300">
                  Select any profile menu or tab below to switch role contexts and jump directly to that module.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Admin Navigation Card */}
                <div className="p-5 rounded-2xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-xl space-y-3">
                  <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
                    <Shield className="w-5 h-5 text-[#C89A2B]" />
                    <h4 className="font-bold text-sm text-white">Admin Navigation</h4>
                  </div>
                  <div className="space-y-1">
                    {[
                      { id: 'admin_dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
                      { id: 'districts', label: 'Districts/Area Offices', icon: MapPin },
                      { id: 'branches', label: 'Branches', icon: Building2 },
                      { id: 'employees', label: 'Employees', icon: Users },
                      { id: 'kpi_management', label: 'KPI Management', icon: Target },
                      { id: 'campaign_management', label: 'Campaign Management', icon: Megaphone },
                      { id: 'reports_analytics', label: 'Reports & Analytics', icon: BarChart3 },
                      { id: 'user_management', label: 'User Management', icon: UserCog },
                      { id: 'roles_permissions', label: 'Roles & Permissions', icon: ShieldCheck },
                      { id: 'my_profile', label: 'My Profile', icon: UserCheck },
                      { id: 'settings', label: 'Settings', icon: Settings },
                    ].map(item => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab(item.id, 'ADMINISTRATOR');
                            onClose();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-gray-200 hover:text-white hover:bg-white/10 flex items-center space-x-2.5 transition-all group font-medium"
                        >
                          <IconComp className="w-4 h-4 text-[#C89A2B] group-hover:scale-110 transition-transform" />
                          <span className="flex-1">{item.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Manager Navigation Card */}
                <div className="p-5 rounded-2xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-xl space-y-3">
                  <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
                    <Briefcase className="w-5 h-5 text-[#C89A2B]" />
                    <h4 className="font-bold text-sm text-white">Manager Navigation</h4>
                  </div>
                  <div className="space-y-1">
                    {[
                      { id: 'manager_dashboard', label: 'Manager Dashboard', icon: LayoutDashboard },
                      { id: 'employees', label: 'Employees', icon: Users },
                      { id: 'performance', label: 'Performance', icon: TrendingUp },
                      { id: 'approvals', label: 'Approvals', icon: CheckCircle2 },
                      { id: 'reports', label: 'Reports', icon: FileText },
                      { id: 'messages', label: 'Messages', icon: MessageSquare },
                      { id: 'my_profile', label: 'My Profile', icon: UserCheck },
                      { id: 'settings', label: 'Settings', icon: Settings },
                    ].map(item => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab(item.id, 'MANAGER');
                            onClose();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-gray-200 hover:text-white hover:bg-white/10 flex items-center space-x-2.5 transition-all group font-medium"
                        >
                          <IconComp className="w-4 h-4 text-[#C89A2B] group-hover:scale-110 transition-transform" />
                          <span className="flex-1">{item.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Employee Navigation Card */}
                <div className="p-5 rounded-2xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-xl space-y-3">
                  <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
                    <UserIcon className="w-5 h-5 text-[#C89A2B]" />
                    <h4 className="font-bold text-sm text-white">Employee Navigation</h4>
                  </div>
                  <div className="space-y-1">
                    {[
                      { id: 'employee_dashboard', label: 'Employee Dashboard', icon: LayoutDashboard },
                      { id: 'my_performance', label: 'My Performance', icon: TrendingUp },
                      { id: 'my_kpis', label: 'MY KPIs', icon: Target },
                      { id: 'my_reports', label: 'My Reports', icon: FileText },
                      { id: 'achievements', label: 'Achievements', icon: Award },
                      { id: 'notifications', label: 'Notifications', icon: Bell },
                      { id: 'my_profile', label: 'My Profile', icon: UserCheck },
                      { id: 'settings', label: 'Settings', icon: Settings },
                    ].map(item => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab(item.id, 'EMPLOYEE');
                            onClose();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-gray-200 hover:text-white hover:bg-white/10 flex items-center space-x-2.5 transition-all group font-medium"
                        >
                          <IconComp className="w-4 h-4 text-[#C89A2B] group-hover:scale-110 transition-transform" />
                          <span className="flex-1">{item.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PERSONAL PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {isSaved && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile contact details updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={e => setMiddleName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">User ID</label>
                  <input
                    type="text"
                    value={userIdInput}
                    onChange={e => setUserIdInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={e => setEmergencyContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Assigned Branch</label>
                  <input
                    type="text"
                    readOnly
                    value={user.branchName || 'Addis Ababa Main Branch'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-xs text-gray-300 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => alert(`Official EPMS Performance Certificate generated for ${getUserFullName(user)}`)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4 text-[#C89A2B]" />
                  <span>Download Performance Record PDF</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-black text-xs shadow-md hover:bg-[#D8B45C] transition-all"
                >
                  Save Profile Updates
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: TARGETS & KPIS */}
          {activeTab === 'targets' && (
            <div className="space-y-6">
              {/* Manager Target Feed Component */}
              {(user.role === 'MANAGER' || user.role === 'ADMINISTRATOR') && (
                <BranchEmployeeTargetManager
                  currentUser={user}
                  employees={employees.length ? employees : [user]}
                  targets={targets}
                  onTargetsUpdated={onRefreshData}
                />
              )}

              {/* Active Assigned Targets View */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#6B3F1D] border border-[#C89A2B]/30 text-xs flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Active Assigned Target Goals ({getUserFullName(user)})
                    </h4>
                    <p className="text-gray-300 text-[11px]">
                      Target values configured by Branch Management compared against actual achievements
                    </p>
                  </div>
                  <span className="bg-[#C89A2B]/20 border border-[#C89A2B]/40 text-[#C89A2B] px-3.5 py-1 rounded-full font-extrabold text-xs">
                    {(targets.filter(t => t.employeeId === user.id || t.branchId === user.branchId).length || 8)} KPIs Tracked
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(
                    targets.filter(t => t.employeeId === user.id || t.branchId === user.branchId).length > 0
                      ? targets.filter(t => t.employeeId === user.id || t.branchId === user.branchId)
                      : [
                          { id: 'T-1', kpiName: 'Deposits Mobilized', targetValue: 15000000, period: 'Annual' },
                          { id: 'T-2', kpiName: 'Foreign Currency Inflow', targetValue: 2500000, period: 'Annual' },
                          { id: 'T-3', kpiName: 'Digital Financial Services', targetValue: 5000000, period: 'Annual' },
                          { id: 'T-4', kpiName: 'Account Openings', targetValue: 250, period: 'Annual' },
                          { id: 'T-5', kpiName: 'Mobile Banking Activations', targetValue: 350, period: 'Annual' },
                          { id: 'T-6', kpiName: 'Internet Banking Activations', targetValue: 80, period: 'Annual' },
                          { id: 'T-7', kpiName: 'Merchant Solutions & QR', targetValue: 40, period: 'Annual' },
                          { id: 'T-8', kpiName: 'ATM Card Activations', targetValue: 200, period: 'Annual' }
                        ]
                  ).map(t => {
                    // Helper to get actual achieved value
                    const getAchieved = (kpiName: string) => {
                      const name = (kpiName || '').toLowerCase();
                      if (name.includes('deposit')) return reports.reduce((s, r) => s + (r.depositsETB || 0), 0);
                      if (name.includes('foreign') || name.includes('fcy')) return reports.reduce((s, r) => s + (r.foreignCurrencyETB || 0), 0);
                      if (name.includes('digital financial')) return reports.reduce((s, r) => s + (r.digitalFinancialServicesETB || 0), 0);
                      if (name.includes('account')) return reports.reduce((s, r) => s + (r.accountOpenings || 0), 0);
                      if (name.includes('mobile')) return reports.reduce((s, r) => s + (r.mobileBankingActivations || 0), 0);
                      if (name.includes('internet')) return reports.reduce((s, r) => s + (r.internetBankingActivations || 0), 0);
                      if (name.includes('merchant')) return reports.reduce((s, r) => s + (r.merchantSolutions || 0), 0);
                      if (name.includes('atm')) return reports.reduce((s, r) => s + (r.atmCardActivations || 0), 0);
                      return 0;
                    };

                    const achieved = getAchieved(t.kpiName || '');
                    const kpiLower = (t.kpiName || '').toLowerCase();
                    const isCurrency = kpiLower.includes('deposit') || kpiLower.includes('currency') || kpiLower.includes('services');
                    const isFCY = kpiLower.includes('foreign') || kpiLower.includes('fcy');
                    const formatValWithCurrency = (val: number) => {
                      if (isFCY) {
                        return `USD ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                      }
                      if (isCurrency) {
                        return `ETB ${val.toLocaleString()}`;
                      }
                      return val.toLocaleString();
                    };
                    const targetVal = t.targetValue || 1;
                    const pct = Math.min(100, Math.round((achieved / targetVal) * 100));

                    return (
                      <div key={t.id} className="p-4 rounded-2xl bg-black/30 border border-white/10 hover:border-[#C89A2B]/40 transition-all space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold text-white">
                          <span className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-[#C89A2B]" />
                            <span>{t.kpiName}</span>
                          </span>
                          <span className="text-[#C89A2B] font-extrabold">
                            {formatValWithCurrency(t.targetValue)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-gray-300">
                            <span>Achieved: <strong className="text-emerald-400">{formatValWithCurrency(achieved)}</strong></span>
                            <span className="font-bold text-[#C89A2B]">{pct}%</span>
                          </div>
                          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-[#C89A2B] h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                          <span>Target Period: {t.period || 'Annual'}</span>
                          <span className="text-emerald-400 font-bold">Assigned by Branch Manager</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BADGES */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#6B3F1D] to-[#4A2C17] border border-[#C89A2B]/30 text-xs">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#C89A2B]" />
                  EPMS Gamified Achievement Wall
                </h4>
                <p className="text-gray-300 mt-0.5">Badges unlocked through continuous target fulfillment in Bunna Bank S.C.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-[#C89A2B]/30 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#C89A2B]/20 border border-[#C89A2B] flex items-center justify-center text-[#C89A2B]">
                    <Award className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-xs text-white">100% Target Club</h5>
                  <p className="text-[10px] text-gray-400">Achieved full deposit mobilization target</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-emerald-500/30 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-xs text-white">Digital Champion</h5>
                  <p className="text-[10px] text-gray-400">Top mobile & internet banking activator</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-blue-500/30 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-blue-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-xs text-white">Excellence Star</h5>
                  <p className="text-[10px] text-gray-400">Consistent daily report submissions</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & PERMISSIONS */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#C89A2B]" />
                  Security Privileges for Role: {user.role}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/20 flex items-center space-x-2 text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Daily Performance Report Submission</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/20 flex items-center space-x-2 text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>View Branch & Individual KPIs</span>
                  </div>
                  {user.role !== 'EMPLOYEE' && (
                    <div className="p-2.5 rounded-xl bg-black/20 flex items-center space-x-2 text-gray-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Approve & Return Staff Reports</span>
                    </div>
                  )}
                  {user.role === 'ADMINISTRATOR' && (
                    <div className="p-2.5 rounded-xl bg-black/20 flex items-center space-x-2 text-gray-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>System Configuration & District Setup</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Change Credential Section */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-black/40 to-[#6B3F1D] border border-[#C89A2B]/30 text-xs space-y-4">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-[#C89A2B]" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Update Staff Credentials & Security Password</h4>
                    <p className="text-gray-400 text-[11px]">Enforce strong authentication rules for Bunna Bank EPMS portal access.</p>
                  </div>
                </div>

                {pwdSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{pwdSuccess}</span>
                  </div>
                )}

                {pwdError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 font-bold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{pwdError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-bold text-gray-300">Confirm New Password</label>
                        {confirmNewPassword && (
                          <span className={`text-[10px] font-bold ${
                            newPassword === confirmNewPassword ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {newPassword === confirmNewPassword ? '✓ Match' : '✕ Mismatch'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Real-time complexity check */}
                  {newPassword && (
                    <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-[10px] grid grid-cols-2 gap-1.5">
                      <span className={`font-semibold ${pwdCriteria.minLen ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {pwdCriteria.minLen ? '✓' : '○'} At least 8 Characters
                      </span>
                      <span className={`font-semibold ${pwdCriteria.hasUpper ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {pwdCriteria.hasUpper ? '✓' : '○'} Uppercase Letter (A-Z)
                      </span>
                      <span className={`font-semibold ${pwdCriteria.hasLower ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {pwdCriteria.hasLower ? '✓' : '○'} Lowercase Letter (a-z)
                      </span>
                      <span className={`font-semibold ${pwdCriteria.hasNum ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {pwdCriteria.hasNum ? '✓' : '○'} Number (0-9)
                      </span>
                      <span className={`font-semibold col-span-2 ${pwdCriteria.hasSpecial ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {pwdCriteria.hasSpecial ? '✓' : '○'} Special Symbol (!@#$%^&*)
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={pwdLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-black text-xs shadow-md hover:bg-[#D8B45C] transition-all disabled:opacity-50"
                  >
                    {pwdLoading ? 'Updating Credentials...' : 'Change Security Password'}
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 5: AUDIT TRAIL */}
          {activeTab === 'activity' && (
            <div className="space-y-3 text-xs">
              <p className="text-gray-400">Recent authenticated activities for account {user.id}:</p>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-[#C89A2B]" />
                    <span>Successful Portal Authentication</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Today, 09:15 AM</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Submitted Daily Performance Report</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Yesterday, 04:30 PM</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
