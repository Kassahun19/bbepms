import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Smartphone,
  Save,
  Send,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  CreditCard,
  Building2,
  Flame,
  ChevronRight,
  Info,
  Plus,
  Minus
} from 'lucide-react';
import { User, BankHoliday, DailyPerformanceReport, getUserFullName, Language } from '../../types';
import { api } from '../../services/api';
import { translations } from '../../i18n/translations';

interface SubmitReportSectionProps {
  user: User;
  reports?: DailyPerformanceReport[];
  holidays?: BankHoliday[];
  onRefreshData?: () => void;
  language?: Language;
  className?: string;
  isInsideModal?: boolean;
}

export const SubmitReportSection: React.FC<SubmitReportSectionProps> = ({
  user,
  reports = [],
  holidays = [],
  onRefreshData,
  language = 'en',
  className = '',
  isInsideModal = false
}) => {
  const t = translations[language] || translations['en'];

  // Form State
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerOnboarding, setCustomerOnboarding] = useState<number | ''>(0);
  const [mobileBanking, setMobileBanking] = useState<number | ''>(0);
  const [internetBanking, setInternetBanking] = useState<number | ''>(0);
  const [atmDebitCards, setAtmDebitCards] = useState<number | ''>(0);
  const [merchantSolutions, setMerchantSolutions] = useState<number | ''>(0);

  const [depositsETB, setDepositsETB] = useState<number | ''>('');
  const [foreignCurrencyETB, setForeignCurrencyETB] = useState<number | ''>('');
  const [digitalFinancialServicesETB, setDigitalFinancialServicesETB] = useState<number | ''>('');

  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if date is Sunday
  const isSundayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getDay() === 0;
  };

  // Check if date is Bank Holiday
  const getHolidayMatch = (dateStr: string) => {
    return holidays.find(h => h.date === dateStr);
  };

  const isSunday = isSundayDate(reportDate);
  const matchedHoliday = getHolidayMatch(reportDate);
  const isBlockedDate = isSunday || !!matchedHoliday;

  // Check if report already exists for selected date
  const existingReport = reports.find(r => 
    (r.reportDate === reportDate || r.report_date === reportDate) && 
    (r.employeeId === user.id || r.employee_id === user.id || (user.userId && r.employeeUserId === user.userId))
  );

  // Day of week
  const dayOfWeekName = new Date(reportDate).toLocaleDateString('en-US', { weekday: 'long' });

  // Persuasive Live Calculations
  const totalValMobilized = Number(depositsETB || 0) + Number(foreignCurrencyETB || 0) + Number(digitalFinancialServicesETB || 0);
  const totalKpiCount = Number(customerOnboarding || 0) + Number(mobileBanking || 0) + Number(internetBanking || 0) + Number(atmDebitCards || 0) + Number(merchantSolutions || 0);
  const dailyTargetKpi = 10;
  const liveProgressPct = Math.min(Math.round(((totalKpiCount + (totalValMobilized > 0 ? 5 : 0)) / dailyTargetKpi) * 100), 100);

  const handleSubmitReport = async (isDraft: boolean) => {
    if (isBlockedDate) {
      setFormMsg({
        type: 'error',
        text: isSunday
          ? (language === 'am' ? 'በእሁድ ቀናት ሪፖርት ማስገባት አይቻልም።' : 'Daily performance submission is disallowed on Sundays.')
          : (language === 'am' ? `በ ${matchedHoliday?.name} የባንክ በዓል ሪፖርት ማስገባት አይቻልም።` : `Daily performance submission is disallowed on ${matchedHoliday?.name}.`)
      });
      return;
    }

    if (
      Number(customerOnboarding || 0) < 0 ||
      Number(mobileBanking || 0) < 0 ||
      Number(internetBanking || 0) < 0 ||
      Number(atmDebitCards || 0) < 0 ||
      Number(merchantSolutions || 0) < 0 ||
      Number(depositsETB || 0) < 0
    ) {
      setFormMsg({
        type: 'error',
        text: 'KPI metrics must be non-negative numeric numbers (0 or greater).'
      });
      return;
    }

    setSubmitting(true);
    setFormMsg(null);

    try {
      await api.submitKpiReport({
        id: existingReport ? existingReport.id : undefined,
        employeeId: user.id,
        employee_id: user.id,
        employeeName: getUserFullName(user),
        employee_name: getUserFullName(user),
        employeeUserId: user.userId || '4994',
        branchId: user.branchId || 'BR-360',
        branch_id: user.branchId || 'BR-360',
        branchName: user.branchName || 'Hamusit Branch (SOL 360)',
        solId: '360',
        sol_id: '360',
        reportDate,
        report_date: reportDate,
        dayOfWeek: dayOfWeekName,
        day_of_week: dayOfWeekName,
        customerOnboarding: Number(customerOnboarding || 0),
        customer_onboarding: Number(customerOnboarding || 0),
        accountOpenings: Number(customerOnboarding || 0),
        mobileBanking: Number(mobileBanking || 0),
        mobile_banking: Number(mobileBanking || 0),
        mobileBankingActivations: Number(mobileBanking || 0),
        internetBanking: Number(internetBanking || 0),
        internet_banking: Number(internetBanking || 0),
        internetBankingActivations: Number(internetBanking || 0),
        atmDebitCards: Number(atmDebitCards || 0),
        atm_debit_cards: Number(atmDebitCards || 0),
        atmCardsIssued: Number(atmDebitCards || 0),
        atmCardActivations: Number(atmDebitCards || 0),
        merchantSolutions: Number(merchantSolutions || 0),
        merchant_solutions: Number(merchantSolutions || 0),
        merchantSolutionsActivations: Number(merchantSolutions || 0),
        depositsETB: Number(depositsETB || 0),
        deposits_etb: Number(depositsETB || 0),
        foreignCurrencyETB: Number(foreignCurrencyETB || 0),
        digitalFinancialServicesETB: Number(digitalFinancialServicesETB || 0),
        status: isDraft ? 'Draft' : 'Pending'
      });

      setFormMsg({
        type: 'success',
        text: isDraft
          ? (language === 'am' ? 'የዕለቱ ሪፖርት ረቂቅ በስኬት ተቀምጧል።' : 'Daily performance report draft saved permanently.')
          : (language === 'am' ? 'የዕለቱ ሪፖርት ለማጽደቅ በስኬት ተልኳል!' : `Daily KPI report for ${reportDate} submitted for approval!`)
      });

      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err.message || 'Failed to submit report.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      
      {/* Outer Glowing Glow Backdrop */}
      <div className="absolute -top-4 -left-4 -right-4 -bottom-4 bg-gradient-to-r from-[#C89A2B]/20 via-amber-500/10 to-[#C89A2B]/20 rounded-[38px] blur-xl opacity-80 pointer-events-none animate-pulse" />

      {/* Main Floating Container */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#6B3F1D] via-[#4A2C17] to-[#2E1B0E] border-2 border-[#C89A2B]/60 shadow-[0_20px_50px_rgba(200,154,43,0.25)] text-white space-y-6 overflow-hidden">
        
        {/* Top Decorative Floating Banner & Badges */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#C89A2B]/30">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] text-[#6B3F1D] font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-md">
                <Sparkles className="w-3 h-3 text-[#6B3F1D] animate-spin" />
                <span>{t.dailyPerformance || 'Daily Performance Submission'}</span>
              </span>
              <span className="text-[11px] text-[#C89A2B] font-semibold bg-[#C89A2B]/10 px-2.5 py-0.5 rounded-full border border-[#C89A2B]/30">
                {t.workingDaysOnly || 'Working Days Only'}
              </span>
            </div>

            <h3 className="text-2xl font-black text-white flex items-center space-x-2 pt-1">
              <Calendar className="w-6 h-6 text-[#C89A2B]" />
              <span>{t.createReportMenu || 'Submit Daily Performance Report'}</span>
            </h3>
            <p className="text-xs text-gray-300">
              {language === 'am' 
                ? 'የዕለቱን የፋይናንስ ማሰባሰብ እና የዲጂታል ባንክ አፈፃፀም መረጃዎችን እዚህ ይመዝግቡ።' 
                : 'Log daily deposits, FCY remittances, and digital banking activations for branch manager approval.'}
            </p>
          </div>

          {/* Persuasive Live Progress Meter */}
          <div className="p-3 rounded-2xl bg-black/40 border border-[#C89A2B]/40 text-right min-w-[200px]">
            <div className="flex items-center justify-end space-x-1.5 text-xs text-[#C89A2B] font-bold">
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Today's Impact Score</span>
            </div>
            <div className="text-xl font-black text-emerald-400">
              {liveProgressPct}% Target
            </div>
            <p className="text-[10px] text-gray-400">
              ETB {totalValMobilized.toLocaleString()} Mobilized Today
            </p>
          </div>
        </div>

        {/* Persuasive Motivation Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#C89A2B]/15 via-amber-500/10 to-[#C89A2B]/10 border border-[#C89A2B]/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold flex items-center justify-center shrink-0 shadow-lg">
              🏆
            </div>
            <div>
              <p className="font-extrabold text-white text-xs">
                {liveProgressPct >= 80 ? '🌟 Outstanding Contribution!' : '🚀 Keep Pushing Excellence!'}
              </p>
              <p className="text-[11px] text-gray-300">
                {liveProgressPct >= 80 
                  ? 'Your entries place you in the Top Performance Bracket for Finfinne Branch today.'
                  : `Add your daily achievements below to climb up the Gold Mobilizer Leaderboard.`}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-1 text-[11px] font-bold text-[#C89A2B]">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>+150 XP</span>
          </div>
        </div>

        {/* Date Selector & Sunday / Bank Holiday Validation Banner */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#C89A2B] mb-1">
                {t.selectDate || 'Select Report Date'}
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-[#C89A2B]/40 text-sm text-white focus:outline-none focus:border-[#C89A2B] shadow-inner font-bold"
              />
            </div>

            <div className="flex items-center text-xs text-gray-300 pt-5">
              <p>Day of Week: <strong className="text-[#C89A2B] font-bold text-sm ml-1">{new Date(reportDate).toLocaleDateString('en-US', { weekday: 'long' })}</strong></p>
            </div>
          </div>

          {/* Validation Banner if Sunday or Bank Holiday */}
          {isBlockedDate && (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs flex items-center space-x-3 shadow-lg">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
              <div>
                <p className="font-bold">Submission Disallowed for Selected Date</p>
                <p className="text-[11px] mt-0.5">
                  {isSunday
                    ? 'Sundays are official non-working days. Daily performance entry is disabled.'
                    : `Selected date is an official Bank Holiday (${matchedHoliday?.name}). Daily performance entry is disabled.`}
                </p>
              </div>
            </div>
          )}

          {/* Warning if report already exists for selected date */}
          {existingReport && !isBlockedDate && (
            <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs flex items-center space-x-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Note: A report already exists for this date with status "{existingReport.status}". Submitting again will update the record.</span>
            </div>
          )}
        </div>

        {/* Form Messages */}
        {formMsg && (
          <div className={`p-4 rounded-xl text-xs flex items-center space-x-2.5 shadow-lg ${
            formMsg.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-200' : 'bg-rose-500/20 border border-rose-500 text-rose-200'
          }`}>
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-bold text-xs">{formMsg.text}</span>
          </div>
        )}

        {/* Section 1: Financial Mobilization Metrics (ETB) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#C89A2B] uppercase tracking-wider flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-[#C89A2B]" />
              <span>{t.financialMobilization || 'Financial Mobilization Metrics (ETB)'}</span>
            </h4>
            <span className="text-[11px] text-emerald-400 font-semibold">
              Subtotal: ETB {totalValMobilized.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Savings Deposits */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C89A2B]/50 transition-all space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-200">
                {t.deposits || 'Savings & Term Deposits (ETB)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  disabled={isBlockedDate}
                  value={depositsETB}
                  onChange={(e) => setDepositsETB(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 150000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/20 text-xs text-white font-bold focus:outline-none focus:border-[#C89A2B]"
                />
              </div>
            </div>

            {/* Foreign Currency FCY */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C89A2B]/50 transition-all space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-200">
                {t.fcy || 'Foreign Currency / FCY Remittance (USD)'}
              </label>
              <input
                type="number"
                disabled={isBlockedDate}
                value={foreignCurrencyETB}
                onChange={(e) => setForeignCurrencyETB(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 5000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/20 text-xs text-white font-bold focus:outline-none focus:border-[#C89A2B]"
              />
            </div>

            {/* Digital Financial Services */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C89A2B]/50 transition-all space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-200">
                {t.dfs || 'Digital Financial Services Vol (ETB)'}
              </label>
              <input
                type="number"
                disabled={isBlockedDate}
                value={digitalFinancialServicesETB}
                onChange={(e) => setDigitalFinancialServicesETB(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 25000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/20 text-xs text-white font-bold focus:outline-none focus:border-[#C89A2B]"
              />
            </div>

          </div>
        </div>

        {/* Section 2: Core 5 Daily KPI Metrics */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#C89A2B] uppercase tracking-wider flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-[#C89A2B]" />
              <span>Core Daily KPI Performance Metrics (Units)</span>
            </h4>
            <span className="text-[11px] text-cyan-400 font-semibold">
              Total Today: {totalKpiCount} Units
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* 1. Customer Onboarding */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/50 transition-all space-y-1.5 text-center">
              <label className="block text-[11px] font-bold text-gray-200 truncate">Customer Onboarding</label>
              <div className="flex items-center justify-between space-x-1">
                <button
                  type="button"
                  disabled={isBlockedDate || Number(customerOnboarding) <= 0}
                  onClick={() => setCustomerOnboarding(Math.max(0, Number(customerOnboarding || 0) - 1))}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min="0"
                  disabled={isBlockedDate}
                  value={customerOnboarding}
                  onChange={(e) => setCustomerOnboarding(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="w-14 text-center py-1 rounded-lg bg-black/40 border border-white/20 text-xs text-white font-black focus:outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  disabled={isBlockedDate}
                  onClick={() => setCustomerOnboarding(Number(customerOnboarding || 0) + 1)}
                  className="w-7 h-7 rounded-lg bg-[#C89A2B] hover:bg-[#D8B45C] flex items-center justify-center text-[#6B3F1D] font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 2. Mobile Banking */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/50 transition-all space-y-1.5 text-center">
              <label className="block text-[11px] font-bold text-gray-200 truncate">Mobile Banking</label>
              <div className="flex items-center justify-between space-x-1">
                <button
                  type="button"
                  disabled={isBlockedDate || Number(mobileBanking) <= 0}
                  onClick={() => setMobileBanking(Math.max(0, Number(mobileBanking || 0) - 1))}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min="0"
                  disabled={isBlockedDate}
                  value={mobileBanking}
                  onChange={(e) => setMobileBanking(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="w-14 text-center py-1 rounded-lg bg-black/40 border border-white/20 text-xs text-white font-black focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  disabled={isBlockedDate}
                  onClick={() => setMobileBanking(Number(mobileBanking || 0) + 1)}
                  className="w-7 h-7 rounded-lg bg-[#C89A2B] hover:bg-[#D8B45C] flex items-center justify-center text-[#6B3F1D] font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 3. Internet Banking */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all space-y-1.5 text-center">
              <label className="block text-[11px] font-bold text-gray-200 truncate">Internet Banking</label>
              <div className="flex items-center justify-between space-x-1">
                <button
                  type="button"
                  disabled={isBlockedDate || Number(internetBanking) <= 0}
                  onClick={() => setInternetBanking(Math.max(0, Number(internetBanking || 0) - 1))}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min="0"
                  disabled={isBlockedDate}
                  value={internetBanking}
                  onChange={(e) => setInternetBanking(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="w-14 text-center py-1 rounded-lg bg-black/40 border border-white/20 text-xs text-white font-black focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  disabled={isBlockedDate}
                  onClick={() => setInternetBanking(Number(internetBanking || 0) + 1)}
                  className="w-7 h-7 rounded-lg bg-[#C89A2B] hover:bg-[#D8B45C] flex items-center justify-center text-[#6B3F1D] font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 4. ATM Debit Cards */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-400/50 transition-all space-y-1.5 text-center">
              <label className="block text-[11px] font-bold text-gray-200 truncate">ATM Debit Cards</label>
              <div className="flex items-center justify-between space-x-1">
                <button
                  type="button"
                  disabled={isBlockedDate || Number(atmDebitCards) <= 0}
                  onClick={() => setAtmDebitCards(Math.max(0, Number(atmDebitCards || 0) - 1))}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min="0"
                  disabled={isBlockedDate}
                  value={atmDebitCards}
                  onChange={(e) => setAtmDebitCards(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="w-14 text-center py-1 rounded-lg bg-black/40 border border-white/20 text-xs text-white font-black focus:outline-none focus:border-violet-400"
                />
                <button
                  type="button"
                  disabled={isBlockedDate}
                  onClick={() => setAtmDebitCards(Number(atmDebitCards || 0) + 1)}
                  className="w-7 h-7 rounded-lg bg-[#C89A2B] hover:bg-[#D8B45C] flex items-center justify-center text-[#6B3F1D] font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 5. Merchant Solutions */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition-all space-y-1.5 text-center">
              <label className="block text-[11px] font-bold text-gray-200 truncate">Merchant Solutions</label>
              <div className="flex items-center justify-between space-x-1">
                <button
                  type="button"
                  disabled={isBlockedDate || Number(merchantSolutions) <= 0}
                  onClick={() => setMerchantSolutions(Math.max(0, Number(merchantSolutions || 0) - 1))}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min="0"
                  disabled={isBlockedDate}
                  value={merchantSolutions}
                  onChange={(e) => setMerchantSolutions(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                  className="w-14 text-center py-1 rounded-lg bg-black/40 border border-white/20 text-xs text-white font-black focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  disabled={isBlockedDate}
                  onClick={() => setMerchantSolutions(Number(merchantSolutions || 0) + 1)}
                  className="w-7 h-7 rounded-lg bg-[#C89A2B] hover:bg-[#D8B45C] flex items-center justify-center text-[#6B3F1D] font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#C89A2B]/30">
          <button
            type="button"
            disabled={isBlockedDate || submitting}
            onClick={() => handleSubmitReport(true)}
            className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs flex items-center space-x-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{t.saveDraft || 'Save Draft'}</span>
          </button>

          <button
            type="button"
            disabled={isBlockedDate || submitting}
            onClick={() => handleSubmitReport(false)}
            className="px-9 py-3 rounded-2xl bg-gradient-to-r from-[#C89A2B] via-[#D8B45C] to-[#A37B1E] text-[#6B3F1D] font-black text-xs shadow-[0_10px_30px_rgba(200,154,43,0.4)] hover:brightness-110 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <Send className="w-4 h-4 text-[#6B3F1D]" />
            <span>{submitting ? 'Submitting Report...' : (t.submitForApproval || 'Submit for Approval')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
