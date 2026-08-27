import React, { useState } from 'react';
import {
  TrendingUp,
  Coins,
  DollarSign,
  Smartphone,
  Globe,
  QrCode,
  CreditCard,
  UserPlus,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';
import { DailyPerformanceReport, PerformanceTarget, KPI } from '../../types';
import { PeriodicPerformanceAnalytics } from './PeriodicPerformanceAnalytics';

interface AllProductsOverviewProps {
  reports: DailyPerformanceReport[];
  targets: PerformanceTarget[];
  kpis?: KPI[];
  title?: string;
  subtitle?: string;
  showBranchDetails?: boolean;
}

export const AllProductsOverview: React.FC<AllProductsOverviewProps> = ({
  reports,
  targets,
  title = "All Products Performance Overview",
  subtitle = "Total achievements in numbers, percentages, remaining targets, and detailed product reports",
  showBranchDetails = true
}) => {
  const [selectedProductKey, setSelectedProductKey] = useState<string>('all');

  // Product Configurations for Bunna Bank's 8 core products
  const products = [
    {
      key: 'depositsETB',
      code: 'DEP_ETB',
      name: 'Deposits Mobilized',
      category: 'Finance',
      unit: 'ETB',
      isCurrency: true,
      icon: Coins,
      gradient: 'from-amber-500/20 to-emerald-500/10',
      border: 'border-amber-500/30',
      textColor: 'text-amber-400',
      kpiId: 'KPI-001',
      defaultTarget: 0
    },
    {
      key: 'foreignCurrencyETB',
      code: 'FCY_ETB',
      name: 'Foreign Currency Inflow',
      category: 'Finance',
      unit: 'USD',
      isCurrency: true,
      icon: DollarSign,
      gradient: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      kpiId: 'KPI-002',
      defaultTarget: 0
    },
    {
      key: 'digitalFinancialServicesETB',
      code: 'DFS_ETB',
      name: 'Digital Financial Services',
      category: 'Finance',
      unit: 'ETB',
      isCurrency: true,
      icon: TrendingUp,
      gradient: 'from-blue-500/20 to-cyan-500/10',
      border: 'border-blue-500/30',
      textColor: 'text-blue-400',
      kpiId: 'KPI-003',
      defaultTarget: 0
    },
    {
      key: 'accountOpenings',
      code: 'ACC_OPEN',
      name: 'Account Openings',
      category: 'Stakeholder',
      unit: 'Accounts',
      isCurrency: false,
      icon: UserPlus,
      gradient: 'from-purple-500/20 to-pink-500/10',
      border: 'border-purple-500/30',
      textColor: 'text-purple-400',
      kpiId: 'KPI-004',
      defaultTarget: 0
    },
    {
      key: 'mobileBankingActivations',
      code: 'MB_ACT',
      name: 'Mobile Banking Activations',
      category: 'Internal Business',
      unit: 'Users',
      isCurrency: false,
      icon: Smartphone,
      gradient: 'from-indigo-500/20 to-blue-500/10',
      border: 'border-indigo-500/30',
      textColor: 'text-indigo-400',
      kpiId: 'KPI-005',
      defaultTarget: 0
    },
    {
      key: 'internetBankingActivations',
      code: 'IB_ACT',
      name: 'Internet Banking Activations',
      category: 'Internal Business',
      unit: 'Users',
      isCurrency: false,
      icon: Globe,
      gradient: 'from-cyan-500/20 to-teal-500/10',
      border: 'border-cyan-500/30',
      textColor: 'text-cyan-400',
      kpiId: 'KPI-006',
      defaultTarget: 0
    },
    {
      key: 'merchantSolutions',
      code: 'MERCH_SOL',
      name: 'Merchant Solutions & QR',
      category: 'Internal Business',
      unit: 'Merchants',
      isCurrency: false,
      icon: QrCode,
      gradient: 'from-orange-500/20 to-amber-500/10',
      border: 'border-orange-500/30',
      textColor: 'text-orange-400',
      kpiId: 'KPI-007',
      defaultTarget: 0
    },
    {
      key: 'atmCardActivations',
      code: 'ATM_CARD',
      name: 'ATM Card Activations',
      category: 'Internal Business',
      unit: 'Cards',
      isCurrency: false,
      icon: CreditCard,
      gradient: 'from-teal-500/20 to-emerald-500/10',
      border: 'border-teal-500/30',
      textColor: 'text-teal-400',
      kpiId: 'KPI-008',
      defaultTarget: 0
    }
  ];

  // Calculate Product Stats
  const productStats = products.map(prod => {
    // Total achieved across all submitted/approved reports
    const achieved = reports.reduce((sum, r) => {
      let val = Number((r as any)[prod.key]) || 0;
      if (!val) {
        if (prod.key === 'atmCardActivations') val = Number(r.atmCardsIssued || 0);
        else if (prod.key === 'merchantSolutions') val = Number(r.merchantSolutionsActivations || 0);
      }
      return sum + val;
    }, 0);
    
    // Find matching target
    const targetObj = targets.find(t => t.kpiId === prod.kpiId || (t.kpiName && prod.name && t.kpiName.toLowerCase().includes(prod.name.toLowerCase())));
    const target = targetObj ? targetObj.targetValue : prod.defaultTarget;

    const percentage = target > 0 ? (achieved / target) * 100 : 0;
    const remaining = Math.max(0, target - achieved);
    const excess = achieved > target ? achieved - target : 0;

    return {
      ...prod,
      target,
      achieved,
      percentage: Number(percentage.toFixed(1)),
      remaining,
      excess
    };
  });

  const formatValue = (value: number, isCurrency: boolean, key?: string) => {
    if (isCurrency) {
      if (key === 'foreignCurrencyETB') {
        if (value >= 1_000_000) {
          return `USD ${(value / 1_000_000).toFixed(2)}M`;
        } else if (value >= 1_000) {
          return `USD ${(value / 1_000).toFixed(1)}k`;
        }
        return `USD ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      if (value >= 1_000_000) {
        return `ETB ${(value / 1_000_000).toFixed(2)}M`;
      } else if (value >= 1_000) {
        return `ETB ${(value / 1_000).toFixed(1)}k`;
      }
      return `ETB ${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Section Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#6B3F1D] via-[#4A2C17] to-[#362011] border border-[#C89A2B]/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-[#C89A2B] text-[#6B3F1D] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                Bunna Bank EPMS Metrics
              </span>
              <span className="text-xs text-gray-300">All 8 Core Products</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#C89A2B]" />
              {title}
            </h3>
            <p className="text-xs text-gray-300 mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center space-x-3 bg-black/20 p-2.5 rounded-2xl border border-white/10 text-xs">
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Total Reports Submitted</p>
              <p className="text-base font-extrabold text-[#C89A2B]">{reports.length}</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Approved Reports</p>
              <p className="text-base font-extrabold text-emerald-400">
                {reports.filter(r => r.status === 'Approved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Periodic Performance Evaluation Engine (100% Scale for Monthly, Quarterly, Semi-Annually, Annually) */}
      <PeriodicPerformanceAnalytics reports={reports} targets={targets} />

      {/* Grid of 8 Product Achievement Cards with Hanging & Hover Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {productStats.map(prod => {
          const Icon = prod.icon;
          const isTargetExceeded = prod.percentage >= 100;
          const diff = prod.achieved - prod.target;
          let signStr = '';
          if (diff > 0) signStr = '+';
          else if (diff < 0) signStr = '-';
          const absDiff = Math.abs(diff);

          return (
            <div
              key={prod.key}
              onClick={() => setSelectedProductKey(prod.key)}
              className={`p-5 rounded-2xl bg-[#4A2C17]/95 border ${prod.border} shadow-xl hover:-translate-y-2.5 hover:shadow-[0_25px_50px_rgba(200,154,43,0.22)] hover:border-[#C89A2B] transition-all duration-300 transform-gpu cursor-pointer relative overflow-hidden group ${
                selectedProductKey === prod.key ? 'ring-2 ring-[#C89A2B] scale-[1.02]' : ''
              }`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${prod.gradient} blur-xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none`} />

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${prod.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center space-x-1 ${
                  isTargetExceeded 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : prod.percentage >= 80 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{prod.percentage}%</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-[#C89A2B] transition-colors">{prod.name}</h4>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">{prod.category}</p>

              {/* Numbers Overview with strict +, -, or none for remaining variance */}
              <div className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-gray-400">Achieved:</span>
                  <span className={`font-black text-sm ${prod.textColor}`}>
                    {formatValue(prod.achieved, prod.isCurrency, prod.key)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-gray-400">Target:</span>
                  <span className="font-semibold text-gray-200">
                    {formatValue(prod.target, prod.isCurrency, prod.key)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Remaining / Variance:</span>
                  <span className={`font-black text-xs px-2 py-0.5 rounded-md border ${
                    diff > 0 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                      : diff < 0 
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                      : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                  }`}>
                    {diff === 0 ? '0' : `${signStr}${formatValue(absDiff, prod.isCurrency, prod.key)}`}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-black/40 border border-white/10">
                  <div
                    style={{ width: `${Math.min(prod.percentage, 100)}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-700 ${
                      isTargetExceeded
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : prod.percentage >= 80
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-rose-500 to-pink-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

