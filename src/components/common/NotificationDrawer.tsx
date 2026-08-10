import React from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, MessageSquare, Info } from 'lucide-react';
import { Notification } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#6B3F1D] border-l border-[#C89A2B]/30 text-white h-full shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#4A2C17]">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#C89A2B]" />
            <h3 className="font-bold text-lg">System Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-white/5 border-white/10 text-gray-300'
                    : 'bg-[#4A2C17] border-[#C89A2B]/40 text-white shadow-lg'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-white/10 text-[#C89A2B] shrink-0 mt-0.5">
                    {n.type === 'approval' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : n.type === 'rejection' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Info className="w-4 h-4 text-[#C89A2B]" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-white">{n.title}</p>
                      <span className="text-[10px] text-gray-400">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#4A2C17] text-center">
          <p className="text-[11px] text-[#C89A2B]">
            Real-time EPMS Approval & Target Notifications
          </p>
        </div>
      </div>
    </div>
  );
};
