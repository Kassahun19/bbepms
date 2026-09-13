import { useState, useEffect } from "react";
import { api } from "./services/api";
import { defaultUsers } from "./data/mockData";
import { useGlobalTranslation } from "./hooks/useGlobalTranslation";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { LandingPage } from "./components/landing/LandingPage";
import { AboutPage } from "./components/common/AboutPage";
import { HowItWorksPage } from "./components/common/HowItWorksPage";
import { UserProfileModal } from "./components/profile/UserProfileModal";
import { SuperAdminDashboard } from "./components/dashboard/SuperAdminDashboard";
import { AdminDashboard } from "./components/dashboard/AdminDashboard";
import { ManagerDashboard } from "./components/dashboard/ManagerDashboard";
import { EmployeeDashboard } from "./components/dashboard/EmployeeDashboard";
import { BoardDashboard } from "./components/dashboard/BoardDashboard";
import { CeoDashboard } from "./components/dashboard/CeoDashboard";
import { ChiefOfficerDashboard } from "./components/dashboard/ChiefOfficerDashboard";
import { DirectorDashboard } from "./components/dashboard/DirectorDashboard";
import { DistrictManagementDashboard } from "./components/dashboard/DistrictManagementDashboard";
import { RoleBasedOrgNavigation } from "./components/navigation/RoleBasedOrgNavigation";
import { GetStartedModal } from "./components/common/GetStartedModal";
import { LoginModal } from "./components/auth/LoginModal";
import { RegisterModal } from "./components/auth/RegisterModal";
import { NotificationDrawer } from "./components/common/NotificationDrawer";
import { GlobalSearchModal } from "./components/common/GlobalSearchModal";
import { AIAssistantDrawer } from "./components/ai/AIAssistantDrawer";
import { FloatingAiCoachButton } from "./components/ai/FloatingAiCoachButton";
import { CalendarView } from "./components/calendar/CalendarView";
import { ReportExportModal } from "./components/reports/ReportExportModal";
import { ApiDocsModal } from "./components/docs/ApiDocsModal";
import { TelegramBotModal } from "./components/common/TelegramBotModal";
export const App = () => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("bunna_language") || "en";
  });
  useGlobalTranslation(language);
  useEffect(() => {
    localStorage.setItem("bunna_language", language);
  }, [language]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("bunna_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse saved user from storage", e);
    }
    return null;
  });
  const [currentNavView, setCurrentNavView] = useState("home");
  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [targets, setTargets] = useState([]);
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiTargetEmployee, setAiTargetEmployee] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const handleOpenAiForEmployee = (emp) => {
    setAiTargetEmployee(emp);
    setIsAiDrawerOpen(true);
  };
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTelegramBotOpen, setIsTelegramBotOpen] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState("overview");
  const [managerActiveTab, setManagerActiveTab] = useState("dashboard");
  const [roleHint, setRoleHint] = useState(null);
  const loadData = async (user) => {
    try {
      const activeUser = user !== void 0 ? user : currentUser;
      const role = activeUser?.role;
      const uId = activeUser?.id || activeUser?.userId;
      const distId = activeUser?.districtId;
      const isExec = role && ["BANK_SUPER_ADMIN", "BOARD_OF_DIRECTORS", "CEO", "ADMINISTRATOR", "CHIEF_OFFICER", "DIRECTOR"].includes(role);
      const [dList, bList, eList, kList, rList, nList, aLogs, hList, tList] = await Promise.all([
        api.getDistricts(role, uId, distId),
        api.getBranches(isExec ? void 0 : distId),
        api.getEmployees(isExec ? void 0 : { districtId: distId }),
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
    loadData(currentUser);
  }, [currentUser?.role, currentUser?.id]);
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn("Logout API call warning", err);
    }
    setCurrentUser(null);
    setCurrentNavView("home");
    localStorage.removeItem("bunna_user");
    localStorage.removeItem("bunna_token");
    sessionStorage.clear();
  };
  const handleRoleSwitch = async (role) => {
    try {
      const user = await api.quickSwitchUserRole(role);
      setCurrentUser(user);
      localStorage.setItem("bunna_user", JSON.stringify(user));
      await loadData(user);
    } catch (err) {
      console.warn("Role switch API fallback triggered", err);
      const fallbackUser = defaultUsers.find((u) => u.role === role) || defaultUsers[0];
      setCurrentUser(fallbackUser);
      localStorage.setItem("bunna_user", JSON.stringify(fallbackUser));
      await loadData(fallbackUser);
    }
  };
  const handleSelectNavTab = (itemId, roleGroup) => {
    if (roleGroup && roleGroup !== currentUser?.role) {
      handleRoleSwitch(roleGroup);
    }
    if (roleGroup === "ADMINISTRATOR" || !roleGroup && currentUser?.role === "ADMINISTRATOR") {
      if (itemId === "admin_dashboard") setAdminActiveTab("overview");
      else if (itemId === "competitor_intelligence") setAdminActiveTab("competitor");
      else if (itemId === "districts") setAdminActiveTab("districts");
      else if (itemId === "branches") setAdminActiveTab("branches");
      else if (itemId === "employees" || itemId === "user_management") setAdminActiveTab("employees");
      else if (itemId === "kpi_management") setAdminActiveTab("kpis");
      else if (itemId === "campaign_management") setAdminActiveTab("products");
      else if (itemId === "reports_analytics") setAdminActiveTab("reports");
      else if (itemId === "roles_permissions") setAdminActiveTab("audit");
    }
    if (roleGroup === "MANAGER" || !roleGroup && currentUser?.role === "MANAGER") {
      if (itemId === "manager_dashboard" || itemId === "dashboard") setManagerActiveTab("dashboard");
      else if (itemId === "employee_performance" || itemId === "staff_performance" || itemId === "employees_perf") setManagerActiveTab("employee_performance");
      else if (itemId === "branch_performance" || itemId === "branch_perf") setManagerActiveTab("branch_performance");
      else if (itemId === "messages_notifications" || itemId === "messages" || itemId === "notifications") setManagerActiveTab("messages");
      else if (itemId === "employee_management" || itemId === "employees") setManagerActiveTab("employees");
      else if (itemId === "kpi_management" || itemId === "kpis" || itemId === "targets") setManagerActiveTab("kpis");
      else if (itemId === "profiles" || itemId === "my_profile") setManagerActiveTab("profiles");
      else if (itemId === "settings") setManagerActiveTab("settings");
    }
    setCurrentNavView("home");
  };
  const handleMarkNotificationRead = async (id) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;
  return <div className="min-h-screen bg-[#F8F7F4] text-[#252525] flex flex-col font-sans selection:bg-[#D9A514] selection:text-[#4A2815]">
      
      {
    /* HEADER */
  }
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

      {
    /* MAIN CONTENT AREA */
  }
      <main className={`flex-1 w-full ${!currentUser && currentNavView === "home" ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}`}>
        
        {currentNavView === "about" ? <AboutPage language={language} /> : currentNavView === "howItWorks" || currentNavView === "contact" ? <HowItWorksPage
    language={language}
    onNavigateHome={() => setCurrentNavView("home")}
    onOpenLogin={() => setIsLoginOpen(true)}
  /> : !currentUser ? (
    /* GUEST / LANDING VIEW */
    <div className="-mt-8">
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
          </div>
  ) : (
    /* AUTHENTICATED DASHBOARD VIEWS */
    <div className="space-y-6">
            
            {currentUser.role === "BANK_SUPER_ADMIN" && <SuperAdminDashboard
      user={currentUser}
      districts={districts}
      branches={branches}
      employees={employees}
      kpis={kpis}
      reports={reports}
      auditLogs={auditLogs}
      holidays={holidays}
      targets={targets}
      onRefreshData={() => loadData()}
      onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
      onOpenExportModal={() => setIsExportModalOpen(true)}
      onOpenProfile={() => setIsProfileOpen(true)}
    />}

            {currentUser.role === "ADMINISTRATOR" && <AdminDashboard
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
    />}

            {currentUser.role === "MANAGER" && <ManagerDashboard
      user={currentUser}
      reports={reports}
      employees={employees}
      targets={targets}
      notifications={notifications}
      activeTab={managerActiveTab}
      onTabChange={setManagerActiveTab}
      onRefreshData={loadData}
      onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
      onOpenExportModal={() => setIsExportModalOpen(true)}
      onOpenProfile={() => setManagerActiveTab("profiles")}
      onOpenAiSummary={handleOpenAiForEmployee}
      onUserUpdated={(updatedUser) => {
        setCurrentUser(updatedUser);
        localStorage.setItem("bunna_user", JSON.stringify(updatedUser));
      }}
      language={language}
      onLanguageChange={setLanguage}
    />}

            {currentUser.role === "EMPLOYEE" && <EmployeeDashboard
      user={currentUser}
      reports={reports}
      targets={targets}
      holidays={holidays}
      onRefreshData={loadData}
      onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
      onOpenProfile={() => setIsProfileOpen(true)}
      language={language}
    />}

            {currentUser.role === "BOARD_OF_DIRECTORS" && <>
                <RoleBasedOrgNavigation
      currentUser={currentUser}
      districts={districts}
      branches={branches}
      employees={employees}
      kpis={kpis}
      reports={reports}
      targets={targets}
      language={language}
    />
                <BoardDashboard
      currentUser={currentUser}
      districts={districts}
      branches={branches}
      kpis={kpis}
      reports={reports}
      targets={targets}
      language={language}
    />
              </>}

            {currentUser.role === "CEO" && <>
                <RoleBasedOrgNavigation
      currentUser={currentUser}
      districts={districts}
      branches={branches}
      employees={employees}
      kpis={kpis}
      reports={reports}
      targets={targets}
      language={language}
    />
                <CeoDashboard
      currentUser={currentUser}
      districts={districts}
      branches={branches}
      kpis={kpis}
      reports={reports}
      targets={targets}
      language={language}
    />
              </>}

            {currentUser.role === "CHIEF_OFFICER" && <>
                <RoleBasedOrgNavigation
      currentUser={currentUser}
      districts={districts}
      branches={branches}
      employees={employees}
      kpis={kpis}
      reports={reports}
      targets={targets}
      language={language}
    />
                <ChiefOfficerDashboard
      currentUser={currentUser}
      districts={districts}
      branches={branches}
      kpis={kpis}
      reports={reports}
      targets={targets}
      language={language}
    />
              </>}

            {currentUser.role === "DIRECTOR" && <>
                <RoleBasedOrgNavigation
      currentUser={currentUser}
      districts={districts}
      branches={branches}
      employees={employees}
      kpis={kpis}
      reports={reports}
      targets={targets}
      language={language}
    />
                <DirectorDashboard
      currentUser={currentUser}
      districts={districts}
      branches={branches}
      kpis={kpis}
      reports={reports}
      targets={targets}
      language={language}
    />
              </>}

            {currentUser.role === "DISTRICT_DIRECTOR" && <>
                <RoleBasedOrgNavigation
      currentUser={currentUser}
      districts={districts}
      branches={branches}
      employees={employees}
      kpis={kpis}
      reports={reports}
      targets={targets}
      language={language}
    />
                <DistrictManagementDashboard
      currentUser={currentUser}
      districts={districts}
      branches={branches}
      kpis={kpis}
      reports={reports}
      targets={targets}
      language={language}
    />
              </>}

          </div>
  )}

      </main>

      {
    /* FOOTER */
  }
      <Footer language={language} />

      {
    /* MODALS & DRAWERS */
  }
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
      localStorage.setItem("bunna_user", JSON.stringify(user));
      loadData(user);
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

      <FloatingAiCoachButton
    onClick={() => setIsAiDrawerOpen(true)}
    language={language}
    isDrawerOpen={isAiDrawerOpen}
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

      {currentUser && <UserProfileModal
    isOpen={isProfileOpen}
    onClose={() => setIsProfileOpen(false)}
    user={currentUser}
    targets={targets}
    reports={reports}
    employees={employees}
    onRefreshData={loadData}
    onOpenAiSummary={handleOpenAiForEmployee}
    onNavigateTab={handleSelectNavTab}
    onLogout={() => {
      setCurrentUser(null);
      setCurrentNavView("home");
      setIsProfileOpen(false);
      localStorage.removeItem("bunna_user");
    }}
    language={language}
    onUserUpdated={(updated) => {
      setCurrentUser(updated);
      localStorage.setItem("bunna_user", JSON.stringify(updated));
    }}
  />}

    </div>;
};
export default App;
