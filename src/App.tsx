import React, { useState, useEffect } from 'react';
import { User, UserRole, Language, District, Branch, KPI, DailyPerformanceReport, Notification, AuditLog, BankHoliday, PerformanceTarget } from './types';
import { api } from './services/api';
import { defaultUsers } from './data/mockData';

// Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { AboutPage } from './components/common/AboutPage';
import { ContactPage } from './components/common/ContactPage';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { ManagerDashboard } from './components/dashboard/ManagerDashboard';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';

// Modals & Drawers
import { GetStartedModal } from './components/common/GetStartedModal';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';
import { CalendarView } from './components/calendar/CalendarView';
import { ReportExportModal } from './components/reports/ReportExportModal';
import { ApiDocsModal } from './components/docs/ApiDocsModal';
import { TelegramBotModal } from './components/common/TelegramBotModal';

export const App: React.FC = () => {
  // Global State
  const [language, setLanguage] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('bunna_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse saved user from storage", e);
    }
    return null;
  });
  const [currentNavView, setCurrentNavView] = useState<'home' | 'about' | 'contact'>('home');

  // App Data
  const [districts, setDistricts] = useState<District[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [reports, setReports] = useState<DailyPerformanceReport[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [holidays, setHolidays] = useState<BankHoliday[]>([]);
  const [targets, setTargets] = useState<PerformanceTarget[]>([]);

  // Modals & Drawers
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiTargetEmployee, setAiTargetEmployee] = useState<User | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleOpenAiForEmployee = (emp: User) => {
    setAiTargetEmployee(emp);
    setIsAiDrawerOpen(true);
  };
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTelegramBotOpen, setIsTelegramBotOpen] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<'overview' | 'products' | 'districts' | 'branches' | 'employees' | 'kpis' | 'reports' | 'audit' | 'holidays' | 'competitor'>('overview');

  const [roleHint, setRoleHint] = useState<UserRole | null>(null);

  const loadData = async () => {
    try {
      const [dList, bList, eList, kList, rList, nList, aLogs, hList, tList] = await Promise.all([
        api.getDistricts(),
        api.getBranches(),
        api.getEmployees(),
        api.getKPIs(),
        api.getDailyReports(),
        api.getNotifications(),
        api.getAuditLogs(),
        api.getBankHolidays(),
        api.getTargets()
      ]);

      setDistricts(dList);
      setBranches(bList);
      setEmployees(eList);
      setKpis(kList);
      setReports(rList);
      setNotifications(nList);
      setAuditLogs(aLogs);
      setHolidays(hList);
      setTargets(tList);
    } catch (err) {
      console.error("Failed to load initial EPMS data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn("Logout API call warning", err);
    }
    setCurrentUser(null);
    setCurrentNavView('home');
    localStorage.removeItem('bunna_user');
    localStorage.removeItem('bunna_token');
    sessionStorage.clear();
  };

  const handleRoleSwitch = async (role: UserRole) => {
    try {
      const user = await api.quickSwitchUserRole(role);
      setCurrentUser(user);
    } catch (err) {
      console.warn("Role switch API fallback triggered", err);
      const fallbackUser = defaultUsers.find(u => u.role === role) || defaultUsers[0];
      setCurrentUser(fallbackUser);
    }
  };

  const handleSelectNavTab = (itemId: string, roleGroup?: UserRole) => {
    if (roleGroup && roleGroup !== currentUser?.role) {
      handleRoleSwitch(roleGroup);
    }

    if (roleGroup === 'ADMINISTRATOR' || (!roleGroup && currentUser?.role === 'ADMINISTRATOR')) {
      if (itemId === 'admin_dashboard') setAdminActiveTab('overview');
      else if (itemId === 'competitor_intelligence') setAdminActiveTab('competitor');
      else if (itemId === 'districts') setAdminActiveTab('districts');
      else if (itemId === 'branches') setAdminActiveTab('branches');
      else if (itemId === 'employees' || itemId === 'user_management') setAdminActiveTab('employees');
      else if (itemId === 'kpi_management') setAdminActiveTab('kpis');
      else if (itemId === 'campaign_management') setAdminActiveTab('products');
      else if (itemId === 'reports_analytics') setAdminActiveTab('reports');
      else if (itemId === 'roles_permissions') setAdminActiveTab('audit');
    }

    setCurrentNavView('home');
  };

  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#222222] flex flex-col font-sans selection:bg-[#C89A2B] selection:text-[#6B3F1D]">
      
      {/* HEADER */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onLogout={handleLogout}
        onRoleSwitch={handleRoleSwitch}
        unreadNotifications={unreadNotificationCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenApiDocs={() => setIsApiDocsOpen(true)}
        onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenTelegramBot={() => setIsTelegramBotOpen(true)}
        onSelectTab={handleSelectNavTab}
        currentNavView={currentNavView}
        onNavigate={(view) => setCurrentNavView(view)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {currentNavView === 'about' ? (
          <AboutPage language={language} />
        ) : currentNavView === 'contact' ? (
          <ContactPage language={language} />
        ) : !currentUser ? (
          /* GUEST / LANDING VIEW */
          <LandingPage
            language={language}
            onGetStarted={() => setIsGetStartedOpen(true)}
            onOpenLogin={() => setIsLoginOpen(true)}
            districts={districts}
            branches={branches}
            employees={employees}
            reports={reports}
            targets={targets}
          />
        ) : (
          /* AUTHENTICATED DASHBOARD VIEWS */
          <div className="space-y-6">
            
            {currentUser.role === 'ADMINISTRATOR' && (
              <AdminDashboard
                user={currentUser}
                districts={districts}
                branches={branches}
                employees={employees}
                kpis={kpis}
                reports={reports}
                auditLogs={auditLogs}
                holidays={holidays}
                targets={targets}
                activeTab={adminActiveTab}
                onTabChange={setAdminActiveTab}
                onRefreshData={loadData}
                onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
                onOpenExportModal={() => setIsExportModalOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
                onOpenAiSummary={handleOpenAiForEmployee}
              />
            )}

            {currentUser.role === 'MANAGER' && (
              <ManagerDashboard
                user={currentUser}
                reports={reports}
                employees={employees}
                targets={targets}
                onRefreshData={loadData}
                onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
                onOpenExportModal={() => setIsExportModalOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
                onOpenAiSummary={handleOpenAiForEmployee}
              />
            )}

            {currentUser.role === 'EMPLOYEE' && (
              <EmployeeDashboard
                user={currentUser}
                reports={reports}
                targets={targets}
                holidays={holidays}
                onRefreshData={loadData}
                onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
                language={language}
              />
            )}

          </div>
        )}

      </main>

      {/* FOOTER */}
      <Footer language={language} />

      {/* MODALS & DRAWERS */}
      <GetStartedModal
        isOpen={isGetStartedOpen}
        onClose={() => setIsGetStartedOpen(false)}
        onSelectRole={(role) => {
          setIsGetStartedOpen(false);
          setRoleHint(role);
          setIsLoginOpen(true);
        }}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('bunna_user', JSON.stringify(user));
        }}
        onOpenRegister={() => setIsRegisterOpen(true)}
        selectedRoleHint={roleHint}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={(user) => {
          setCurrentUser(user);
          loadData();
        }}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        employees={employees}
        branches={branches}
        districts={districts}
        reports={reports}
        kpis={kpis}
      />

      <AIAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        userRole={currentUser?.role}
        targetEmployee={aiTargetEmployee}
        onClearTargetEmployee={() => setAiTargetEmployee(null)}
      />

      <CalendarView
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        holidays={holidays}
      />

      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <ApiDocsModal
        isOpen={isApiDocsOpen}
        onClose={() => setIsApiDocsOpen(false)}
      />

      <TelegramBotModal
        isOpen={isTelegramBotOpen}
        onClose={() => setIsTelegramBotOpen(false)}
        currentUser={currentUser}
      />

      {currentUser && (
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={currentUser}
          targets={targets}
          reports={reports}
          employees={employees}
          onRefreshData={loadData}
          onOpenAiSummary={handleOpenAiForEmployee}
          onNavigateTab={handleSelectNavTab}
          onLogout={() => { setCurrentUser(null); setCurrentNavView('home'); setIsProfileOpen(false); localStorage.removeItem('bunna_user'); }}
          language={language}
          onUserUpdated={(updated) => {
            setCurrentUser(updated);
            localStorage.setItem('bunna_user', JSON.stringify(updated));
          }}
        />
      )}

    </div>
  );
};

export default App;
