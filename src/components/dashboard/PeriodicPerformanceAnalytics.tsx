import React, { useState } from 'react';
import {
  Calendar,
  Award,
  TrendingUp,
  Coins,
  DollarSign,
  Smartphone,
  Globe,
  QrCode,
  CreditCard,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles,
  PieChart
} from 'lucide-react';
import { DailyPerformanceReport, PerformanceTarget } from '../../types';

interface PeriodicPerformanceProps {
  reports: DailyPerformanceReport[];
  targets: PerformanceTarget[];
  employeeName?: string;
  title?: string;
}

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannually' | 'annually';

export const PeriodicPerformanceAnalytics: React.FC<PeriodicPerformanceProps> = ({
  reports,
  targets,
  employeeName,
  title = "Overall Periodic Performance Evaluation"
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('daily');

  const productsConfig = [
    { key: 'depositsETB', code: 'DEP_ETB', name: 'Deposits Mobilized', unit: 'ETB', isCurrency: true, kpiId: 'KPI-001', defaultAnnualTarget: 0, icon: Coins, textColor: 'text-amber-400', border: 'border-amber-500/30' },
    { key: 'foreignCurrencyETB', code: 'FCY_USD', name: 'Foreign Currency Inflow', unit: 'USD', isCurrency: true, kpiId: 'KPI-002', defaultAnnualTarget: 0, icon: DollarSign, textColor: 'text-emerald-400', border: 'border-emerald-500/30' },
    { key: 'digitalFinancialServicesETB', code: 'DFS_ETB', name: 'Digital Financial Services', unit: 'ETB', isCurrency: true, kpiId: 'KPI-003', defaultAnnualTarget: 0, icon: TrendingUp, textColor: 'text-blue-400', border: 'border-blue-500/30' },
    { key: 'accountOpenings', code: 'ACC_OPEN', name: 'Account Openings', unit: 'Accounts', isCurrency: false, kpiId: 'KPI-004', defaultAnnualTarget: 0, icon: UserPlus, textColor: 'text-purple-400', border: 'border-purple-500/30' },
    { key: 'mobileBankingActivations', code: 'MB_ACT', name: 'Mobile Banking Activations', unit: 'Users', isCurrency: false, kpiId: 'KPI-005', defaultAnnualTarget: 0, icon: Smartphone, textColor: 'text-indigo-400', border: 'border-indigo-500/30' },
    { key: 'internetBankingActivations', code: 'IB_ACT', name: 'Internet Banking Activations', unit: 'Users', isCurrency: false, kpiId: 'KPI-006', defaultAnnualTarget: 0, icon: Globe, textColor: 'text-cyan-400', border: 'border-cyan-500/30' },
    { key: 'merchantSolutions', code: 'MERCH_SOL', name: 'Merchant Solutions & QR', unit: 'Merchants', isCurrency: false, kpiId: 'KPI-007', defaultAnnualTarget: 0, icon: QrCode, textColor: 'text-orange-400', border: 'border-orange-500/30' },
    { key: 'atmCardActivations', code: 'ATM_CARD', name: 'ATM Card Activations', unit: 'Cards', isCurrency: false, kpiId: 'KPI-008', defaultAnnualTarget: 0, icon: CreditCard, textColor: 'text-teal-400', border: 'border-teal-500/30' }
  ];

  // Helper for Period Multiplier & Days
  const getPeriodMultiplier = (p: PeriodType) => {
    switch (p) {
      case 'daily': return 1 / 300;
      case 'weekly': return 1 / 52;
      case 'monthly': return 1 / 12;
      case 'quarterly': return 1 / 4;
      case 'semiannually': return 1 / 2;
      case 'annually': return 1;
    }
  };

  const getPeriodDays = (p: PeriodType) => {
    switch (p) {
      case 'daily': return 1;
      case 'weekly': return 7;
      case 'monthly': return 30;
      case 'quarterly': return 90;
      case 'semiannually': return 180;
      case 'annually': return 365;
    }
  };

  // Filter reports by employee if specified
  const filteredReportsByEmp = employeeName 
    ? reports.filter(r => (r.employeeName || '').toLowerCase() === employeeName.toLowerCase())
    : reports;

  // Filter reports by selected date period
  let periodReports: DailyPerformanceReport[] = [];
  let activeDayLabel = '';

  if (selectedPeriod === 'daily') {
    const validReports = filteredReportsByEmp.filter(r => r.reportDate);
    if (validReports.length > 0) {
      const sorted = [...validReports].sort((a, b) => {
        const dA = a.reportDate || '';
        const dB = b.reportDate || '';
        return dB.localeCompare(dA);
      });
      const latestDate = sorted[0].reportDate;
      periodReports = filteredReportsByEmp.filter(r => r.reportDate === latestDate);
      activeDayLabel = latestDate;
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      periodReports = [];
      activeDayLabel = todayStr;
    }
  } else {
    const periodDays = getPeriodDays(selectedPeriod);
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    periodReports = filteredReportsByEmp.filter(r => {
      if (!r.reportDate) return true;
      const reportDateObj = new Date(r.reportDate);
      return isNaN(reportDateObj.getTime()) || reportDateObj >= cutoffDate;
    });
    activeDayLabel = `Last ${periodDays} Days`;
  }

  const multiplier = getPeriodMultiplier(selectedPeriod);

  // Calculate Product Specific Evaluation
  const productEvaluations = productsConfig.map(prod => {
    const achieved = periodReports.reduce((sum, r) => {
      let val = Number((r as any)[prod.key]) || 0;
      if (!val) {
        if (prod.key === 'atmCardActivations') val = Number(r.atmCardsIssued || 0);
        else if (prod.key === 'merchantSolutions') val = Number(r.merchantSolutionsActivations || 0);
      }
      return sum + val;
    }, 0);
    
    const targetObj = targets.find(t => t.kpiId === prod.kpiId || (t.kpiName && prod.name && t.kpiName.toLowerCase().includes(prod.name.toLowerCase())));
    const annualTarget = targetObj ? targetObj.targetValue : prod.defaultAnnualTarget;
    
    // Adjusted Target for selected period
    const exactTarget = annualTarget * multiplier;
    const periodTarget = exactTarget > 0 && exactTarget < 1 
      ? Number(exactTarget.toFixed(2)) 
      : Math.round(exactTarget);

    // Percentage calculation strictly based on Target vs. Achievement (UNCAPPED!)
    const rawPercentage = exactTarget > 0 ? (achieved / exactTarget) * 100 : 0;
    const scoreOutOf100 = rawPercentage;

    // Variance with sign rule:
    // If achieved > periodTarget -> '+'
    // If achieved < periodTarget -> '-'
    // If equal -> '0'
    const diff = achieved - periodTarget;
    let signSymbol = '';
    if (diff > 0) signSymbol = '+';
    else if (diff < 0) signSymbol = '-';

    const absDiff = Math.abs(diff);

    return {
      ...prod,
      achieved,
      periodTarget,
      exactTarget,
      rawPercentage: Number(rawPercentage.toFixed(1)),
      scoreOutOf100: Number(scoreOutOf100.toFixed(1)),
      diff,
      signSymbol,
      absDiff
    };
  });

  // Calculate Overall Composite Performance Score (uncapped average of percentages!)
  const overallCompositeScore = Math.round(
    productEvaluations.reduce((sum, p) => sum + p.scoreOutOf100, 0) / productsConfig.length
  );

  const getGradeBadge = (score: number) => {
    if (score >= 95) {
      return { grade: 'A+', label: 'Outstanding (95%+)', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
    } else if (score >= 85) {
      return { grade: 'A', label: 'Excellent (85-94%)', color: 'bg-green-500/20 text-green-400 border-green-500/40' };
    } else if (score >= 75) {
      return { grade: 'B', label: 'Good (75-84%)', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
    } else if (score >= 60) {
      return { grade: 'C', label: 'Satisfactory (60-74%)', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
    }
    return { grade: 'D', label: 'Needs Support (<60%)', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' };
  };

  const badgeInfo = getGradeBadge(overallCompositeScore);

  const formatValue = (val: number, isCurrency: boolean, key?: string) => {
    if (isCurrency) {
      if (key === 'foreignCurrencyETB') {
        if (val >= 1_000_000) return `USD ${(val / 1_000_000).toFixed(2)}M`;
        if (val >= 1_000) return `USD ${(val / 1_000).toFixed(1)}k`;
        return `USD ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      if (val >= 1_000_000) return `ETB ${(val / 1_000_000).toFixed(2)}M`;
      if (val >= 1_000) return `ETB ${(val / 1_000).toFixed(1)}k`;
      return `ETB ${val.toLocaleString()}`;
    }
    return val.toLocaleString();
  };

  return (
    <div className="p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-2xl text-white space-y-6">
      
      {/* Header & Period Selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-[#C89A2B] text-[#6B3F1D] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {selectedPeriod === 'daily' ? 'Daily' : selectedPeriod === 'semiannually' ? 'Semi-Annual' : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Performance
            </span>
            <span className="text-xs text-gray-300 font-medium">Auto-Evaluated EPMS Engine</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-[#C89A2B]" />
            Overall {selectedPeriod === 'daily' ? 'Daily' : selectedPeriod === 'semiannually' ? 'Semi-Annual' : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Performance Evaluation
          </h3>
          <p className="text-xs text-gray-300 mt-0.5">
            Individual product achievements averaged across all 8 core products for the selected timeframe.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex flex-wrap items-center bg-[#6B3F1D] p-1.5 rounded-2xl border border-[#C89A2B]/30 text-xs font-bold gap-1 sm:gap-0">
          <button
            onClick={() => setSelectedPeriod('daily')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              selectedPeriod === 'daily' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md scale-105' : 'text-gray-300 hover:text-white'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setSelectedPeriod('weekly')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              selectedPeriod === 'weekly' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md scale-105' : 'text-gray-300 hover:text-white'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setSelectedPeriod('monthly')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              selectedPeriod === 'monthly' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md scale-105' : 'text-gray-300 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPeriod('quarterly')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              selectedPeriod === 'quarterly' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md scale-105' : 'text-gray-300 hover:text-white'
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => setSelectedPeriod('semiannually')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              selectedPeriod === 'semiannually' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md scale-105' : 'text-gray-300 hover:text-white'
            }`}
          >
            Semi-Annually
          </button>
          <button
            onClick={() => setSelectedPeriod('annually')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              selectedPeriod === 'annually' ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md scale-105' : 'text-gray-300 hover:text-white'
            }`}
          >
            Annually
          </button>
        </div>
      </div>

      {/* Main Scorecard Gauge & Overview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Overall Score Gauge Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#6B3F1D] to-[#362011] border border-[#C89A2B]/40 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#C89A2B]/10 blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
          
          <p className="text-xs uppercase font-bold text-gray-300 mb-2 tracking-wider">
            {selectedPeriod === 'semiannually' ? 'SEMI-ANNUAL' : selectedPeriod.toUpperCase()} COMPOSITE PERFORMANCE
          </p>
          
          {/* Circular Score Visual */}
          <div className="relative my-2 w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#C89A2B] transition-all duration-1000 ease-out"
                strokeDasharray={`${Math.min(100, overallCompositeScore)}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-[#C89A2B] tracking-tight">
                {overallCompositeScore}%
              </span>
              <span className="text-[10px] font-bold text-gray-300">Performance</span>
            </div>
          </div>

          <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${badgeInfo.color}`}>
            Grade {badgeInfo.grade}: {badgeInfo.label}
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Timeframe Period</p>
            <p className="text-base font-extrabold text-[#C89A2B] capitalize mt-1">
              {selectedPeriod === 'semiannually' ? 'Semi-Annually' : selectedPeriod}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Window: {activeDayLabel}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Reports Count</p>
            <p className="text-base font-extrabold text-emerald-400 mt-1">{periodReports.length} Reports</p>
            <p className="text-[10px] text-gray-400 mt-1">Submitted in timeframe</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Products Analyzed</p>
            <p className="text-base font-extrabold text-cyan-400 mt-1">8 Core Products</p>
            <p className="text-[10px] text-gray-400 mt-1">Weighted equally 12.5% each</p>
          </div>

          <div className="col-span-2 sm:col-span-3 p-4 rounded-2xl bg-[#6B3F1D]/60 border border-[#C89A2B]/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-[#C89A2B]" />
              <div>
                <p className="text-xs font-bold text-white">EPMS Performance Formula</p>
                <p className="text-[11px] text-gray-300">
                  Overall Score = Sum of 8 product scores uncapped ÷ 8 products.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product-by-Product Scorecard Grid */}
      <div>
        <h4 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#C89A2B]" />
          Product-by-Product Evaluation for {selectedPeriod === 'semiannually' ? 'SEMI-ANNUAL' : selectedPeriod.toUpperCase()} Period
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {productEvaluations.map(prod => {
            const Icon = prod.icon;
            const isExceeded = prod.diff > 0;
            const isEqual = prod.diff === 0;

            return (
              <div
                key={prod.key}
                className={`p-4 rounded-2xl bg-[#6B3F1D]/80 border ${prod.border} shadow-lg hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(200,154,43,0.18)] transition-all duration-300 transform-gpu relative group overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl bg-white/5 ${prod.textColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-[#C89A2B]/20 text-[#C89A2B] border border-[#C89A2B]/40 text-xs font-black">
                    {prod.scoreOutOf100}%
                  </div>
                </div>

                <h5 className="text-xs font-bold text-white group-hover:text-[#C89A2B] transition-colors line-clamp-1">{prod.name}</h5>
                <p className="text-[10px] text-gray-400">{prod.unit}</p>

                {/* Score & Variance */}
                <div className="mt-3 space-y-1 text-xs border-t border-white/10 pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Achieved:</span>
                    <span className={`font-bold ${prod.textColor}`}>
                      {formatValue(prod.achieved, prod.isCurrency, prod.key)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">{selectedPeriod === 'semiannually' ? 'Semi-Annual' : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Target:</span>
                    <span className="font-semibold text-gray-200">
                      {formatValue(prod.periodTarget, prod.isCurrency, prod.key)}
                    </span>
                  </div>

                  {/* Remaining / Variance with + / - Sign shaded green / red */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Variance:</span>
                    <span className={`font-black text-xs px-2 py-0.5 rounded-md border ${
                      isExceeded 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                        : isEqual 
                        ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' 
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    }`}>
                      {isEqual ? '0' : `${prod.signSymbol}${formatValue(prod.absDiff, prod.isCurrency, prod.key)}`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded-full bg-black/40 border border-white/10">
                    <div
                      style={{ width: `${Math.min(100, prod.scoreOutOf100)}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-700 ${
                        prod.scoreOutOf100 >= 100 ? 'bg-emerald-500' : prod.scoreOutOf100 >= 75 ? 'bg-[#C89A2B]' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
