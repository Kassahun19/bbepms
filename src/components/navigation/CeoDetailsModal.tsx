import React from 'react';
import { Crown, Shield, Building2, Users, Award, ChevronRight, CheckCircle2, TrendingUp, Mail, Phone } from 'lucide-react';
import { User, District, Branch, DailyPerformanceReport } from '../../types';
import { ModalCloseButton } from '../common/ModalCloseButton';
import { useModalDismiss } from '../../hooks/useModalDismiss';

interface Props {
  ceo: User;
  chiefs: User[];
  districts: District[];
  branches: Branch[];
  reports: DailyPerformanceReport[];
  onClose: () => void;
  onSelectChief?: (chief: User) => void;
}

export const CeoDetailsModal: React.FC<Props> = ({
  ceo,
  chiefs,
  districts,
  branches,
  reports,
  onClose,
  onSelectChief
}) => {
  const { contentRef, handleBackdropClick } = useModalDismiss({
    isOpen: true,
    onClose,
  });

  const ceoName = `${ceo.firstName || ''} ${ceo.lastName || ''}`.trim() || ceo.userId || 'Chief Executive Officer';
  const ceoTitle = ceo.jobTitle || 'Chief Executive Officer (CEO)';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div 
        ref={contentRef}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-950/10 dark:border-amber-500/20 w-full max-w-4xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5C3A21] via-[#4A2E1A] to-[#1E120A] text-white p-6 relative">
          <ModalCloseButton onClose={onClose} className="text-white hover:bg-white/10" />
          
          <div className="flex flex-wrap items-center justify-between gap-4 pr-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg border-2 border-amber-300">
                <Crown className="w-8 h-8 text-amber-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-1">
                  <Shield className="w-4 h-4" />
                  <span>Executive Management Office</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{ceoName}</h2>
                <p className="text-amber-100/90 text-sm font-medium mt-0.5">{ceoTitle}</p>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400/20 border border-amber-400/40 text-amber-300">
              Bunna Bank Chief Executive Officer
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Corporate Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/80 dark:border-amber-900/40 p-4 rounded-xl">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Executive Chiefs</span>
                <Users className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {chiefs.length || 8}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Directorate Leaders</span>
            </div>

            <div className="bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/80 dark:border-amber-900/40 p-4 rounded-xl">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Districts</span>
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {districts.length}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Regional Commands</span>
            </div>

            <div className="bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/80 dark:border-amber-900/40 p-4 rounded-xl">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Outlets</span>
                <Award className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {branches.length}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Bank Branches</span>
            </div>

            <div className="bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/80 dark:border-amber-900/40 p-4 rounded-xl">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Bank Performance</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Target Realization</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-[#5C3A21] dark:text-amber-400 rounded-lg">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Executive Secretariat Email</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{ceo.email || 'ceo@bunnabanket.com'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-[#5C3A21] dark:text-amber-400 rounded-lg">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">CEO Direct Line</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">+251 11 126 2600 (Executive Office)</p>
              </div>
            </div>
          </div>

          {/* Executive Directorate Team */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider mb-3">
              <Users className="w-4 h-4 text-[#5C3A21] dark:text-amber-400" />
              <span>Reporting Executive Chiefs ({chiefs.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {chiefs.map(chief => (
                <div 
                  key={chief.id || chief.userId}
                  onClick={() => onSelectChief && onSelectChief(chief)}
                  className="group bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#5C3A21] text-amber-300 font-bold flex items-center justify-center text-sm shadow-sm">
                      {(chief.firstName || 'C').charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#5C3A21] dark:group-hover:text-amber-400 transition-colors">
                        {chief.jobTitle || `${chief.firstName || ''} ${chief.lastName || ''}`}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {`${chief.firstName || ''} ${chief.lastName || ''}`.trim() || chief.userId}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#5C3A21] dark:group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Bunna Bank Executive Inspector
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#5C3A21] hover:bg-[#4A2E1A] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
