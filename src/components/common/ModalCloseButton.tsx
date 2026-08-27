import React from 'react';
import { X } from 'lucide-react';

interface ModalCloseButtonProps {
  onClose: () => void;
  className?: string;
  ariaLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  variant?: 'light' | 'dark' | 'gold' | 'ghost';
}

export const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  onClose,
  className = '',
  ariaLabel = 'Close dialog',
  size = 'md',
  id,
  variant = 'dark'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2 min-h-[40px] min-w-[40px]',
    lg: 'w-11 h-11 p-2.5 min-h-[44px] min-w-[44px]'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const variantClasses = {
    dark: 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border border-white/10 hover:border-white/20',
    gold: 'bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] hover:text-white border border-[#D4AF37]/40',
    light: 'bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-900 border border-black/10',
    ghost: 'hover:bg-white/10 text-gray-400 hover:text-white'
  };

  return (
    <button
      id={id || 'modal-close-btn'}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`rounded-2xl flex items-center justify-center transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      <X className={`${iconSizes[size]} transition-transform hover:scale-110`} />
    </button>
  );
};
