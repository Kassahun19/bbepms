import React, { useState, useEffect } from 'react';
import {
  Target,
  Users,
  CheckCircle2,
  Save,
  Sparkles,
  Building2,
  UserCheck,
  ShieldAlert,
  Layers,
  Send,
  Clock,
  XCircle,
  History,
  FileText,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';
import { User, PerformanceTarget, TargetStatus, getUserFullName } from '../../types';
import { api } from '../../services/api';
import { ModalCloseButton } from '../common/ModalCloseButton';
import { useModalDismiss } from '../../hooks/useModalDismiss';

interface BranchEmployeeTargetManagerProps {
  currentUser: User;
  employees: User[];
  targets: PerformanceTarget[];
  onTargetsUpdated?: () => void;
  onOpenAiSummary?: (employee: User) => void;
}

const DEFAULT_KPIS = [
  { kpiId: 'KPI-001', kpiCode: 'DEP-01', kpiName: 'Deposits Mobilized', unit: 'ETB', category: 'Financial', isCurrency: true, defaultVal: 5000000, weight: 25 },
  { kpiId: 'KPI-002', kpiCode: 'FCY-01', kpiName: 'Foreign Currency Inflow', unit: 'ETB', category: 'Financial', isCurrency: true, defaultVal: 1500000, weight: 15 },
  { kpiId: 'KPI-003', kpiCode: 'DFS-01', kpiName: 'Digital Financial Services', unit: 'ETB', category: 'Financial', isCurrency: true, defaultVal: 800000, weight: 10 },
  { kpiId: 'KPI-004', kpiCode: 'ACC-01', kpiName: 'Account Openings', unit: 'Accounts', category: 'Customer Acquisition', isCurrency: false, defaultVal: 450, weight: 15 },
  { kpiId: 'KPI-005', kpiCode: 'MB-01', kpiName: 'Mobile Banking Activations', unit: 'Users', category: 'Digital Banking', isCurrency: false, defaultVal: 350, weight: 10 },
  { kpiId: 'KPI-006', kpiCode: 'IB-01', kpiName: 'Internet Banking Activations', unit: 'Users', category: 'Digital Banking', isCurrency: false, defaultVal: 120, weight: 10 },
  { kpiId: 'KPI-007', kpiCode: 'MERCH-01', kpiName: 'Merchant Solutions & QR', unit: 'Merchants', category: 'Digital Banking', isCurrency: false, defaultVal: 30, weight: 10 },
  { kpiId: 'KPI-008', kpiCode: 'ATM-01', kpiName: 'ATM Card Activations', unit: 'Cards', category: 'Digital Banking', isCurrency: false, defaultVal: 280, weight: 5 },
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
  const [isSending, setIsSending] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Target values state keyed by kpiId
  const [targetValues, setTargetValues] = useState<Record<string, number>>({});

  // Audit history modal
  const [showAuditModal, setShowAuditModal] = useState(false);

  const { contentRef: auditModalRef, handleBackdropClick: handleAuditBackdropClick } = useModalDismiss({
    isOpen: showAuditModal,
    onClose: () => setShowAuditModal(false),
  });

  const selectedEmployee = branchEmployees.find(e => e.id === selectedEmployeeId) || branchEmployees[0];

  // Get current targets for selected employee
  const currentEmployeeTargets = targets.filter(t => {
    const tEmp = String(t.employeeId || t.employee_id || '').toLowerCase();
    return selectedEmployee && tEmp === selectedEmployee.id.toLowerCase();
  });

  // Calculate current status for selected employee
  const hasPending = currentEmployeeTargets.some(t => t.status === 'PENDING_ACCEPTANCE');
  const hasRejected = currentEmployeeTargets.some(t => t.status === 'REJECTED');
  const hasAccepted = currentEmployeeTargets.length > 0 && currentEmployeeTargets.every(t => !t.status || t.status === 'ACCEPTED');
  const hasDraft = currentEmployeeTargets.some(t => t.status === 'DRAFT');

  const employeeAgreementStatus: TargetStatus = 
    hasPending ? 'PENDING_ACCEPTANCE' :
    hasRejected ? 'REJECTED' :
    hasAccepted ? 'ACCEPTED' :
    hasDraft ? 'DRAFT' : 'DRAFT';

  // Find rejection reason if any
  const rejectedTarget = currentEmployeeTargets.find(t => t.status === 'REJECTED' && t.rejectionReason);

  // Load existing targets when selected employee changes
  useEffect(() => {
    if (!selectedEmployeeId) return;

    const initialMap: Record<string, number> = {};
    DEFAULT_KPIS.forEach(kpi => {
      // Find matching target for employee or branch
      const match = targets.find(t => 
        (String(t.employeeId || t.employee_id || '').toLowerCase() === selectedEmployeeId.toLowerCase()) &&
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

  // 1. Send Targets to Employee (Status becomes PENDING_ACCEPTANCE)
  const handleSendTargetsToEmployee = async () => {
    if (!selectedEmployee) {
      setErrorMessage('Please select a valid employee to assign targets.');
      return;
    }

    setIsSending(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload: PerformanceTarget[] = DEFAULT_KPIS.map(kpi => ({
        id: `TGT-${selectedEmployee.id}-${kpi.kpiId}`,
        kpiId: kpi.kpiId,
        kpiCode: kpi.kpiCode,
        kpiName: kpi.kpiName,
        kpiCategory: kpi.category,
        kpiUnit: kpi.unit,
        kpiWeight: kpi.weight,
        employeeId: selectedEmployee.id,
        employeeName: getUserFullName(selectedEmployee),
        branchId: selectedEmployee.branchId || currentUser.branchId || 'BR-360',
        branchName: selectedEmployee.branchName || currentUser.branchName || 'Hamusit Branch',
        period: targetPeriod,
        year: targetYear,
        targetValue: targetValues[kpi.kpiId] ?? kpi.defaultVal,
        status: 'PENDING_ACCEPTANCE',
        assignedBy: currentUser.id,
        assignedByName: getUserFullName(currentUser),
        sentBy: currentUser.id,
        sentByName: getUserFullName(currentUser)
      }));

      const res = await api.sendTargets({
        targets: payload,
        employeeId: selectedEmployee.id,
        branchId: currentUser.branchId,
        sentBy: currentUser.id,
        sentByName: getUserFullName(currentUser),
        notes: submissionNotes || (hasRejected ? 'Revised targets submitted following feedback' : 'Initial annual targets assignment')
      });

      setSuccessMessage(
        `Targets successfully sent to ${getUserFullName(selectedEmployee)}. Status is now "PENDING ACCEPTANCE". The employee has been notified to review and accept.`
      );

      setSubmissionNotes('');
      if (onTargetsUpdated) {
        onTargetsUpdated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send targets to employee.');
    } finally {
      setIsSending(false);
    }
  };

  // 2. Save Draft Targets (Status becomes DRAFT)
  const handleSaveDraft = async () => {
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
        kpiCode: kpi.kpiCode,
        kpiName: kpi.kpiName,
        kpiCategory: kpi.category,
        kpiUnit: kpi.unit,
        kpiWeight: kpi.weight,
        employeeId: selectedEmployee.id,
        employeeName: getUserFullName(selectedEmployee),
        branchId: selectedEmployee.branchId || currentUser.branchId || 'BR-360',
        branchName: selectedEmployee.branchName || currentUser.branchName || 'Hamusit Branch',
        period: targetPeriod,
        year: targetYear,
        targetValue: targetValues[kpi.kpiId] ?? kpi.defaultVal,
        status: 'DRAFT',
        assignedBy: currentUser.id,
        assignedByName: getUserFullName(currentUser)
      }));

      await api.saveTargets(payload);

      setSuccessMessage(
        `Draft targets saved locally for ${getUserFullName(selectedEmployee)}. Targets will not be sent to the employee until you click "Send KPI Targets".`
      );

      if (onTargetsUpdated) {
        onTargetsUpdated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save draft targets.');
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
              <UserCheck className="w-3.5 h-3.5" /> Target Allocation & Agreement Workflow Engine
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#C89A2B]" />
            Employee Target & KPI Assignments Manager
          </h3>
          <p className="text-xs text-gray-300">
            Define, review, and submit KPI targets to branch employees. Targets require employee acceptance to become active.
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

      {/* Two-Party Agreement Protocol Notice Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-black/40 via-[#6B3F1D]/40 to-black/40 border border-[#C89A2B]/30 text-gray-200 text-xs leading-relaxed space-y-1.5">
        <div className="flex items-center justify-between">
          <strong className="text-[#C89A2B] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> Two-Party KPI Agreement Protocol
          </strong>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
            System Rule Enforced
          </span>
        </div>
        <p className="text-[11px] text-gray-300">
          When you submit targets, they are set to <strong>PENDING ACCEPTANCE</strong>. The employee receives a notification and must officially <strong>ACCEPT</strong> or <strong>REJECT</strong> the proposed plan. Only <strong>ACCEPTED</strong> targets become active and drive dynamic performance scoring, speedometer gauges, and certificates.
        </p>
      </div>

      {/* Employee Selection & Agreement Status Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Employee Dropdown and Current Status Banner */}
        <div className="lg:col-span-2 bg-[#6B3F1D]/80 border border-[#C89A2B]/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#C89A2B] flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Select Branch Employee to Assign Targets:
            </label>
            {/* Agreement Status Badge */}
            <div>
              {employeeAgreementStatus === 'PENDING_ACCEPTANCE' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" /> PENDING ACCEPTANCE
                </span>
              )}
              {employeeAgreementStatus === 'ACCEPTED' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> TARGETS ACCEPTED & ACTIVE
                </span>
              )}
              {employeeAgreementStatus === 'REJECTED' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 border border-rose-400 text-rose-300 flex items-center gap-1 animate-pulse">
                  <XCircle className="w-3 h-3" /> REJECTED BY EMPLOYEE
                </span>
              )}
              {employeeAgreementStatus === 'DRAFT' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gray-500/20 border border-gray-400 text-gray-300 flex items-center gap-1">
                  DRAFT (UNSUBMITTED)
                </span>
              )}
            </div>
          </div>

          <select
            value={selectedEmployeeId}
            onChange={e => setSelectedEmployeeId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white font-bold focus:outline-none focus:border-[#C89A2B] cursor-pointer"
          >
            {branchEmployees.map(emp => {
              const empTgts = targets.filter(t => (t.employeeId || t.employee_id) === emp.id);
              const statusTag = empTgts.some(t => t.status === 'PENDING_ACCEPTANCE') ? '⏳ Pending' :
                                empTgts.some(t => t.status === 'REJECTED') ? '❌ Rejected' :
                                empTgts.length > 0 && empTgts.every(t => !t.status || t.status === 'ACCEPTED') ? '✅ Accepted' : '📝 Draft';

              return (
                <option key={emp.id} value={emp.id} className="bg-[#362011] text-white">
                  {getUserFullName(emp)} ({emp.jobTitle || 'Officer'}) — [{statusTag}]
                </option>
              );
            })}
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
              <div className="flex items-center space-x-2">
                {currentEmployeeTargets.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAuditModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 text-gray-300 font-bold text-[11px] flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-[#C89A2B]" />
                    <span>Audit Trail</span>
                  </button>
                )}

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
            </div>
          )}
        </div>

        {/* Manager Authority & Branch Quick Summary */}
        <div className="bg-[#6B3F1D]/80 border border-[#C89A2B]/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] uppercase text-gray-400 font-bold block">Branch Agreement Status</span>
            <span className="text-sm font-black text-white flex items-center gap-1 mt-0.5">
              <Building2 className="w-4 h-4 text-[#C89A2B]" /> {currentUser.branchName || 'Hamusit Branch'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 text-center bg-black/30 p-2 rounded-xl border border-white/10 text-[10px]">
            <div className="p-1">
              <span className="text-emerald-400 block font-black">
                {branchEmployees.filter(e => {
                  const empTgts = targets.filter(t => (t.employeeId || t.employee_id) === e.id);
                  return empTgts.length > 0 && empTgts.every(t => !t.status || t.status === 'ACCEPTED');
                }).length}
              </span>
              <span className="text-gray-400">Accepted</span>
            </div>
            <div className="p-1">
              <span className="text-amber-400 block font-black">
                {branchEmployees.filter(e => {
                  const empTgts = targets.filter(t => (t.employeeId || t.employee_id) === e.id);
                  return empTgts.some(t => t.status === 'PENDING_ACCEPTANCE');
                }).length}
              </span>
              <span className="text-gray-400">Pending</span>
            </div>
            <div className="p-1">
              <span className="text-rose-400 block font-black">
                {branchEmployees.filter(e => {
                  const empTgts = targets.filter(t => (t.employeeId || t.employee_id) === e.id);
                  return empTgts.some(t => t.status === 'REJECTED');
                }).length}
              </span>
              <span className="text-gray-400">Rejected</span>
            </div>
          </div>
        </div>
      </div>

      {/* REJECTION ALERT BOX (IF EMPLOYEE REJECTED) */}
      {hasRejected && rejectedTarget && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-white space-y-2 animate-in fade-in duration-200">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/30 text-rose-300 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-rose-300 uppercase tracking-wider">
                  Employee Rejected Proposed Targets
                </h4>
                {rejectedTarget.employeeResponseDate && (
                  <span className="text-[10px] text-gray-300">
                    {new Date(rejectedTarget.employeeResponseDate).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-200">
                {getUserFullName(selectedEmployee)} has rejected the previously proposed targets and provided the following explanation:
              </p>
              <div className="p-3 rounded-xl bg-black/50 border border-rose-500/30 text-xs text-rose-200 font-medium italic mt-1">
                "{rejectedTarget.rejectionReason}"
              </div>
              <p className="text-[11px] text-gray-300 pt-1">
                👉 <strong>Action Required:</strong> Review the feedback above, adjust the target values in the grid below, and click <strong>"Revise & Resubmit to Employee"</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Banners */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-xs text-emerald-300 hover:text-white">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-xs text-rose-200 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Target Input Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#C89A2B]" /> Set Target Values for Bunna Bank Core KPIs ({targetPeriod} - {targetYear})
          </h4>
          <span className="text-[11px] text-gray-400">
            Total Weight: <strong className="text-[#C89A2B]">100%</strong>
          </span>
        </div>

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
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                      {kpi.weight}%
                    </span>
                    <span className="text-[10px] text-gray-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                      {kpi.unit}
                    </span>
                  </div>
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

                {/* Live Automatic Period Allocation Breakdown */}
                {val > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10 bg-black/30 p-2 rounded-xl text-[10px] space-y-1">
                    <div className="text-[10px] text-[#C89A2B] font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>Automatic Period Allocations:</span>
                      <span className="text-gray-400 font-normal">Based on 300-day calendar</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      <div className="bg-white/5 p-1 rounded">
                        <span className="text-gray-400 block">Daily:</span>
                        <strong className="text-white">
                          {kpi.isCurrency ? 'ETB ' : ''}{(val / 300).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </strong>
                      </div>
                      <div className="bg-white/5 p-1 rounded">
                        <span className="text-gray-400 block">Weekly:</span>
                        <strong className="text-white">
                          {kpi.isCurrency ? 'ETB ' : ''}{(val / 52).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </strong>
                      </div>
                      <div className="bg-white/5 p-1 rounded">
                        <span className="text-gray-400 block">Monthly:</span>
                        <strong className="text-white">
                          {kpi.isCurrency ? 'ETB ' : ''}{(val / 12).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </strong>
                      </div>
                      <div className="bg-white/5 p-1 rounded">
                        <span className="text-gray-400 block">Quarterly:</span>
                        <strong className="text-white">
                          {kpi.isCurrency ? 'ETB ' : ''}{(val / 4).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </strong>
                      </div>
                      <div className="bg-white/5 p-1 rounded">
                        <span className="text-gray-400 block">Semi-Annual:</span>
                        <strong className="text-white">
                          {kpi.isCurrency ? 'ETB ' : ''}{(val / 2).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </strong>
                      </div>
                      <div className="bg-white/5 p-1 rounded">
                        <span className="text-gray-400 block">Annual:</span>
                        <strong className="text-[#C89A2B]">
                          {kpi.isCurrency ? 'ETB ' : ''}{val.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission Note Input */}
      <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2">
        <label className="block text-xs font-bold text-gray-300">
          Notes / Instructions for Employee (Optional):
        </label>
        <input
          type="text"
          value={submissionNotes}
          onChange={e => setSubmissionNotes(e.target.value)}
          placeholder="e.g. Adjusted targets to align with Q3 branch campaign focus on Mobile Banking and Merchant QR onboarding."
          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C89A2B]"
        />
      </div>

      {/* Primary Action Buttons */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#C89A2B]" />
          Submitting targets triggers an instant notification for the employee to review and agree.
        </p>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Save Draft Button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving || isSending}
            className="px-4 py-3 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/20 text-gray-300 font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-gray-400" />
            <span>{isSaving ? 'Saving Draft...' : 'Save Draft'}</span>
          </button>

          {/* Primary Submit Button */}
          <button
            type="button"
            onClick={handleSendTargetsToEmployee}
            disabled={isSaving || isSending}
            className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-[#C89A2B] text-[#6B3F1D] font-black text-xs shadow-xl hover:bg-[#D8B45C] active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isSending ? (
              <span>Submitting to Employee...</span>
            ) : hasRejected ? (
              <>
                <RotateCcw className="w-4 h-4 text-[#6B3F1D]" />
                <span>Revise & Resubmit to Employee</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#6B3F1D]" />
                <span>Send KPI Targets to Employee</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AUDIT TRAIL MODAL FOR BRANCH MANAGER */}
      {showAuditModal && (
        <div
          onClick={handleAuditBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
        >
          <div
            ref={auditModalRef}
            className="bg-[#4A2C17] border border-[#C89A2B] rounded-3xl p-6 max-w-xl w-full text-white space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-[#C89A2B]" />
                <h3 className="text-base font-black text-white">
                  Target Agreement History for {getUserFullName(selectedEmployee)}
                </h3>
              </div>
              <ModalCloseButton onClose={() => setShowAuditModal(false)} ariaLabel="Close target agreement history" />
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {currentEmployeeTargets.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No historical audit entries found.</p>
              ) : (
                currentEmployeeTargets.map((tgt, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-xs">{tgt.kpiName}</strong>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        tgt.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-300' :
                        tgt.status === 'PENDING_ACCEPTANCE' ? 'bg-amber-500/20 text-amber-300' :
                        tgt.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300' : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {tgt.status || 'ACCEPTED'}
                      </span>
                    </div>

                    {(tgt.auditHistory || []).map((entry, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-white/5 text-[11px] space-y-1">
                        <div className="flex justify-between text-[#C89A2B] font-bold">
                          <span>Action: {entry.action}</span>
                          <span className="text-gray-400">{new Date(entry.performedAt).toLocaleString()}</span>
                        </div>
                        <div className="text-gray-300">By: {entry.performedByName || entry.performedBy}</div>
                        {entry.notes && <div className="text-gray-400 italic">"{entry.notes}"</div>}
                        {entry.rejectionReason && (
                          <div className="text-rose-300 font-medium">Rejection Reason: "{entry.rejectionReason}"</div>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-5 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs"
              >
                Close Audit History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
