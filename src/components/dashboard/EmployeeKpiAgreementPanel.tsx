import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  Building2,
  Layers,
  ChevronDown,
  ChevronUp,
  History,
  ShieldCheck,
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';
import { User, PerformanceTarget, getUserFullName } from '../../types';
import { api } from '../../services/api';
import { ModalCloseButton } from '../common/ModalCloseButton';
import { useModalDismiss } from '../../hooks/useModalDismiss';

interface EmployeeKpiAgreementPanelProps {
  user: User;
  targets: PerformanceTarget[];
  onRefreshData: () => void;
}

export const EmployeeKpiAgreementPanel: React.FC<EmployeeKpiAgreementPanelProps> = ({
  user,
  targets,
  onRefreshData
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals state
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [targetToRespond, setTargetToRespond] = useState<PerformanceTarget | 'ALL' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<PerformanceTarget | null>(null);

  const { contentRef: acceptModalRef, handleBackdropClick: handleAcceptBackdropClick } = useModalDismiss({
    isOpen: showAcceptModal,
    onClose: () => setShowAcceptModal(false),
  });

  const isRejectDirty = rejectionReason.trim().length > 0;
  const { contentRef: rejectModalRef, handleBackdropClick: handleRejectBackdropClick, handleDismissRequest: requestRejectClose } = useModalDismiss({
    isOpen: showRejectModal,
    onClose: () => setShowRejectModal(false),
    hasUnsavedChanges: isRejectDirty,
    unsavedMessage: 'You have typed rejection feedback. Are you sure you want to discard and close?',
  });

  const { contentRef: historyModalRef, handleBackdropClick: handleHistoryBackdropClick } = useModalDismiss({
    isOpen: showHistoryModal && !!historyTarget,
    onClose: () => setShowHistoryModal(false),
  });

  // Filter targets assigned specifically to this employee
  const userLower = user.id.toLowerCase();
  const myTargets = targets.filter(t => {
    const tEmp = String(t.employeeId || t.employee_id || '').toLowerCase();
    return tEmp === userLower || (user.userId && tEmp === user.userId.toLowerCase());
  });

  const pendingTargets = myTargets.filter(t => t.status === 'PENDING_ACCEPTANCE');
  const acceptedTargets = myTargets.filter(t => !t.status || t.status === 'ACCEPTED');
  const rejectedTargets = myTargets.filter(t => t.status === 'REJECTED');
  const draftTargets = myTargets.filter(t => t.status === 'DRAFT');

  // Overall status of the agreement
  const overallAgreementStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NO_TARGETS' = 
    pendingTargets.length > 0 ? 'PENDING' :
    rejectedTargets.length > 0 ? 'REJECTED' :
    acceptedTargets.length > 0 ? 'ACCEPTED' : 'NO_TARGETS';

  const handleOpenAcceptModal = (target: PerformanceTarget | 'ALL') => {
    setTargetToRespond(target);
    setShowAcceptModal(true);
    setActionError(null);
  };

  const handleOpenRejectModal = (target: PerformanceTarget | 'ALL') => {
    setTargetToRespond(target);
    setRejectionReason('');
    setShowRejectModal(true);
    setActionError(null);
  };

  const handleConfirmAccept = async () => {
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      if (targetToRespond === 'ALL') {
        const targetIds = pendingTargets.map(t => t.id);
        const res = await api.batchRespondToTargets({
          targetIds,
          employeeId: user.id,
          employeeName: getUserFullName(user),
          action: 'ACCEPT'
        });
        setActionSuccess(res.message || 'All proposed KPI targets accepted and activated successfully!');
      } else if (targetToRespond) {
        const res = await api.respondToTarget(targetToRespond.id, {
          action: 'ACCEPT',
          employeeId: user.id,
          employeeName: getUserFullName(user)
        });
        setActionSuccess(res.message || `Target for ${targetToRespond.kpiName} accepted successfully!`);
      }

      setShowAcceptModal(false);
      setTargetToRespond(null);
      onRefreshData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to accept target(s). Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      setActionError('A clear rejection reason (at least 5 characters) is mandatory.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      if (targetToRespond === 'ALL') {
        const targetIds = pendingTargets.map(t => t.id);
        const res = await api.batchRespondToTargets({
          targetIds,
          employeeId: user.id,
          employeeName: getUserFullName(user),
          action: 'REJECT',
          rejectionReason: rejectionReason.trim()
        });
        setActionSuccess(res.message || 'KPI targets rejected and returned to Branch Manager with your reason.');
      } else if (targetToRespond) {
        const res = await api.respondToTarget(targetToRespond.id, {
          action: 'REJECT',
          rejectionReason: rejectionReason.trim(),
          employeeId: user.id,
          employeeName: getUserFullName(user)
        });
        setActionSuccess(res.message || `Target for ${targetToRespond.kpiName} rejected and returned to Branch Manager.`);
      }

      setShowRejectModal(false);
      setTargetToRespond(null);
      setRejectionReason('');
      onRefreshData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject target(s). Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Status Card */}
      <div className="bg-[#4A2C17] border border-[#C89A2B]/40 rounded-3xl p-6 shadow-2xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C89A2B]/20 border border-[#C89A2B]/40 text-[#C89A2B] uppercase tracking-wider">
                Two-Party Agreement Engine
              </span>
              {overallAgreementStatus === 'PENDING' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/50 text-amber-300 animate-pulse flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Action Required: Review & Respond
                </span>
              )}
              {overallAgreementStatus === 'ACCEPTED' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Official Active Targets Confirmed
                </span>
              )}
              {overallAgreementStatus === 'REJECTED' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 border border-rose-500/50 text-rose-300 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Targets Returned to Manager
                </span>
              )}
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
              <Target className="w-6 h-6 text-[#C89A2B]" />
              My Official KPI Targets & Agreement Workflow
            </h3>
            <p className="text-xs text-gray-300">
              Review, accept, or reject proposed annual KPI targets assigned by your Branch Manager.
            </p>
          </div>

          {/* Quick Stats Chips */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-center">
              <span className="text-[10px] text-gray-400 block uppercase font-bold">Pending</span>
              <strong className="text-sm text-amber-400 font-extrabold">{pendingTargets.length}</strong>
            </div>
            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-center">
              <span className="text-[10px] text-gray-400 block uppercase font-bold">Accepted</span>
              <strong className="text-sm text-emerald-400 font-extrabold">{acceptedTargets.length}</strong>
            </div>
            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-center">
              <span className="text-[10px] text-gray-400 block uppercase font-bold">Rejected</span>
              <strong className="text-sm text-rose-400 font-extrabold">{rejectedTargets.length}</strong>
            </div>
          </div>
        </div>

        {/* Global Feedback Notifications */}
        {actionSuccess && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-xs text-emerald-300 hover:text-white">✕</button>
          </div>
        )}

        {actionError && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-xs text-rose-200 hover:text-white">✕</button>
          </div>
        )}

        {/* PENDING ACCEPTANCE HERO BANNER WITH BULK ACTIONS */}
        {pendingTargets.length > 0 && (
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-amber-600/20 to-black/40 border border-amber-400/50 text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-300">
                    New Proposed Targets Awaiting Your Agreement ({pendingTargets.length} KPIs)
                  </h4>
                  <p className="text-xs text-gray-200 mt-0.5">
                    Your Branch Manager (<strong>{pendingTargets[0]?.assignedByName || pendingTargets[0]?.assignedBy || 'Branch Manager'}</strong>) has proposed new KPI targets for FY 2026. Please inspect the values below and provide your official sign-off.
                  </p>
                </div>
              </div>

              {/* Bulk Action Buttons */}
              <div className="flex items-center gap-2 sm:shrink-0">
                <button
                  onClick={() => handleOpenAcceptModal('ALL')}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg flex items-center space-x-1.5 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept All Proposed Targets</span>
                </button>

                <button
                  onClick={() => handleOpenRejectModal('ALL')}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg flex items-center space-x-1.5 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject All & Provide Reason</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REJECTED STATUS HERO BANNER */}
        {rejectedTargets.length > 0 && pendingTargets.length === 0 && (
          <div className="mt-6 p-5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-white space-y-2">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-rose-500/30 text-rose-300 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-rose-300">
                  Proposed KPI Targets Were Rejected and Returned to Branch Manager
                </h4>
                <p className="text-xs text-gray-200">
                  You rejected the proposed targets. The Branch Manager has been notified with your reason and will review, adjust the figures, and resubmit them for your acceptance.
                </p>
                {rejectedTargets[0]?.rejectionReason && (
                  <div className="mt-2 p-3 rounded-xl bg-black/40 border border-rose-500/30 text-xs text-rose-200">
                    <strong className="text-white block text-[11px] uppercase tracking-wider mb-1">Your Stated Rejection Reason:</strong>
                    "{rejectedTargets[0].rejectionReason}"
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACCEPTED STATUS HERO BANNER */}
        {acceptedTargets.length > 0 && pendingTargets.length === 0 && rejectedTargets.length === 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-white flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                All KPI Targets Confirmed & Active
              </h4>
              <p className="text-xs text-gray-300">
                Your KPI target agreement is active and finalized. Your daily performance reports, progress meters, and certificates are calibrated against these agreed numbers.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED KPI TARGET CARDS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C89A2B]" />
            Proposed & Active KPI Target Breakdown ({myTargets.length} Assigned Targets)
          </h4>
          <span className="text-xs text-gray-400">
            Fiscal Year 2026 • Bunna Bank S.C.
          </span>
        </div>

        {myTargets.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#4A2C17]/60 border border-[#C89A2B]/30 text-center space-y-3">
            <Target className="w-12 h-12 text-gray-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No Custom Targets Assigned Yet</h4>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Your Branch Manager has not yet published custom KPI targets for your profile. Default standard targets are currently used for baseline progress tracking.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myTargets.map(tgt => {
              const isPending = tgt.status === 'PENDING_ACCEPTANCE';
              const isAccepted = !tgt.status || tgt.status === 'ACCEPTED';
              const isRejected = tgt.status === 'REJECTED';
              const isDraft = tgt.status === 'DRAFT';
              const isCurrency = tgt.kpiUnit === 'ETB' || (tgt.kpiName && (tgt.kpiName.toLowerCase().includes('deposit') || tgt.kpiName.toLowerCase().includes('currency') || tgt.kpiName.toLowerCase().includes('financial')));

              return (
                <div
                  key={tgt.id}
                  className={`rounded-3xl p-5 border transition-all space-y-4 shadow-xl ${
                    isPending
                      ? 'bg-[#4A2C17] border-amber-400/60 ring-2 ring-amber-400/20'
                      : isRejected
                      ? 'bg-[#4A2C17]/80 border-rose-500/50'
                      : isAccepted
                      ? 'bg-[#4A2C17]/80 border-[#C89A2B]/40 hover:border-[#C89A2B]'
                      : 'bg-[#4A2C17]/60 border-white/10'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                          {tgt.kpiCode || tgt.kpiId}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {tgt.kpiCategory || 'Core Banking'}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-white mt-1">
                        {tgt.kpiName}
                      </h4>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isPending && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3" /> PENDING ACCEPTANCE
                        </span>
                      )}
                      {isAccepted && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ACCEPTED (ACTIVE)
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 border border-rose-400 text-rose-300 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> REJECTED
                        </span>
                      )}
                      {isDraft && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-500/20 border border-gray-400 text-gray-300 flex items-center gap-1">
                          DRAFT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Target Value Display */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Proposed Annual Target:</span>
                      <div className="text-xl font-black text-[#C89A2B] mt-0.5">
                        {isCurrency ? 'ETB ' : ''}{(tgt.annualTarget || tgt.targetValue || 0).toLocaleString()}
                        <span className="text-xs font-normal text-gray-400 ml-1">/{tgt.period || 'Annual'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Unit Type</span>
                      <span className="text-xs font-bold text-white">{tgt.kpiUnit || 'Count'}</span>
                    </div>
                  </div>

                  {/* Period Allocations Breakdown */}
                  {tgt.periodTargets && (
                    <div className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-1.5 text-[11px]">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Banking Calendar Period Breakdown:</span>
                      <div className="grid grid-cols-3 gap-1 text-[10px]">
                        <div className="bg-white/5 p-1.5 rounded-lg">
                          <span className="text-gray-400 block">Daily:</span>
                          <strong className="text-white">{isCurrency ? 'ETB ' : ''}{tgt.periodTargets.daily?.toLocaleString()}</strong>
                        </div>
                        <div className="bg-white/5 p-1.5 rounded-lg">
                          <span className="text-gray-400 block">Weekly:</span>
                          <strong className="text-white">{isCurrency ? 'ETB ' : ''}{tgt.periodTargets.weekly?.toLocaleString()}</strong>
                        </div>
                        <div className="bg-white/5 p-1.5 rounded-lg">
                          <span className="text-gray-400 block">Monthly:</span>
                          <strong className="text-white">{isCurrency ? 'ETB ' : ''}{tgt.periodTargets.monthly?.toLocaleString()}</strong>
                        </div>
                        <div className="bg-white/5 p-1.5 rounded-lg">
                          <span className="text-gray-400 block">Quarterly:</span>
                          <strong className="text-white">{isCurrency ? 'ETB ' : ''}{tgt.periodTargets.quarterly?.toLocaleString()}</strong>
                        </div>
                        <div className="bg-white/5 p-1.5 rounded-lg">
                          <span className="text-gray-400 block">Semi-Annual:</span>
                          <strong className="text-white">{isCurrency ? 'ETB ' : ''}{tgt.periodTargets.semiAnnual?.toLocaleString()}</strong>
                        </div>
                        <div className="bg-white/5 p-1.5 rounded-lg">
                          <span className="text-gray-400 block">Annual:</span>
                          <strong className="text-[#C89A2B]">{isCurrency ? 'ETB ' : ''}{tgt.periodTargets.annual?.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rejection Details if rejected */}
                  {isRejected && tgt.rejectionReason && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200 space-y-1">
                      <strong className="text-white block text-[10px] uppercase tracking-wider">Rejection Reason:</strong>
                      <p>"{tgt.rejectionReason}"</p>
                      {tgt.employeeResponseDate && (
                        <span className="text-[10px] text-gray-400 block pt-1">
                          Recorded: {new Date(tgt.employeeResponseDate).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-3.5 h-3.5 text-[#C89A2B]" />
                      <span>{tgt.branchName || user.branchName || 'Hamusit Branch'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {tgt.auditHistory && tgt.auditHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setHistoryTarget(tgt);
                            setShowHistoryModal(true);
                          }}
                          className="text-[11px] text-[#C89A2B] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <History className="w-3 h-3" /> Audit Trail ({tgt.auditHistory.length})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Individual Action Buttons if Pending */}
                  {isPending && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-400/20">
                      <button
                        onClick={() => handleOpenAcceptModal(tgt)}
                        disabled={isSubmitting}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center justify-center space-x-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Target</span>
                      </button>

                      <button
                        onClick={() => handleOpenRejectModal(tgt)}
                        disabled={isSubmitting}
                        className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md flex items-center justify-center space-x-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Target</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ACCEPTANCE CONFIRMATION MODAL */}
      {showAcceptModal && (
        <div
          onClick={handleAcceptBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
        >
          <div
            ref={acceptModalRef}
            className="bg-[#4A2C17] border border-[#C89A2B] rounded-3xl p-6 max-w-lg w-full text-white space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-emerald-400">
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Confirm Acceptance of KPI Targets
                  </h3>
                  <span className="text-xs text-gray-300">
                    Official Performance Agreement Sign-off
                  </span>
                </div>
              </div>
              <ModalCloseButton onClose={() => setShowAcceptModal(false)} ariaLabel="Close confirmation modal" />
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-gray-200 space-y-2 leading-relaxed">
              <p>
                {targetToRespond === 'ALL'
                  ? `You are about to officially accept all ${pendingTargets.length} proposed KPI target(s) for FY 2026.`
                  : `You are about to officially accept the target for ${targetToRespond?.kpiName}.`}
              </p>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Permanent Performance Rule:
                </div>
                <p>
                  Once accepted, these figures become your official active targets. Your daily performance reports, monthly achievement percentages, and certificate rankings will be evaluated directly against these numbers.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAcceptModal(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xl flex items-center space-x-2 active:scale-95 transition-all"
              >
                {isSubmitting ? (
                  <span>Activating Targets...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Accept Targets</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL (MANDATORY REASON) */}
      {showRejectModal && (
        <div
          onClick={handleRejectBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
        >
          <div
            ref={rejectModalRef}
            className="bg-[#4A2C17] border border-rose-500 rounded-3xl p-6 max-w-lg w-full text-white space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-rose-400">
                <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40">
                  <XCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Reject Proposed KPI Targets
                  </h3>
                  <span className="text-xs text-rose-300">
                    Mandatory Rejection Feedback for Branch Manager
                  </span>
                </div>
              </div>
              <ModalCloseButton onClose={requestRejectClose} ariaLabel="Close rejection feedback modal" />
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-gray-200 space-y-2 leading-relaxed">
              <p>
                {targetToRespond === 'ALL'
                  ? `You are rejecting all ${pendingTargets.length} proposed targets.`
                  : `You are rejecting the proposed target for ${targetToRespond?.kpiName}.`}
              </p>
              <p className="text-[11px] text-gray-400">
                Please clearly explain why the target is unachievable or requires adjustment (e.g. footfall conditions, market competition, unrealistic quota, role misalignment).
              </p>
            </div>

            {/* Mandatory Rejection Reason Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-rose-300 flex items-center justify-between">
                <span>Reason for Rejection * (Mandatory):</span>
                <span className="text-[10px] text-gray-400 font-normal">Min 5 characters</span>
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="State specific reasons and propose realistic alternative values if applicable..."
                className="w-full p-3 rounded-2xl bg-black/50 border border-rose-400/40 focus:border-rose-400 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={requestRejectClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isSubmitting || !rejectionReason.trim()}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-xl flex items-center space-x-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Returning to Manager...</span>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Submit Rejection & Return</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT TRAIL / HISTORY MODAL */}
      {showHistoryModal && historyTarget && (
        <div
          onClick={handleHistoryBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
        >
          <div
            ref={historyModalRef}
            className="bg-[#4A2C17] border border-[#C89A2B] rounded-3xl p-6 max-w-xl w-full text-white space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-[#C89A2B]" />
                <h3 className="text-base font-black text-white">
                  Target Agreement History & Audit Trail
                </h3>
              </div>
              <ModalCloseButton onClose={() => setShowHistoryModal(false)} ariaLabel="Close target agreement audit history" />
            </div>

            <div className="text-xs text-gray-300">
              Target for <strong>{historyTarget.kpiName}</strong> ({historyTarget.kpiCode || historyTarget.kpiId})
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {(historyTarget.auditHistory || []).map((entry, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-[#C89A2B] uppercase">
                      Action: {entry.action}
                    </span>
                    <span className="text-gray-400">
                      {new Date(entry.performedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-gray-300 text-[11px]">
                    Performed by: <strong className="text-white">{entry.performedByName || entry.performedBy}</strong>
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    Status transitioned to: <strong className="text-emerald-400">{entry.newStatus}</strong>
                  </div>
                  {entry.notes && (
                    <div className="p-2 rounded-lg bg-white/5 text-gray-300 text-[11px] mt-1">
                      {entry.notes}
                    </div>
                  )}
                  {entry.rejectionReason && (
                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-200 text-[11px] mt-1">
                      <strong>Rejection Reason:</strong> "{entry.rejectionReason}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
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
