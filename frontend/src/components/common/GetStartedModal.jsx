import React from "react";
import { Shield, Briefcase, UserCheck } from "lucide-react";
import { BunnaBankLogo } from "./BunnaBankLogo";
import { ModalCloseButton } from "./ModalCloseButton";
import { useModalDismiss } from "../../hooks/useModalDismiss";

export const GetStartedModal = ({
  isOpen,
  onClose,
  onSelectRole,
  onOpenRegister
}) => {
  const { contentRef, handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose
  });

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center pt-6 sm:pt-12 md:pt-16 pb-8 px-4"
    >
      <div
        ref={contentRef}
        className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl text-gray-900 overflow-hidden p-6 sm:p-8 relative"
      >
        <div className="absolute top-5 right-5 z-10">
          <ModalCloseButton onClose={onClose} ariaLabel="Close role selection modal" />
        </div>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#541718] p-1.5 shadow-md flex items-center justify-center mx-auto mb-3">
            <BunnaBankLogo className="w-9 h-9" variant="gold" />
          </div>
          <h3 className="text-2xl font-bold text-[#541718]">Choose Login Role</h3>
          <p className="text-xs text-gray-500 mt-1">Select your access portal for Bunna Bank S.C. EPMS</p>
        </div>

        <div className="space-y-3">
          {/* Bank Super Admin Option */}
          <button
            onClick={() => onSelectRole("BANK_SUPER_ADMIN")}
            className="w-full p-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all flex items-center space-x-4 text-left group shadow-xs cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#541718] text-white flex items-center justify-center transition-colors shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-gray-900">Bank Super Admin</h4>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#541718]/10 text-[#541718] border border-[#541718]/20 rounded-full">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-gray-500">Master bank setup, executive structure, RBAC permissions, and security vault</p>
            </div>
          </button>

          {/* Administrator Role Option */}
          <button
            onClick={() => onSelectRole("ADMINISTRATOR")}
            className="w-full p-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all flex items-center space-x-4 text-left group shadow-xs cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#541718] text-white flex items-center justify-center transition-colors shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Administrator Portal</h4>
              <p className="text-xs text-gray-500">District management, KPI governance, system audit logs & analytics</p>
            </div>
          </button>

          {/* Manager Role Option */}
          <button
            onClick={() => onSelectRole("MANAGER")}
            className="w-full p-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all flex items-center space-x-4 text-left group shadow-xs cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#541718] text-white flex items-center justify-center transition-colors shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Branch Manager Portal</h4>
              <p className="text-xs text-gray-500">Daily report approvals, target assignments, performance reviews & comments</p>
            </div>
          </button>

          {/* Employee Role Option */}
          <button
            onClick={() => onSelectRole("EMPLOYEE")}
            className="w-full p-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all flex items-center space-x-4 text-left group shadow-xs cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#541718] text-white flex items-center justify-center transition-colors shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Employee Self-Service</h4>
              <p className="text-xs text-gray-500">Daily performance entry, digital activations tracker, achievements & AI guidance</p>
            </div>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600">
            Don't have an EPMS account yet?{" "}
            <button
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="font-bold text-[#541718] hover:underline cursor-pointer"
            >
              Create Account Now
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default GetStartedModal;
