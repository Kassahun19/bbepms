import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Lock, User as UserIcon, CheckCircle, Mail, AlertCircle, ShieldAlert } from 'lucide-react';
import { UserRole, User } from '../../types';
import { api } from '../../services/api';
import { BunnaBankLogo } from '../common/BunnaBankLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onOpenRegister: () => void;
  selectedRoleHint?: UserRole | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenRegister,
  selectedRoleHint
}) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Failed Attempts & Lockout state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  // Clear credentials & state when modal opens or closes (logout/re-login clean slate)
  useEffect(() => {
    if (isOpen) {
      setUserId('');
      setPassword('');
      setError('');
      setShowPassword(false);
      setRememberMe(false);
      setFailedAttempts(0);
      setLockoutTimer(0);
      setForgotModalOpen(false);
      setForgotEmail('');
      setForgotSuccessMsg('');
    }
  }, [isOpen]);

  // Lockout countdown timer effect
  useEffect(() => {
    let timer: any;
    if (lockoutTimer > 0) {
      timer = setInterval(() => {
        setLockoutTimer(prev => {
          if (prev <= 1) {
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTimer]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    // Validate Input Formats
    const trimmedId = userId.trim();
    if (!trimmedId) {
      setError('Please enter your Staff / User ID.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.login(trimmedId, password);
      setFailedAttempts(0);
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      const newFailCount = failedAttempts + 1;
      setFailedAttempts(newFailCount);

      if (newFailCount >= 3) {
        setLockoutTimer(30);
        setError('Too many failed attempts. Security protocol triggered: Account access paused for 30 seconds.');
      } else {
        setError(err.message || `Invalid User ID or Password. (${3 - newFailCount} attempt(s) remaining)`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await api.forgotPassword(forgotEmail);
      setForgotSuccessMsg(res.message);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-start justify-center pt-6 sm:pt-12 md:pt-16 pb-8 px-4">
      <div className="w-full max-w-md bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl shadow-2xl text-white overflow-hidden p-6 sm:p-8 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C89A2B] via-[#D8B45C] to-[#6B3F1D] p-0.5 shadow-xl flex items-center justify-center mx-auto mb-3">
            <div className="w-full h-full bg-[#6B3F1D] rounded-[14px] p-2 flex items-center justify-center">
              <BunnaBankLogo className="w-10 h-10" variant="gold" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">Bunna Bank S.C.</h3>
          <p className="text-xs text-[#C89A2B] mt-0.5 font-semibold">EPMS Staff Portal Authentication</p>
        </div>

        {/* Lockout Warning Banner */}
        {lockoutTimer > 0 && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/60 text-rose-200 text-xs flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 animate-pulse" />
            <div>
              <p className="font-bold">Security Lockout Active</p>
              <p className="text-[11px] opacity-90">Please wait <strong className="text-white text-sm">{lockoutTimer}s</strong> before retrying credentials.</p>
            </div>
          </div>
        )}

        {error && lockoutTimer === 0 && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-gray-200 mb-1">User ID / Staff ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300">
                <UserIcon className="w-4 h-4 text-[#C89A2B]" />
              </div>
              <input
                type="text"
                required
                disabled={lockoutTimer > 0}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter Staff ID Number"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:border-[#C89A2B] focus:outline-none text-sm text-white placeholder-gray-300 font-medium disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-200">Password</label>
              {capsLockOn && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                  🔒 Caps Lock ON
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300">
                <Lock className="w-4 h-4 text-[#C89A2B]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={lockoutTimer > 0}
                value={password}
                onKeyDown={handleKeyDown}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/10 border border-white/20 focus:border-[#C89A2B] focus:outline-none text-sm text-white placeholder-gray-300 font-medium disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 text-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-[#C89A2B] focus:ring-0"
              />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              onClick={() => setForgotModalOpen(true)}
              className="text-[#C89A2B] font-semibold hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || lockoutTimer > 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] text-[#6B3F1D] font-extrabold text-sm shadow-xl hover:opacity-95 transition-all transform active:scale-95 mt-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating Credentials...' : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : 'Sign In to EPMS'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-xs text-gray-200">
            Need a new Bunna Bank staff account?{' '}
            <button
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="font-bold text-[#C89A2B] hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>

      </div>

      {/* Forgot Password Reset Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#6B3F1D] border border-[#C89A2B]/50 rounded-2xl p-6 relative text-white">
            <button
              onClick={() => { setForgotModalOpen(false); setForgotSuccessMsg(''); }}
              className="absolute top-4 right-4 p-1 rounded-lg bg-white/10 text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="font-bold text-lg text-white mb-2">Reset Password</h4>
            <p className="text-xs text-gray-200 mb-4">
              Enter your registered Bunna Bank email address. We will dispatch an email verification reset link.
            </p>

            {forgotSuccessMsg ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{forgotSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. employee.kebede@bunnabanksc.com"
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:border-[#C89A2B] text-xs text-white"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs"
                >
                  Send Reset Verification Email
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
