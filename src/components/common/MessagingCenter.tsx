import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, User, CheckCircle2, AlertCircle, Clock, Check, Bell, Search, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { getUserFullName } from '../../types';
import { NotificationToast, NotificationType } from './NotificationToast';

interface MessagingCenterProps {
  currentUser: any;
  employees: any[];
}

export const MessagingCenter: React.FC<MessagingCenterProps> = ({ currentUser, employees }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [branchEmployees, setBranchEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sendIndividual' | 'broadcast'>('inbox');

  // Form states
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');

  const [statusMessage, setStatusMessage] = useState<{ type: NotificationType; text: string } | null>(null);

  const isManager = currentUser.role === 'BRANCH_MANAGER' || currentUser.role === 'ADMIN';

  const fetchInbox = async () => {
    try {
      const inbox = await api.getInboxMessages(currentUser.id);
      setMessages(inbox);
    } catch (err) {
      console.warn('Failed to load inbox:', err);
    }
  };

  const fetchBranchStaff = async () => {
    if (!isManager) return;
    try {
      const staff = await api.getBranchManagerEmployees(currentUser.branchId, currentUser.id);
      // Filter out self
      setBranchEmployees(staff.filter((s: any) => s.id !== currentUser.id));
      if (staff.length > 0 && !recipientId) {
        const firstOther = staff.find((s: any) => s.id !== currentUser.id);
        if (firstOther) setRecipientId(firstOther.id);
      }
    } catch (err) {
      console.warn('Failed to load branch staff:', err);
      // Fallback to prop employees filtered by branch
      const fallback = employees.filter((e: any) => e.branchId === currentUser.branchId && e.id !== currentUser.id);
      setBranchEmployees(fallback);
      if (fallback.length > 0 && !recipientId) setRecipientId(fallback[0].id);
    }
  };

  useEffect(() => {
    fetchInbox();
    fetchBranchStaff();
  }, [currentUser.id]);

  const handleSendIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId || !messageContent.trim()) {
      setStatusMessage({ type: 'error', text: 'Please select an employee and enter message content.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    try {
      await api.sendMessage({
        senderId: currentUser.id,
        senderName: getUserFullName(currentUser),
        receiverId: recipientId,
        subject: subject.trim() || 'Direct Message from Manager',
        message: messageContent.trim()
      });
      setStatusMessage({ type: 'success', text: 'Private message sent successfully to employee.' });
      setSubject('');
      setMessageContent('');
      setActiveTab('inbox');
      fetchInbox();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to send message.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastContent.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter broadcast message content.' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await api.broadcastMessage({
        senderId: currentUser.id,
        senderName: getUserFullName(currentUser),
        branchId: currentUser.branchId || employees.find(e => e.id === currentUser.id)?.branchId || 'BRANCH-01',
        subject: broadcastSubject.trim() || 'Branch-Wide Announcement',
        message: broadcastContent.trim()
      });
      setStatusMessage({ type: 'success', text: `Broadcast sent successfully to ${res.count || branchEmployees.length} employees in your branch!` });
      setBroadcastSubject('');
      setBroadcastContent('');
      setActiveTab('inbox');
      fetchInbox();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to broadcast message.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMessage = async (msg: any) => {
    if (!msg.read) {
      try {
        await api.markMessageAsRead(msg.id);
        setMessages(messages.map(m => m.id === msg.id ? { ...m, read: true } : m));
      } catch (err) {
        console.warn('Failed to mark read:', err);
      }
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#3A1F0D] p-5 rounded-3xl border border-[#C89A2B]/30 shadow-lg">
        <div>
          <span className="bg-[#C89A2B] text-[#4A2C17] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Secure Communications
          </span>
          <h2 className="text-xl font-black text-white mt-1 flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-[#C89A2B]" />
            <span>Branch Messaging Center</span>
          </h2>
          <p className="text-xs text-gray-300 mt-0.5">
            {isManager ? 'Manage branch announcements and direct employee communications.' : 'View official memos and direct messages from your Branch Manager.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'inbox' ? 'bg-[#C89A2B] text-[#4A2C17]' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Inbox ({unreadCount} Unread)</span>
          </button>

          {isManager && (
            <>
              <button
                onClick={() => setActiveTab('sendIndividual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  activeTab === 'sendIndividual' ? 'bg-[#C89A2B] text-[#4A2C17]' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Send to Employee</span>
              </button>

              <button
                onClick={() => setActiveTab('broadcast')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  activeTab === 'broadcast' ? 'bg-[#C89A2B] text-[#4A2C17]' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Send to All Employees</span>
              </button>
            </>
          )}
        </div>
      </div>

      {statusMessage && (
        <NotificationToast
          type={statusMessage.type}
          message={statusMessage.text}
          onClose={() => setStatusMessage(null)}
        />
      )}

      {/* TAB 1: INBOX */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          <div className="bg-[#3A1F0D] rounded-3xl border border-white/15 p-6 shadow-xl">
            <h3 className="text-sm font-extrabold text-[#C89A2B] uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Received Messages & Notifications ({messages.length})</span>
            </h3>

            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#C89A2B]" />
                <p>Your inbox is currently empty.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleOpenMessage(m)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      !m.read
                        ? 'bg-[#4A2C17] border-[#C89A2B] shadow-lg ring-1 ring-[#C89A2B]/40'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        {!m.read && <span className="w-2.5 h-2.5 rounded-full bg-[#C89A2B] animate-pulse"></span>}
                        <h4 className="font-bold text-white text-sm">{m.subject || 'Branch Communication'}</h4>
                      </div>
                      <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-300" />
                        <span>{new Date(m.timestamp || m.createdAt || Date.now()).toLocaleString()}</span>
                      </span>
                    </div>

                    <p className="text-xs text-gray-200 bg-black/20 p-3 rounded-xl border border-white/5 whitespace-pre-wrap">
                      {m.message}
                    </p>

                    <div className="mt-3 flex justify-between items-center text-[11px] text-amber-200/80">
                      <span>Sender: <strong className="text-white">{m.senderName || 'Branch Manager'}</strong></span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.read ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {m.read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SEND TO INDIVIDUAL EMPLOYEE */}
      {activeTab === 'sendIndividual' && isManager && (
        <div className="bg-[#3A1F0D] rounded-3xl border border-white/15 p-6 shadow-xl max-w-2xl mx-auto">
          <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-white/10">
            <User className="w-5 h-5 text-[#C89A2B]" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Send Private Message to Employee</h3>
          </div>

          <form onSubmit={handleSendIndividual} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Select Supervised Employee:</label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#4A2C17] border border-white/15 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                required
              >
                <option value="">-- Choose Employee Under Your Supervision --</option>
                {branchEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {getUserFullName(emp)} ({emp.jobTitle || 'Employee'} - {emp.branchName || currentUser.branchName})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-amber-200/70 mt-1">
                * Security enforced: You can only message staff assigned directly to your branch.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Subject / Title:</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Performance Review Feedback & Daily Targets"
                className="w-full px-4 py-2.5 rounded-xl bg-[#4A2C17] border border-white/15 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Message Content:</label>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={5}
                placeholder="Write your private message or instructions here..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#4A2C17] border border-white/15 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setActiveTab('inbox')}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#C89A2B] hover:bg-amber-500 text-[#4A2C17] text-xs font-black shadow-lg flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending...' : 'Send Private Message'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SEND TO ALL EMPLOYEES (BROADCAST) */}
      {activeTab === 'broadcast' && isManager && (
        <div className="bg-[#3A1F0D] rounded-3xl border border-white/15 p-6 shadow-xl max-w-2xl mx-auto">
          <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-white/10">
            <Users className="w-5 h-5 text-[#C89A2B]" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Broadcast Message to All Branch Employees</h3>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
              <p className="font-bold">Target Group: All Active Employees in {currentUser.branchName || 'Your Branch'}</p>
              <p className="text-[11px] text-gray-300 mt-0.5">
                This will instantly dispatch the notification to all {branchEmployees.length} staff members under your supervision.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Subject / Announcement Title:</label>
              <input
                type="text"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                placeholder="e.g. Urgent: End-of-Day Deposit Mobilization Briefing"
                className="w-full px-4 py-2.5 rounded-xl bg-[#4A2C17] border border-white/15 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Message / Announcement Content:</label>
              <textarea
                value={broadcastContent}
                onChange={(e) => setBroadcastContent(e.target.value)}
                rows={5}
                placeholder="Type your branch-wide memo or instructions here..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#4A2C17] border border-white/15 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setActiveTab('inbox')}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#C89A2B] hover:bg-amber-500 text-[#4A2C17] text-xs font-black shadow-lg flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Broadcasting...' : `Send to All (${branchEmployees.length} Staff)`}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
