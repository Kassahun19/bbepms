import React, { useState } from 'react';
import { Search, User, Building, MapPin, Target, FileText } from 'lucide-react';
import { getUserFullName } from '../../types';
import { ModalCloseButton } from './ModalCloseButton';
import { useModalDismiss } from '../../hooks/useModalDismiss';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: any[];
  branches: any[];
  districts: any[];
  reports: any[];
  kpis: any[];
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  employees,
  branches,
  districts,
  reports,
  kpis
}) => {
  const [query, setQuery] = useState('');

  const { contentRef, handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose,
  });

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedEmployees = q ? employees.filter(e => 
    (e.firstName || '').toLowerCase().includes(q) || 
    (e.middleName && e.middleName.toLowerCase().includes(q)) || 
    (e.lastName || '').toLowerCase().includes(q) || 
    (e.jobTitle || '').toLowerCase().includes(q) ||
    (e.userId || '').toLowerCase().includes(q)
  ) : [];
  const matchedBranches = q ? branches.filter(b => 
    (b.name || '').toLowerCase().includes(q) || 
    (b.code || '').toLowerCase().includes(q) ||
    (b.solId || '').toLowerCase().includes(q)
  ) : [];
  const matchedDistricts = q ? districts.filter(d => 
    (d.name || '').toLowerCase().includes(d.name ? q : '') || 
    (d.region || '').toLowerCase().includes(d.region ? q : '') ||
    (d.code || '').toLowerCase().includes(d.code ? q : '')
  ) : [];
  const matchedReports = q ? reports.filter(r => 
    (r.employeeName || '').toLowerCase().includes(q) || 
    (r.reportDate || '').includes(q) || 
    (r.status || '').toLowerCase().includes(q) ||
    (r.branchName || '').toLowerCase().includes(q)
  ) : [];
  const matchedKPIs = q ? kpis.filter(k => 
    (k.name || '').toLowerCase().includes(q) || 
    (k.code || '').toLowerCase().includes(q)
  ) : [];

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-start justify-center pt-20 px-4"
    >
      <div
        ref={contentRef}
        className="w-full max-w-2xl bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-2xl shadow-2xl text-white overflow-hidden"
      >
        
        {/* Search Bar Input */}
        <div className="p-4 border-b border-white/10 flex items-center space-x-3 bg-[#4A2C17]">
          <Search className="w-5 h-5 text-[#C89A2B] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees, branches, districts, reports, KPIs, dates..."
            className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm font-medium"
            autoFocus
          />
          <ModalCloseButton
            onClose={onClose}
            ariaLabel="Close search modal"
            size="sm"
            variant="ghost"
          />
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-5">
          {!query ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              Type employee name, branch, district, date (e.g., 2026-07-27), or KPI code...
            </div>
          ) : (
            <>
              {/* Employees */}
              {matchedEmployees.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#C89A2B] uppercase tracking-wider mb-2 flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Employees ({matchedEmployees.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedEmployees.map(e => (
                      <div key={e.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">{getUserFullName(e)}</p>
                          <p className="text-gray-400 text-[10px]">{e.jobTitle} • {e.branchName}</p>
                        </div>
                        <span className="bg-[#C89A2B]/20 text-[#C89A2B] px-2 py-0.5 rounded-md text-[10px] font-semibold">{e.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Branches */}
              {matchedBranches.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#C89A2B] uppercase tracking-wider mb-2 flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>Branches ({matchedBranches.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedBranches.map(b => (
                      <div key={b.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">{b.name} ({b.code})</p>
                          <p className="text-gray-400 text-[10px]">{b.districtName} • Manager: {b.managerName}</p>
                        </div>
                        <span className="text-xs font-bold text-[#C89A2B]">{b.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Districts */}
              {matchedDistricts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#C89A2B] uppercase tracking-wider mb-2 flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Districts ({matchedDistricts.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedDistricts.map(d => (
                      <div key={d.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">{d.name}</p>
                          <p className="text-gray-400 text-[10px]">Region: {d.region} • Branches: {d.branchCount}</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400">{d.totalEmployees} Employees</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reports */}
              {matchedReports.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#C89A2B] uppercase tracking-wider mb-2 flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Daily Reports ({matchedReports.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedReports.map(r => (
                      <div key={r.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">{r.employeeName} ({r.reportDate})</p>
                          <p className="text-gray-400 text-[10px]">Deposits: ETB {r.depositsETB?.toLocaleString()} • Mobile: {r.mobileBankingActivations}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KPIs */}
              {matchedKPIs.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#C89A2B] uppercase tracking-wider mb-2 flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>KPIs ({matchedKPIs.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedKPIs.map(k => (
                      <div key={k.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">{k.name} ({k.code})</p>
                          <p className="text-gray-400 text-[10px]">{k.description}</p>
                        </div>
                        <span className="text-xs font-bold text-[#C89A2B]">{k.weight}% Weight</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedEmployees.length === 0 && matchedBranches.length === 0 && matchedDistricts.length === 0 && matchedReports.length === 0 && matchedKPIs.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-xs">
                  No matching records found for "{query}".
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
