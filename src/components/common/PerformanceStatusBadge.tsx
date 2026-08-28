import React from 'react';
import { getPerformanceClassification, PerformanceClassificationTier } from '../../utils/performanceClassification';

export type PerformanceStatusBadgeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface PerformanceStatusBadgeProps {
  percentage?: number | null;
  classification?: PerformanceClassificationTier;
  size?: PerformanceStatusBadgeSize;
  showEmoji?: boolean;
  showPercentage?: boolean;
  showMeaningTooltip?: boolean;
  pulse?: boolean;
  className?: string;
  id?: string;
}

export const PerformanceStatusBadge: React.FC<PerformanceStatusBadgeProps> = ({
  percentage,
  classification: propClassification,
  size = 'md',
  showEmoji = true,
  showPercentage = false,
  showMeaningTooltip = true,
  pulse = true,
  className = '',
  id
}) => {
  const tier = propClassification || getPerformanceClassification(percentage);

  // Size mapping
  const sizeClasses: Record<PerformanceStatusBadgeSize, {
    container: string;
    text: string;
    emoji: string;
    pct: string;
  }> = {
    xs: {
      container: 'px-1.5 py-0.5 text-[10px] space-x-1 rounded-md',
      text: 'text-[10px] font-bold tracking-tight',
      emoji: 'text-[10px]',
      pct: 'text-[9px] font-mono'
    },
    sm: {
      container: 'px-2 py-0.5 text-xs space-x-1.5 rounded-lg',
      text: 'text-[11px] font-extrabold uppercase tracking-wide',
      emoji: 'text-xs',
      pct: 'text-[10px] font-mono font-bold'
    },
    md: {
      container: 'px-2.5 py-1 text-xs space-x-2 rounded-xl',
      text: 'text-xs font-black uppercase tracking-wider',
      emoji: 'text-sm',
      pct: 'text-xs font-mono font-bold'
    },
    lg: {
      container: 'px-3.5 py-1.5 text-sm space-x-2.5 rounded-xl',
      text: 'text-sm font-black uppercase tracking-wider',
      emoji: 'text-base',
      pct: 'text-sm font-mono font-bold'
    },
    xl: {
      container: 'px-4 py-2 text-base space-x-3 rounded-2xl',
      text: 'text-base font-black uppercase tracking-wider',
      emoji: 'text-lg',
      pct: 'text-base font-mono font-bold'
    }
  };

  const s = sizeClasses[size] || sizeClasses.md;
  const isPulsing = pulse && (tier.key === 'CRITICAL' || tier.key === 'UNSATISFACTORY');

  return (
    <span
      id={id || `perf-badge-${tier.key.toLowerCase()}`}
      title={showMeaningTooltip ? `${tier.badgeLabel} — ${tier.meaning}` : undefined}
      className={`inline-flex items-center border font-sans select-none transition-all duration-200 ${tier.badgeClass} ${s.container} ${isPulsing ? 'animate-pulse' : ''} ${className}`}
      role="status"
      aria-label={`Performance status: ${tier.label}, ${tier.normalizedPercentage}%`}
    >
      {showEmoji && (
        <span className={`${s.emoji} leading-none drop-shadow-sm`}>
          {tier.badgeEmoji}
        </span>
      )}
      <span className={s.text}>
        {tier.label}
      </span>
      {showPercentage && (
        <span className={`opacity-90 border-l border-white/20 pl-1.5 ${s.pct}`}>
          {tier.normalizedPercentage}%
        </span>
      )}
    </span>
  );
};
