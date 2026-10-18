import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Lock, User as UserIcon, CheckCircle, AlertCircle, ShieldAlert } from "lucide-react";
import { api } from "../../services/api";
import { BunnaBankLogo } from "../common/BunnaBankLogo";
import { ModalCloseButton } from "../common/ModalCloseButton";
import { useModalDismiss } from "../../hooks/useModalDismiss";
const QUICK_ROLES = [
  { key: "CEO", label: "CEO", id: "ceo", pass: "Ceo@2026!" },
  { key: "BOARD_OF_DIRECTORS", label: "Board", id: "board", pass: "Board@2026!" },
  { key: "CHIEF_OFFICER", label: "Chief", id: "chief", pass: "Chief@2026!" },
  { key: "DISTRICT_DIRECTOR", label: "Director", id: "director", pass: "District@2026!" },
  { key: "MANAGER", label: "Manager", id: "manager", pass: "Manager@2026!" },
  { key: "EMPLOYEE", label: "Employee", id: "4994", pass: "Kassahun@360" },
  { key: "BANK_SUPER_ADMIN", label: "Super Admin", id: "superadmin", pass: "SuperAdmin@2026!" }
];

export const LoginModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenRegister,
  selectedRoleHint
}) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (selectedRoleHint) {
        const found = QUICK_ROLES.find(r => r.key === selectedRoleHint || r.label.toLowerCase() === String(selectedRoleHint).toLowerCase());
        if (found) {
          setUserId(found.id);
          setPassword(found.pass);
        } else {
          setUserId("");
          setPassword("");
        }
      } else {
        setUserId("");
        setPassword("");
      }
      setError("");
      setShowPassword(false);
      setRememberMe(false);
      setFailedAttempts(0);
      setLockoutTimer(0);
      setForgotModalOpen(false);
      setForgotEmail("");
      setForgotSuccessMsg("");
    }
  }, [isOpen, selectedRoleHint]);
  useEffect(() => {
    let timer;
    if (lockoutTimer > 0) {
      timer = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1e3);
    }
    return () => clearInterval(timer);
  }, [lockoutTimer]);
  const handleKeyDown = (e) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    const trimmedId = userId.trim();
    if (!trimmedId) {
      setError("Please enter your User Name.");
      return;
    }
    if (!password) {
      setError("Please enter your account password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api.login(trimmedId, password);
      setFailedAttempts(0);
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      const newFailCount = failedAttempts + 1;
      setFailedAttempts(newFailCount);
      if (newFailCount >= 3) {
        setLockoutTimer(30);
        setError("Too many failed attempts. Security protocol triggered: Account access paused for 30 seconds.");
      } else {
        setError(err.message || `Invalid User Name or Password. (${3 - newFailCount} attempt(s) remaining)`);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await api.forgotPassword(forgotEmail);
      setForgotSuccessMsg(res.message);
    } catch (err) {
      setError(err.message);
    }
  };
  const { contentRef, handleBackdropClick } = useModalDismiss({
    isOpen: isOpen && !forgotModalOpen,
    onClose
  });
  const forgotContentRef = useRef(null);
  if (!isOpen) return null;
  return <div
    onClick={handleBackdropClick}
    className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-start justify-center pt-6 sm:pt-12 md:pt-16 pb-8 px-4"
  >
      <div
        ref={contentRef}
        className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl text-gray-900 overflow-hidden p-6 sm:p-8 relative"
      >
        <div className="absolute top-5 right-5 z-10">
          <ModalCloseButton onClose={onClose} ariaLabel="Close login dialog" />
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#541718] p-1.5 shadow-md flex items-center justify-center mx-auto mb-3">
            <BunnaBankLogo className="w-9 h-9" variant="gold" />
          </div>
          <h3 className="text-2xl font-bold text-[#541718]">Bunna Bank S.C.</h3>
          <p className="text-xs text-gray-500 mt-0.5 font-semibold">EPMS Staff Portal Authentication</p>
        </div>

        {/* Lockout Warning Banner */}
        {lockoutTimer > 0 && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-600 animate-pulse" />
            <div>
              <p className="font-bold">Security Lockout Active</p>
              <p className="text-[11px] opacity-90">Please wait <strong className="text-red-900 text-sm">{lockoutTimer}s</strong> before retrying credentials.</p>
            </div>
          </div>
        )}

        {error && lockoutTimer === 0 && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Role Fill Selector */}
        <div className="mb-4 p-3 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700 mb-2">
            <span>Quick Role Selector:</span>
            <span className="text-[10px] text-gray-500 font-normal">Tap to auto-fill</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ROLES.map((role) => (
              <button
                key={role.key}
                type="button"
                onClick={() => {
                  setUserId(role.id);
                  setPassword(role.pass);
                  setError("");
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  userId.toLowerCase() === role.id.toLowerCase()
                    ? "bg-[#541718] text-white shadow-xs"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">User Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <UserIcon className="w-4 h-4 text-[#541718]" />
              </div>
              <input
                type="text"
                required
                disabled={lockoutTimer > 0}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User Name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-[#541718] focus:ring-1 focus:ring-[#541718] focus:outline-none text-sm text-gray-900 placeholder-gray-400 font-medium disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700">Password</label>
              {capsLockOn && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  🔒 Caps Lock ON
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4 text-[#541718]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={lockoutTimer > 0}
                value={password}
                onKeyDown={handleKeyDown}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-[#541718] focus:ring-1 focus:ring-[#541718] focus:outline-none text-sm text-gray-900 placeholder-gray-400 font-medium disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-[#541718] focus:ring-[#541718]"
              />
              <span>Remember Me</span>
            </label>

            <button
              type="button"
              onClick={() => setForgotModalOpen(true)}
              className="text-[#541718] font-semibold hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || lockoutTimer > 0}
            className="w-full py-3 rounded-xl bg-[#541718] hover:bg-[#3d1011] text-white font-bold text-sm shadow-sm transition-all transform active:scale-95 mt-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Authenticating Credentials..." : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : "Sign In to EPMS"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-xs text-gray-600">
            Need a new Bunna Bank staff account?{" "}
            <button
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="font-bold text-[#541718] hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </p>
        </div>

      </div>

      {
    /* Forgot Password Reset Modal */
  }
      {forgotModalOpen && <div
    onClick={(e) => {
      if (forgotContentRef.current && !forgotContentRef.current.contains(e.target)) {
        setForgotModalOpen(false);
        setForgotSuccessMsg("");
      }
    }}
    className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
  >
          <div
            ref={forgotContentRef}
            className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-6 relative text-gray-900 shadow-2xl"
          >
            <div className="absolute top-4 right-4">
              <ModalCloseButton
                onClose={() => {
                  setForgotModalOpen(false);
                  setForgotSuccessMsg("");
                }}
                ariaLabel="Close forgot password dialog"
                size="sm"
              />
            </div>

            <h4 className="font-bold text-lg text-[#541718] mb-2">Reset Password</h4>
            <p className="text-xs text-gray-600 mb-4">
              Enter your registered Bunna Bank email address. We will dispatch an email verification reset link.
            </p>

            {forgotSuccessMsg ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
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
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 focus:border-[#541718] text-xs text-gray-900 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#541718] hover:bg-[#3d1011] text-white font-bold text-xs cursor-pointer"
                >
                  Send Reset Verification Email
                </button>
              </form>
            )}
          </div>
        </div>}

    </div>;
};
