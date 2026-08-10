import React from 'react';
import { X, Shield, Briefcase, UserCheck } from 'lucide-react';
import { UserRole } from '../../types';
import { BunnaBankLogo } from './BunnaBankLogo';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: UserRole) => void;
  onOpenRegister: () => void;
}

export const GetStartedModal: React.FC<GetStartedModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  onOpenRegister
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-start justify-center pt-6 sm:pt-12 md:pt-16 pb-8 px-4">
      <div className="w-full max-w-lg bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl shadow-2xl text-white overflow-hidden p-6 sm:p-8 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C89A2B] via-[#D8B45C] to-[#4A2C17] p-0.5 shadow-xl flex items-center justify-center mx-auto mb-3">
            <div className="w-full h-full bg-[#4A2C17] rounded-[14px] p-2 flex items-center justify-center">
              <BunnaBankLogo className="w-10 h-10" variant="gold" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">Choose Login Role</h3>
          <p className="text-xs text-[#C89A2B] mt-1">Select your access portal for Bunna Bank S.C. EPMS</p>
        </div>

        <div className="space-y-4">
          {/* Administrator Role Option */}
          <button
            onClick={() => onSelectRole('ADMINISTRATOR')}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#4A2C17] to-[#3B2312] hover:to-[#2E1B0E] border border-[#C89A2B]/30 hover:border-[#C89A2B] transition-all flex items-center space-x-4 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#C89A2B]/20 group-hover:bg-[#C89A2B] text-[#C89A2B] group-hover:text-[#6B3F1D] flex items-center justify-center transition-colors">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Administrator Portal</h4>
              <p className="text-xs text-gray-300">District management, KPI governance, system audit logs & analytics</p>
            </div>
          </button>

          {/* Manager Role Option */}
          <button
            onClick={() => onSelectRole('MANAGER')}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#4A2C17] to-[#3B2312] hover:to-[#2E1B0E] border border-[#C89A2B]/30 hover:border-[#C89A2B] transition-all flex items-center space-x-4 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#C89A2B]/20 group-hover:bg-[#C89A2B] text-[#C89A2B] group-hover:text-[#6B3F1D] flex items-center justify-center transition-colors">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Branch Manager Portal</h4>
              <p className="text-xs text-gray-300">Daily report approvals, target assignments, performance reviews & comments</p>
            </div>
          </button>

          {/* Employee Role Option */}
          <button
            onClick={() => onSelectRole('EMPLOYEE')}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#4A2C17] to-[#3B2312] hover:to-[#2E1B0E] border border-[#C89A2B]/30 hover:border-[#C89A2B] transition-all flex items-center space-x-4 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#C89A2B]/20 group-hover:bg-[#C89A2B] text-[#C89A2B] group-hover:text-[#6B3F1D] flex items-center justify-center transition-colors">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Employee Self-Service</h4>
              <p className="text-xs text-gray-300">Daily performance entry, digital activations tracker, achievements & AI guidance</p>
            </div>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-gray-300">
            Don't have an EPMS account yet?{' '}
            <button
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="font-bold text-[#C89A2B] hover:underline"
            >
              Create Account Now
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
