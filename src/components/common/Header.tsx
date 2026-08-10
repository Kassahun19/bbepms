import React, { useState } from 'react';
import {
  Building2,
  Globe,
  Bell,
  Sparkles,
  Search,
  UserCheck,
  LogOut,
  Shield,
  Briefcase,
  ChevronDown,
  Menu,
  X,
  FileCode2,
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
  CheckCircle2,
  FileText,
  MessageSquare,
  Award,
  ChevronRight,
  Bot,
  User as UserIcon
} from 'lucide-react';
import { User, Language, UserRole, getUserFullName } from '../../types';
import { BunnaBankLogo } from './BunnaBankLogo';
import { translations } from '../../i18n/translations';

interface HeaderProps {
  user?: User | null;
  currentUser?: User | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenLogin: () => void;
  onOpenRegister?: () => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  onOpenAiAssistant?: () => void;
  onOpenSearch: () => void;
  onOpenApiDocs: () => void;
  onOpenTelegramBot?: () => void;
  onOpenCalendar?: () => void;
  activeRoleView?: UserRole | null;
  onSelectRoleView?: (role: UserRole) => void;
  onRoleSwitch?: (role: UserRole) => void;
  unreadCount?: number;
  unreadNotifications?: number;
  currentNavView?: 'home' | 'about' | 'contact';
  onNavigate?: (view: 'home' | 'about' | 'contact') => void;
  onOpenProfile?: () => void;
  onSelectTab?: (tab: string, role?: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = (props) => {
  const {
    user,
    currentUser,
    language,
    onLanguageChange,
    onOpenLogin,
    onLogout,
    onOpenNotifications,
    onOpenAiAssistant,
    onOpenSearch,
    onOpenApiDocs,
    onOpenTelegramBot,
    activeRoleView,
    onSelectRoleView,
    onRoleSwitch,
    unreadCount,
    unreadNotifications,
    currentNavView = 'home',
    onNavigate
  } = props;

  const activeUser = user !== undefined ? user : (currentUser !== undefined ? currentUser : null);
  const currentRole = activeRoleView || activeUser?.role || null;
  const handleRoleSelect = onSelectRoleView || onRoleSwitch || (() => {});
  const notificationsCount = unreadCount ?? unreadNotifications ?? 0;

  const t = translations[language] || translations['en'];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [selectedNavRole, setSelectedNavRole] = useState<UserRole>(activeUser?.role || 'EMPLOYEE');

  const handleMenuItemClick = (itemId: string, roleGroup: UserRole) => {
    setRoleMenuOpen(false);

    if (onRoleSwitch) {
      onRoleSwitch(roleGroup);
    } else if (onSelectRoleView) {
      onSelectRoleView(roleGroup);
    }

    if (itemId === 'my_profile' || itemId === 'my_profile_badges') {
      props.onOpenProfile && props.onOpenProfile();
      return;
    }

    if (itemId === 'settings') {
      props.onOpenProfile && props.onOpenProfile();
      return;
    }

    if (itemId === 'notifications') {
      onOpenNotifications();
      return;
    }

    if (props.onSelectTab) {
      props.onSelectTab(itemId, roleGroup);
    }

    if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#6B3F1D]/95 backdrop-blur-md border-b border-[#C89A2B]/30 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Brand Identity & Left Navigation Links */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className="flex items-center space-x-3 text-left focus:outline-none group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C89A2B] via-[#D8B45C] to-[#6B3F1D] p-0.5 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#6B3F1D] rounded-[10px] p-1.5 flex items-center justify-center">
                  <BunnaBankLogo className="w-8 h-8" variant="gold" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xl tracking-tight text-white">{t.bankName}</span>
                  <span className="bg-[#C89A2B]/20 text-[#C89A2B] border border-[#C89A2B]/40 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    EPMS
                  </span>
                </div>
                <p className="text-xs text-[#C89A2B]/90 font-medium hidden sm:block">
                  {t.tagline}
                </p>
              </div>
            </button>

            {/* Navigation Bar Link Names: Home, About, & Contact on Left Side */}
            <nav className="hidden lg:flex items-center space-x-1.5 bg-[#4A2C17] p-1.5 rounded-2xl border border-[#C89A2B]/20">
              <button
                onClick={() => onNavigate && onNavigate('home')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentNavView === 'home'
                    ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
                    : 'text-gray-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.home || 'Home'}
              </button>

              <button
                onClick={() => onNavigate && onNavigate('about')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentNavView === 'about'
                    ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
                    : 'text-gray-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.about || 'About'}
              </button>

              <button
                onClick={() => onNavigate && onNavigate('contact')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentNavView === 'contact'
                    ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
                    : 'text-gray-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.contact || 'Contact'}
              </button>
            </nav>
          </div>

          {/* Center Space / Active User Role Indicator */}
          {activeUser && (
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#4A2C17] border border-[#C89A2B]/30 text-xs text-[#C89A2B] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#C89A2B] animate-ping mr-1" />
              <span>
                {activeUser.role === 'ADMINISTRATOR' ? 'HQ Admin Workspace' : activeUser.role === 'MANAGER' ? `${activeUser.branchName || 'Branch'} Manager Portal` : `${activeUser.branchName || 'Branch'} Staff Portal`}
              </span>
            </div>
          )}

          {/* Right Action Icons & Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-gray-200 transition-colors"
              title="Global Search"
            >
              <Search className="w-4 h-4 text-[#C89A2B]" />
            </button>

            {/* AI Assistant Button */}
            {onOpenAiAssistant && (
              <button
                onClick={onOpenAiAssistant}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] text-[#6B3F1D] font-bold text-xs shadow-md hover:opacity-95 transition-all transform active:scale-95"
              >
                <Sparkles className="w-4 h-4 animate-spin text-[#6B3F1D]" style={{ animationDuration: '6s' }} />
                <span>{t.askAi}</span>
              </button>
            )}

            {/* API Docs & Schema */}
            <button
              onClick={onOpenApiDocs}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-gray-200 transition-colors"
              title="Developer API & MySQL Schema"
            >
              <FileCode2 className="w-4 h-4 text-[#C89A2B]" />
            </button>

            {/* Telegram Bot */}
            {onOpenTelegramBot && (
              <button
                onClick={onOpenTelegramBot}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-gray-200 transition-colors"
                title="BBEPMS Telegram Bot Integration"
              >
                <Bot className="w-4 h-4 text-[#C89A2B]" />
              </button>
            )}

            {/* Notifications */}
            {activeUser && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-gray-200 transition-colors"
              >
                <Bell className="w-4 h-4 text-[#C89A2B]" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C89A2B] text-[#6B3F1D] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {notificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-[#4A2C17] rounded-xl p-1 border border-[#C89A2B]/30 text-xs font-semibold">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  language === 'en' || language === ('EN' as any) ? 'bg-[#C89A2B] text-[#6B3F1D]' : 'text-gray-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('am')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  language === 'am' || language === ('AM' as any) ? 'bg-[#C89A2B] text-[#6B3F1D]' : 'text-gray-300 hover:text-white'
                }`}
              >
                አማ
              </button>
            </div>

            {/* User Account / Login Button */}
            {activeUser ? (
              <div className="relative">
                <button
                  onClick={() => {
                    const nextState = !roleMenuOpen;
                    setRoleMenuOpen(nextState);
                    if (nextState && activeUser) {
                      setSelectedNavRole(activeUser.role);
                    }
                  }}
                  className="flex items-center space-x-2 pl-3 pr-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-[#C89A2B] text-[#6B3F1D] font-bold flex items-center justify-center text-xs">
                    {activeUser.firstName[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white leading-none">{getUserFullName(activeUser)}</p>
                    <p className="text-[10px] text-[#C89A2B]">{activeUser.jobTitle}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-300 ml-1" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#4A2C17] border border-[#C89A2B]/40 rounded-2xl shadow-2xl z-50 text-xs overflow-hidden max-h-[82vh] flex flex-col">
                    {/* Header / User Profile summary */}
                    <div className="px-4 py-3 bg-[#6B3F1D] border-b border-white/10 shrink-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-[#C89A2B] text-[#6B3F1D] font-black flex items-center justify-center text-sm shadow">
                          {activeUser.firstName[0]}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-white text-sm truncate">{getUserFullName(activeUser)}</p>
                          <p className="text-[#C89A2B] text-xs font-medium truncate">{activeUser.email}</p>
                          <p className="text-gray-400 text-[10px] truncate">{activeUser.branchName || 'Bunna Bank S.C.'}</p>
                        </div>
                      </div>

                      {/* Role Navigation Selector Tabs */}
                      <div className="mt-3 grid grid-cols-3 gap-1 p-1 bg-black/40 rounded-xl border border-white/10 text-[10px] font-bold">
                        <button
                          onClick={() => setSelectedNavRole('ADMINISTRATOR')}
                          className={`py-1 rounded-lg transition-all ${
                            selectedNavRole === 'ADMINISTRATOR' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow' : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          Admin
                        </button>
                        <button
                          onClick={() => setSelectedNavRole('MANAGER')}
                          className={`py-1 rounded-lg transition-all ${
                            selectedNavRole === 'MANAGER' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow' : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          Manager
                        </button>
                        <button
                          onClick={() => setSelectedNavRole('EMPLOYEE')}
                          className={`py-1 rounded-lg transition-all ${
                            selectedNavRole === 'EMPLOYEE' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow' : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          Employee
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Navigation List */}
                    <div className="overflow-y-auto py-2 divide-y divide-white/5 space-y-2 flex-1">
                      
                      {/* 1. ADMIN NAVIGATION */}
                      {selectedNavRole === 'ADMINISTRATOR' && (
                        <div className="px-2 space-y-0.5">
                          <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-extrabold text-[#C89A2B] flex items-center space-x-1.5">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Admin Navigation</span>
                          </div>
                          {[
                            { id: 'admin_dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
                            { id: 'competitor_intelligence', label: 'Competitor Intelligence', icon: BarChart3 },
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
                                onClick={() => handleMenuItemClick(item.id, 'ADMINISTRATOR')}
                                className="w-full text-left px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 flex items-center space-x-2.5 transition-colors font-medium group"
                              >
                                <IconComp className="w-4 h-4 text-[#C89A2B] group-hover:scale-110 transition-transform" />
                                <span className="flex-1">{item.label}</span>
                                <ChevronRight className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. MANAGER NAVIGATION */}
                      {selectedNavRole === 'MANAGER' && (
                        <div className="px-2 space-y-0.5">
                          <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-extrabold text-[#C89A2B] flex items-center space-x-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>Manager Navigation</span>
                          </div>
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
                                onClick={() => handleMenuItemClick(item.id, 'MANAGER')}
                                className="w-full text-left px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 flex items-center space-x-2.5 transition-colors font-medium group"
                              >
                                <IconComp className="w-4 h-4 text-[#C89A2B] group-hover:scale-110 transition-transform" />
                                <span className="flex-1">{item.label}</span>
                                <ChevronRight className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 3. EMPLOYEE NAVIGATION */}
                      {selectedNavRole === 'EMPLOYEE' && (
                        <div className="px-2 space-y-0.5">
                          <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-extrabold text-[#C89A2B] flex items-center space-x-1.5">
                            <UserIcon className="w-3.5 h-3.5" />
                            <span>Employee Navigation</span>
                          </div>
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
                                onClick={() => handleMenuItemClick(item.id, 'EMPLOYEE')}
                                className="w-full text-left px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 flex items-center space-x-2.5 transition-colors font-medium group"
                              >
                                <IconComp className="w-4 h-4 text-[#C89A2B] group-hover:scale-110 transition-transform" />
                                <span className="flex-1">{item.label}</span>
                                <ChevronRight className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                    </div>

                    {/* Logout footer button */}
                    <div className="p-2 border-t border-white/10 bg-[#6B3F1D] shrink-0">
                      <button
                        onClick={() => {
                          setRoleMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 flex items-center space-x-2 font-bold transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-5 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs shadow-md hover:bg-[#D8B45C] transition-all transform active:scale-95"
              >
                {t.login}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'am' : 'en')}
              className="px-2.5 py-1 rounded-lg bg-[#C89A2B] text-[#6B3F1D] text-xs font-bold"
            >
              {language === 'en' ? 'አማርኛ' : 'English'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/10 text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#4A2C17] border-b border-[#C89A2B]/30 px-4 py-4 space-y-3">
          
          {/* Main Navigation Links */}
          <div className="grid grid-cols-3 gap-2 pb-2 border-b border-white/10">
            <button
              onClick={() => { onNavigate && onNavigate('home'); setMobileMenuOpen(false); }}
              className={`py-2 rounded-lg text-xs font-bold text-center ${currentNavView === 'home' ? 'bg-[#C89A2B] text-[#6B3F1D]' : 'bg-white/5 text-gray-200'}`}
            >
              {t.home || 'Home'}
            </button>
            <button
              onClick={() => { onNavigate && onNavigate('about'); setMobileMenuOpen(false); }}
              className={`py-2 rounded-lg text-xs font-bold text-center ${currentNavView === 'about' ? 'bg-[#C89A2B] text-[#6B3F1D]' : 'bg-white/5 text-gray-200'}`}
            >
              {t.about || 'About'}
            </button>
            <button
              onClick={() => { onNavigate && onNavigate('contact'); setMobileMenuOpen(false); }}
              className={`py-2 rounded-lg text-xs font-bold text-center ${currentNavView === 'contact' ? 'bg-[#C89A2B] text-[#6B3F1D]' : 'bg-white/5 text-gray-200'}`}
            >
              {t.contact || 'Contact'}
            </button>
          </div>

          {/* Active User Badge in Mobile Menu */}
          {activeUser && (
            <div className="p-2.5 rounded-xl bg-white/5 border border-[#C89A2B]/20 text-xs text-center text-[#C89A2B] font-bold">
              <span>
                Logged in as: {getUserFullName(activeUser)} ({activeUser.role})
              </span>
            </div>
          )}

          <div className="flex flex-col space-y-2 pt-2 border-t border-white/10">
            {onOpenAiAssistant && (
              <button
                onClick={() => { onOpenAiAssistant(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-[#C89A2B] text-[#6B3F1D] font-bold rounded-xl text-xs flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.askAi}</span>
              </button>
            )}
            {activeUser ? (
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-red-600/80 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.logout}</span>
              </button>
            ) : (
              <button
                onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-[#C89A2B] text-[#6B3F1D] font-bold rounded-xl text-xs"
              >
                {t.login}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
