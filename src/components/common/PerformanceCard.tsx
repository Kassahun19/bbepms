import React, { useState, useEffect } from 'react';
import {
  Award,
  Building2,
  User as UserIcon,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Target,
  BarChart3,
  Layers,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon
} from 'lucide-react';
import { getPerformanceClassification, formatPerformancePercentage, PerformanceClassificationTier } from '../../utils/performanceClassification';
import { PerformanceStatusBadge } from './PerformanceStatusBadge';

export interface PerformanceCardKpiItem {
  label: string;
  value: string | number;
  target?: string | number;
  percentage?: number;
  isCurrency?: boolean;
  unit?: string;
  color?: string;
}

export interface PerformanceCardProps {
  entityType?: 'employee' | 'branch';
  name: string;
  subtitle?: string;
  identifier?: string;
  avatarUrl?: string;
  roleOrDistrict?: string;
  percentage: number;
  achievement?: string | number;
  target?: string | number;
  achievementLabel?: string;
  targetLabel?: string;
  kpis?: PerformanceCardKpiItem[];
  trend?: {
    value: number; // e.g. +5.2 or -3.1
    label?: string; // e.g. "vs previous period"
    isPositive?: boolean;
  };
  lastUpdated?: string;
  periodLabel?: string;
  isCompact?: boolean;
  onClick?: () => void;
  actions?: React.ReactNode;
  className?: string;
  id?: string;
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({
  entityType = 'employee',
  name,
  subtitle,
  identifier,
  avatarUrl,
  roleOrDistrict,
  percentage,
  achievement,
  target,
  achievementLabel = 'Achievement',
  targetLabel = 'Target',
  kpis = [],
  trend,
  lastUpdated,
  periodLabel,
  isCompact = false,
  onClick,
  actions,
  className = '',
  id
}) => {
  const classification = getPerformanceClassification(percentage);
  const normalizedPct = classification.normalizedPercentage;
  const isNegative = classification.isNegative;

  // Animated Count-Up Hook
  const [displayNumber, setDisplayNumber] = useState<number>(0);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 900; // ms
    const targetVal = normalizedPct;
    const startVal = 0;

    let frameId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Number((startVal + (targetVal - startVal) * easeProgress).toFixed(1));
      setDisplayNumber(currentVal);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setDisplayNumber(targetVal);
        setHasAnimated(true);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [normalizedPct]);

  // Progress Bar calculation (minimum visible indicator for non-zero, full for 100%, 0% baseline)
  const progressWidth = isNegative 
    ? 0 
    : Math.min(100, Math.max(0, normalizedPct));

  return (
    <div
      id={id || `perf-card-${entityType}-${identifier || name.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={`relative group rounded-3xl p-6 md:p-7 transition-all duration-300 backdrop-blur-md border shadow-xl ${
        classification.borderClass
      } ${classification.cardGlowClass} ${
        onClick ? 'cursor-pointer hover:-translate-y-1.5' : 'hover:-translate-y-0.5'
      } bg-gradient-to-br from-[#241307] via-[#1A0C04] to-[#120702] ${className}`}
      style={{
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.6), 0 0 20px -5px rgba(200, 154, 43, 0.15)'
      }}
    >
      {/* Subtle floating ambient background glow matching status tier */}
      <div
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 transition-opacity duration-300 group-hover:opacity-35 ${
          classification.tone === 'emerald'
            ? 'bg-emerald-500'
            : classification.tone === 'green'
            ? 'bg-green-500'
            : classification.tone === 'amber'
            ? 'bg-amber-500'
            : classification.tone === 'pink'
            ? 'bg-pink-500'
            : 'bg-red-500'
        }`}
      />

      {/* Top Card Header */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center space-x-3.5 min-w-0">
          {/* Avatar / Branch Icon */}
          <div className="relative shrink-0">
            <div
              className={`w-13 h-13 rounded-2xl flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-105 ${
                classification.borderClass
              } ${
                entityType === 'branch'
                  ? 'bg-gradient-to-br from-[#6B3F1D] to-[#362011] text-[#C89A2B]'
                  : 'bg-gradient-to-br from-[#4A2C17] to-[#1F0C05] text-white'
              }`}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover rounded-2xl"
                  referrerPolicy="no-referrer"
                />
              ) : entityType === 'branch' ? (
                <Building2 className="w-6 h-6 text-[#C89A2B]" />
              ) : (
                <UserIcon className="w-6 h-6 text-amber-200" />
              )}
            </div>
            {classification.key === 'OUTSTANDING' && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 text-black flex items-center justify-center text-[10px] font-black shadow-md">
                ✨
              </span>
            )}
          </div>

          {/* Name & Subtitle */}
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="text-lg md:text-xl font-black text-white truncate tracking-tight group-hover:text-amber-300 transition-colors">
                {name}
              </h3>
              {identifier && (
                <span className="text-[10px] font-mono font-bold bg-black/50 text-gray-300 px-2 py-0.5 rounded-md border border-white/10 shrink-0">
                  {identifier}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-300 truncate mt-0.5">
              {subtitle || (entityType === 'branch' ? 'Bunna Bank Branch' : 'Customer Service Officer')}
              {roleOrDistrict && ` • ${roleOrDistrict}`}
            </p>
          </div>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex flex-col items-end space-y-1.5 shrink-0">
          <PerformanceStatusBadge classification={classification} size="sm" />
          {periodLabel && (
            <span className="text-[10px] font-medium text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
              {periodLabel}
            </span>
          )}
        </div>
      </div>

      {/* Main Performance Display Section */}
      <div className="relative z-10 my-5 p-4 md:p-5 rounded-2xl bg-black/40 border border-white/10 shadow-inner flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Huge Percentage & Result */}
        <div className="text-center md:text-left space-y-1 min-w-[140px]">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#C89A2B]">
            Overall Performance
          </span>
          <div className="flex items-baseline justify-center md:justify-start space-x-1">
            <span
              className={`text-4xl md:text-5xl font-black tracking-tight font-sans ${
                isNegative
                  ? 'text-red-400'
                  : classification.key === 'OUTSTANDING'
                  ? 'bg-gradient-to-r from-emerald-300 via-amber-200 to-emerald-400 bg-clip-text text-transparent'
                  : classification.key === 'EXCELLENT'
                  ? 'text-green-400'
                  : classification.key === 'SATISFACTORY'
                  ? 'text-amber-300'
                  : 'text-pink-400'
              }`}
            >
              {displayNumber.toFixed(1)}%
            </span>
            {classification.isExceededCapped && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/40">
                MAX 100%
              </span>
            )}
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-2 pt-0.5">
            <PerformanceStatusBadge classification={classification} size="xs" showPercentage={false} />
            <span className="text-xs font-bold text-gray-300">
              {classification.remark}
            </span>
          </div>
        </div>

        {/* Middle/Right: Progress Bar & Elegant Quote Remark */}
        <div className="w-full md:flex-1 space-y-2.5">
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-gray-300">
              <span>Progress to Target</span>
              <span className={isNegative ? 'text-red-400' : 'text-amber-300'}>
                {isNegative ? `${normalizedPct}% (Below Baseline)` : `${normalizedPct}% / 100%`}
              </span>
            </div>
            <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  classification.progressColor
                } ${classification.pulseClass}`}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>

          {/* Elegant Quote Remark */}
          <p className="text-xs italic text-gray-300/90 bg-white/5 p-2.5 rounded-xl border border-white/5 leading-relaxed">
            «{classification.quote}»
          </p>
        </div>
      </div>

      {/* Achievement vs Target Metrics Grid */}
      {(achievement !== undefined || target !== undefined) && (
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1">
              <Target className="w-3 h-3 text-[#C89A2B]" />
              <span>{targetLabel}</span>
            </span>
            <p className="text-sm font-black text-white">
              {typeof target === 'number' ? target.toLocaleString() : target || '100%'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1">
              <Award className="w-3 h-3 text-emerald-400" />
              <span>{achievementLabel}</span>
            </span>
            <p className="text-sm font-black text-emerald-300">
              {typeof achievement === 'number' ? achievement.toLocaleString() : achievement || `${normalizedPct}%`}
            </p>
          </div>

          {trend && (
            <div className="col-span-2 md:col-span-1 p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1">
                <BarChart3 className="w-3 h-3 text-blue-400" />
                <span>Trend</span>
              </span>
              <div className="flex items-center space-x-1.5">
                {trend.value >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                )}
                <span className={`text-sm font-black ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trend.value >= 0 ? `+${trend.value}%` : `${trend.value}%`}
                </span>
                {trend.label && (
                  <span className="text-[10px] text-gray-400 truncate">
                    {trend.label}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Mini-Pills Breakdown (if provided) */}
      {kpis.length > 0 && !isCompact && (
        <div className="relative z-10 pt-2 border-t border-white/10 mt-4 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
            Key Performance Indicators
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {kpis.slice(0, 4).map((kpi, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-between space-y-1"
              >
                <span className="text-[10px] font-bold text-gray-400 truncate" title={kpi.label}>
                  {kpi.label}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-black text-white truncate">
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                  </span>
                  {kpi.percentage !== undefined && (
                    <span
                      className={`text-[10px] font-bold font-mono ${
                        kpi.percentage >= 100
                          ? 'text-emerald-400'
                          : kpi.percentage >= 75
                          ? 'text-green-400'
                          : kpi.percentage >= 50
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {formatPerformancePercentage(kpi.percentage, 0)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer: Last Updated & Custom Actions */}
      <div className="relative z-10 flex items-center justify-between pt-4 mt-3 border-t border-white/10 text-xs text-gray-400">
        <div className="flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-[10px]">
            {lastUpdated ? `Updated: ${lastUpdated}` : 'Verified Banking EPMS Record'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {actions}
          {onClick && (
            <span className="text-[10px] font-bold text-[#C89A2B] flex items-center group-hover:translate-x-1 transition-transform">
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
