import React, { useState } from 'react';
import {
  UserCheck,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Shield,
  Award,
  Calendar,
  MapPin,
  CheckCircle2,
  Save,
  KeyRound,
  Users,
  TrendingUp,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';
import { User, getUserFullName, PerformanceTarget, DailyPerformanceReport } from '../../types';
import { api } from '../../services/api';

interface ManagerProfileViewProps {
  user: User;
  employees: User[];
  reports?: DailyPerformanceReport[];
  targets?: PerformanceTarget[];
  onUserUpdated?: (updatedUser: User) => void;
  onOpenAiSummary?: (employee: User) => void;
}

export const ManagerProfileView: React.FC<ManagerProfileViewProps> = ({
  user,
  employees,
  reports = [],
  targets = [],
  onUserUpdated,
  onOpenAiSummary
}) => {
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [middleName, setMiddleName] = useState(user.middleName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [phone, setPhone] = useState(user.phone || '+251 911 234 567');
  const [email, setEmail] = useState(user.email || 'manager@bunnabanksc.com');
  const [emergencyContact, setEmergencyContact] = useState('+251 912 345 678');
  const [gender, setGender] = useState(user.gender || 'Male');
  const [bio, setBio] = useState('Experienced Branch Operations Manager with over 10 years of banking leadership, deposit mobilization, and team performance optimization at Bunna Bank.');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter employees belonging to manager's branch
  const branchEmployees = employees.filter(e => {
    if (e.role !== 'EMPLOYEE') return false;
    if (!user.branchId && !user.branchName) return true;
    const sameBranchId = user.branchId && e.branchId && user.branchId === e.branchId;
    const sameBranchName = user.branchName && e.branchName && user.branchName.trim().toLowerCase() === e.branchName.trim().toLowerCase();
    return Boolean(sameBranchId || sameBranchName);
  });

  // Calculate manager overview stats
  const branchReports = reports.filter(r => {
    if (!user.branchId && !user.branchName) return true;
    const sameBranchId = user.branchId && r.branchId && user.branchId === r.branchId;
    const sameBranchName = user.branchName && r.branchName && user.branchName.trim().toLowerCase() === r.branchName.trim().toLowerCase();
    return Boolean(sameBranchId || sameBranchName);
  });

  const approvedReports = branchReports.filter(r => r.status === 'Approved');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/employees/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          email,
          phone,
          gender
        })
      });

      if (res.ok) {
        const updated = await res.json();
        if (onUserUpdated) onUserUpdated(updated);
        localStorage.setItem('bunna_user', JSON.stringify(updated));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update manager profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B4228] via-[#08321E] to-[#051F13] border border-[#D4AF37]/30 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#0B4228] p-1 shadow-2xl flex items-center justify-center">
              <div className="w-full h-full bg-[#08321E] rounded-[14px] flex items-center justify-center text-3xl font-black text-[#D4AF37]">
                {user.firstName[0]}{(user.middleName || user.lastName || '')[0]}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-white">{getUserFullName(user)}</h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] uppercase tracking-wider flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  Branch Operations Manager
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{user.branchName || 'Branch'} • {user.districtName || 'District Area Office'} • Bunna Bank S.C.</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 mt-2">
                <span>Staff ID: <strong className="text-[#D4AF37] font-mono">{user.userId || user.id}</strong></span>
                <span>•</span>
                <span>Supervision: <strong className="text-emerald-400">{branchEmployees.length} Staff Assigned</strong></span>
                <span>•</span>
                <span>Status: <strong className="text-emerald-400">Active Manager</strong></span>
              </div>
            </div>
          </div>

          {onOpenAiSummary && (
            <button
              onClick={() => onOpenAiSummary(user)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#e0be4d] text-[#0B4228] font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-[#0B4228]" />
              <span>AI Manager Profile Summary</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#08321E] border border-[#D4AF37]/30 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Supervised Staff</span>
            <Users className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{branchEmployees.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Assigned branch roster</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#08321E] border border-[#D4AF37]/30 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Reports Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{approvedReports.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Total validated submissions</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#08321E] border border-[#D4AF37]/30 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Assigned Targets</span>
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="text-2xl font-black text-[#D4AF37] mt-2">{targets.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Active & pending targets</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#08321E] border border-[#D4AF37]/30 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Manager Authority</span>
            <Shield className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="text-2xl font-black text-white mt-2">Level II</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Full Branch Operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal & Professional Information Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-extrabold text-lg text-white">Manager Profile Information</h3>
              </div>
              <span className="text-xs text-gray-400">Manage your official contact & identity</span>
            </div>

            {saveSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>✓ Profile information successfully updated and synced across Bunna EPMS!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#D4AF37] mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4AF37] mb-1">Middle Name (Father)</label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4AF37] mb-1">Last Name (Grandfather)</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#D4AF37] mb-1">Official Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4AF37] mb-1">Work Phone / Mobile</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#D4AF37] mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Male" className="bg-[#08321E]">Male</option>
                    <option value="Female" className="bg-[#08321E]">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4AF37] mb-1">Emergency Contact Number</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4AF37] mb-1">Executive Summary / Leadership Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37] resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e0be4d] text-[#0B4228] font-black text-xs shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Professional Details & Manager Authority Scope */}
        <div className="space-y-6">
          {/* Professional Authority Scope */}
          <div className="p-6 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl text-white space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
              <h4 className="font-extrabold text-sm text-white">Managerial Scope & Authority</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-1">
                <span className="text-gray-400 text-[11px] block">Supervisory Branch Unit</span>
                <p className="font-bold text-white text-sm">{user.branchName || 'Bunna Bank Bole Branch'}</p>
                <p className="text-[#D4AF37] text-[11px]">{user.districtName || 'Addis Ababa East District'}</p>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-1">
                <span className="text-gray-400 text-[11px] block">Role Permissions</span>
                <ul className="text-gray-300 text-[11px] space-y-1 list-disc pl-4">
                  <li>Daily KPI Performance Approval & Rejection</li>
                  <li>Branch Target Definition & Employee Allocation</li>
                  <li>Direct & Broadcast Messaging with Staff</li>
                  <li>Team Roster & Performance Analytics Oversight</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 text-[11px] block">Approval Threshold</span>
                  <span className="font-bold text-emerald-400">ETB 10,000,000 / Day</span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Badges & Recognition */}
          <div className="p-6 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl text-white space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
              <Award className="w-5 h-5 text-[#D4AF37]" />
              <h4 className="font-extrabold text-sm text-white">Badges & Recognition</h4>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-black/30 border border-[#D4AF37]/30 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Excellence in Branch Leadership</p>
                  <p className="text-[10px] text-gray-400">Awarded for 100%+ target realization in FY 2024/25</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Top Deposit Mobilizer</p>
                  <p className="text-[10px] text-gray-400">Ranked #1 in district for Q2 deposit campaigns</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Zero-Error Compliance Badge</p>
                  <p className="text-[10px] text-gray-400">100% on-time daily audit & report verification</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
