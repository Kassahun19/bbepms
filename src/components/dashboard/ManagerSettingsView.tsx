import React, { useState } from 'react';
import {
  Settings,
  Lock,
  KeyRound,
  Bell,
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Clock,
  Filter,
  Smartphone,
  Mail,
  RotateCcw
} from 'lucide-react';
import { User, Language } from '../../types';
import { api } from '../../services/api';

interface ManagerSettingsViewProps {
  user: User;
  onUserUpdated?: (updatedUser: User) => void;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const ManagerSettingsView: React.FC<ManagerSettingsViewProps> = ({
  user,
  onUserUpdated,
  language = 'en',
  onLanguageChange
}) => {
  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Operational Preferences State
  const [defaultQueueFilter, setDefaultQueueFilter] = useState<'Pending' | 'All' | 'Approved'>('Pending');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<string>('30');
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [kpiAcceptanceAlerts, setKpiAcceptanceAlerts] = useState(true);
  const [dailyDigestEnabled, setDailyDigestEnabled] = useState(false);
  const [prefSaveSuccess, setPrefSaveSuccess] = useState(false);

  // Password requirement criteria
  const pwdCriteria = {
    minLen: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNum: /[0-9]/.test(newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(newPassword)
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentPassword) {
      setPwdError('Please enter your current account password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwdError('New Password and Confirm New Password do not match.');
      return;
    }

    if (!Object.values(pwdCriteria).every(Boolean)) {
      setPwdError('New password does not fulfill all security complexity requirements (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special symbol).');
      return;
    }

    setPwdLoading(true);

    try {
      const res = await api.changePassword({
        userId: user.id,
        currentPassword,
        newPassword
      });

      const updatedUser = res.user || { ...user, password: newPassword };
      setPwdSuccess(res.message || '✓ Manager password updated successfully! Use your new password for subsequent logins.');
      
      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }
      localStorage.setItem('bunna_user', JSON.stringify(updatedUser));

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPwdError(err.message || 'Failed to update password. Please verify your current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefSaveSuccess(true);
    setTimeout(() => setPrefSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Settings Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B4228] via-[#08321E] to-[#051F13] border border-[#D4AF37]/30 shadow-xl text-white">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Manager Settings & Security</h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Manage account authentication security, operational defaults, and notification preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security & Password Change */}
        <div className="p-6 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl text-white space-y-6">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-white/10">
            <KeyRound className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h3 className="font-extrabold text-lg text-white">Security & Password</h3>
              <p className="text-xs text-gray-300">Update your official Bunna EPMS manager password</p>
            </div>
          </div>

          {pwdSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{pwdSuccess}</span>
            </div>
          )}

          {pwdError && (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{pwdError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-[#D4AF37] mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-[#D4AF37] mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new secure password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Requirements Checklist */}
              <div className="mt-2 p-3 rounded-xl bg-black/30 border border-white/10 space-y-1.5 text-[11px]">
                <p className="font-bold text-gray-400">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <span className={`flex items-center space-x-1 ${pwdCriteria.minLen ? 'text-emerald-400' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>8+ characters</span>
                  </span>
                  <span className={`flex items-center space-x-1 ${pwdCriteria.hasUpper ? 'text-emerald-400' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>1 uppercase letter</span>
                  </span>
                  <span className={`flex items-center space-x-1 ${pwdCriteria.hasLower ? 'text-emerald-400' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>1 lowercase letter</span>
                  </span>
                  <span className={`flex items-center space-x-1 ${pwdCriteria.hasNum ? 'text-emerald-400' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>1 number</span>
                  </span>
                  <span className={`flex items-center space-x-1 ${pwdCriteria.hasSpecial ? 'text-emerald-400' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>1 special symbol</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-[#D4AF37] mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={pwdLoading}
                className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e0be4d] text-[#0B4228] font-black text-xs shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{pwdLoading ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Operational & Notification Preferences */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl text-white space-y-6">
            <div className="flex items-center space-x-2.5 pb-4 border-b border-white/10">
              <Filter className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <h3 className="font-extrabold text-lg text-white">Branch Operational Defaults</h3>
                <p className="text-xs text-gray-300">Customize your daily queue & operational views</p>
              </div>
            </div>

            {prefSaveSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>✓ Operational settings and preferences saved!</span>
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#D4AF37] mb-1">Default Daily Submissions Filter</label>
                <select
                  value={defaultQueueFilter}
                  onChange={(e: any) => setDefaultQueueFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Pending" className="bg-[#08321E]">Pending Reports (Recommended for review)</option>
                  <option value="All" className="bg-[#08321E]">All Submissions</option>
                  <option value="Approved" className="bg-[#08321E]">Approved Submissions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4AF37] mb-1">Queue Live Refresh Rate</label>
                <select
                  value={autoRefreshInterval}
                  onChange={(e) => setAutoRefreshInterval(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="15" className="bg-[#08321E]">Every 15 seconds</option>
                  <option value="30" className="bg-[#08321E]">Every 30 seconds</option>
                  <option value="60" className="bg-[#08321E]">Every 1 minute</option>
                </select>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-4 h-4" /> Manager Notifications & Alerts
                </h4>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10 cursor-pointer hover:bg-black/40">
                    <div className="flex items-center space-x-2.5">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <span>Email Alerts on New Employee Submissions</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlertsEnabled}
                      onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                      className="rounded border-white/20 text-[#D4AF37] focus:ring-0"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10 cursor-pointer hover:bg-black/40">
                    <div className="flex items-center space-x-2.5">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>SMS / In-App Alerts for KPI Target Acceptance & Rejections</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={kpiAcceptanceAlerts}
                      onChange={(e) => setKpiAcceptanceAlerts(e.target.checked)}
                      className="rounded border-white/20 text-[#D4AF37] focus:ring-0"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10 cursor-pointer hover:bg-black/40">
                    <div className="flex items-center space-x-2.5">
                      <Clock className="w-4 h-4 text-[#D4AF37]" />
                      <span>Daily 5:00 PM Branch Performance Digest</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={dailyDigestEnabled}
                      onChange={(e) => setDailyDigestEnabled(e.target.checked)}
                      className="rounded border-white/20 text-[#D4AF37] focus:ring-0"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e0be4d] text-[#0B4228] font-black text-xs shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
