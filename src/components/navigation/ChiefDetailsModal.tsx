import React from 'react';
import { Award, Shield, Users, Building2, ChevronRight, CheckCircle2, TrendingUp, BarChart3, Mail, Phone } from 'lucide-react';
import { User, District, Branch, DailyPerformanceReport } from '../../types';
import { ModalCloseButton } from '../common/ModalCloseButton';
import { useModalDismiss } from '../../hooks/useModalDismiss';

interface Props {
  chief: User;
  districts: District[];
  branches: Branch[];
  reports: DailyPerformanceReport[];
  onClose: () => void;
  onSelectDistrict?: (district: District) => void;
}

export const ChiefDetailsModal: React.FC<Props> = ({
  chief,
  districts,
  branches,
  reports,
  onClose,
  onSelectDistrict
}) => {
  const { contentRef, handleBackdropClick } = useModalDismiss({
    isOpen: true,
    onClose,
  });

  const chiefName = `${chief.firstName || ''} ${chief.lastName || ''}`.trim() || chief.userId || 'Chief Officer';
  const chiefTitle = chief.jobTitle || chief.roleType || 'Chief Executive Officer';

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
        <div className="bg-gradient-to-r from-[#5C3A21] via-[#4A2E1A] to-[#2B1B10] text-white p-6 relative">
          <ModalCloseButton onClose={onClose} className="text-white hover:bg-white/10" />
          
          <div className="flex flex-wrap items-center justify-between gap-4 pr-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg border-2 border-amber-300">
                {chiefName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-1">
                  <Award className="w-4 h-4" />
                  <span>Executive Leadership Directorate</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{chiefName}</h2>
                <p className="text-amber-100/90 text-sm font-medium mt-0.5">{chiefTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Executive Chief</span>
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Executive Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/80 dark:border-amber-900/40 p-4 rounded-xl">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Organizational Scope</span>
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {districts.length} Districts
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">National Bank Network</span>
            </div>

            <div className="bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/80 dark:border-amber-900/40 p-4 rounded-xl">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Branch Outlets</span>
                <Users className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {branches.length} Branches
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Active Operational Units</span>
            </div>

            <div className="bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/80 dark:border-amber-900/40 p-4 rounded-xl">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Directorate Status</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                Optimal
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Strategic KPI Fulfillment</span>
            </div>
          </div>

          {/* Contact & Profile */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-[#5C3A21] dark:text-amber-400 rounded-lg">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Official Email</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{chief.email || `${chief.userId?.toLowerCase() || 'chief'}@bunnabanket.com`}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-[#5C3A21] dark:text-amber-400 rounded-lg">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Head Office Contact</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">+251 11 126 2600 (Head Office)</p>
              </div>
            </div>
          </div>

          {/* Overseas Districts Overview */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider mb-3">
              <Building2 className="w-4 h-4 text-[#5C3A21] dark:text-amber-400" />
              <span>Overseen Regional Districts ({districts.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {districts.map(d => (
                <div 
                  key={d.id}
                  onClick={() => onSelectDistrict && onSelectDistrict(d)}
                  className="group bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#5C3A21] dark:group-hover:text-amber-400 transition-colors">
                      {d.name}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {d.region || 'Region'} • SOL: {d.solId || d.code} • Director: {d.managerName || 'Assigned'}
                    </p>
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
            Bunna Bank Executive Leadership Inspector
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
