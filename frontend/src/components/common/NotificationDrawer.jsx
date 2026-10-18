import React from "react";
import { Bell, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { ModalCloseButton } from "./ModalCloseButton";
import { useModalDismiss } from "../../hooks/useModalDismiss";

export const NotificationDrawer = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkRead
}) => {
  const { contentRef, handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose
  });

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end"
    >
      <div
        ref={contentRef}
        className="w-full max-w-md bg-white border-l border-gray-200 text-gray-900 h-full shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#541718]" />
            <h3 className="font-bold text-lg text-gray-900">System Notifications</h3>
          </div>
          <ModalCloseButton onClose={onClose} ariaLabel="Close notification drawer" />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkRead && onMarkRead(n.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  n.read
                    ? "bg-white border-gray-200 text-gray-500"
                    : "bg-white border-[#541718]/30 text-gray-900 shadow-sm ring-1 ring-[#541718]/10"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100 text-[#541718] shrink-0 mt-0.5">
                    {n.type === "approval" ? (
                      <CheckCircle2 className="w-4 h-4 text-[#425727]" />
                    ) : n.type === "rejection" ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Info className="w-4 h-4 text-[#541718]" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-gray-900">{n.title}</p>
                      <span className="text-[10px] text-gray-400">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white text-center">
          <p className="text-[11px] text-gray-400">Bunna Bank Executive Performance System &bull; 24/7 Audit Alerts</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
