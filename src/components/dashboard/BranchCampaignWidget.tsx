import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Globe,
  CreditCard,
  QrCode,
  Users,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { DailyPerformanceReport } from '../../types';
import { api } from '../../services/api';

interface BranchCampaignWidgetProps {
  branchName?: string;
  userRole?: string;
  reports?: DailyPerformanceReport[];
  onReportSubmitted?: () => void;
}

type CampaignPeriod = 'today' | 'weekly' | 'monthly' | 'quarterly' | 'semiannually' | 'yearly';

export const BranchCampaignWidget: React.FC<BranchCampaignWidgetProps> = ({
  branchName = 'Hamusit Branch (SOL 360)',
  userRole = 'EMPLOYEE',
  reports = [],
  onReportSubmitted
}) => {
  const [period, setPeriod] = useState<CampaignPeriod>('today');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const periods: { id: CampaignPeriod; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'quarterly', label: 'Quarterly' },
    { id: 'semiannually', label: 'Semi-Annually' },
    { id: 'yearly', label: 'Yearly' },
  ];

  // Filter reports by period
  const getFilteredReports = () => {
    const now = new Date();
    const utcDateStr = now.toISOString().split('T')[0];
    const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;
    const currentHalf = currentMonth <= 6 ? 1 : 2;

    const periodFiltered = reports.filter(r => {
      if (!r.reportDate) return false;
      if (r.status !== 'Approved') return false;
      if (period === 'today') {
        return r.reportDate === utcDateStr || r.reportDate === localDateStr;
      }
      if (period === 'weekly') {
        const reportDate = new Date(r.reportDate);
        const diffDays = (now.getTime() - reportDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (period === 'monthly') {
        const repYear = r.year || new Date(r.reportDate).getFullYear();
        const repMonth = r.month || (new Date(r.reportDate).getMonth() + 1);
        return repYear === currentYear && repMonth === currentMonth;
      }
      if (period === 'quarterly') {
        const repYear = r.year || new Date(r.reportDate).getFullYear();
        const repMonth = r.month || (new Date(r.reportDate).getMonth() + 1);
        const repQuarter = Math.floor((repMonth - 1) / 3) + 1;
        return repYear === currentYear && repQuarter === currentQuarter;
      }
      if (period === 'semiannually') {
        const repYear = r.year || new Date(r.reportDate).getFullYear();
        const repMonth = r.month || (new Date(r.reportDate).getMonth() + 1);
        const repHalf = repMonth <= 6 ? 1 : 2;
        return repYear === currentYear && repHalf === currentHalf;
      }
      if (period === 'yearly') {
        const repYear = r.year || new Date(r.reportDate).getFullYear();
        return repYear === currentYear;
      }
      return true;
    });

    return periodFiltered;
  };

  const filtered = getFilteredReports();

  // Aggregate metrics
  const totals = filtered.reduce(
    (acc, r) => ({
      customerBase: acc.customerBase + Number(r.accountOpenings || 0),
      mobileBanking: acc.mobileBanking + Number(r.mobileBankingActivations || 0),
      internetBanking: acc.internetBanking + Number(r.internetBankingActivations || 0),
      atmCards: acc.atmCards + Number(r.atmCardActivations || r.atmCardsIssued || 0),
      merchants: acc.merchants + Number(r.merchantSolutions || r.merchantSolutionsActivations || 0),
      deposits: acc.deposits + Number(r.depositsETB || 0)
    }),
    { customerBase: 0, mobileBanking: 0, internetBanking: 0, atmCards: 0, merchants: 0, deposits: 0 }
  );

  const totalDigitalActivations = totals.mobileBanking + totals.internetBanking + totals.atmCards + totals.merchants;

  const handleManualSync = async () => {
    setIsRefreshing(true);
    setSyncStatus('syncing');
    try {
      if (onReportSubmitted) {
        await onReportSubmitted();
      }
      setTimeout(() => {
        setSyncStatus('synced');
        setIsRefreshing(false);
      }, 500);
    } catch {
      setSyncStatus('synced');
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-[#4A2C17] border border-[#C89A2B]/40 rounded-3xl p-6 shadow-xl text-white space-y-6">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C89A2B]/20 border border-[#C89A2B]/40 text-[#C89A2B] uppercase tracking-wider">
              Bunna Bank Daily Campaign Engine
            </span>
            <span className="flex items-center space-x-1 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Persistent & Local Storage Active</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C89A2B]" />
            Branch Daily Campaign Analytics ({branchName})
          </h2>
          <p className="text-xs text-gray-300">
            Real-time tracking of Customer Base, Mobile Banking, Internet Banking, ATM, & Merchant POS metrics
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleManualSync}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-gray-200 transition-colors"
            title="Sync latest campaign data from persistent database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C89A2B] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          {/* Period Selector Tabs */}
          <div className="flex flex-wrap items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-bold gap-1">
            {periods.map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all text-xs ${
                  period === p.id
                    ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md font-extrabold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Customer Base */}
        <div className="bg-[#6B3F1D]/80 border border-[#C89A2B]/25 rounded-2xl p-4 flex flex-col justify-between hover:border-[#C89A2B]/50 transition-colors">
          <div className="flex items-center justify-between text-gray-300 text-xs font-medium">
            <span>Customer Base</span>
            <Users className="w-4 h-4 text-[#C89A2B]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{totals.customerBase.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Accounts Opened</span>
          </div>
        </div>

        {/* Mobile Banking */}
        <div className="bg-[#6B3F1D]/80 border border-[#C89A2B]/25 rounded-2xl p-4 flex flex-col justify-between hover:border-[#C89A2B]/50 transition-colors">
          <div className="flex items-center justify-between text-gray-300 text-xs font-medium">
            <span>Mobile Banking</span>
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{totals.mobileBanking.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Bunna Mobile Activations</span>
          </div>
        </div>

        {/* Internet Banking */}
        <div className="bg-[#6B3F1D]/80 border border-[#C89A2B]/25 rounded-2xl p-4 flex flex-col justify-between hover:border-[#C89A2B]/50 transition-colors">
          <div className="flex items-center justify-between text-gray-300 text-xs font-medium">
            <span>Internet Banking</span>
            <Globe className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{totals.internetBanking.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Active Portal Users</span>
          </div>
        </div>

        {/* ATM Cards */}
        <div className="bg-[#6B3F1D]/80 border border-[#C89A2B]/25 rounded-2xl p-4 flex flex-col justify-between hover:border-[#C89A2B]/50 transition-colors">
          <div className="flex items-center justify-between text-gray-300 text-xs font-medium">
            <span>ATM Cards</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{totals.atmCards.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Issued & Activated</span>
          </div>
        </div>

        {/* Merchant POS & QR */}
        <div className="bg-[#6B3F1D]/80 border border-[#C89A2B]/25 rounded-2xl p-4 flex flex-col justify-between hover:border-[#C89A2B]/50 transition-colors">
          <div className="flex items-center justify-between text-gray-300 text-xs font-medium">
            <span>Merchant POS / QR</span>
            <QrCode className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{totals.merchants.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Solutions Deployed</span>
          </div>
        </div>
      </div>

      {/* Campaign Summary Stats Banner */}
      <div className="bg-gradient-to-r from-[#6B3F1D] via-[#4A2C17] to-[#6B3F1D] border border-[#C89A2B]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#C89A2B] text-[#6B3F1D] flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Total Digital Banking Activations ({periods.find(p => p.id === period)?.label.toUpperCase()})
            </h4>
            <p className="text-xs text-gray-300">
              Combined Mobile, Web, ATM Cards, and Merchant POS deployed across the campaign
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-right">
          <div>
            <span className="text-xs text-gray-400 block uppercase font-medium">Total Digital</span>
            <span className="text-2xl font-black text-[#C89A2B]">
              {totalDigitalActivations.toLocaleString()}
            </span>
          </div>

          <div className="border-l border-white/15 pl-6">
            <span className="text-xs text-gray-400 block uppercase font-medium">Total Deposits (ETB)</span>
            <span className="text-2xl font-black text-emerald-400">
              {totals.deposits.toLocaleString()} <span className="text-xs text-emerald-300 font-semibold">ETB</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
