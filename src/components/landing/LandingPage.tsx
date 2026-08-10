import React, { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Award,
  ChevronRight,
  Sparkles,
  BarChart3,
  Globe2,
  CheckCircle2,
  HelpCircle,
  Mail,
  Send,
  Coins,
  DollarSign,
  Smartphone,
  Globe,
  QrCode,
  CreditCard,
  UserPlus,
  Target,
  Trophy,
  Percent,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, District, Branch, User, DailyPerformanceReport, PerformanceTarget } from '../../types';
import { translations } from '../../i18n/translations';
import { BunnaBankLogo } from '../common/BunnaBankLogo';
import { api } from '../../services/api';

interface LandingPageProps {
  language: Language;
  onGetStarted: () => void;
  onOpenLogin: () => void;
  districts?: District[];
  branches?: Branch[];
  employees?: User[];
  reports?: DailyPerformanceReport[];
  targets?: PerformanceTarget[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onGetStarted,
  onOpenLogin,
  districts,
  branches,
  employees,
  reports,
  targets
}) => {
  const t = translations[language];

  // Live Data State
  const [liveDistricts, setLiveDistricts] = useState<District[]>(districts || []);
  const [liveBranches, setLiveBranches] = useState<Branch[]>(branches || []);
  const [liveEmployees, setLiveEmployees] = useState<User[]>(employees || []);
  const [liveReports, setLiveReports] = useState<DailyPerformanceReport[]>(reports || []);
  const [liveTargets, setLiveTargets] = useState<PerformanceTarget[]>(targets || []);

  useEffect(() => {
    if (districts && districts.length > 0) setLiveDistricts(districts);
    if (branches && branches.length > 0) setLiveBranches(branches);
    if (employees && employees.length > 0) setLiveEmployees(employees);
    if (reports && reports.length > 0) setLiveReports(reports);
    if (targets && targets.length > 0) setLiveTargets(targets);
  }, [districts, branches, employees, reports, targets]);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const [dList, bList, eList, rList, tList] = await Promise.all([
          api.getDistricts(),
          api.getBranches(),
          api.getEmployees(),
          api.getDailyReports(),
          api.getTargets()
        ]);
        if (dList && dList.length > 0) setLiveDistricts(dList);
        if (bList && bList.length > 0) setLiveBranches(bList);
        if (eList && eList.length > 0) setLiveEmployees(eList);
        if (rList && rList.length > 0) setLiveReports(rList);
        if (tList && tList.length > 0) setLiveTargets(tList);
      } catch (err) {
        console.warn("Failed to fetch live landing page data", err);
      }
    };
    fetchLiveData();
  }, []);

  // CountUp Counters Animation derived from live database
  const [districtsCount, setDistrictsCount] = useState(0);
  const [branchesCount, setBranchesCount] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [efficiencyCount, setEfficiencyCount] = useState(0);

  // Category Filter for Hanging Card Performance KPIs
  const [kpiCategory, setKpiCategory] = useState<'ALL' | 'FINANCIAL' | 'DIGITAL'>('ALL');

  useEffect(() => {
    // For the home page counter:
    // Districts: 33+
    // Branches: 500+
    // Employees: 5,000+
    // Approval Efficiency: 0%
    const dTarget = 33;
    const bTarget = 500;
    const eTarget = 5000;
    const effTarget = 0;

    const duration = 1200;
    const steps = 30;
    const intervalTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setDistrictsCount(Math.floor(dTarget * progress));
      setBranchesCount(Math.floor(bTarget * progress));
      setEmployeesCount(Math.floor(eTarget * progress));
      setEfficiencyCount(Number((effTarget * progress).toFixed(1)));

      if (step >= steps) {
        clearInterval(timer);
        setDistrictsCount(dTarget);
        setBranchesCount(bTarget);
        setEmployeesCount(eTarget);
        setEfficiencyCount(effTarget);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

  // Dynamic KPI Configurations & Calculations
  const kpiConfigs = [
    {
      id: 'KPI-001',
      name: 'Deposits Mobilized',
      code: 'DEP_ETB',
      category: 'FINANCIAL' as const,
      unit: 'ETB',
      key: 'depositsETB',
      isCurrency: true,
      currencySymbol: 'ETB',
      icon: Coins,
      gradient: 'from-[#C89A2B] to-amber-500',
      textColor: 'text-[#C89A2B]'
    },
    {
      id: 'KPI-002',
      name: 'Foreign Currency Inflow',
      code: 'FCY_ETB',
      category: 'FINANCIAL' as const,
      unit: 'USD',
      key: 'foreignCurrencyETB',
      isCurrency: true,
      currencySymbol: 'USD',
      icon: DollarSign,
      gradient: 'from-emerald-400 to-teal-500',
      textColor: 'text-emerald-400'
    },
    {
      id: 'KPI-003',
      name: 'Digital Financial Services',
      code: 'DFS_ETB',
      category: 'FINANCIAL' as const,
      unit: 'ETB',
      key: 'digitalFinancialServicesETB',
      isCurrency: true,
      currencySymbol: 'ETB',
      icon: TrendingUp,
      gradient: 'from-blue-400 to-cyan-500',
      textColor: 'text-blue-400'
    },
    {
      id: 'KPI-004',
      name: 'Account Openings',
      code: 'ACC_OPEN',
      category: 'DIGITAL' as const,
      unit: 'Accounts',
      key: 'accountOpenings',
      isCurrency: false,
      currencySymbol: '',
      icon: UserPlus,
      gradient: 'from-purple-400 to-pink-500',
      textColor: 'text-purple-400'
    },
    {
      id: 'KPI-005',
      name: 'Bunna Mobile Activations',
      code: 'MB_ACT',
      category: 'DIGITAL' as const,
      unit: 'Users',
      key: 'mobileBankingActivations',
      isCurrency: false,
      currencySymbol: '',
      icon: Smartphone,
      gradient: 'from-indigo-400 to-purple-500',
      textColor: 'text-indigo-400'
    },
    {
      id: 'KPI-006',
      name: 'Internet Banking',
      code: 'IB_ACT',
      category: 'DIGITAL' as const,
      unit: 'Users',
      key: 'internetBankingActivations',
      isCurrency: false,
      currencySymbol: '',
      icon: Globe,
      gradient: 'from-cyan-400 to-blue-500',
      textColor: 'text-cyan-400'
    },
    {
      id: 'KPI-007',
      name: 'Merchant QR Solutions',
      code: 'MERCH_SOL',
      category: 'DIGITAL' as const,
      unit: 'Merchants',
      key: 'merchantSolutions',
      isCurrency: false,
      currencySymbol: '',
      icon: QrCode,
      gradient: 'from-orange-400 to-amber-500',
      textColor: 'text-orange-400'
    },
    {
      id: 'KPI-008',
      name: 'ATM Card Activations',
      code: 'ATM_CARD',
      category: 'DIGITAL' as const,
      unit: 'Cards',
      key: 'atmCardActivations',
      isCurrency: false,
      currencySymbol: '',
      icon: CreditCard,
      gradient: 'from-teal-400 to-emerald-500',
      textColor: 'text-teal-400'
    }
  ];

  const formatKpiValue = (val: number, unit: string, isCurrency: boolean, symbol: string) => {
    if (val === 0) {
      if (symbol === 'USD') return '$0.00 USD';
      if (isCurrency) return '0.00 ETB';
      return `0 ${unit}`;
    }
    if (isCurrency) {
      if (symbol === 'USD') {
        if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)} Million USD`;
        if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k USD`;
        return `$${val.toLocaleString()} USD`;
      }
      if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(2)} Billion ETB`;
      if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} Million ETB`;
      if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k ETB`;
      return `${val.toLocaleString()} ETB`;
    }
    return `${val.toLocaleString()} ${unit}`;
  };

  const bankKpisPerformance = kpiConfigs.map(cfg => {
    const targetObjList = liveTargets.filter(t =>
      t.kpiId === cfg.id ||
      (t.kpiName && t.kpiName.toLowerCase().includes(cfg.name.toLowerCase())) ||
      t.kpiCode === cfg.code
    );
    const totalTargetNum = targetObjList.reduce((sum, t) => sum + (Number(t.targetValue) || 0), 0);
    const totalAchievedNum = liveReports.reduce((sum, r) => sum + (Number((r as any)[cfg.key]) || 0), 0);

    const percentage = totalTargetNum > 0 ? Number(((totalAchievedNum / totalTargetNum) * 100).toFixed(1)) : 0;

    let status = 'Pending Data';
    let bgBadge = 'bg-white/10 text-gray-300 border-white/20';

    if (totalTargetNum > 0 || totalAchievedNum > 0) {
      if (percentage >= 100) {
        status = 'Exceeded';
        bgBadge = 'bg-[#C89A2B]/20 text-[#C89A2B] border-[#C89A2B]/40';
      } else if (percentage >= 80) {
        status = 'Achieved';
        bgBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      } else {
        status = 'Below Target';
        bgBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
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

  const validKpisWithTargets = bankKpisPerformance.filter(k => k.percentage > 0);
  const overallAttainmentPct = validKpisWithTargets.length > 0
    ? Number((validKpisWithTargets.reduce((acc, k) => acc + k.percentage, 0) / validKpisWithTargets.length).toFixed(1))
    : 0;

  let overallStatusLabel = 'Pending Data';
  if (overallAttainmentPct >= 100) overallStatusLabel = 'Exceeding Target';
  else if (overallAttainmentPct >= 80) overallStatusLabel = 'On Track';
  else if (overallAttainmentPct > 0) overallStatusLabel = 'In Progress';

  const filteredKpis = bankKpisPerformance.filter(
    k => kpiCategory === 'ALL' || k.category === kpiCategory
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#222222]">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#6B3F1D] via-[#4A2C17] to-[#3A2212] text-white">
        {/* Glow & Grid Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C89A2B]/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#C89A2B]/20 border border-[#C89A2B]/40 text-[#C89A2B] text-xs font-bold tracking-wide">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Bunna Bank S.C. Official EPMS Portal</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-none">
                {t.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                {t.heroSubtitle}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={onGetStarted}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] text-[#6B3F1D] font-extrabold text-sm shadow-2xl hover:opacity-95 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <span>{t.getStarted}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-[#C89A2B]/40 text-white font-bold text-sm transition-all"
                >
                  <span>{t.login}</span>
                </button>
              </div>

              {/* Live CountUp Animated Stats Bar */}
              <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10">
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#C89A2B]">{districtsCount}+</p>
                  <p className="text-[11px] text-gray-200 font-medium mt-0.5">{t.statsDistricts}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#C89A2B]">{branchesCount}+</p>
                  <p className="text-[11px] text-gray-200 font-medium mt-0.5">{t.statsBranches}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#C89A2B]">{employeesCount.toLocaleString()}+</p>
                  <p className="text-[11px] text-gray-200 font-medium mt-0.5">{t.statsEmployees}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#C89A2B]">{efficiencyCount}%</p>
                  <p className="text-[11px] text-gray-200 font-medium mt-0.5">Approval Efficiency</p>
                </div>
              </div>

            </div>

            {/* Hero Hanging Enterprise Performance Plaque/Card */}
            <div className="lg:col-span-5 relative pt-10 sm:pt-12">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Hanging Cables / Golden Suspenders with Top Mounting Pins */}
                <div className="absolute -top-12 left-1/4 w-0.5 h-12 bg-gradient-to-b from-[#C89A2B]/10 via-[#C89A2B]/80 to-[#C89A2B] z-20">
                  <div className="w-3 h-3 rounded-full bg-[#C89A2B] border-2 border-[#6B3F1D] -translate-x-[5px] -translate-y-1.5 shadow-[0_0_10px_#C89A2B]" />
                </div>
                <div className="absolute -top-12 right-1/4 w-0.5 h-12 bg-gradient-to-b from-[#C89A2B]/10 via-[#C89A2B]/80 to-[#C89A2B] z-20">
                  <div className="w-3 h-3 rounded-full bg-[#C89A2B] border-2 border-[#6B3F1D] -translate-x-[5px] -translate-y-1.5 shadow-[0_0_10px_#C89A2B]" />
                </div>

                {/* Animated Hanging Main Glass Card */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-10 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#6B3F1D]/95 via-[#4A2C17]/95 to-[#3A2212]/95 backdrop-blur-2xl border-2 border-[#C89A2B]/70 shadow-[0_20px_50px_rgba(200,154,43,0.25)] hover:shadow-[0_25px_60px_rgba(200,154,43,0.4)] transition-all duration-500 overflow-hidden"
                >
                  {/* Subtle Light-Sweep Ambient Glow */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C89A2B]/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#D8B45C]/15 rounded-full blur-3xl pointer-events-none" />

                  {/* Header Section */}
                  <div className="pb-4 border-b border-[#C89A2B]/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C89A2B] via-[#D8B45C] to-[#6B3F1D] p-0.5 shadow-lg flex items-center justify-center">
                          <div className="w-full h-full bg-[#6B3F1D] rounded-[14px] p-1.5 flex items-center justify-center">
                            <BunnaBankLogo className="w-7 h-7" variant="gold" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-extrabold text-sm text-white tracking-wide">Bunna Bank S.C.</h3>
                            <span className="px-2 py-0.5 rounded-full bg-[#C89A2B]/20 border border-[#C89A2B]/50 text-[#C89A2B] text-[10px] font-bold">
                              FY 2025/26
                            </span>
                          </div>
                          <p className="text-[11px] text-[#C89A2B] font-semibold mt-0.5">Overall Bank KPI Performance</p>
                        </div>
                      </div>

                      {/* Overall Attainment Badge */}
                      <div className="flex flex-col items-end">
                        <div className="flex items-center space-x-1 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#C89A2B]/20 to-[#D8B45C]/20 border border-[#C89A2B]/50 text-[#C89A2B] shadow-md">
                          <Trophy className="w-4 h-4 text-[#C89A2B] animate-bounce" />
                          <span className="text-sm font-extrabold tracking-tight text-white">{overallAttainmentPct.toFixed(1)}%</span>
                        </div>
                        <span className="text-[9px] font-bold text-[#C89A2B] tracking-wider uppercase mt-1">{overallStatusLabel}</span>
                      </div>
                    </div>

                    {/* KPI Category Navigation Tabs */}
                    <div className="pt-1 flex items-center justify-between gap-1 bg-black/30 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => setKpiCategory('ALL')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                          kpiCategory === 'ALL'
                            ? 'bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] text-[#6B3F1D] shadow-md'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        All KPIs (8)
                      </button>
                      <button
                        onClick={() => setKpiCategory('FINANCIAL')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                          kpiCategory === 'FINANCIAL'
                            ? 'bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] text-[#6B3F1D] shadow-md'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        Financial
                      </button>
                      <button
                        onClick={() => setKpiCategory('DIGITAL')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                          kpiCategory === 'DIGITAL'
                            ? 'bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] text-[#6B3F1D] shadow-md'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        Digital Banking
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
                            className="p-3 rounded-2xl bg-black/40 border border-[#C89A2B]/25 hover:border-[#C89A2B]/60 transition-all group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${kpi.gradient} p-0.5 flex-shrink-0 shadow-sm`}>
                                  <div className="w-full h-full bg-[#6B3F1D] rounded-[10px] flex items-center justify-center">
                                    <Icon className={`w-4 h-4 ${kpi.textColor}`} />
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate group-hover:text-[#C89A2B] transition-colors">
                                    {kpi.name}
                                  </p>
                                  <p className="text-[10px] text-gray-300 font-medium truncate">
                                    Target: {kpi.target}
                                  </p>
                                </div>
                              </div>

                              {/* Percentage Pill */}
                              <div className="flex flex-col items-end flex-shrink-0">
                                <span className={`px-2 py-0.5 rounded-full border text-xs font-black tracking-tight ${kpi.bgBadge}`}>
                                  {kpi.percentage.toFixed(1)}%
                                </span>
                                <span className="text-[9px] text-[#C89A2B] font-semibold mt-0.5">
                                  {kpi.achieved}
                                </span>
                              </div>
                            </div>

                            {/* Animated Glowing Progress Bar */}
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden relative p-0.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${fillWidth}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                className={`h-full rounded-full bg-gradient-to-r ${kpi.gradient} shadow-[0_0_12px_rgba(200,154,43,0.6)] relative`}
                              >
                                {kpi.percentage >= 100 && (
                                  <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                                )}
                              </motion.div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px]">
                    <div className="flex items-center space-x-1.5 text-emerald-300 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Audit Verified • {liveBranches.length} Branches</span>
                    </div>
                    <span className="text-[#C89A2B] font-bold flex items-center space-x-1">
                      <span>Live EPMS Core</span>
                      <Sparkles className="w-3 h-3 text-[#C89A2B] animate-spin" />
                    </span>
                  </div>
                </motion.div>

                {/* Decorative floating badge */}
                <div className="absolute -bottom-6 -left-6 p-3.5 rounded-2xl bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] text-[#6B3F1D] shadow-2xl z-20 flex items-center space-x-3 hidden sm:flex border border-white/30">
                  <Award className="w-7 h-7" />
                  <div>
                    <p className="font-black text-xs tracking-tight">Bunna Bank Live Attainment</p>
                    <p className="text-[10px] font-bold opacity-90">Fiscal Year 2025/26: {overallAttainmentPct.toFixed(1)}%</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ABOUT EPMS SECTION */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#6B3F1D] font-bold text-xs uppercase tracking-widest">About EPMS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] mt-2">
              Transforming Human Capital Across Bunna Bank S.C.
            </h2>
            <p className="text-[#666666] text-sm mt-3 leading-relaxed">
              EPMS bridges everyday branch operations with executive strategic goals. By digitizing deposit tracking, FCY inflow, and digital banking activations, Bunna Bank empowers every employee to excel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5] hover:border-[#6B3F1D] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#6B3F1D]/10 text-[#6B3F1D] flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-[#6B3F1D]" />
              </div>
              <h3 className="font-bold text-lg text-[#222222] mb-2">Real-Time Performance Tracking</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Employees record financial metrics and digital banking activations daily, feeding live dashboards for managers and district directors.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5] hover:border-[#6B3F1D] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#6B3F1D]/10 text-[#6B3F1D] flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#6B3F1D]" />
              </div>
              <h3 className="font-bold text-lg text-[#222222] mb-2">AI-Powered Performance Insights</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Gemini LLM assistant provides personalized target gap analysis, manager comment drafting, and predictive trend forecasts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5] hover:border-[#6B3F1D] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#6B3F1D]/10 text-[#6B3F1D] flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-[#6B3F1D]" />
              </div>
              <h3 className="font-bold text-lg text-[#222222] mb-2">Multi-Tier Approval Governance</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Full governance cycle with draft, submission, manager approval, rejection, and correction workflows backed by audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#6B3F1D] font-bold text-xs uppercase tracking-widest">System Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#222222] mt-2">
              Designed for Enterprise Banking Excellence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Financial Mobilization", desc: "Track ETB savings deposits, Foreign Currency (FCY) remittance, and Digital Financial Services." },
              { title: "Digital Banking Activations", desc: "Monitor account openings, Bunna Mobile, Internet Banking, Merchant POS, and ATM cards." },
              { title: "District & Branch Leaderboards", desc: "Compare district rankings, top branch benchmarks, and monthly employee champions." },
              { title: "Multi-Format Exporting", desc: "Generate formatted performance reports in Excel, PDF, Word, CSV, and printable views." }
            ].map((f, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-[#E5E5E5] hover:border-[#C89A2B] transition-all shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-[#2E7D32] mb-3" />
                <h4 className="font-bold text-base text-[#222222] mb-1.5">{f.title}</h4>
                <p className="text-xs text-[#666666] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#6B3F1D] font-bold text-xs uppercase tracking-widest">Questions & Answers</span>
            <h2 className="text-3xl font-extrabold text-[#222222] mt-1">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((f, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-[#222222] flex justify-between items-center hover:bg-black/5"
                >
                  <span>{f.q}</span>
                  <ChevronRight className={`w-5 h-5 text-[#6B3F1D] transition-transform ${openFaq === idx ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-[#666666] leading-relaxed border-t border-[#E5E5E5] pt-3 bg-white">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F5F5F5]">
        <div className="max-w-4xl mx-auto bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl p-8 sm:p-12 shadow-2xl text-center text-white">
          <div className="w-12 h-12 rounded-2xl bg-[#C89A2B] text-[#6B3F1D] font-bold flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Contact Bunna Bank EPMS Desk</h2>
          <p className="text-xs text-gray-200 mt-2 max-w-xl mx-auto">
            Have questions regarding EPMS account provisioning, branch district mapping, or system capabilities? Get in touch with our team.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Your Full Name"
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-gray-300 focus:outline-none focus:border-[#C89A2B]"
            />
            <input
              type="email"
              placeholder="Your Bunna Bank Email"
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-gray-300 focus:outline-none focus:border-[#C89A2B]"
            />
          </div>
          <textarea
            rows={3}
            placeholder="How can we assist your branch or district?"
            className="w-full mt-4 max-w-xl px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-gray-300 focus:outline-none focus:border-[#C89A2B]"
          />
          <button
            onClick={() => alert("Thank you! Your inquiry has been sent to Bunna Bank EPMS Support Desk.")}
            className="mt-4 px-8 py-3 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs hover:bg-[#D8B45C] transition-all shadow-md"
          >
            Send Inquiry
          </button>
        </div>
      </section>

    </div>
  );
};
