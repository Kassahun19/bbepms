import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  KeyRound, 
  CheckCircle2, 
  Ban, 
  Eye, 
  X, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Building2, 
  AlertTriangle, 
  Lock,
  UserCheck
} from 'lucide-react';
import { User, getUserFullName } from '../../types';
import { api } from '../../services/api';

interface BranchEmployeeManagementPanelProps {
  currentUser: User;
  employees: User[];
  onRefreshData: () => void;
  onOpenAiSummary?: (employee: User) => void;
}

export const BranchEmployeeManagementPanel: React.FC<BranchEmployeeManagementPanelProps> = ({
  currentUser,
  employees,
  onRefreshData,
  onOpenAiSummary
}) => {
  // Filter employees belonging strictly to manager's branch
  const branchEmployees = employees.filter(e => {
    if (e.role !== 'EMPLOYEE') return false;
    if (!currentUser.branchId && !currentUser.branchName) return true;
    const sameBranchId = currentUser.branchId && e.branchId && currentUser.branchId === e.branchId;
    const sameBranchName = currentUser.branchName && e.branchName && currentUser.branchName.trim().toLowerCase() === e.branchName.trim().toLowerCase();
    return Boolean(sameBranchId || sameBranchName);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<User | null>(null);
  const [resetPwdEmployee, setResetPwdEmployee] = useState<User | null>(null);
  const [deleteConfirmEmployee, setDeleteConfirmEmployee] = useState<User | null>(null);

  // Form States for Add/Edit
  const [formFirstName, setFormFirstName] = useState('');
  const [formMiddleName, setFormMiddleName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formUserId, setFormUserId] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formJobTitle, setFormJobTitle] = useState('Customer Service Officer');
  const [formPassword, setFormPassword] = useState('Employee@360');

  // Reset Password State
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredEmployees = branchEmployees.filter(e => {
    const term = (searchTerm || '').toLowerCase();
    const fullName = getUserFullName(e).toLowerCase();
    const uId = (e.userId || e.id || '').toLowerCase();
    const title = (e.jobTitle || '').toLowerCase();
    const matchesSearch = !term || fullName.includes(term) || uId.includes(term) || title.includes(term);
    const matchesStatus = statusFilter === 'All' ? true : (e.status || 'Active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setFormFirstName('');
    setFormMiddleName('');
    setFormLastName('');
    setFormUserId(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormEmail('');
    setFormPhone('+251 9');
    setFormJobTitle('Customer Service Officer');
    setFormPassword('Employee@360');
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleSaveAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName || !formLastName || !formUserId) {
      setErrorMsg('Please fill in First Name, Last Name, and User ID.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      await api.addBranchEmployee({
        managerId: currentUser.id,
        firstName: formFirstName,
        middleName: formMiddleName,
        lastName: formLastName,
        userId: formUserId,
        email: formEmail || `${formUserId}@bunnabanksc.com`,
        phone: formPhone,
        jobTitle: formJobTitle,
        password: formPassword,
        branchId: currentUser.branchId || 'BR-001',
        branchName: currentUser.branchName || 'Main Branch'
      });
      setSuccessMsg('Employee registered successfully and linked to your branch!');
      setIsAddModalOpen(false);
      onRefreshData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register employee.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditModal = (emp: User) => {
    setEditingEmployee(emp);
    setFormFirstName(emp.firstName || '');
    setFormMiddleName(emp.middleName || '');
    setFormLastName(emp.lastName || '');
    setFormEmail(emp.email || '');
    setFormPhone(emp.phone || '');
    setFormJobTitle(emp.jobTitle || 'Customer Service Officer');
    setErrorMsg('');
  };

  const handleSaveEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      await api.updateBranchEmployee(editingEmployee.id, {
        managerId: currentUser.id,
        firstName: formFirstName,
        middleName: formMiddleName,
        lastName: formLastName,
        email: formEmail,
        phone: formPhone,
        jobTitle: formJobTitle
      });
      setSuccessMsg('Employee details updated successfully!');
      setEditingEmployee(null);
      onRefreshData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update employee.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteConfirmEmployee) return;

    setIsLoading(true);
    try {
      await api.deleteBranchEmployee(deleteConfirmEmployee.id, currentUser.id);
      setSuccessMsg('Employee removed from branch successfully.');
      setDeleteConfirmEmployee(null);
      onRefreshData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete employee.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (emp: User) => {
    const nextStatus = (emp.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
    setIsLoading(true);
    try {
      await api.updateEmployeeStatus(emp.id, currentUser.id, nextStatus);
      setSuccessMsg(`Employee account status changed to ${nextStatus}.`);
      onRefreshData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to change employee status.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwdEmployee || !newPasswordInput) return;

    setIsLoading(true);
    try {
      await api.resetEmployeePassword(resetPwdEmployee.id, currentUser.id, newPasswordInput);
      setSuccessMsg(`Password for ${getUserFullName(resetPwdEmployee)} reset successfully.`);
      setResetPwdEmployee(null);
      setNewPasswordInput('');
      onRefreshData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl text-white space-y-6">
      
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Section Header & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-[#D4AF37]" />
            <h3 className="font-extrabold text-xl text-white">Branch Employee Management</h3>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            Supervise, register, monitor, and manage staff assigned to <strong className="text-[#D4AF37]">{currentUser.branchName || 'Your Branch'}</strong>.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#e2bd4e] text-[#0B4228] font-extrabold text-xs flex items-center space-x-2 shadow-lg transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employees by name, User ID, or job title..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="md:col-span-4 flex items-center space-x-2">
          {['All', 'Active', 'Inactive'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`flex-1 py-3 px-3 rounded-2xl border text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-[#D4AF37] text-[#0B4228] border-[#D4AF37] shadow'
                  : 'bg-white/5 text-white border-white/10 hover:border-[#D4AF37]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Employees Table */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <Users className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <p className="text-xs text-gray-400">No employees found under your supervision matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0B4228] text-[#D4AF37] font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Employee Name</th>
                <th className="p-3.5">User ID</th>
                <th className="p-3.5">Position / Title</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-[#08321E]/60">
              {filteredEmployees.map(emp => {
                const isInactive = (emp.status || 'Active') !== 'Active';
                return (
                  <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center font-bold text-[#D4AF37]">
                          {emp.firstName?.[0] || 'E'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{getUserFullName(emp)}</p>
                          <p className="text-[10px] text-gray-400">{emp.email || `${emp.userId}@bunnabanksc.com`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[#D4AF37] font-bold">{emp.userId || emp.id}</td>
                    <td className="p-3.5 font-semibold text-gray-200">{emp.jobTitle || 'Customer Service Officer'}</td>
                    <td className="p-3.5 text-gray-300">{emp.phone || '-'}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        !isInactive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {emp.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setViewingEmployee(emp)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
                          title="Update Employee"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setResetPwdEmployee(emp);
                            setNewPasswordInput('Employee@360');
                          }}
                          className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={`p-2 rounded-xl ${!isInactive ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300' : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'}`}
                          title={!isInactive ? 'Deactivate Account' : 'Activate Account'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmEmployee(emp)}
                          className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#08321E] border border-[#D4AF37]/40 w-full max-w-xl rounded-3xl p-6 text-white shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-extrabold text-lg text-[#D4AF37] flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Register New Branch Employee</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddEmployee} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={e => setFormFirstName(e.target.value)}
                    placeholder="e.g. Abebe"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={formMiddleName}
                    onChange={e => setFormMiddleName(e.target.value)}
                    placeholder="e.g. Kebede"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={e => setFormLastName(e.target.value)}
                    placeholder="e.g. Tadesse"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">User ID * (e.g. 4994)</label>
                  <input
                    type="text"
                    required
                    value={formUserId}
                    onChange={e => setFormUserId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Job Title / Position</label>
                  <select
                    value={formJobTitle}
                    onChange={e => setFormJobTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B4228] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Customer Service Officer">Customer Service Officer</option>
                    <option value="Senior Teller">Senior Teller</option>
                    <option value="Loan Officer">Loan Officer</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Digital Banking Officer">Digital Banking Officer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="+251 912 345 678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0B4228] border border-white/10 text-xs text-gray-300 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Assigned Branch: <strong className="text-white">{currentUser.branchName || 'Current Branch'}</strong></span>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e2bd4e] text-[#0B4228] font-extrabold text-xs shadow"
                >
                  {isLoading ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#08321E] border border-blue-500/40 w-full max-w-xl rounded-3xl p-6 text-white shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-extrabold text-lg text-blue-300 flex items-center space-x-2">
                <Edit3 className="w-5 h-5" />
                <span>Update Employee: {getUserFullName(editingEmployee)}</span>
              </h3>
              <button onClick={() => setEditingEmployee(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditEmployee} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formFirstName}
                    onChange={e => setFormFirstName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={formMiddleName}
                    onChange={e => setFormMiddleName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formLastName}
                    onChange={e => setFormLastName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Job Title / Position</label>
                <input
                  type="text"
                  value={formJobTitle}
                  onChange={e => setFormJobTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#08321E] border border-[#D4AF37]/40 w-full max-w-lg rounded-3xl p-6 text-white shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-extrabold text-lg text-[#D4AF37] flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5" />
                <span>Employee Profile Details</span>
              </h3>
              <button onClick={() => setViewingEmployee(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center font-black text-xl text-[#D4AF37]">
                  {viewingEmployee.firstName?.[0] || 'E'}
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">{getUserFullName(viewingEmployee)}</h4>
                  <p className="text-[#D4AF37] font-mono">User ID: {viewingEmployee.userId || viewingEmployee.id}</p>
                  <p className="text-gray-300 mt-0.5">{viewingEmployee.jobTitle || 'Customer Service Officer'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-gray-400 block text-[10px] uppercase">Email Address</span>
                  <span className="font-semibold text-white mt-0.5 block">{viewingEmployee.email || `${viewingEmployee.userId}@bunnabanksc.com`}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-gray-400 block text-[10px] uppercase">Phone Number</span>
                  <span className="font-semibold text-white mt-0.5 block">{viewingEmployee.phone || '+251 912 345 678'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-gray-400 block text-[10px] uppercase">Branch Assigned</span>
                  <span className="font-semibold text-white mt-0.5 block">{viewingEmployee.branchName || currentUser.branchName}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-gray-400 block text-[10px] uppercase">Account Status</span>
                  <span className="font-semibold text-emerald-400 mt-0.5 block">{viewingEmployee.status || 'Active'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
              {onOpenAiSummary && (
                <button
                  onClick={() => {
                    setViewingEmployee(null);
                    onOpenAiSummary(viewingEmployee);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B4228] font-bold text-xs flex items-center space-x-1"
                >
                  <span>AI Performance Summary</span>
                </button>
              )}
              <button
                onClick={() => setViewingEmployee(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetPwdEmployee && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#08321E] border border-amber-500/40 w-full max-w-md rounded-3xl p-6 text-white shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-extrabold text-lg text-amber-300 flex items-center space-x-2">
                <KeyRound className="w-5 h-5" />
                <span>Reset Employee Password</span>
              </h3>
              <button onClick={() => setResetPwdEmployee(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <p className="text-xs text-gray-300">
                Set a secure new temporary login password for <strong className="text-white">{getUserFullName(resetPwdEmployee)}</strong> ({resetPwdEmployee.userId}).
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">New Temporary Password *</label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setResetPwdEmployee(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow"
                >
                  {isLoading ? 'Resetting...' : 'Confirm Password Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmEmployee && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#08321E] border border-rose-500/40 w-full max-w-md rounded-3xl p-6 text-white shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-extrabold text-lg">Confirm Employee Removal</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-white">{getUserFullName(deleteConfirmEmployee)}</strong> from your branch? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setDeleteConfirmEmployee(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEmployee}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow"
              >
                {isLoading ? 'Deleting...' : 'Yes, Delete Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
