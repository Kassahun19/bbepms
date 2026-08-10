import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Loader2
} from 'lucide-react';
import { DailyPerformanceReport, PerformanceTarget, KPI } from '../../types';
import { PeriodicPerformanceAnalytics } from './PeriodicPerformanceAnalytics';
import { api } from '../../services/api';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Approved' | 'Pending' | 'Rejected'>('ALL');

  // Pagination and local table record display states
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number | 'all'>(5);
  const [tableReports, setTableReports] = useState<DailyPerformanceReport[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [totals, setTotals] = useState<Record<string, number>>({
    depositsETB: 0,
    foreignCurrencyETB: 0,
    digitalFinancialServicesETB: 0,
    accountOpenings: 0,
    mobileBankingActivations: 0,
    internetBankingActivations: 0,
    merchantSolutions: 0,
    atmCardActivations: 0,
  });
  
  // Reset page when search or filters change
  const handleProductChange = (val: string) => {
    setSelectedProductKey(val);
    setPage(1);
  };

  const handleStatusChange = (val: 'ALL' | 'Approved' | 'Pending' | 'Rejected') => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
  };

  const handleLimitChange = (val: number | 'all') => {
    setLimit(val);
    setPage(1);
  };

  // Fetch paginated reports
  useEffect(() => {
    let active = true;
    const loadPaginated = async () => {
      setLoadingTable(true);
      try {
        const result = await api.getPaginatedReports({
          page,
          limit,
          search: searchTerm,
          product: selectedProductKey,
          status: statusFilter
        });
        if (active) {
          setTableReports(result.reports || []);
          setTotalCount(result.totalCount || 0);
          if (result.totals) {
            setTotals(result.totals);
          } else {
            // Fallback: calculate from returned reports if server did not include totals
            const currentTotals = {
              depositsETB: (result.reports || []).reduce((sum, r: any) => sum + Number(r.depositsETB || 0), 0),
              foreignCurrencyETB: (result.reports || []).reduce((sum, r: any) => sum + Number(r.foreignCurrencyETB || 0), 0),
              digitalFinancialServicesETB: (result.reports || []).reduce((sum, r: any) => sum + Number(r.digitalFinancialServicesETB || 0), 0),
              accountOpenings: (result.reports || []).reduce((sum, r: any) => sum + Number(r.accountOpenings || 0), 0),
              mobileBankingActivations: (result.reports || []).reduce((sum, r: any) => sum + Number(r.mobileBankingActivations || 0), 0),
              internetBankingActivations: (result.reports || []).reduce((sum, r: any) => sum + Number(r.internetBankingActivations || 0), 0),
              merchantSolutions: (result.reports || []).reduce((sum, r: any) => sum + Number(r.merchantSolutions || 0), 0),
              atmCardActivations: (result.reports || []).reduce((sum, r: any) => sum + Number(r.atmCardActivations || r.atmCardsIssued || 0), 0),
            };
            setTotals(currentTotals);
          }
        }
      } catch (err) {
        console.warn("Server-side pagination error, falling back to local client processing:", err);
        if (active) {
          // Fallback client-side processing
          const clientFiltered = reports.filter(report => {
            if (statusFilter !== 'ALL' && report.status !== statusFilter) return false;
            if (selectedProductKey !== 'all') {
              const val = Number((report as any)[selectedProductKey]);
              if (!val || val <= 0) return false;
            }
            if (searchTerm.trim()) {
              const term = searchTerm.toLowerCase();
              const matchName = (report.employeeName || '').toLowerCase().includes(term);
              const matchBranch = (report.branchName || '').toLowerCase().includes(term);
              const matchDistrict = (report.districtName || '').toLowerCase().includes(term);
              const matchDate = (report.reportDate || '').includes(term);
              return matchName || matchBranch || matchDistrict || matchDate;
            }
            return true;
          });
          setTotalCount(clientFiltered.length);
          if (limit === 'all') {
            setTableReports(clientFiltered);
          } else {
            const l = Number(limit) || 5;
            setTableReports(clientFiltered.slice((page - 1) * l, page * l));
          }
          // Compute totals on ALL matching records, not just the page
          const fallbackTotals = {
            depositsETB: clientFiltered.reduce((sum, r: any) => sum + Number(r.depositsETB || 0), 0),
            foreignCurrencyETB: clientFiltered.reduce((sum, r: any) => sum + Number(r.foreignCurrencyETB || 0), 0),
            digitalFinancialServicesETB: clientFiltered.reduce((sum, r: any) => sum + Number(r.digitalFinancialServicesETB || 0), 0),
            accountOpenings: clientFiltered.reduce((sum, r: any) => sum + Number(r.accountOpenings || 0), 0),
            mobileBankingActivations: clientFiltered.reduce((sum, r: any) => sum + Number(r.mobileBankingActivations || 0), 0),
            internetBankingActivations: clientFiltered.reduce((sum, r: any) => sum + Number(r.internetBankingActivations || 0), 0),
            merchantSolutions: clientFiltered.reduce((sum, r: any) => sum + Number(r.merchantSolutions || 0), 0),
            atmCardActivations: clientFiltered.reduce((sum, r: any) => sum + Number(r.atmCardActivations || r.atmCardsIssued || 0), 0),
          };
          setTotals(fallbackTotals);
        }
      } finally {
        if (active) {
          setLoadingTable(false);
        }
      }
    };

    loadPaginated();
    return () => {
      active = false;
    };
  }, [page, limit, selectedProductKey, statusFilter, searchTerm, reports]);

  // Product Configurations for Bunna Bank's 8 core products
  const products = [
    {
      key: 'depositsETB',
      code: 'DEP_ETB',
      name: 'Deposits Mobilized',
      category: 'Financial',
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
      category: 'Financial',
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
      category: 'Financial',
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
      category: 'Customer Acquisition',
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
      category: 'Digital Banking',
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
      category: 'Digital Banking',
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
      category: 'Digital Banking',
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
      category: 'Digital Banking',
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

      {/* Product Reports Table Section */}
      <div className="bg-[#4A2C17] border border-[#C89A2B]/30 rounded-3xl p-6 shadow-xl space-y-4">
        
        {/* Table Controls Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#C89A2B]" />
              Product Performance Reports Database
            </h4>
            <p className="text-xs text-gray-300">
              {selectedProductKey === 'all'
                ? 'Showing figures for all 8 Bunna Bank products across all submitted reports'
                : `Filtered view for: ${products.find(p => p.key === selectedProductKey)?.name}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Product Selector Dropdown */}
            <select
              value={selectedProductKey}
              onChange={(e) => handleProductChange(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[#C89A2B] focus:outline-none font-semibold cursor-pointer"
            >
              <option value="all" className="bg-[#6B3F1D]">All 8 Products</option>
              {products.map(p => (
                <option key={p.key} value={p.key} className="bg-[#6B3F1D]">{p.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[#C89A2B] focus:outline-none font-semibold cursor-pointer"
            >
              <option value="ALL" className="bg-[#6B3F1D]">All Statuses</option>
              <option value="Approved" className="bg-[#6B3F1D]">Approved Only</option>
              <option value="Pending" className="bg-[#6B3F1D]">Pending Review</option>
              <option value="Rejected" className="bg-[#6B3F1D]">Rejected</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search staff, branch..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:border-[#C89A2B] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto transition-opacity duration-200" style={{ opacity: loadingTable ? 0.6 : 1 }}>
          <table className="w-full text-left text-xs text-gray-200">
            <thead className="bg-white/5 border-b border-white/10 text-[11px] uppercase tracking-wider text-[#C89A2B] font-bold">
              <tr>
                <th className="py-3 px-4">Date & ID</th>
                <th className="py-3 px-4">Staff & Branch</th>
                <th className="py-3 px-4">Deposits (ETB)</th>
                <th className="py-3 px-4">FCY (USD)</th>
                <th className="py-3 px-4">DFS (ETB)</th>
                <th className="py-3 px-4 text-center">Accounts</th>
                <th className="py-3 px-4 text-center min-w-[110px] whitespace-normal break-words">Mobile Banking</th>
                <th className="py-3 px-4 text-center min-w-[110px] whitespace-normal break-words">Internet Banking</th>
                <th className="py-3 px-4 text-center">Merchant POS</th>
                <th className="py-3 px-4 text-center">ATM Cards</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tableReports.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-gray-400">
                    {loadingTable ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 text-[#C89A2B] animate-spin" />
                        <span>Loading matching reports...</span>
                      </div>
                    ) : (
                      "No performance reports match the selected filters or search terms."
                    )}
                  </td>
                </tr>
              ) : (
                tableReports.map(report => (
                  <tr key={report.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <p className="font-bold text-white">{report.reportDate}</p>
                      <p className="text-[10px] text-gray-400">{report.id}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{report.employeeName}</p>
                      <p className="text-[10px] text-[#C89A2B]">{report.branchName}</p>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-amber-300">
                      ETB {(report.depositsETB || 0).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-emerald-300">
                      USD {(report.foreignCurrencyETB || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-blue-300">
                      ETB {(report.digitalFinancialServicesETB || 0).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-purple-300">
                      {report.accountOpenings || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-indigo-300">
                      {report.mobileBankingActivations || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-cyan-300">
                      {report.internetBankingActivations || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-orange-300">
                      {report.merchantSolutions || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-teal-300">
                      {report.atmCardActivations || 0}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        report.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : report.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}>
                        {report.status === 'Approved' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        <span>{report.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {tableReports.length > 0 && (
              <tfoot className="border-t-2 border-white/20 bg-white/5 font-bold text-white text-xs">
                <tr className="hover:bg-white/10 transition-colors">
                  <td className="py-4 px-4 font-black tracking-wider text-[#C89A2B] uppercase">
                    FILTERED TOTAL
                  </td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4 font-extrabold text-amber-300">
                    ETB {(totals.depositsETB || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 font-extrabold text-emerald-300">
                    USD {(totals.foreignCurrencyETB || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 font-extrabold text-blue-300">
                    ETB {(totals.digitalFinancialServicesETB || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center font-extrabold text-purple-300">
                    {(totals.accountOpenings || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center font-extrabold text-indigo-300">
                    {(totals.mobileBankingActivations || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center font-extrabold text-cyan-300">
                    {(totals.internetBankingActivations || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center font-extrabold text-orange-300">
                    {(totals.merchantSolutions || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center font-extrabold text-teal-300">
                    {(totals.atmCardActivations || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-4"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination & Display controls footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-gray-300">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span>Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  handleLimitChange(val);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[#C89A2B] focus:outline-none font-semibold cursor-pointer"
              >
                <option value={5} className="bg-[#6B3F1D]">5 rows</option>
                <option value={10} className="bg-[#6B3F1D]">10 rows</option>
                <option value={15} className="bg-[#6B3F1D]">15 rows</option>
                <option value={20} className="bg-[#6B3F1D]">20 rows</option>
                <option value={25} className="bg-[#6B3F1D]">25 rows</option>
                <option value={50} className="bg-[#6B3F1D]">50 rows</option>
                <option value={100} className="bg-[#6B3F1D]">100 rows</option>
                <option value="all" className="bg-[#6B3F1D]">All rows</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              {loadingTable && <Loader2 className="w-3.5 h-3.5 text-[#C89A2B] animate-spin" />}
              <span>
                Showing {totalCount === 0 ? 0 : (page - 1) * (limit === 'all' ? totalCount : limit) + 1}–
                {limit === 'all' ? totalCount : Math.min(page * limit, totalCount)} of {totalCount} records
              </span>
            </div>
          </div>

          {/* Page numbers navigation links */}
          {limit !== 'all' && totalCount > limit && (
            <div className="flex flex-wrap items-center gap-1.5 justify-end">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {(() => {
                const totalPages = Math.ceil(totalCount / (limit as number));
                const getPageNumbers = (current: number, total: number) => {
                  const pages: (number | string)[] = [];
                  if (total <= 5) {
                    for (let i = 1; i <= total; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (current > 3) pages.push('...');
                    const start = Math.max(2, current - 1);
                    const end = Math.min(total - 1, current + 1);
                    for (let i = start; i <= end; i++) pages.push(i);
                    if (current < total - 2) pages.push('...');
                    pages.push(total);
                  }
                  return pages;
                };

                return getPageNumbers(page, totalPages).map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (typeof p === 'number') setPage(p);
                    }}
                    disabled={p === '...'}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      p === page
                        ? 'bg-[#C89A2B] text-[#4A2C17] shadow-md border border-[#C89A2B]'
                        : p === '...'
                        ? 'text-gray-500 cursor-default px-1.5'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ));
              })()}

              <button
                onClick={() => {
                  const totalPages = Math.ceil(totalCount / (limit as number));
                  setPage(prev => Math.min(totalPages, prev + 1));
                }}
                disabled={page === Math.ceil(totalCount / (limit as number))}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
