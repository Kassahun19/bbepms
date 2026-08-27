import React, { useState } from 'react';
import {
  MessageSquare,
  Bell,
  FileText,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  Filter,
  AlertCircle,
  Megaphone,
  UserCheck,
  Building2,
  Trash2
} from 'lucide-react';
import { User, Notification, getUserFullName } from '../../types';
import { MessagingCenter } from '../common/MessagingCenter';
import { BankMemoLibrary } from '../common/BankMemoLibrary';
import { api } from '../../services/api';

interface ManagerMessagesNotificationsViewProps {
  currentUser: User;
  employees: User[];
  notifications?: Notification[];
  onRefreshData?: () => void;
}

export const ManagerMessagesNotificationsView: React.FC<ManagerMessagesNotificationsViewProps> = ({
  currentUser,
  employees,
  notifications = [],
  onRefreshData
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'messaging' | 'notifications' | 'memos'>('messaging');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'kpi' | 'report'>('all');

  // Filter branch employees
  const branchEmployees = employees.filter(e => {
    if (e.role !== 'EMPLOYEE') return false;
    if (!currentUser.branchId && !currentUser.branchName) return true;
    const sameBranchId = currentUser.branchId && e.branchId && currentUser.branchId === e.branchId;
    const sameBranchName = currentUser.branchName && e.branchName && currentUser.branchName.trim().toLowerCase() === e.branchName.trim().toLowerCase();
    return Boolean(sameBranchId || sameBranchName);
  });

  // Filter manager notifications
  const managerNotifications = notifications.filter(n => {
    if (n.userId && n.userId === currentUser.id) return true;
    return true;
  });

  const filteredNotifications = managerNotifications.filter(n => {
    if (filterType === 'unread') return !n.read;
    if (filterType === 'kpi') return n.type === 'target' || (n.title && n.title.toLowerCase().includes('kpi'));
    if (filterType === 'report') return n.type === 'approval' || n.type === 'rejection' || (n.title && n.title.toLowerCase().includes('report'));
    return true;
  });

  const unreadCount = managerNotifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = async () => {
    for (const n of managerNotifications.filter(item => !item.read)) {
      await api.markNotificationRead(n.id);
    }
    if (onRefreshData) onRefreshData();
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B4228] via-[#08321E] to-[#051F13] border border-[#D4AF37]/30 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="bg-[#D4AF37] text-[#0B4228] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
              Branch Communication & Alerts Hub
            </span>
            <h2 className="text-2xl font-black text-white mt-1">
              Messages & Notifications
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Manage real-time branch staff communication, broadcast announcements, KPI alerts, and official bank memos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-[#D4AF37] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#D4AF37]" />
              <span>{unreadCount} Unread Alerts</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sub-navigation Controls */}
      <div className="flex flex-wrap items-center gap-3 p-2 bg-[#08321E] rounded-2xl border border-[#D4AF37]/40 shadow-lg">
        <button
          onClick={() => setActiveSubTab('messaging')}
          className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'messaging' ? 'bg-[#D4AF37] text-[#0B4228] shadow-lg' : 'bg-black/30 text-gray-300 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Branch Messaging (Direct & Broadcast)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'notifications' ? 'bg-[#D4AF37] text-[#0B4228] shadow-lg' : 'bg-black/30 text-gray-300 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alerts & Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('memos')}
          className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'memos' ? 'bg-[#D4AF37] text-[#0B4228] shadow-lg' : 'bg-black/30 text-gray-300 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Bank Memos & Digital Circulars</span>
        </button>
      </div>

      {/* View 1: Messaging Center */}
      {activeSubTab === 'messaging' && (
        <MessagingCenter currentUser={currentUser} employees={employees} />
      )}

      {/* View 2: Notifications Center */}
      {activeSubTab === 'notifications' && (
        <div className="p-6 rounded-3xl bg-[#08321E] border border-[#D4AF37]/30 shadow-xl text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-extrabold text-lg text-white">Manager Alerts & Notification Feed</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${filterType === 'all' ? 'bg-[#D4AF37] text-[#0B4228]' : 'text-gray-300 hover:text-white'}`}
                >
                  All ({managerNotifications.length})
                </button>
                <button
                  onClick={() => setFilterType('unread')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${filterType === 'unread' ? 'bg-[#D4AF37] text-[#0B4228]' : 'text-gray-300 hover:text-white'}`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilterType('kpi')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${filterType === 'kpi' ? 'bg-[#D4AF37] text-[#0B4228]' : 'text-gray-300 hover:text-white'}`}
                >
                  KPI Target Alerts
                </button>
                <button
                  onClick={() => setFilterType('report')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${filterType === 'report' ? 'bg-[#D4AF37] text-[#0B4228]' : 'text-gray-300 hover:text-white'}`}
                >
                  Daily Submissions
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#D4AF37] text-xs font-bold transition-colors"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs space-y-2">
              <Bell className="w-8 h-8 text-[#D4AF37] mx-auto opacity-50" />
              <p className="font-bold text-white text-sm">No Notifications Found</p>
              <p className="text-gray-400">All manager alerts, employee KPI target responses, and submission updates will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                    !item.read
                      ? 'bg-black/50 border-[#D4AF37]/50 shadow-md'
                      : 'bg-black/20 border-white/10 opacity-90'
                  }`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 ${
                    item.type === 'target' || (item.title && item.title.toLowerCase().includes('target'))
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {item.type === 'target' ? <Sparkles className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-sm text-white truncate">{item.title}</h4>
                      <span className="text-[10px] text-gray-400 shrink-0">{item.timestamp || 'Recent'}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View 3: Bank Memo Library */}
      {activeSubTab === 'memos' && (
        <BankMemoLibrary currentUser={currentUser} />
      )}
    </div>
  );
};
