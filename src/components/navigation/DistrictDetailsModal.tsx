import React, { useMemo } from 'react';
import { Building2, Users, MapPin, Hash, ShieldCheck, ChevronRight, Award, BarChart3, CheckCircle2 } from 'lucide-react';
import { District, Branch, User, DailyPerformanceReport, KPI, PerformanceTarget } from '../../types';
import { ModalCloseButton } from '../common/ModalCloseButton';
import { useModalDismiss } from '../../hooks/useModalDismiss';

interface Props {
  district: District;
  branches: Branch[];
  employees: User[];
  reports: DailyPerformanceReport[];
  kpis: KPI[];
  targets: PerformanceTarget[];
  onClose: () => void;
  onSelectBranch?: (branch: Branch) => void;
  onSelectEmployee?: (employee: User) => void;
}

export const DistrictDetailsModal: React.FC<Props> = ({
  district,
  branches,
  employees,
  reports,
  kpis,
  targets,
  onClose,
  onSelectBranch,
  onSelectEmployee
}) => {
  const { contentRef, handleBackdropClick } = useModalDismiss({
    isOpen: true,
    onClose,
  });

  // Filter branches in this district
  const districtBranches = useMemo(() => {
    return branches.filter(b => 
      b.districtId === district.id || 
      b.districtId === district.code || 
      (b.districtName && district.name && b.districtName.toLowerCase().trim() === district.name.toLowerCase().trim())
    );
  }, [branches, district]);

  // Filter employees in this district
  const districtEmployees = useMemo(() => {
    return employees.filter(e => 
      e.districtId === district.id || 
      e.districtId === district.code || 
      (e.districtName && district.name && e.districtName.toLowerCase().trim() === district.name.toLowerCase().trim())
    );
  }, [employees, district]);

  // District Director
  const districtDirector = useMemo(() => {
    return districtEmployees.find(e => e.role === 'DISTRICT_DIRECTOR') || {
      name: district.managerName || 'District Director',
      jobTitle: 'District Director',
      email: district.email || `${district.code?.toLowerCase() || 'district'}@bunnabanket.com`
    };
  }, [districtEmployees, district]);

  // Reports for branches in this district
  const districtBranchIds = useMemo(() => new Set(districtBranches.map(b => b.id)), [districtBranches]);
  const districtReports = useMemo(() => {
    return reports.filter(r => r.districtId === district.id || (r.branchId && districtBranchIds.has(r.branchId)));
  }, [reports, district, districtBranchIds]);

  const totalActual = useMemo(() => {
    return districtReports.reduce((sum, r) => sum + (r.actualValue || 0), 0);
  }, [districtReports]);

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
        <div className="bg-gradient-to-r from-[#5C3A21] via-[#4A2E1A] to-[#382213] text-white p-6 relative">
          <ModalCloseButton onClose={onClose} className="text-white hover:bg-white/10" />
          
          <div className="flex flex-wrap items-center justify-between gap-4 pr-10">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-1">
                <Building2 className="w-4 h-4" />
                <span>Bunna Bank Organizational Master Unit</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{district.name}</h2>
              <p className="text-amber-200/80 text-sm mt-0.5">
                {district.region || 'Regional Operation Scope'} • {district.type || 'District'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 border border-amber-400/40 text-amber-300">
                SOL ID: {district.solId || district.code || 'N/A'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                Active Status
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-amber-50/50 dark:bg-slate-800/60 border border-amber-200/60 dark:border-amber-900/40 p-4 rounded-xl">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Branches</span>
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {districtBranches.length || district.branchCount || 0}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Active Branch Outlets</span>
            </div>

            <div className="bg-amber-50/50 dark:bg-slate-800/60 border border-amber-200/60 dark:border-amber-900/40 p-4 rounded-xl">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Staff Roster</span>
                <Users className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {districtEmployees.length || district.totalEmployees || 0}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Assigned Personnel</span>
            </div>

            <div className="bg-amber-50/50 dark:bg-slate-800/60 border border-amber-200/60 dark:border-amber-900/40 p-4 rounded-xl">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">KPI Volume</span>
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {districtReports.length}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Approved Daily Reports</span>
            </div>

            <div className="bg-amber-50/50 dark:bg-slate-800/60 border border-amber-200/60 dark:border-amber-900/40 p-4 rounded-xl">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Performance</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalActual > 0 ? totalActual.toLocaleString() : '100%'}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Recorded Achievement</span>
            </div>
          </div>

          {/* District Director Info */}
          <div className="bg-gradient-to-r from-amber-900/5 to-amber-600/5 dark:from-amber-900/20 dark:to-amber-600/20 border border-amber-200/80 dark:border-amber-800/40 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#5C3A21] text-amber-400 flex items-center justify-center font-bold text-lg shadow-md">
                {(districtDirector as any).firstName ? (districtDirector as any).firstName.charAt(0) : 'D'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {(districtDirector as any).name || `${(districtDirector as any).firstName || ''} ${(districtDirector as any).lastName || ''}`.trim() || district.managerName}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {districtDirector.jobTitle || 'District Director'}
                </p>
                {district.phone && (
                  <p className="text-xs text-amber-800 dark:text-amber-400 font-mono mt-0.5">
                    📞 {district.phone}
                  </p>
                )}
              </div>
            </div>
            <span className="px-3 py-1 bg-[#5C3A21]/10 dark:bg-amber-400/20 text-[#5C3A21] dark:text-amber-300 text-xs font-semibold rounded-lg border border-[#5C3A21]/20 dark:border-amber-400/30">
              District Leadership
            </span>
          </div>

          {/* Branches List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-[#5C3A21] dark:text-amber-400" />
                <span>Assigned District Branches ({districtBranches.length})</span>
              </h3>
            </div>

            {districtBranches.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm">
                No branches currently listed under this district.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {districtBranches.map(b => (
                  <div 
                    key={b.id}
                    onClick={() => onSelectBranch && onSelectBranch(b)}
                    className="group bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#5C3A21] dark:group-hover:text-amber-400 transition-colors">
                          {b.name}
                        </span>
                        {b.solId && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                            {b.solId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {b.type || 'Branch'} • Manager: {b.managerName || 'Assigned Manager'}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#5C3A21] dark:group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Bunna Bank EPMS Organizational Data Hierarchy
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
