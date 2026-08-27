import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationToastProps {
  type: NotificationType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, duration]);

  const config = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-emerald-600',
      text: 'text-white',
      border: 'border-emerald-500',
      iconColor: 'text-emerald-50'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-rose-600',
      text: 'text-white',
      border: 'border-rose-500',
      iconColor: 'text-rose-50'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-500',
      text: 'text-[#4A2C17]',
      border: 'border-amber-400',
      iconColor: 'text-[#4A2C17]'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-600',
      text: 'text-white',
      border: 'border-blue-500',
      iconColor: 'text-blue-50'
    }
  };

  const style = config[type] || config.info;
  const Icon = style.icon;

  return (
    <div className="fixed top-6 right-6 z-[9999] max-w-sm w-full md:max-w-md animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={`flex items-start p-4 rounded-xl shadow-2xl border ${style.bg} ${style.border} ${style.text}`}>
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 mr-3 ${style.iconColor}`} />
        <div className="flex-1 text-sm font-medium leading-relaxed pr-2">
          {message}
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors focus:outline-none`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
