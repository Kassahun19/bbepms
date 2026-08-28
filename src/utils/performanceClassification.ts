// =============================================================================
// BUNNA BANK S.C. - CENTRALIZED PERFORMANCE CLASSIFICATION & REMARKS ENGINE
// =============================================================================

export type PerformanceTierKey = 'CRITICAL' | 'UNSATISFACTORY' | 'SATISFACTORY' | 'EXCELLENT' | 'OUTSTANDING';

export interface PerformanceClassificationTier {
  key: PerformanceTierKey;
  label: string; // e.g. "Critical", "Unsatisfactory", "Satisfactory", "Excellent", "Outstanding"
  status: string; // Canonical status name
  remark: string; // Short remark
  badgeEmoji: string; // 🔴, 🩷, 🟡, 🟢, 🟢✨
  badgeLabel: string; // "🔴 Critical", "🩷 Unsatisfactory", "🟡 Satisfactory", "🟢 Excellent", "🟢✨ Outstanding"
  meaning: string; // Official explanation
  quote: string; // Elegant stylized quote for card presentations
  tone: 'red' | 'pink' | 'amber' | 'green' | 'emerald';
  colorHex: string;
  badgeClass: string;
  borderClass: string;
  glowClass: string;
  cardGlowClass: string;
  bgGradient: string;
  progressColor: string;
  pulseClass: string;
  normalizedPercentage: number;
  rawPercentage: number;
  isNegative: boolean;
  isExceededCapped: boolean;
}

/**
 * 1. Global Performance Percentage Rules
 * - Performance must never exceed 100%.
 * - Any result above 100% must be displayed as 100%.
 * - Legitimate negative performance values must be preserved exactly as calculated.
 * - Do NOT convert negative values to 0%.
 * - Do NOT use a generic "Math.max(value, 0)" or "clamp(value, 0, 100)".
 */
export function capPerformancePercentage(rawPercentage: number | null | undefined): number {
  if (rawPercentage === null || rawPercentage === undefined || isNaN(Number(rawPercentage))) {
    return 0;
  }
  const num = Number(rawPercentage);
  if (num > 100) {
    return 100;
  }
  // Preserves exact negative numbers (e.g. -25, -10.5)
  return Number(num.toFixed(1));
}

/**
 * Formats a performance percentage for display:
 * - Capped at 100%
 * - Preserves negative signs
 * - Includes '%' symbol
 */
export function formatPerformancePercentage(rawPercentage: number | null | undefined, decimals: number = 1): string {
  const capped = capPerformancePercentage(rawPercentage);
  return `${capped.toFixed(decimals)}%`;
}

/**
 * 2. Centralized Performance Classification Engine
 *
 * Tier Boundaries:
 * - Below 0%         -> 🔴 Critical       (Red)
 * - 0% – 49.99%      -> 🩷 Unsatisfactory (Pink/Rose)
 * - 50% – 74.99%     -> 🟡 Satisfactory   (Yellow/Amber)
 * - 75% – 89.99%     -> 🟢 Excellent      (Green)
 * - 90% – 100%       -> 🟢✨ Outstanding   (Emerald/Gold)
 */
export function getPerformanceClassification(rawPercentage: number | null | undefined): PerformanceClassificationTier {
  const raw = rawPercentage === null || rawPercentage === undefined || isNaN(Number(rawPercentage)) ? 0 : Number(rawPercentage);
  const normalized = capPerformancePercentage(raw);
  const isNegative = raw < 0;
  const isExceededCapped = raw > 100;

  if (isNegative || normalized < 0) {
    return {
      key: 'CRITICAL',
      label: 'Critical',
      status: 'Critical',
      remark: 'Critical Underperformance',
      badgeEmoji: '🔴',
      badgeLabel: '🔴 Critical',
      meaning: 'Performance is significantly below the expected target',
      quote: 'Performance is significantly below the expected target. Immediate managerial review required.',
      tone: 'red',
      colorHex: '#EF4444',
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm shadow-red-500/20',
      borderClass: 'border-red-500/40',
      glowClass: 'shadow-red-500/25',
      cardGlowClass: 'hover:shadow-red-500/25 hover:border-red-500/60',
      bgGradient: 'from-red-950/40 via-[#2A1208] to-[#1A0A05]',
      progressColor: 'bg-red-500',
      pulseClass: 'animate-pulse',
      normalizedPercentage: normalized,
      rawPercentage: raw,
      isNegative: true,
      isExceededCapped: false
    };
  }

  if (normalized < 50) {
    return {
      key: 'UNSATISFACTORY',
      label: 'Unsatisfactory',
      status: 'Unsatisfactory',
      remark: 'Below Expectation',
      badgeEmoji: '🩷',
      badgeLabel: '🩷 Unsatisfactory',
      meaning: 'Performance is below the acceptable expectation',
      quote: 'Performance is below the acceptable expectation. Structured coaching & support recommended.',
      tone: 'pink',
      colorHex: '#F472B6',
      badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-sm shadow-pink-500/20',
      borderClass: 'border-pink-500/40',
      glowClass: 'shadow-pink-500/25',
      cardGlowClass: 'hover:shadow-pink-500/25 hover:border-pink-500/60',
      bgGradient: 'from-pink-950/40 via-[#331422] to-[#1F0C14]',
      progressColor: 'bg-pink-400',
      pulseClass: 'animate-pulse',
      normalizedPercentage: normalized,
      rawPercentage: raw,
      isNegative: false,
      isExceededCapped: false
    };
  }

  if (normalized < 75) {
    return {
      key: 'SATISFACTORY',
      label: 'Satisfactory',
      status: 'Satisfactory',
      remark: 'Basic / Acceptable',
      badgeEmoji: '🟡',
      badgeLabel: '🟡 Satisfactory',
      meaning: 'Performance meets a basic/acceptable level',
      quote: 'Performance meets a basic/acceptable level with potential for higher target conversion.',
      tone: 'amber',
      colorHex: '#FBBF24',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20',
      borderClass: 'border-amber-500/40',
      glowClass: 'shadow-amber-500/25',
      cardGlowClass: 'hover:shadow-amber-500/25 hover:border-amber-500/60',
      bgGradient: 'from-amber-950/30 via-[#362011] to-[#24150B]',
      progressColor: 'bg-amber-400',
      pulseClass: '',
      normalizedPercentage: normalized,
      rawPercentage: raw,
      isNegative: false,
      isExceededCapped: false
    };
  }

  if (normalized < 90) {
    return {
      key: 'EXCELLENT',
      label: 'Excellent',
      status: 'Excellent',
      remark: 'Strong Performance',
      badgeEmoji: '🟢',
      badgeLabel: '🟢 Excellent',
      meaning: 'Strong performance against the target',
      quote: 'Strong and steady performance across the assigned banking targets.',
      tone: 'green',
      colorHex: '#22C55E',
      badgeClass: 'bg-green-500/20 text-green-400 border-green-500/40 shadow-sm shadow-green-500/20',
      borderClass: 'border-green-500/40',
      glowClass: 'shadow-green-500/25',
      cardGlowClass: 'hover:shadow-green-500/25 hover:border-green-500/60',
      bgGradient: 'from-green-950/40 via-[#0B4228] to-[#08321E]',
      progressColor: 'bg-green-500',
      pulseClass: '',
      normalizedPercentage: normalized,
      rawPercentage: raw,
      isNegative: false,
      isExceededCapped: false
    };
  }

  // 90% – 100% (and any capped value > 100%)
  return {
    key: 'OUTSTANDING',
    label: 'Outstanding',
    status: 'Outstanding',
    remark: 'Exceptional Performance',
    badgeEmoji: '🟢✨',
    badgeLabel: '🟢✨ Outstanding',
    meaning: 'Exceptional performance',
    quote: isExceededCapped 
      ? 'Exceptional performance exceeding benchmark expectations (capped at 100%).' 
      : 'Exceptional performance exceeding benchmark expectations.',
    tone: 'emerald',
    colorHex: '#10B981',
    badgeClass: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-sm shadow-emerald-500/30',
    borderClass: 'border-emerald-500/50',
    glowClass: 'shadow-emerald-500/30',
    cardGlowClass: 'hover:shadow-emerald-500/30 hover:border-emerald-400/70',
    bgGradient: 'from-emerald-950/60 via-[#0B4228] to-[#052315]',
    progressColor: 'bg-gradient-to-r from-emerald-400 to-[#D4AF37]',
    pulseClass: '',
    normalizedPercentage: normalized,
    rawPercentage: raw,
    isNegative: false,
    isExceededCapped
  };
}
