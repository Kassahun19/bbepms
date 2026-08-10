import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, Award, Calendar, Layers, Target, CheckCircle2 } from 'lucide-react';
import { DailyPerformanceReport, PerformanceTarget } from '../../types';

interface PersonalKpiProgressChartProps {
  reports: DailyPerformanceReport[];
  targets?: PerformanceTarget[];
  employeeName?: string;
}

export const PersonalKpiProgressChart: React.FC<PersonalKpiProgressChartProps> = ({
  reports,
  targets = [],
  employeeName = 'Employee'
}) => {
  const [activeMetric, setActiveMetric] = useState<'overall' | 'deposits' | 'digital' | 'accounts'>('overall');

  // Generate last 6 months data dynamically
  const generate6MonthsData = () => {
    const data = [];
    const now = new Date(); // Current date e.g. July 2026

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1 - 12
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      // Filter reports for this specific month & year
      const monthReports = reports.filter(r => {
        if (r.year && r.month) {
          return r.year === year && r.month === month;
        }
        if (r.reportDate) {
          const rd = new Date(r.reportDate);
          return rd.getFullYear() === year && rd.getMonth() + 1 === month;
        }
        return false;
      });

      // Sum actuals
      const depositsActual = monthReports.reduce((sum, r) => sum + (r.depositsETB || 0), 0);
      const fcyActual = monthReports.reduce((sum, r) => sum + (r.foreignCurrencyETB || 0), 0);
      const mobileActual = monthReports.reduce((sum, r) => sum + (r.mobileBankingActivations || 0), 0);
      const ibActual = monthReports.reduce((sum, r) => sum + (r.internetBankingActivations || 0), 0);
      const merchantActual = monthReports.reduce((sum, r) => sum + (r.merchantSolutions || 0), 0);
      const atmActual = monthReports.reduce((sum, r) => sum + (r.atmCardActivations || 0), 0);
      const accountsActual = monthReports.reduce((sum, r) => sum + (r.accountOpenings || 0), 0);

      const digitalTotalActual = mobileActual + ibActual + merchantActual + atmActual;

      // Find monthly targets or defaults
      const depTargetObj = targets.find(t => t.month === month && t.year === year && (t.kpiName && t.kpiName.toLowerCase().includes('deposit')));
      const depositsTarget = depTargetObj?.targetValue || 0;

      const digitalTargetObj = targets.find(t => t.month === month && t.year === year && (t.kpiName && (t.kpiName.toLowerCase().includes('mobile') || t.kpiName.toLowerCase().includes('digital'))));
      const digitalTarget = digitalTargetObj?.targetValue || 0;

      const accountsTargetObj = targets.find(t => t.month === month && t.year === year && (t.kpiName && t.kpiName.toLowerCase().includes('account')));
      const accountsTarget = accountsTargetObj?.targetValue || 0;

      // Calculate score percentages
      const depositPct = depositsTarget > 0 ? Math.min(100, Math.round((depositsActual / depositsTarget) * 100)) : 0;
      const digitalPct = digitalTarget > 0 ? Math.min(100, Math.round((digitalTotalActual / digitalTarget) * 100)) : 0;
      const accountsPct = accountsTarget > 0 ? Math.min(100, Math.round((accountsActual / accountsTarget) * 100)) : 0;

      // Composite overall performance score out of 100
      const overallScore = Math.round((depositPct * 0.5) + (digitalPct * 0.3) + (accountsPct * 0.2));

      data.push({
        monthLabel,
        year,
        month,
        depositsActual,
        depositsTarget,
        depositsActualK: Math.round(depositsActual / 1000),
        depositsTargetK: Math.round(depositsTarget / 1000),
        fcyActual,
        mobileActual,
        ibActual,
        merchantActual,
        atmActual,
        digitalTotalActual,
        digitalTarget,
        accountsActual,
        accountsTarget,
        overallScore,
        targetBenchmark: 100
      });
    }

    return data;
  };

  const chartData = generate6MonthsData();

  // Summary Metrics over 6 months
  const total6MonthDeposits = chartData.reduce((sum, d) => sum + d.depositsActual, 0);
  const total6MonthDigital = chartData.reduce((sum, d) => sum + d.digitalTotalActual, 0);
  const total6MonthAccounts = chartData.reduce((sum, d) => sum + d.accountsActual, 0);
  const avg6MonthScore = Math.round(chartData.reduce((sum, d) => sum + d.overallScore, 0) / 6);

  // Custom Tooltip Formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#362011] border border-[#C89A2B]/40 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[180px]">
          <p className="font-bold text-[#C89A2B] border-b border-white/10 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-gray-400">KPI Performance</span>
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <span className="flex items-center space-x-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold text-white">
                {entry.name.includes('ETB') || entry.name.includes('Deposit')
                  ? `ETB ${Number(entry.value).toLocaleString()}`
                  : entry.name.includes('Score')
                  ? `${entry.value}%`
                  : Number(entry.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#4A2C17] border border-[#C89A2B]/40 rounded-3xl p-6 shadow-xl text-white space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C89A2B]/20 border border-[#C89A2B]/40 text-[#C89A2B] uppercase tracking-wider">
              Personal Performance Analytics
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 6-Month Trend Evaluation
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#C89A2B]" />
            Personal KPI Progress Visualization ({employeeName})
          </h3>
          <p className="text-xs text-gray-300">
            Historical monthly trend comparing target thresholds against actual achievements over the last 6 months
          </p>
        </div>

        {/* Metric Switcher Tabs */}
        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveMetric('overall')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeMetric === 'overall'
                ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overall Score (%)
          </button>
          <button
            onClick={() => setActiveMetric('deposits')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeMetric === 'deposits'
                ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Deposits (ETB)
          </button>
          <button
            onClick={() => setActiveMetric('digital')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeMetric === 'digital'
                ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Digital Banking
          </button>
          <button
            onClick={() => setActiveMetric('accounts')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeMetric === 'accounts'
                ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Account Openings
          </button>
        </div>
      </div>

      {/* Summary Highlights Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[#6B3F1D]/80 border border-[#C89A2B]/25 rounded-2xl p-4">
          <span className="text-xs text-gray-400 font-medium block">6-Month Avg KPI Score</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-black text-[#C89A2B]">{avg6MonthScore}%</span>
            <span className="text-[10px] text-emerald-400 font-semibold">/ 100% Target</span>
          </div>
        </div>

        <div className="bg-[#6B3F1D]/80 border border-[#C89A2B]/25 rounded-2xl p-4">
          <span className="text-xs text-gray-400 font-medium block">6-Month Total Deposits</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-emerald-400">
              ETB {(total6MonthDeposits / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>

        <div className="bg-[#6B3F1D]/80 border border-[#C89A2B]/25 rounded-2xl p-4">
          <span className="text-xs text-gray-400 font-medium block">6-Month Digital Activations</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-white">{total6MonthDigital}</span>
            <span className="text-[10px] text-gray-400">Activations</span>
          </div>
        </div>

        <div className="bg-[#6B3F1D]/80 border border-[#C89A2B]/25 rounded-2xl p-4">
          <span className="text-xs text-gray-400 font-medium block">6-Month Account Openings</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-black text-sky-400">{total6MonthAccounts}</span>
            <span className="text-[10px] text-gray-400">Accounts</span>
          </div>
        </div>
      </div>

      {/* Recharts Chart Section */}
      <div className="bg-[#6B3F1D]/40 border border-white/10 rounded-2xl p-4 sm:p-5 pt-6">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeMetric === 'overall' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C89A2B" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#C89A2B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="monthLabel" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="overallScore"
                  name="Achieved KPI Score (%)"
                  stroke="#C89A2B"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="targetBenchmark"
                  name="100% Target Benchmark"
                  stroke="#2E7D32"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            ) : activeMetric === 'deposits' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="monthLabel" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                <Bar dataKey="depositsActual" name="Actual Deposits (ETB)" fill="#2E7D32" radius={[6, 6, 0, 0]} />
                <Bar dataKey="depositsTarget" name="Target Deposits (ETB)" fill="#C89A2B" radius={[6, 6, 0, 0]} opacity={0.4} />
              </BarChart>
            ) : activeMetric === 'digital' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="monthLabel" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                <Bar dataKey="mobileActual" name="Bunna Mobile" stackId="a" fill="#2E7D32" radius={[0, 0, 0, 0]} />
                <Bar dataKey="ibActual" name="Internet Banking" stackId="a" fill="#38BDF8" radius={[0, 0, 0, 0]} />
                <Bar dataKey="atmActual" name="ATM Cards" stackId="a" fill="#C084FC" radius={[0, 0, 0, 0]} />
                <Bar dataKey="merchantActual" name="Merchant POS/QR" stackId="a" fill="#FBBF24" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="monthLabel" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="accountsActual"
                  name="Accounts Opened"
                  stroke="#38BDF8"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#38BDF8' }}
                />
                <Line
                  type="monotone"
                  dataKey="accountsTarget"
                  name="Monthly Account Target"
                  stroke="#C89A2B"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
