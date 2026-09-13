export function capPerformancePercentage(rawPercentage) {
  if (rawPercentage === null || rawPercentage === void 0 || isNaN(Number(rawPercentage))) {
    return 0;
  }
  const num = Number(rawPercentage);
  if (num > 100) {
    return 100;
  }
  return Number(num.toFixed(1));
}
export function formatPerformancePercentage(rawPercentage, decimals = 1) {
  const capped = capPerformancePercentage(rawPercentage);
  return `${capped.toFixed(decimals)}%`;
}
export function getPerformanceClassification(rawPercentage) {
  const raw = rawPercentage === null || rawPercentage === void 0 || isNaN(Number(rawPercentage)) ? 0 : Number(rawPercentage);
  const normalized = capPerformancePercentage(raw);
  const isNegative = raw < 0;
  const isExceededCapped = raw > 100;
  if (isNegative || normalized < 0) {
    return {
      key: "CRITICAL",
      label: "Critical",
      status: "Critical",
      remark: "Critical Underperformance",
      badgeEmoji: "\u{1F534}",
      badgeLabel: "\u{1F534} Critical",
      meaning: "Performance is significantly below the expected target",
      quote: "Performance is significantly below the expected target. Immediate managerial review required.",
      tone: "red",
      colorHex: "#EF4444",
      badgeClass: "bg-red-500/20 text-red-400 border-red-500/40 shadow-sm shadow-red-500/20",
      borderClass: "border-red-500/40",
      glowClass: "shadow-red-500/25",
      cardGlowClass: "hover:shadow-red-500/25 hover:border-red-500/60",
      bgGradient: "from-red-950/40 via-[#2A1208] to-[#1A0A05]",
      progressColor: "bg-red-500",
      pulseClass: "animate-pulse",
      normalizedPercentage: normalized,
      rawPercentage: raw,
      isNegative: true,
      isExceededCapped: false
    };
  }
  if (normalized < 50) {
    return {
      key: "UNSATISFACTORY",
      label: "Unsatisfactory",
      status: "Unsatisfactory",
      remark: "Below Expectation",
      badgeEmoji: "\u{1FA77}",
      badgeLabel: "\u{1FA77} Unsatisfactory",
      meaning: "Performance is below the acceptable expectation",
      quote: "Performance is below the acceptable expectation. Structured coaching & support recommended.",
      tone: "pink",
      colorHex: "#F472B6",
      badgeClass: "bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-sm shadow-pink-500/20",
      borderClass: "border-pink-500/40",
      glowClass: "shadow-pink-500/25",
      cardGlowClass: "hover:shadow-pink-500/25 hover:border-pink-500/60",
      bgGradient: "from-pink-950/40 via-[#331422] to-[#1F0C14]",
      progressColor: "bg-pink-400",
      pulseClass: "animate-pulse",
      normalizedPercentage: normalized,
      rawPercentage: raw,
      isNegative: false,
      isExceededCapped: false
    };
  }
  if (normalized < 75) {
    return {
      key: "SATISFACTORY",
      label: "Satisfactory",
      status: "Satisfactory",
      remark: "Basic / Acceptable",
      badgeEmoji: "\u{1F7E1}",
      badgeLabel: "\u{1F7E1} Satisfactory",
      meaning: "Performance meets a basic/acceptable level",
      quote: "Performance meets a basic/acceptable level with potential for higher target conversion.",
      tone: "amber",
      colorHex: "#FBBF24",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20",
      borderClass: "border-amber-500/40",
      glowClass: "shadow-amber-500/25",
      cardGlowClass: "hover:shadow-amber-500/25 hover:border-amber-500/60",
      bgGradient: "from-amber-950/30 via-[#362011] to-[#24150B]",
      progressColor: "bg-amber-400",
      pulseClass: "",
      normalizedPercentage: normalized,
      rawPercentage: raw,
      isNegative: false,
      isExceededCapped: false
    };
  }
  if (normalized < 90) {
    return {
      key: "EXCELLENT",
      label: "Excellent",
      status: "Excellent",
      remark: "Strong Performance",
      badgeEmoji: "\u{1F7E2}",
      badgeLabel: "\u{1F7E2} Excellent",
      meaning: "Strong performance against the target",
      quote: "Strong and steady performance across the assigned banking targets.",
      tone: "green",
      colorHex: "#22C55E",
      badgeClass: "bg-green-500/20 text-green-400 border-green-500/40 shadow-sm shadow-green-500/20",
      borderClass: "border-green-500/40",
      glowClass: "shadow-green-500/25",
      cardGlowClass: "hover:shadow-green-500/25 hover:border-green-500/60",
      bgGradient: "from-green-950/40 via-[#0B4228] to-[#08321E]",
      progressColor: "bg-green-500",
      pulseClass: "",
      normalizedPercentage: normalized,
      rawPercentage: raw,
      isNegative: false,
      isExceededCapped: false
    };
  }
  return {
    key: "OUTSTANDING",
    label: "Outstanding",
    status: "Outstanding",
    remark: "Exceptional Performance",
    badgeEmoji: "\u{1F7E2}\u2728",
    badgeLabel: "\u{1F7E2}\u2728 Outstanding",
    meaning: "Exceptional performance",
    quote: isExceededCapped ? "Exceptional performance exceeding benchmark expectations (capped at 100%)." : "Exceptional performance exceeding benchmark expectations.",
    tone: "emerald",
    colorHex: "#10B981",
    badgeClass: "bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-sm shadow-emerald-500/30",
    borderClass: "border-emerald-500/50",
    glowClass: "shadow-emerald-500/30",
    cardGlowClass: "hover:shadow-emerald-500/30 hover:border-emerald-400/70",
    bgGradient: "from-emerald-950/60 via-[#0B4228] to-[#052315]",
    progressColor: "bg-gradient-to-r from-emerald-400 to-[#D4AF37]",
    pulseClass: "",
    normalizedPercentage: normalized,
    rawPercentage: raw,
    isNegative: false,
    isExceededCapped
  };
}
