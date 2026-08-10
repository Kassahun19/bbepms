import React, { useState, useEffect } from 'react';
import { Target, Users, CheckCircle2, Save, Sparkles, Building2, UserCheck, ShieldAlert, Layers } from 'lucide-react';
import { User, PerformanceTarget, getUserFullName } from '../../types';
import { api } from '../../services/api';

interface BranchEmployeeTargetManagerProps {
  currentUser: User;
  employees: User[];
  targets: PerformanceTarget[];
  onTargetsUpdated?: () => void;
  onOpenAiSummary?: (employee: User) => void;
}

const DEFAULT_KPIS = [
  { kpiId: 'KPI-001', kpiName: 'Deposits Mobilized', unit: 'ETB', category: 'Financial', isCurrency: true, defaultVal: 0 },
  { kpiId: 'KPI-002', kpiName: 'Foreign Currency Inflow', unit: 'ETB', category: 'Financial', isCurrency: true, defaultVal: 0 },
  { kpiId: 'KPI-003', kpiName: 'Digital Financial Services', unit: 'ETB', category: 'Financial', isCurrency: true, defaultVal: 0 },
  { kpiId: 'KPI-004', kpiName: 'Account Openings', unit: 'Accounts', category: 'Customer Acquisition', isCurrency: false, defaultVal: 0 },
  { kpiId: 'KPI-005', kpiName: 'Mobile Banking Activations', unit: 'Users', category: 'Digital Banking', isCurrency: false, defaultVal: 0 },
  { kpiId: 'KPI-006', kpiName: 'Internet Banking Activations', unit: 'Users', category: 'Digital Banking', isCurrency: false, defaultVal: 0 },
  { kpiId: 'KPI-007', kpiName: 'Merchant Solutions & QR', unit: 'Merchants', category: 'Digital Banking', isCurrency: false, defaultVal: 0 },
  { kpiId: 'KPI-008', kpiName: 'ATM Card Activations', unit: 'Cards', category: 'Digital Banking', isCurrency: false, defaultVal: 0 },
];

export const BranchEmployeeTargetManager: React.FC<BranchEmployeeTargetManagerProps> = ({
  currentUser,
  employees,
  targets,
  onTargetsUpdated,
  onOpenAiSummary
}) => {
  // Filter employees for manager's branch, strictly excluding branch managers and Negash Adugna
  const branchEmployees = employees.filter(e => {
    const fullName = `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase();
    if (
      e.role === 'MANAGER' ||
      e.roleType === 'Managerial' ||
      (e.jobTitle && e.jobTitle.toLowerCase().includes('manager')) ||
      fullName.includes('negash') ||
      fullName.includes('adugna')
    ) {
      return false;
    }
    if (currentUser.role === 'ADMINISTRATOR') return true;
    if (!currentUser.branchId) return true;
    return e.branchId === currentUser.branchId || e.branchName === currentUser.branchName;
  });

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    branchEmployees[0]?.id || currentUser.id
  );
  const [targetPeriod, setTargetPeriod] = useState<'Annual' | 'Quarterly' | 'Monthly'>('Annual');
  const [targetYear] = useState<number>(2026);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Target values state keyed by kpiId
  const [targetValues, setTargetValues] = useState<Record<string, number>>({});

  const selectedEmployee = branchEmployees.find(e => e.id === selectedEmployeeId) || branchEmployees[0];

  // Load existing targets when selected employee changes
  useEffect(() => {
    if (!selectedEmployeeId) return;

    const initialMap: Record<string, number> = {};
    DEFAULT_KPIS.forEach(kpi => {
      // Find matching target for employee or branch
      const match = targets.find(t => 
        (t.employeeId === selectedEmployeeId || t.branchId === currentUser.branchId) &&
        (t.kpiId === kpi.kpiId || (t.kpiName && kpi.kpiName && t.kpiName.toLowerCase().includes(kpi.kpiName.toLowerCase())))
      );
      initialMap[kpi.kpiId] = match ? match.targetValue : kpi.defaultVal;
    });

    setTargetValues(initialMap);
  }, [selectedEmployeeId, targets, currentUser.branchId]);

  const handleInputChange = (kpiId: string, value: string) => {
    const num = Number(value.replace(/,/g, '')) || 0;
    setTargetValues(prev => ({
      ...prev,
      [kpiId]: num
    }));
  };

  const handleSaveAndFeedTargets = async () => {
    if (!selectedEmployee) {
      setErrorMessage('Please select a valid employee to assign targets.');
      return;
    }

    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload: PerformanceTarget[] = DEFAULT_KPIS.map(kpi => ({
        id: `TGT-${selectedEmployee.id}-${kpi.kpiId}`,
        kpiId: kpi.kpiId,
        kpiName: kpi.kpiName,
        employeeId: selectedEmployee.id,
        branchId: selectedEmployee.branchId || currentUser.branchId || 'BR-001',
        period: targetPeriod,
        year: targetYear,
        targetValue: targetValues[kpi.kpiId] || kpi.defaultVal
      }));

      await api.saveTargets(payload);

      setSuccessMessage(
        `Target & KPI Assignments successfully fed to ${getUserFullName(selectedEmployee)} (${selectedEmployee.jobTitle || 'Staff'}).`
      );

      if (onTargetsUpdated) {
        onTargetsUpdated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save employee targets');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#4A2C17] border border-[#C89A2B]/40 rounded-3xl p-6 shadow-2xl text-white space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C89A2B]/20 border border-[#C89A2B]/40 text-[#C89A2B] uppercase tracking-wider">
              Branch Manager Control Center
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> Target Allocation & Feeding Engine
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#C89A2B]" />
            Employee Target & KPI Assignments Manager
          </h3>
          <p className="text-xs text-gray-300">
            Feed individual target goals to branch employees. Assigned targets directly calibrate employee dashboards & KPI achievements.
          </p>
        </div>

        {/* Target Period Selector */}
        <div className="flex items-center space-x-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 text-xs font-bold">
          <span className="text-gray-400 px-2 text-[11px]">Period:</span>
          {(['Annual', 'Quarterly', 'Monthly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setTargetPeriod(p)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                targetPeriod === p
                  ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Notice Banner explaining calendar breakdown */}
      <div className="p-4 rounded-2xl bg-black/20 border border-[#C89A2B]/30 text-gray-300 text-xs leading-relaxed space-y-1">
        <strong className="text-[#C89A2B] uppercase text-[10px] tracking-wider block">Automated Calendar Target Breakdown System</strong>
        <p>
          The system automatically converts the annual plans you enter below into <strong>Daily</strong>, <strong>Weekly</strong>, <strong>Monthly</strong>, <strong>Quarterly</strong>, and <strong>Semi-Annual</strong> period targets based on the official banking calendar (excluding Sundays and official holidays). Any unsubmitted valid reporting days are recorded as 0 achievement against these calibrated targets, ensuring precise dynamic performance calculations.
        </p>
      </div>

      {/* Employee Selection & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Employee Dropdown */}
        <div className="md:col-span-2 bg-[#6B3F1D]/80 border border-[#C89A2B]/30 rounded-2xl p-4 space-y-2">
          <label className="block text-xs font-bold text-[#C89A2B] flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Select Branch Employee to Feed Targets:
          </label>
          <select
            value={selectedEmployeeId}
            onChange={e => setSelectedEmployeeId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white font-bold focus:outline-none focus:border-[#C89A2B] cursor-pointer"
          >
            {branchEmployees.map(emp => (
              <option key={emp.id} value={emp.id} className="bg-[#362011] text-white">
                {getUserFullName(emp)} — {emp.jobTitle || 'Banking Officer'} ({emp.branchName || 'Branch Staff'})
              </option>
            ))}
          </select>
          {selectedEmployee && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-300 pt-1">
              <div className="flex items-center space-x-3">
                <span>Staff ID: <strong className="text-white">{selectedEmployee.id}</strong></span>
                <span>•</span>
                <span>Branch: <strong className="text-[#C89A2B]">{selectedEmployee.branchName || currentUser.branchName}</strong></span>
                <span>•</span>
                <span>Role: <strong className="text-emerald-400">{selectedEmployee.role}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenAiSummary && selectedEmployee) {
                    onOpenAiSummary(selectedEmployee);
                  }
                }}
                className="px-3 py-1 rounded-lg bg-[#C89A2B] hover:bg-[#D8B45C] text-[#6B3F1D] font-bold text-[11px] flex items-center space-x-1 shadow transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Performance Summary</span>
              </button>
            </div>
          )}
        </div>

        {/* Manager Badge Info */}
        <div className="bg-[#6B3F1D]/80 border border-[#C89A2B]/30 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase text-gray-400 font-bold block">Manager Authority</span>
            <span className="text-sm font-black text-white flex items-center gap-1 mt-0.5">
              <Building2 className="w-4 h-4 text-[#C89A2B]" /> {currentUser.branchName || 'Headquarters'}
            </span>
          </div>
          <div className="text-[11px] text-emerald-300 font-medium flex items-center gap-1 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Direct sync with Employee Home Dashboard
          </div>
        </div>
      </div>

      {/* Feedback Banners */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center space-x-2 shadow-lg">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Target Input Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#C89A2B]" /> Set Target Values for Bunna Bank Core KPIs ({targetPeriod} - {targetYear})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {DEFAULT_KPIS.map(kpi => {
            const val = targetValues[kpi.kpiId] ?? kpi.defaultVal;
            return (
              <div
                key={kpi.kpiId}
                className="p-3.5 rounded-2xl bg-[#6B3F1D]/60 border border-white/10 hover:border-[#C89A2B]/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C89A2B]" />
                    {kpi.kpiName}
                  </span>
                  <span className="text-[10px] text-gray-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                    {kpi.unit}
                  </span>
                </div>

                <div className="relative">
                  {kpi.isCurrency && (
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-[#C89A2B]">
                      ETB
                    </span>
                  )}
                  <input
                    type="number"
                    min="0"
                    step={kpi.isCurrency ? "10000" : "1"}
                    value={val}
                    onChange={e => handleInputChange(kpi.kpiId, e.target.value)}
                    className={`w-full py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-white font-extrabold focus:outline-none focus:border-[#C89A2B] ${
                      kpi.isCurrency ? 'pl-12 pr-3' : 'px-3'
                    }`}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Category: {kpi.category}</span>
                  <span className="text-emerald-400">Target Period: {targetPeriod}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#C89A2B]" />
          Feeding targets updates the employee's personal speedometer, progress chart, & certificates.
        </p>

        <button
          onClick={handleSaveAndFeedTargets}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#C89A2B] text-[#6B3F1D] font-black text-xs shadow-xl hover:bg-[#D8B45C] active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isSaving ? (
            <span>Saving & Syncing Target Feed...</span>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#6B3F1D]" />
              <span>Save & Feed Employee Targets</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
