import React, { useState, useEffect } from 'react';
import {
  Calendar,
  TrendingUp,
  Target,
  Award,
  Coins,
  DollarSign,
  Smartphone,
  Globe,
  QrCode,
  CreditCard,
  UserPlus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

interface PeriodPerformanceDashboardProps {
  employeeId: string;
}

export const PeriodPerformanceDashboard: React.FC<PeriodPerformanceDashboardProps> = ({ employeeId }) => {
  const [activePeriod, setActivePeriod] = useState<'today' | 'thisWeek' | 'thisMonth' | 'thisQuarter' | 'thisSemiAnnual' | 'thisYear'>('thisMonth');
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getEmployeeKpiSummary(employeeId);
        if (active) {
          if (data) {
            setSummaryData(data);
          } else {
            setError("Failed to load period-based target performance.");
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to retrieve employee performance statistics.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchSummary();
    return () => {
      active = false;
    };
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-white bg-[#4A2C17]/40 border border-[#C89A2B]/20 rounded-3xl space-y-3">
        <Loader2 className="w-8 h-8 text-[#C89A2B] animate-spin" />
        <p className="text-xs text-gray-300 font-bold">Calculating calendar-based targets and performance...</p>
      </div>
    );
  }

  if (error || !summaryData) {
    return (
      <div className="p-8 text-center text-rose-300 bg-rose-950/20 border border-rose-500/30 rounded-3xl space-y-2">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="font-bold text-sm">Target Calculation Error</p>
        <p className="text-xs text-rose-200/80 max-w-md mx-auto">{error || "Ensure the backend is online and the employee has an active plan."}</p>
      </div>
    );
  }

  const activeMetrics = summaryData[activePeriod];
  if (!activeMetrics) {
    return (
      <div className="p-8 text-center text-amber-300 bg-amber-950/20 border border-amber-500/30 rounded-3xl">
        <p className="text-xs font-bold">No metrics found for the selected {activePeriod} range.</p>
      </div>
    );
  }

  const { actuals, targets, achievements, weightedScores, overallPerformance, periodInfo } = activeMetrics;

  // Render performance rating
  let ratingLabel = 'On Track';
  let ratingColor = 'text-blue-400';
  let ratingBg = 'bg-blue-500/10 border border-blue-500/30';
  if (overallPerformance >= 100) {
    ratingLabel = 'Exceeds Target (Excellent)';
    ratingColor = 'text-emerald-400';
    ratingBg = 'bg-emerald-500/10 border border-emerald-500/30';
  } else if (overallPerformance >= 75) {
    ratingLabel = 'On Track (Good)';
    ratingColor = 'text-teal-400';
    ratingBg = 'bg-teal-500/10 border border-teal-500/30';
  } else if (overallPerformance >= 50) {
    ratingLabel = 'Moderate Progress';
    ratingColor = 'text-amber-400';
    ratingBg = 'bg-amber-500/10 border border-amber-500/30';
  } else {
    ratingLabel = 'Needs Immediate Attention';
    ratingColor = 'text-rose-400';
    ratingBg = 'bg-rose-500/10 border border-rose-500/30';
  }

  const PERIODS: { key: typeof activePeriod; label: string }[] = [
    { key: 'today', label: 'Daily' },
    { key: 'thisWeek', label: 'Weekly' },
    { key: 'thisMonth', label: 'Monthly' },
    { key: 'thisQuarter', label: 'Quarterly' },
    { key: 'thisSemiAnnual', label: 'Semi-Annual' },
    { key: 'thisYear', label: 'Annual' }
  ];

  return (
    <div className="bg-[#4A2C17] border border-[#C89A2B]/40 rounded-3xl p-6 shadow-xl w-full text-white space-y-6">
      
      {/* Header and Period Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="bg-[#C89A2B]/20 text-[#C89A2B] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#C89A2B]/30">
            Calendar-Aware Performance System
          </span>
          <h3 className="text-lg font-black text-white mt-1">
            Dynamic Period Targets & Weighted Scoring
          </h3>
          <p className="text-xs text-gray-300">
            Target breakdown based on the actual 2026 calendar (excluding Sundays and banking holidays).
          </p>
        </div>

        {/* Period Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/30 p-1.5 rounded-2xl border border-white/10">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setActivePeriod(p.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePeriod === p.key
                  ? 'bg-[#C89A2B] text-[#4A2C17] shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Period Metadata banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-black/20 p-4 rounded-2xl border border-white/5 text-xs">
        <div className="md:col-span-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-1.5 text-gray-300">
            <Calendar className="w-4 h-4 text-[#C89A2B]" />
            <span>Active Range:</span>
            <strong className="text-white">{periodInfo?.startDate} to {periodInfo?.endDate}</strong>
          </div>
          <div className="flex items-center gap-1.5 text-gray-300">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Valid Reporting Days:</span>
            <strong className="text-emerald-400">{periodInfo?.validDays} days</strong>
          </div>
          <div className="text-gray-400 text-[11px]">
            (Scaled by factor of {Number(periodInfo?.scaleFactor).toFixed(4)} of {periodInfo?.totalYearDays} annual reporting days)
          </div>
        </div>

        {/* Overall Weighted Score */}
        <div className="md:col-span-4 flex items-center justify-end gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 pl-0 md:pl-4">
          <div className="text-right">
            <span className="text-[10px] uppercase text-gray-400 block font-semibold">Overall Score</span>
            <span className={`text-sm font-bold ${ratingColor}`}>{ratingLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 px-3.5 py-2 rounded-xl border border-white/10">
            <Award className="w-5 h-5 text-[#C89A2B]" />
            <span className="text-xl font-black text-[#C89A2B]">{overallPerformance}%</span>
          </div>
        </div>
      </div>

      {/* KPI Categories (Weights Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        
        {/* DEPOSIT CARD (20%) */}
        <div className="bg-[#6B3F1D]/40 border border-white/10 hover:border-[#C89A2B]/40 transition-all rounded-2xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-500/10 text-emerald-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20">
                Weight: 20%
              </span>
              <Coins className="w-4 h-4 text-[#C89A2B]" />
            </div>
            <div>
              <h4 className="text-xs uppercase text-gray-300 font-bold">1. Deposits Mobilized</h4>
              <p className="text-lg font-black text-white mt-1">ETB {Number(actuals?.deposits).toLocaleString()}</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs text-gray-300">
            <div className="flex justify-between">
              <span>Expected Target:</span>
              <span className="font-bold text-white">ETB {Number(targets?.deposit).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Achievement:</span>
              <span className="font-bold text-emerald-400">{achievements?.deposit}%</span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 pt-1 border-t border-white/5">
              <span>Weighted Contribution:</span>
              <span className="font-bold text-[#C89A2B]">{weightedScores?.deposit}%</span>
            </div>
          </div>
        </div>

        {/* FCY CARD (15%) */}
        <div className="bg-[#6B3F1D]/40 border border-white/10 hover:border-[#C89A2B]/40 transition-all rounded-2xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-teal-500/10 text-teal-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-teal-500/20">
                Weight: 15%
              </span>
              <DollarSign className="w-4 h-4 text-[#C89A2B]" />
            </div>
            <div>
              <h4 className="text-xs uppercase text-gray-300 font-bold">2. Foreign Currency (FCY)</h4>
              <p className="text-lg font-black text-white mt-1">USD {Number(actuals?.fcy).toLocaleString()}</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs text-gray-300">
            <div className="flex justify-between">
              <span>Expected Target:</span>
              <span className="font-bold text-white">USD {Number(targets?.fcy).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Achievement:</span>
              <span className="font-bold text-emerald-400">{achievements?.fcy}%</span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 pt-1 border-t border-white/5">
              <span>Weighted Contribution:</span>
              <span className="font-bold text-[#C89A2B]">{weightedScores?.fcy}%</span>
            </div>
          </div>
        </div>

        {/* DFS CARD (20%) */}
        <div className="bg-[#6B3F1D]/40 border border-white/10 hover:border-[#C89A2B]/40 transition-all rounded-2xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-blue-500/10 text-blue-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20">
                Weight: 20%
              </span>
              <TrendingUp className="w-4 h-4 text-[#C89A2B]" />
            </div>
            <div>
              <h4 className="text-xs uppercase text-gray-300 font-bold">3. DFS Vol</h4>
              <p className="text-lg font-black text-white mt-1">ETB {Number(actuals?.dfs).toLocaleString()}</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs text-gray-300">
            <div className="flex justify-between">
              <span>Expected Target:</span>
              <span className="font-bold text-white">ETB {Number(targets?.dfs).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Achievement:</span>
              <span className="font-bold text-emerald-400">{achievements?.dfs}%</span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 pt-1 border-t border-white/5">
              <span>Weighted Contribution:</span>
              <span className="font-bold text-[#C89A2B]">{weightedScores?.dfs}%</span>
            </div>
          </div>
        </div>

        {/* CUSTOMER BASE CARD (20%) */}
        <div className="bg-[#6B3F1D]/40 border border-white/10 hover:border-[#C89A2B]/40 transition-all rounded-2xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-purple-500/10 text-purple-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-purple-500/20">
                Weight: 20%
              </span>
              <UserPlus className="w-4 h-4 text-[#C89A2B]" />
            </div>
            <div>
              <h4 className="text-xs uppercase text-gray-300 font-bold">4. Customer Base</h4>
              <p className="text-lg font-black text-white mt-1">{Number(actuals?.customerBase).toLocaleString()} users</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs text-gray-300">
            <div className="flex justify-between">
              <span>Expected Target:</span>
              <span className="font-bold text-white">{Number(targets?.customerBase).toLocaleString()} users</span>
            </div>
            <div className="flex justify-between">
              <span>Achievement:</span>
              <span className="font-bold text-emerald-400">{achievements?.customerBase}%</span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 pt-1 border-t border-white/5">
              <span>Weighted Contribution:</span>
              <span className="font-bold text-[#C89A2B]">{weightedScores?.customerBase}%</span>
            </div>
          </div>
        </div>

        {/* DIGITALS CATEGORY CARD (25%) */}
        <div className="bg-[#6B3F1D]/40 border border-white/10 hover:border-[#C89A2B]/40 transition-all rounded-2xl p-4 flex flex-col justify-between space-y-4 lg:col-span-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="bg-amber-500/10 text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-500/20">
                Weight: 25%
              </span>
              <Smartphone className="w-4 h-4 text-[#C89A2B]" />
            </div>
            <div>
              <h4 className="text-xs uppercase text-gray-300 font-bold">5. Digitals (Grouped)</h4>
              <p className="text-lg font-black text-white mt-1">{achievements?.digitals}% average</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs text-gray-300">
            <div className="flex justify-between">
              <span>Active Sub-KPIs:</span>
              <span className="font-bold text-white">4 Products</span>
            </div>
            <div className="flex justify-between">
              <span>Group Score:</span>
              <span className="font-bold text-emerald-400">{achievements?.digitals}%</span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 pt-1 border-t border-white/5">
              <span>Weighted Contribution:</span>
              <span className="font-bold text-[#C89A2B]">{weightedScores?.digitals}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Sub-KPIs Breakdown section within the Digitals category */}
      <div className="p-5 rounded-2xl bg-black/25 border border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h4 className="text-xs uppercase font-extrabold text-[#C89A2B] flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-[#C89A2B]" />
            Digitals Category Sub-KPIs Performance Breakdown (Equal Weight Contribution to 25% Category)
          </h4>
          <span className="text-[10px] text-gray-400">Values scaled using active period reporting days</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Mobile Activations */}
          <div className="p-4 rounded-xl bg-[#6B3F1D]/25 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                Mobile Banking
              </span>
              <span className="text-[10px] text-gray-400">Contribution: 25%</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Expected Target:</span>
                <strong className="text-white">{Number(targets?.mobileBanking).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Actual Achievement:</span>
                <strong className="text-white">{Number(actuals?.mobileBanking).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10 text-[#C89A2B] font-bold">
                <span>Performance:</span>
                <span>{achievements?.mobileBanking}%</span>
              </div>
            </div>
          </div>

          {/* ATM */}
          <div className="p-4 rounded-xl bg-[#6B3F1D]/25 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                ATM Debit Cards
              </span>
              <span className="text-[10px] text-gray-400">Contribution: 25%</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Expected Target:</span>
                <strong className="text-white">{Number(targets?.atm).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Actual Achievement:</span>
                <strong className="text-white">{Number(actuals?.atm).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10 text-[#C89A2B] font-bold">
                <span>Performance:</span>
                <span>{achievements?.atm}%</span>
              </div>
            </div>
          </div>

          {/* Merchant Activations */}
          <div className="p-4 rounded-xl bg-[#6B3F1D]/25 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                Merchant Activations
              </span>
              <span className="text-[10px] text-gray-400">Contribution: 25%</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Expected Target:</span>
                <strong className="text-white">{Number(targets?.merchant).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Actual Achievement:</span>
                <strong className="text-white">{Number(actuals?.merchant).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10 text-[#C89A2B] font-bold">
                <span>Performance:</span>
                <span>{achievements?.merchant}%</span>
              </div>
            </div>
          </div>

          {/* Internet Activations */}
          <div className="p-4 rounded-xl bg-[#6B3F1D]/25 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Internet Banking
              </span>
              <span className="text-[10px] text-gray-400">Contribution: 25%</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Expected Target:</span>
                <strong className="text-white">{Number(targets?.internetBanking).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Actual Achievement:</span>
                <strong className="text-white">{Number(actuals?.internetBanking).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10 text-[#C89A2B] font-bold">
                <span>Performance:</span>
                <span>{achievements?.internetBanking}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
