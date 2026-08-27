import React, { useState } from 'react';
import {
  Save,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User as UserIcon,
  Building2,
  DollarSign,
  Smartphone,
  CreditCard,
  Globe,
  Store,
  Users
} from 'lucide-react';
import { DailyPerformanceReport } from '../../types';
import { api } from '../../services/api';
import { ModalCloseButton } from '../common/ModalCloseButton';
import { useModalDismiss } from '../../hooks/useModalDismiss';

interface DailyKpiEditModalProps {
  report: DailyPerformanceReport;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const DailyKpiEditModal: React.FC<DailyKpiEditModalProps> = ({
  report,
  isOpen,
  onClose,
  onSaved
}) => {
  const [customerOnboarding, setCustomerOnboarding] = useState<number>(
    report?.customerOnboarding ?? report?.accountOpenings ?? 0
  );
  const [mobileBanking, setMobileBanking] = useState<number>(
    report?.mobileBanking ?? report?.mobileBankingActivations ?? 0
  );
  const [internetBanking, setInternetBanking] = useState<number>(
    report?.internetBanking ?? report?.internetBankingActivations ?? 0
  );
  const [atmDebitCards, setAtmDebitCards] = useState<number>(
    report?.atmDebitCards ?? report?.atmCardsIssued ?? report?.atmCardActivations ?? 0
  );
  const [merchantSolutions, setMerchantSolutions] = useState<number>(
    report?.merchantSolutions ?? report?.merchantSolutionsActivations ?? 0
  );
  const [depositsETB, setDepositsETB] = useState<number>(
    report?.depositsETB ?? report?.deposits_etb ?? 0
  );
  const [foreignCurrencyETB, setForeignCurrencyETB] = useState<number>(
    report?.foreignCurrencyETB ?? report?.foreign_currency_etb ?? 0
  );
  const [status, setStatus] = useState<string>(report?.status || 'Pending');
  const [managerComment, setManagerComment] = useState<string>(report?.managerComment || '');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isDirty = report ? (
    customerOnboarding !== (report.customerOnboarding ?? report.accountOpenings ?? 0) ||
    mobileBanking !== (report.mobileBanking ?? report.mobileBankingActivations ?? 0) ||
    internetBanking !== (report.internetBanking ?? report.internetBankingActivations ?? 0) ||
    atmDebitCards !== (report.atmDebitCards ?? report.atmCardsIssued ?? report.atmCardActivations ?? 0) ||
    merchantSolutions !== (report.merchantSolutions ?? report.merchantSolutionsActivations ?? 0) ||
    depositsETB !== (report.depositsETB ?? report.deposits_etb ?? 0) ||
    foreignCurrencyETB !== (report.foreignCurrencyETB ?? report.foreign_currency_etb ?? 0) ||
    status !== (report.status || 'Pending') ||
    managerComment !== (report.managerComment || '')
  ) : false;

  const { contentRef, handleBackdropClick, handleDismissRequest: requestClose } = useModalDismiss({
    isOpen,
    onClose,
    hasUnsavedChanges: isDirty,
    unsavedMessage: 'You have unsaved KPI changes. Are you sure you want to discard them and close?'
  });

  if (!isOpen || !report) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      customerOnboarding < 0 ||
      mobileBanking < 0 ||
      internetBanking < 0 ||
      atmDebitCards < 0 ||
      merchantSolutions < 0 ||
      depositsETB < 0 ||
      foreignCurrencyETB < 0
    ) {
      setErrorMsg('KPI values cannot be negative numbers.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await api.updateReport(report.id, {
        customerOnboarding: Number(customerOnboarding),
        accountOpenings: Number(customerOnboarding),
        mobileBanking: Number(mobileBanking),
        mobileBankingActivations: Number(mobileBanking),
        internetBanking: Number(internetBanking),
        internetBankingActivations: Number(internetBanking),
        atmDebitCards: Number(atmDebitCards),
        atmCardsIssued: Number(atmDebitCards),
        atmCardActivations: Number(atmDebitCards),
        merchantSolutions: Number(merchantSolutions),
        merchantSolutionsActivations: Number(merchantSolutions),
        depositsETB: Number(depositsETB),
        deposits_etb: Number(depositsETB),
        foreignCurrencyETB: Number(foreignCurrencyETB),
        foreign_currency_etb: Number(foreignCurrencyETB),
        status: status as any,
        managerComment
      });

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update daily KPI report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        ref={contentRef}
        className="bg-gradient-to-b from-[#4A2C17] to-[#2E1B0E] border border-[#C89A2B]/50 rounded-3xl p-6 w-full max-w-xl text-white shadow-2xl space-y-5"
      >
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C89A2B]/20 text-[#C89A2B] uppercase tracking-wider">
              Edit Daily Performance
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              Daily KPI Record: {report.reportDate} ({report.dayOfWeek})
            </h3>
            <p className="text-xs text-gray-300">
              Employee: <strong className="text-[#C89A2B]">{report.employeeName}</strong> • {report.branchName || 'Hamusit Branch (SOL 360)'}
            </p>
          </div>
          <ModalCloseButton onClose={requestClose} ariaLabel="Close edit daily KPI dialog" />
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* 5 Core Numeric KPI Fields */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#C89A2B] uppercase tracking-wider block">
              Core Daily KPI Metrics
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Customer Onboarding */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Customer Onboarding</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={customerOnboarding}
                  onChange={(e) => setCustomerOnboarding(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-sm font-bold text-white focus:outline-none focus:border-[#C89A2B]"
                />
              </div>

              {/* Mobile Banking */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mobile Banking</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={mobileBanking}
                  onChange={(e) => setMobileBanking(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-sm font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Internet Banking */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Internet Banking</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={internetBanking}
                  onChange={(e) => setInternetBanking(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* ATM Debit Cards */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-violet-400" />
                  <span>ATM Debit Cards</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={atmDebitCards}
                  onChange={(e) => setAtmDebitCards(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-sm font-bold text-white focus:outline-none focus:border-violet-400"
                />
              </div>

              {/* Merchant Solutions */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                  <span>Merchant Solutions</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={merchantSolutions}
                  onChange={(e) => setMerchantSolutions(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Deposits ETB */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Deposit Mobilized (ETB)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={depositsETB}
                  onChange={(e) => setDepositsETB(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-sm font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Foreign Currency (FCY) */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>Foreign Currency (FCY) (USD)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={foreignCurrencyETB}
                  onChange={(e) => setForeignCurrencyETB(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

            </div>
          </div>

          {/* Status & Manager Comment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-[#C89A2B]"
              >
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Returned">Returned</option>
                <option value="Rejected">Rejected</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">Manager Note / Comment</label>
              <input
                type="text"
                value={managerComment}
                onChange={(e) => setManagerComment(e.target.value)}
                placeholder="Optional feedback..."
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
              >
              </input>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] hover:brightness-110 text-[#6B3F1D] font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save KPI Changes'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
