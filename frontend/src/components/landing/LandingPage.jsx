import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Coins,
  DollarSign,
  Smartphone,
  Globe,
  QrCode,
  CreditCard,
  UserPlus,
  Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { translations } from "../../i18n/translations";
import { BunnaBankLogo } from "../common/BunnaBankLogo";
import { api } from "../../services/api";
export const LandingPage = ({
  language,
  onGetStarted,
  onOpenLogin,
  districts,
  branches,
  employees,
  reports,
  targets
}) => {
  const tr = translations[language] || translations.en;
  const t2 = Object.assign(
    (str) => tr[str] || str,
    tr
  );
  const [liveDistricts, setLiveDistricts] = useState(districts || []);
  const [liveBranches, setLiveBranches] = useState(branches || []);
  const [liveEmployees, setLiveEmployees] = useState(employees || []);
  const [liveReports, setLiveReports] = useState(reports || []);
  const [liveTargets, setLiveTargets] = useState(targets || []);
  useEffect(() => {
    if (districts && districts.length > 0) setLiveDistricts(districts);
    if (branches && branches.length > 0) setLiveBranches(branches);
    if (employees && employees.length > 0) setLiveEmployees(employees);
    if (reports && reports.length > 0) setLiveReports(reports);
    if (targets && targets.length > 0) setLiveTargets(targets);
  }, [districts, branches, employees, reports, targets]);
  const [serverStats, setServerStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLiveData = async () => {
      try {
        setIsLoadingStats(true);
        setStatsError(null);

        // Fetch real-time public stats derived from actual database records
        const [statsData, dList, bList, eList, rList, tList] = await Promise.all([
          api.getPublicStats().catch(() => null),
          api.getDistricts().catch(() => []),
          api.getBranches().catch(() => []),
          api.getEmployees().catch(() => []),
          api.getDailyReports().catch(() => []),
          api.getTargets().catch(() => [])
        ]);

        if (!isMounted) return;

        if (Array.isArray(dList) && dList.length > 0) setLiveDistricts(dList);
        if (Array.isArray(bList) && bList.length > 0) setLiveBranches(bList);
        if (Array.isArray(eList) && eList.length > 0) setLiveEmployees(eList);
        if (Array.isArray(rList) && rList.length > 0) setLiveReports(rList);
        if (Array.isArray(tList) && tList.length > 0) setLiveTargets(tList);

        if (statsData) {
          setServerStats(statsData);
        }
      } catch (err) {
        console.warn("Failed to fetch live landing page data", err);
        if (isMounted) setStatsError(err.message || "Failed to load live statistics");
      } finally {
        if (isMounted) setIsLoadingStats(false);
      }
    };

    fetchLiveData();

    // Auto-update periodically so stats stay in sync when data changes
    const syncInterval = setInterval(fetchLiveData, 30000);
    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, []);

  // Compute accurate real-time values from actual database records
  const targetDistricts = useMemo(() => {
    if (serverStats?.districtsCount !== undefined && serverStats?.districtsCount !== null) {
      return Number(serverStats.districtsCount);
    }
    return Array.isArray(liveDistricts) ? liveDistricts.length : 0;
  }, [serverStats, liveDistricts]);

  const targetBranches = useMemo(() => {
    if (serverStats?.branchesCount !== undefined && serverStats?.branchesCount !== null) {
      return Number(serverStats.branchesCount);
    }
    return Array.isArray(liveBranches) ? liveBranches.length : 0;
  }, [serverStats, liveBranches]);

  const targetEmployees = useMemo(() => {
    if (serverStats?.employeesCount !== undefined && serverStats?.employeesCount !== null) {
      return Number(serverStats.employeesCount);
    }
    const branchStaff = Array.isArray(liveBranches)
      ? liveBranches.reduce((sum, b) => sum + (Number(b.employee_count || b.employeeCount) || 0), 0)
      : 0;
    const districtStaff = Array.isArray(liveDistricts)
      ? liveDistricts.reduce((sum, d) => sum + (Number(d.total_employees || d.totalEmployees) || 0), 0)
      : 0;
    const userCount = Array.isArray(liveEmployees) ? liveEmployees.length : 0;
    return branchStaff > 0 ? branchStaff : (districtStaff > 0 ? districtStaff : userCount);
  }, [serverStats, liveBranches, liveDistricts, liveEmployees]);

  const targetEfficiency = useMemo(() => {
    if (serverStats?.approvalEfficiency !== undefined && serverStats?.approvalEfficiency !== null) {
      return Number(serverStats.approvalEfficiency);
    }
    const reportList = Array.isArray(liveReports) ? liveReports : [];
    if (reportList.length === 0) return 0;
    const approved = reportList.filter((r) => (r.status || "").toLowerCase() === "approved").length;
    return Number(((approved / reportList.length) * 100).toFixed(1));
  }, [serverStats, liveReports]);

  const [districtsCount, setDistrictsCount] = useState(0);
  const [branchesCount, setBranchesCount] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [efficiencyCount, setEfficiencyCount] = useState(0);
  const [kpiCategory, setKpiCategory] = useState("ALL");

  // Live CountUp animation tracking actual database target values
  useEffect(() => {
    if (isLoadingStats) return;

    const duration = 1000;
    const steps = 25;
    const intervalTime = Math.max(16, duration / steps);
    let step = 0;

    const startD = districtsCount;
    const startB = branchesCount;
    const startE = employeesCount;
    const startEff = efficiencyCount;

    const diffD = targetDistricts - startD;
    const diffB = targetBranches - startB;
    const diffE = targetEmployees - startE;
    const diffEff = targetEfficiency - startEff;

    if (diffD === 0 && diffB === 0 && diffE === 0 && diffEff === 0) {
      setDistrictsCount(targetDistricts);
      setBranchesCount(targetBranches);
      setEmployeesCount(targetEmployees);
      setEfficiencyCount(targetEfficiency);
      return;
    }

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

      setDistrictsCount(Math.round(startD + diffD * ease));
      setBranchesCount(Math.round(startB + diffB * ease));
      setEmployeesCount(Math.round(startE + diffE * ease));
      setEfficiencyCount(Number((startEff + diffEff * ease).toFixed(1)));

      if (step >= steps) {
        clearInterval(timer);
        setDistrictsCount(targetDistricts);
        setBranchesCount(targetBranches);
        setEmployeesCount(targetEmployees);
        setEfficiencyCount(targetEfficiency);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [targetDistricts, targetBranches, targetEmployees, targetEfficiency, isLoadingStats]);
  const [openFaq, setOpenFaq] = useState(0);
  const faqs = [
    {
      q: "What is Bunna Bank EPMS?",
      a: "The Employee Performance Management System (EPMS) is an enterprise AI-powered platform designed for Bunna Bank S.C. to track daily financial mobilization, digital banking activations, and multi-tier approvals across all nationwide branches."
    },
    {
      q: "When can employees submit their daily performance reports?",
      a: "Employees can submit daily performance reports on all official working days except Sundays and configured bank holidays (such as Enkutatash, Genna, Timkat, and Adwa)."
    },
    {
      q: "How does the AI Performance Assistant work?",
      a: "The embedded Gemini AI assistant answers questions regarding KPIs, district targets, manager approval queues, policy rules, and provides automated performance summaries with natural language querying."
    },
    {
      q: "How are manager report approvals structured?",
      a: "Branch managers can Approve, Reject, Return for Correction with comments, Suspend, or Delete daily reports. Employees receive instant notification alerts and audit logs update automatically."
    }
  ];
  const kpiConfigs = [
    {
      id: "KPI-001",
      name: "Deposits Mobilized",
      code: "DEP_ETB",
      category: "Finance",
      unit: "ETB",
      key: "depositsETB",
      isCurrency: true,
      currencySymbol: "ETB",
      icon: Coins,
      gradient: "from-[#D4A017] to-amber-500",
      textColor: "text-[#D4A017]"
    },
    {
      id: "KPI-002",
      name: "Foreign Currency Inflow",
      code: "FCY_ETB",
      category: "Finance",
      unit: "USD",
      key: "foreignCurrencyETB",
      isCurrency: true,
      currencySymbol: "USD",
      icon: DollarSign,
      gradient: "from-emerald-400 to-teal-500",
      textColor: "text-emerald-400"
    },
    {
      id: "KPI-003",
      name: "Digital Financial Services",
      code: "DFS_ETB",
      category: "Finance",
      unit: "ETB",
      key: "digitalFinancialServicesETB",
      isCurrency: true,
      currencySymbol: "ETB",
      icon: TrendingUp,
      gradient: "from-blue-400 to-cyan-500",
      textColor: "text-blue-400"
    },
    {
      id: "KPI-004",
      name: "Account Openings",
      code: "ACC_OPEN",
      category: "Stakeholder",
      unit: "Accounts",
      key: "accountOpenings",
      isCurrency: false,
      currencySymbol: "",
      icon: UserPlus,
      gradient: "from-purple-400 to-pink-500",
      textColor: "text-purple-400"
    },
    {
      id: "KPI-005",
      name: "Bunna Mobile Activations",
      code: "MB_ACT",
      category: "Internal Business",
      unit: "Users",
      key: "mobileBankingActivations",
      isCurrency: false,
      currencySymbol: "",
      icon: Smartphone,
      gradient: "from-indigo-400 to-purple-500",
      textColor: "text-indigo-400"
    },
    {
      id: "KPI-006",
      name: "Internet Banking",
      code: "IB_ACT",
      category: "Internal Business",
      unit: "Users",
      key: "internetBankingActivations",
      isCurrency: false,
      currencySymbol: "",
      icon: Globe,
      gradient: "from-cyan-400 to-blue-500",
      textColor: "text-cyan-400"
    },
    {
      id: "KPI-007",
      name: "Merchant QR Solutions",
      code: "MERCH_SOL",
      category: "Internal Business",
      unit: "Merchants",
      key: "merchantSolutions",
      isCurrency: false,
      currencySymbol: "",
      icon: QrCode,
      gradient: "from-orange-400 to-amber-500",
      textColor: "text-orange-400"
    },
    {
      id: "KPI-008",
      name: "ATM Card Activations",
      code: "ATM_CARD",
      category: "Internal Business",
      unit: "Cards",
      key: "atmCardActivations",
      isCurrency: false,
      currencySymbol: "",
      icon: CreditCard,
      gradient: "from-teal-400 to-emerald-500",
      textColor: "text-teal-400"
    }
  ];
  const formatKpiValue = (val, unit, isCurrency, symbol) => {
    if (val === 0) {
      if (symbol === "USD") return "$0.00 USD";
      if (isCurrency) return "0.00 ETB";
      return `0 ${unit}`;
    }
    if (isCurrency) {
      if (symbol === "USD") {
        if (val >= 1e6) return `$${(val / 1e6).toFixed(2)} Million USD`;
        if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}k USD`;
        return `$${val.toLocaleString()} USD`;
      }
      if (val >= 1e9) return `${(val / 1e9).toFixed(2)} Billion ETB`;
      if (val >= 1e6) return `${(val / 1e6).toFixed(2)} Million ETB`;
      if (val >= 1e3) return `${(val / 1e3).toFixed(1)}k ETB`;
      return `${val.toLocaleString()} ETB`;
    }
    return `${val.toLocaleString()} ${unit}`;
  };
  const bankKpisPerformance = kpiConfigs.map((cfg) => {
    const targetObjList = liveTargets.filter(
      (t3) => t3.kpiId === cfg.id || t3.kpiName && t3.kpiName.toLowerCase().includes(cfg.name.toLowerCase()) || t3.kpiCode === cfg.code
    );
    const totalTargetNum = targetObjList.reduce((sum, t3) => sum + (Number(t3.targetValue) || 0), 0);
    const totalAchievedNum = liveReports.reduce((sum, r) => sum + (Number(r[cfg.key]) || 0), 0);
    const percentage = totalTargetNum > 0 ? Number((totalAchievedNum / totalTargetNum * 100).toFixed(1)) : 0;
    let status = "Pending Data";
    let bgBadge = "bg-white/10 text-gray-300 border-white/20";
    if (totalTargetNum > 0 || totalAchievedNum > 0) {
      if (percentage >= 100) {
        status = "Exceeded";
        bgBadge = "bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]/40";
      } else if (percentage >= 80) {
        status = "Achieved";
        bgBadge = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      } else {
        status = "Below Target";
        bgBadge = "bg-amber-500/20 text-amber-300 border-amber-500/40";
      }
    }
    return {
      ...cfg,
      target: formatKpiValue(totalTargetNum, cfg.unit, cfg.isCurrency, cfg.currencySymbol),
      achieved: formatKpiValue(totalAchievedNum, cfg.unit, cfg.isCurrency, cfg.currencySymbol),
      percentage,
      status,
      bgBadge
    };
  });
  const validKpisWithTargets = bankKpisPerformance.filter((k) => k.percentage > 0);
  const overallAttainmentPct = validKpisWithTargets.length > 0 ? Number((validKpisWithTargets.reduce((acc, k) => acc + k.percentage, 0) / validKpisWithTargets.length).toFixed(1)) : 0;
  let overallStatusLabel = "Pending Data";
  if (overallAttainmentPct >= 100) overallStatusLabel = "Exceeding Target";
  else if (overallAttainmentPct >= 80) overallStatusLabel = "On Track";
  else if (overallAttainmentPct > 0) overallStatusLabel = "In Progress";
  const filteredKpis = bankKpisPerformance.filter(
    (k) => kpiCategory === "ALL" || k.category === kpiCategory
  );
  return <div className="bg-white text-gray-900">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white text-gray-900 border-b border-gray-100">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#541818]/10 border border-[#541818]/20 text-[#541818] text-xs font-bold tracking-wide">
                <Sparkles className="w-4 h-4 text-[#541818]" />
                <span>{t2("Bunna Bank S.C. Official EPMS Portal")}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#541818] leading-tight">
                {t2.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                {t2.heroSubtitle}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={onGetStarted}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#541818] hover:bg-[#3d1011] text-white font-extrabold text-sm shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{t2.getStarted}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 font-bold text-sm transition-all cursor-pointer"
                >
                  <span>{t2.login}</span>
                </button>
              </div>

              {/* Live CountUp Animated Stats Bar */}
              <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-100">
                <div className="p-3.5 rounded-2xl bg-white border border-gray-200 text-center shadow-xs">
                  {isLoadingStats ? (
                    <div className="h-8 w-16 mx-auto bg-gray-100 animate-pulse rounded-lg my-0.5" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-extrabold text-[#541818]">
                      {districtsCount === 0 ? "0" : `${districtsCount}+`}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-600 font-medium mt-0.5">{t2.statsDistricts}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200 text-center shadow-xs">
                  {isLoadingStats ? (
                    <div className="h-8 w-16 mx-auto bg-gray-100 animate-pulse rounded-lg my-0.5" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-extrabold text-[#541818]">
                      {branchesCount === 0 ? "0" : `${branchesCount}+`}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-600 font-medium mt-0.5">{t2.statsBranches}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200 text-center shadow-xs">
                  {isLoadingStats ? (
                    <div className="h-8 w-20 mx-auto bg-gray-100 animate-pulse rounded-lg my-0.5" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-extrabold text-[#541818]">
                      {employeesCount === 0 ? "0" : `${employeesCount.toLocaleString()}+`}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-600 font-medium mt-0.5">{t2.statsEmployees}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-gray-200 text-center shadow-xs">
                  {isLoadingStats ? (
                    <div className="h-8 w-16 mx-auto bg-gray-100 animate-pulse rounded-lg my-0.5" />
                  ) : (
                    <p className="text-2xl sm:text-3xl font-extrabold text-[#425727]">
                      {efficiencyCount === 0 ? "0%" : `${efficiencyCount}%`}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-600 font-medium mt-0.5">{t2("Approval Efficiency")}</p>
                </div>
              </div>

            </div>

            {/* Enterprise Performance Plaque / Card */}
            <div className="lg:col-span-5 relative pt-4 sm:pt-6">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Glass Card with White UI */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 p-5 sm:p-6 rounded-3xl bg-white border border-gray-200 shadow-md transition-all duration-500 overflow-hidden"
                >
                  {/* Header Section */}
                  <div className="pb-4 border-b border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#541818] p-1.5 shadow-sm flex items-center justify-center">
                          <BunnaBankLogo className="w-7 h-7" variant="gold" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-extrabold text-sm text-gray-900 tracking-wide">{t2("Bunna Bank S.C.")}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-[#541818]/10 border border-[#541818]/20 text-[#541818] text-[10px] font-bold">
                              {t2("FY 2025/26")}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{t2("Overall Bank KPI Performance")}</p>
                        </div>
                      </div>

                      {/* Overall Attainment Badge */}
                      <div className="flex flex-col items-end">
                        <div className="flex items-center space-x-1 px-3 py-1.5 rounded-2xl bg-[#425727]/10 border border-[#425727]/20 text-[#425727] shadow-xs">
                          <Trophy className="w-4 h-4 text-[#425727]" />
                          <span className="text-sm font-extrabold tracking-tight">{overallAttainmentPct.toFixed(1)}%</span>
                        </div>
                        <span className="text-[9px] font-bold text-gray-500 tracking-wider uppercase mt-1">{overallStatusLabel}</span>
                      </div>
                    </div>

                    {/* KPI Category Navigation Tabs */}
                    <div className="pt-1 grid grid-cols-5 gap-1 bg-gray-100 p-1 rounded-xl text-[10px]">
                      <button
                        onClick={() => setKpiCategory("ALL")}
                        className={`py-1.5 px-1 rounded-lg font-bold transition-all truncate cursor-pointer ${kpiCategory === "ALL" ? "bg-[#541818] text-white shadow-xs" : "text-gray-600 hover:text-gray-900 hover:bg-white"}`}
                      >
                        {t2("All")}
                      </button>
                      <button
                        onClick={() => setKpiCategory("Finance")}
                        className={`py-1.5 px-1 rounded-lg font-bold transition-all truncate cursor-pointer ${kpiCategory === "Finance" ? "bg-[#541818] text-white shadow-xs" : "text-gray-600 hover:text-gray-900 hover:bg-white"}`}
                      >
                        {t2("Finance")}
                      </button>
                      <button
                        onClick={() => setKpiCategory("Stakeholder")}
                        className={`py-1.5 px-1 rounded-lg font-bold transition-all truncate cursor-pointer ${kpiCategory === "Stakeholder" ? "bg-[#541818] text-white shadow-xs" : "text-gray-600 hover:text-gray-900 hover:bg-white"}`}
                      >
                        {t2("Stakeholder")}
                      </button>
                      <button
                        onClick={() => setKpiCategory("Internal Business")}
                        className={`py-1.5 px-1 rounded-lg font-bold transition-all truncate cursor-pointer ${kpiCategory === "Internal Business" ? "bg-[#541818] text-white shadow-xs" : "text-gray-600 hover:text-gray-900 hover:bg-white"}`}
                      >
                        {t2("Internal Business")}
                      </button>
                      <button
                        onClick={() => setKpiCategory("Learning & Growth")}
                        className={`py-1.5 px-1 rounded-lg font-bold transition-all truncate cursor-pointer ${kpiCategory === "Learning & Growth" ? "bg-[#541818] text-white shadow-xs" : "text-gray-600 hover:text-gray-900 hover:bg-white"}`}
                      >
                        {t2("Learning & Growth")}
                      </button>
                    </div>
                  </div>

                  {/* Scrollable KPI Progress List */}
                  <div className="py-3 max-h-[290px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                      {filteredKpis.map((kpi, idx) => {
                        const Icon = kpi.icon;
                        const fillWidth = Math.min(kpi.percentage, 100);
                        return (
                          <motion.div
                            key={kpi.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, delay: idx * 0.04 }}
                            className="p-3 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition-all shadow-xs"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-gray-100 p-0.5 flex-shrink-0 flex items-center justify-center">
                                  <Icon className="w-4 h-4 text-[#541818]" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-gray-900 truncate">
                                    {kpi.name}
                                  </p>
                                  <p className="text-[10px] text-gray-500 font-medium truncate">
                                    {t2("Target:")} {kpi.target}
                                  </p>
                                </div>
                              </div>

                              {/* Percentage Pill */}
                              <div className="flex flex-col items-end flex-shrink-0">
                                <span className={`px-2 py-0.5 rounded-full border text-xs font-bold tracking-tight ${kpi.percentage >= 100 ? "bg-[#425727]/10 text-[#425727] border-[#425727]/20" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                                  {kpi.percentage.toFixed(1)}%
                                </span>
                                <span className="text-[9px] text-gray-500 font-semibold mt-0.5">
                                  {kpi.achieved}
                                </span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden relative">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${fillWidth}%` }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="h-full rounded-full bg-[#541818] relative"
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px]">
                    <div className="flex items-center space-x-1.5 text-gray-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#425727]" />
                      <span>{t2("Audit Verified \u2022")} {liveBranches.length} {t2("Branches")}</span>
                    </div>
                    <span className="text-[#541818] font-bold flex items-center space-x-1">
                      <span>{t2("Live EPMS Core")}</span>
                      <Sparkles className="w-3 h-3 text-[#541818]" />
                    </span>
                  </div>
                </motion.div>

                {/* Decorative badge */}
                <div className="mt-4 p-3.5 rounded-2xl bg-white text-gray-900 shadow-sm flex items-center space-x-3 border border-gray-200">
                  <div className="w-9 h-9 rounded-xl bg-[#541818] text-white flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs tracking-tight text-gray-900">{t2("Bunna Bank Live Attainment")}</p>
                    <p className="text-[10px] font-semibold text-gray-500">{t2("Fiscal Year 2025/26:")} {overallAttainmentPct.toFixed(1)}%</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

    </div>;
};
