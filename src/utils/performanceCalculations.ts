import { DailyPerformanceReport, PerformanceTarget, PeriodTargetAllocations } from '../types';
import {
  capPerformancePercentage,
  getPerformanceClassification,
  PerformanceClassificationTier,
  formatPerformancePercentage
} from './performanceClassification';

export * from './performanceClassification';

// =============================================================================
// BUNNA BANK S.C. - EPMS KPI & TARGET CALCULATION ENGINE
// =============================================================================

// Official Ethiopian Banking Holidays for Calendar Year 2026
export const ETHIOPIAN_BANK_HOLIDAYS_2026 = [
  { date: '2026-01-07', name: 'Ethiopian Christmas (Genna)' },
  { date: '2026-01-19', name: 'Epiphany (Timket)' },
  { date: '2026-03-02', name: 'Adwa Victory Day' },
  { date: '2026-03-20', name: 'Eid al-Fitr (Ramadan End)' },
  { date: '2026-05-01', name: 'International Labour Day' },
  { date: '2026-05-05', name: 'Patriots Victory Day' },
  { date: '2026-05-27', name: 'Eid al-Adha (Arefa)' },
  { date: '2026-09-11', name: 'Ethiopian New Year (Enkutatash)' },
  { date: '2026-09-27', name: 'Finding of True Cross (Meskel)' }
];

export const TOTAL_BANKING_WORKING_DAYS_YEAR = 300; // Standard banking working days / year (approx. 50 weeks * 6 days)

// Core 8 KPIs definition for Bunna Bank
export type KpiGroup = 'Finance' | 'Stakeholder' | 'Internal Business' | 'Learning & Growth';

export interface KpiMetadata {
  kpiId: string;
  kpiCode: string;
  kpiName: string;
  category: KpiGroup;
  unit: string;
  isCurrency: boolean;
  weight: number; // weight in category
  categoryWeight: number; // overall category weight
  defaultAnnualTarget: number;
}

export const CORE_KPIS: KpiMetadata[] = [
  {
    kpiId: 'KPI-001',
    kpiCode: 'DEP_ETB',
    kpiName: 'Deposits Mobilized',
    category: 'Finance',
    unit: 'ETB',
    isCurrency: true,
    weight: 1.0,
    categoryWeight: 0.20,
    defaultAnnualTarget: 5600000
  },
  {
    kpiId: 'KPI-002',
    kpiCode: 'FCY_USD',
    kpiName: 'Foreign Currency Inflow',
    category: 'Finance',
    unit: 'USD',
    isCurrency: true,
    weight: 1.0,
    categoryWeight: 0.15,
    defaultAnnualTarget: 500
  },
  {
    kpiId: 'KPI-003',
    kpiCode: 'DFS_ETB',
    kpiName: 'Digital Financial Services',
    category: 'Finance',
    unit: 'ETB',
    isCurrency: true,
    weight: 1.0,
    categoryWeight: 0.20,
    defaultAnnualTarget: 200000
  },
  {
    kpiId: 'KPI-004',
    kpiCode: 'ACC_OPEN',
    kpiName: 'Account Openings',
    category: 'Stakeholder',
    unit: 'Accounts',
    isCurrency: false,
    weight: 1.0,
    categoryWeight: 0.20,
    defaultAnnualTarget: 240
  },
  {
    kpiId: 'KPI-005',
    kpiCode: 'MB_ACT',
    kpiName: 'Mobile Banking Activations',
    category: 'Internal Business',
    unit: 'Users',
    isCurrency: false,
    weight: 0.25,
    categoryWeight: 0.25,
    defaultAnnualTarget: 200
  },
  {
    kpiId: 'KPI-006',
    kpiCode: 'IB_ACT',
    kpiName: 'Internet Banking Activations',
    category: 'Internal Business',
    unit: 'Users',
    isCurrency: false,
    weight: 0.25,
    categoryWeight: 0.25,
    defaultAnnualTarget: 10
  },
  {
    kpiId: 'KPI-007',
    kpiCode: 'MERCH_SOL',
    kpiName: 'Merchant Solutions & QR',
    category: 'Internal Business',
    unit: 'Merchants',
    isCurrency: false,
    weight: 0.25,
    categoryWeight: 0.25,
    defaultAnnualTarget: 3
  },
  {
    kpiId: 'KPI-008',
    kpiCode: 'ATM_CARD',
    kpiName: 'ATM Card Activations',
    category: 'Internal Business',
    unit: 'Cards',
    isCurrency: false,
    weight: 0.25,
    categoryWeight: 0.25,
    defaultAnnualTarget: 0
  }
];

/**
 * 1. Automatic Target Allocation by Period
 * Calculates Daily, Weekly, Monthly, Quarterly, Semi-Annual, and Annual period targets
 * from an assigned Annual Target value.
 */
export function allocatePeriodTargets(annualTarget: number): PeriodTargetAllocations {
  const safeAnnual = Math.max(0, Number(annualTarget) || 0);

  // Allocation standard ratios:
  // Daily: Annual / 300 banking days
  // Weekly: Annual / 52 weeks
  // Monthly: Annual / 12 months
  // Quarterly: Annual / 4 quarters
  // Semi-Annual: Annual / 2 half-years
  // Annual: Annual * 1
  const daily = safeAnnual > 0 ? Number((safeAnnual / TOTAL_BANKING_WORKING_DAYS_YEAR).toFixed(2)) : 0;
  const weekly = safeAnnual > 0 ? Number((safeAnnual / 52).toFixed(2)) : 0;
  const monthly = safeAnnual > 0 ? Number((safeAnnual / 12).toFixed(2)) : 0;
  const quarterly = safeAnnual > 0 ? Number((safeAnnual / 4).toFixed(2)) : 0;
  const semiAnnual = safeAnnual > 0 ? Number((safeAnnual / 2).toFixed(2)) : 0;
  const annual = safeAnnual;

  return {
    daily,
    weekly,
    monthly,
    quarterly,
    semiAnnual,
    annual
  };
}

/**
 * 2. Automatic Performance Percentage Calculation
 * Formula: Performance (%) = (Actual Achievement ÷ Applicable Target) × 100
 * Strictly capped at 100% while preserving legitimate negative values.
 */
export function calculatePerformancePercentage(actual: number, target: number): number {
  const safeActual = Number(actual) || 0;
  const safeTarget = Number(target) || 0;

  if (safeTarget <= 0) {
    // If target is 0 and employee has achieved > 0, 100% performance; if 0 achieved, 0%
    return safeActual > 0 ? 100 : 0;
  }

  const rawPercent = (safeActual / safeTarget) * 100;
  return capPerformancePercentage(rawPercent);
}

/**
 * Checks if a specific date is a Sunday or Ethiopian Bank Holiday
 */
export function isSundayOrBankHoliday(dateStr: string): boolean {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    if (d.getDay() === 0) return true; // Sunday
    const holidayDates = ETHIOPIAN_BANK_HOLIDAYS_2026.map(h => h.date);
    return holidayDates.includes(dateStr);
  } catch (e) {
    return false;
  }
}

/**
 * Counts valid banking working days (excluding Sundays & official holidays) between two dates
 */
export function countBankingWorkingDays(startDateStr: string, endDateStr: string): number {
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 1;

    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const dStr = current.toISOString().split('T')[0];
      if (!isSundayOrBankHoliday(dStr)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return Math.max(1, count);
  } catch (e) {
    return 1;
  }
}

export type ReportingPeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiAnnual' | 'annual';

/**
 * Get date range boundary for a given period relative to an anchor date (defaulting to current/system date)
 */
export function getReportingPeriodDateRange(periodType: ReportingPeriodType, anchorDateStr: string = '2026-08-09'): { start: string; end: string; label: string } {
  const d = new Date(anchorDateStr);
  const validDate = isNaN(d.getTime()) ? new Date('2026-08-09') : d;
  const year = validDate.getFullYear();
  const month = validDate.getMonth(); // 0-indexed

  switch (periodType) {
    case 'daily': {
      const dateStr = validDate.toISOString().split('T')[0];
      return { start: dateStr, end: dateStr, label: `Daily (${dateStr})` };
    }
    case 'weekly': {
      const day = validDate.getDay();
      const distToMonday = day === 0 ? 6 : day - 1;
      const monday = new Date(validDate);
      monday.setDate(validDate.getDate() - distToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const start = monday.toISOString().split('T')[0];
      const end = sunday.toISOString().split('T')[0];
      return { start, end, label: `Weekly (${start} to ${end})` };
    }
    case 'monthly': {
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      const start = first.toISOString().split('T')[0];
      const end = last.toISOString().split('T')[0];
      const monthName = first.toLocaleString('en-US', { month: 'long' });
      return { start, end, label: `Monthly (${monthName} ${year})` };
    }
    case 'quarterly': {
      const q = Math.floor(month / 3);
      const first = new Date(year, q * 3, 1);
      const last = new Date(year, (q + 1) * 3, 0);
      const start = first.toISOString().split('T')[0];
      const end = last.toISOString().split('T')[0];
      return { start, end, label: `Q${q + 1} (${start} to ${end})` };
    }
    case 'semiAnnual': {
      const h = Math.floor(month / 6);
      const first = new Date(year, h * 6, 1);
      const last = new Date(year, (h + 1) * 6, 0);
      const start = first.toISOString().split('T')[0];
      const end = last.toISOString().split('T')[0];
      return { start, end, label: `H${h + 1} Semi-Annual (${start} to ${end})` };
    }
    case 'annual': {
      return { start: `${year}-01-01`, end: `${year}-12-31`, label: `Annual FY ${year}` };
    }
  }
}

export interface KpiPerformanceItem {
  kpiId: string;
  kpiCode: string;
  kpiName: string;
  category: string;
  unit: string;
  isCurrency: boolean;
  annualTarget: number;
  applicableTarget: number;
  actualAchievement: number;
  performancePercentage: number;
  variance: number;
  isExceeded: boolean;
}

export interface PeriodPerformanceResult {
  period: ReportingPeriodType;
  periodLabel: string;
  startDate: string;
  endDate: string;
  validWorkingDays: number;
  totalAnnualWorkingDays: number;
  scaleRatio: number;
  recordCount: number;
  kpis: KpiPerformanceItem[];
  categoryScores: {
    financial: number;
    customerAcquisition: number;
    digitalBanking: number;
  };
  overallPerformancePercentage: number;
  rawPerformancePercentage: number;
  classification: PerformanceClassificationTier;
  grade: {
    letter: 'A+' | 'A' | 'B' | 'C' | 'D';
    label: string;
    badgeClass: string;
  };
}

/**
 * Calculates comprehensive period targets, actual achievements, and performance percentages
 * for an employee or team given the reporting period.
 */
export function calculatePeriodPerformance(
  reports: DailyPerformanceReport[],
  targets: PerformanceTarget[],
  employeeId?: string,
  periodType: ReportingPeriodType = 'monthly',
  anchorDateStr: string = '2026-08-09'
): PeriodPerformanceResult {
  const { start, end, label } = getReportingPeriodDateRange(periodType, anchorDateStr);

  const totalYearDays = countBankingWorkingDays('2026-01-01', '2026-12-31');
  const validDays = countBankingWorkingDays(start, end);
  const scaleRatio = totalYearDays > 0 ? (validDays / totalYearDays) : 1;

  // Filter reports matching employee and date range
  const filteredReports = reports.filter(r => {
    if (employeeId) {
      const empMatch = 
        (r.employeeId && r.employeeId.toLowerCase() === employeeId.toLowerCase()) ||
        (r.employee_id && r.employee_id.toLowerCase() === employeeId.toLowerCase()) ||
        (r.employeeUserId && r.employeeUserId.toLowerCase() === employeeId.toLowerCase());
      if (!empMatch) return false;
    }
    const rDate = r.reportDate || r.report_date;
    if (!rDate) return false;
    return rDate >= start && rDate <= end;
  });

  // Calculate actual achievements across reports
  const actualsMap: Record<string, number> = {
    'KPI-001': filteredReports.reduce((s, r) => s + (Number(r.deposits_etb ?? r.depositsETB ?? 0) || 0), 0),
    'KPI-002': filteredReports.reduce((s, r) => s + (Number(r.foreign_currency_etb ?? r.foreignCurrencyETB ?? 0) || 0), 0),
    'KPI-003': filteredReports.reduce((s, r) => s + (Number(r.digital_financial_services_etb ?? r.digitalFinancialServicesETB ?? 0) || 0), 0),
    'KPI-004': filteredReports.reduce((s, r) => s + (Number(r.customer_onboarding ?? r.customerOnboarding ?? r.accountOpenings ?? 0) || 0), 0),
    'KPI-005': filteredReports.reduce((s, r) => s + (Number(r.mobile_banking ?? r.mobileBanking ?? r.mobileBankingActivations ?? 0) || 0), 0),
    'KPI-006': filteredReports.reduce((s, r) => s + (Number(r.internet_banking ?? r.internetBanking ?? r.internetBankingActivations ?? 0) || 0), 0),
    'KPI-007': filteredReports.reduce((s, r) => s + (Number(r.merchant_solutions ?? r.merchantSolutions ?? r.merchantSolutionsActivations ?? 0) || 0), 0),
    'KPI-008': filteredReports.reduce((s, r) => s + (Number(r.atm_debit_cards ?? r.atmDebitCards ?? r.atmCardActivations ?? r.atmCardsIssued ?? 0) || 0), 0),
  };

  // Helper to find assigned annual target (Strictly enforcing that ONLY ACCEPTED targets are active)
  const getAnnualTarget = (kpi: KpiMetadata): number => {
    if (!employeeId) return kpi.defaultAnnualTarget;
    const match = targets.find(t => {
      const empMatches = String(t.employeeId || t.employee_id || '').toLowerCase() === employeeId.toLowerCase();
      const kpiMatches = t.kpiId === kpi.kpiId || (t.kpiName && kpi.kpiName && t.kpiName.toLowerCase().includes(kpi.kpiName.toLowerCase()));
      // Critical Rule: Only ACCEPTED targets (or legacy active records without pending/rejected flags) are official targets
      const isAccepted = !t.status || t.status === 'ACCEPTED';
      return empMatches && kpiMatches && isAccepted;
    });
    if (match) {
      return Number(match.annualTarget ?? match.targetValue ?? kpi.defaultAnnualTarget);
    }
    // Special rule for deposit target on USR-2213 / USR-2725
    if (kpi.kpiId === 'KPI-001' && (employeeId === '2213' || employeeId === '2725' || employeeId === 'USR-2213' || employeeId === 'USR-2725')) {
      return 6600000;
    }
    return kpi.defaultAnnualTarget;
  };

  const kpisResult: KpiPerformanceItem[] = CORE_KPIS.map(kpi => {
    const annualTarget = getAnnualTarget(kpi);
    const allocations = allocatePeriodTargets(annualTarget);
    
    let applicableTarget = 0;
    switch (periodType) {
      case 'daily': applicableTarget = allocations.daily; break;
      case 'weekly': applicableTarget = allocations.weekly; break;
      case 'monthly': applicableTarget = allocations.monthly; break;
      case 'quarterly': applicableTarget = allocations.quarterly; break;
      case 'semiAnnual': applicableTarget = allocations.semiAnnual; break;
      case 'annual': applicableTarget = allocations.annual; break;
    }

    const actualAchievement = actualsMap[kpi.kpiId] || 0;
    const performancePercentage = calculatePerformancePercentage(actualAchievement, applicableTarget);
    const variance = Number((actualAchievement - applicableTarget).toFixed(2));
    const isExceeded = actualAchievement >= applicableTarget && applicableTarget > 0;

    return {
      kpiId: kpi.kpiId,
      kpiCode: kpi.kpiCode,
      kpiName: kpi.kpiName,
      category: kpi.category,
      unit: kpi.unit,
      isCurrency: kpi.isCurrency,
      annualTarget,
      applicableTarget,
      actualAchievement,
      performancePercentage,
      variance,
      isExceeded
    };
  });

  // Calculate Weighted Categories
  const depItem = kpisResult.find(k => k.kpiId === 'KPI-001')!;
  const fcyItem = kpisResult.find(k => k.kpiId === 'KPI-002')!;
  const dfsItem = kpisResult.find(k => k.kpiId === 'KPI-003')!;
  const custItem = kpisResult.find(k => k.kpiId === 'KPI-004')!;
  const mbItem = kpisResult.find(k => k.kpiId === 'KPI-005')!;
  const ibItem = kpisResult.find(k => k.kpiId === 'KPI-006')!;
  const merchItem = kpisResult.find(k => k.kpiId === 'KPI-007')!;
  const atmItem = kpisResult.find(k => k.kpiId === 'KPI-008')!;

  const financialScore = Number(((depItem.performancePercentage * 0.20) + (fcyItem.performancePercentage * 0.15) + (dfsItem.performancePercentage * 0.20)).toFixed(2));
  const customerAcqScore = Number((custItem.performancePercentage * 0.20).toFixed(2));
  const digitalAvg = (mbItem.performancePercentage + ibItem.performancePercentage + merchItem.performancePercentage + atmItem.performancePercentage) / 4;
  const digitalBankingScore = Number((digitalAvg * 0.25).toFixed(2));

  const rawScore = Number((financialScore + customerAcqScore + digitalBankingScore).toFixed(1));
  const overallPerformancePercentage = capPerformancePercentage(rawScore);
  const classification = getPerformanceClassification(rawScore);

  let gradeLetter: 'A+' | 'A' | 'B' | 'C' | 'D' = 'D';
  if (classification.key === 'OUTSTANDING') gradeLetter = 'A+';
  else if (classification.key === 'EXCELLENT') gradeLetter = 'A';
  else if (classification.key === 'SATISFACTORY') gradeLetter = 'B';
  else if (classification.key === 'UNSATISFACTORY') gradeLetter = 'C';
  else gradeLetter = 'D';

  const grade: PeriodPerformanceResult['grade'] = {
    letter: gradeLetter,
    label: `${classification.badgeEmoji} ${classification.label}`,
    badgeClass: classification.badgeClass
  };

  return {
    period: periodType,
    periodLabel: label,
    startDate: start,
    endDate: end,
    validWorkingDays: validDays,
    totalAnnualWorkingDays: totalYearDays,
    scaleRatio,
    recordCount: filteredReports.length,
    kpis: kpisResult,
    categoryScores: {
      financial: financialScore,
      customerAcquisition: customerAcqScore,
      digitalBanking: digitalBankingScore
    },
    overallPerformancePercentage,
    rawPerformancePercentage: rawScore,
    classification,
    grade
  };
}

/**
 * Format KPI values for UI displays (e.g. "ETB 1,250,000" or "45 Accounts")
 */
export function formatKpiValue(val: number, isCurrency: boolean, unit?: string): string {
  const num = Number(val) || 0;
  if (isCurrency) {
    if (unit === 'USD') {
      return `$ ${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `ETB ${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return `${num.toLocaleString()} ${unit || ''}`.trim();
}

/**
 * Calculates performance percentages for the four standard KPI groups:
 * 1. Finance
 * 2. Stakeholder
 * 3. Internal Business
 * 4. Learning & Growth
 */
export function calculateKpiGroupPerformances(kpis: any[], targets: any[], reports: any[]) {
  const groups = ['Finance', 'Stakeholder', 'Internal Business', 'Learning & Growth'];
  const results: Record<string, { target: number; achieved: number; percentage: number; kpiCount: number }> = {};

  for (const g of groups) {
    results[g] = { target: 0, achieved: 0, percentage: 0, kpiCount: 0 };
  }

  // Count kpis per group
  for (const k of (kpis || [])) {
    const cat = k.category || 'Finance';
    if (results[cat]) {
      results[cat].kpiCount++;
    }
  }

  // Sum targets
  for (const t of (targets || [])) {
    const kpi = (kpis || []).find((k: any) => k.id === t.kpiId || k.name === t.kpiName || k.code === t.kpiCode);
    const grp = kpi ? (kpi.category || 'Finance') : 'Finance';
    if (results[grp]) {
      results[grp].target += (Number(t.targetValue) || 0);
    }
  }

  // Sum achieved from approved reports
  const approved = (reports || []).filter((r: any) => r.status === 'Approved');
  for (const r of approved) {
    if (results['Finance']) {
      results['Finance'].achieved += (Number(r.depositsETB) || Number(r.deposits_etb) || 0) +
                                     (Number(r.foreignCurrencyETB) || Number(r.foreign_currency_etb) || 0) +
                                     (Number(r.digitalFinancialServicesETB) || Number(r.digital_financial_services_etb) || 0);
    }
    if (results['Stakeholder']) {
      results['Stakeholder'].achieved += (Number(r.accountOpenings) || Number(r.customerOnboarding) || 0);
    }
    if (results['Internal Business']) {
      results['Internal Business'].achieved += (Number(r.mobileBankingActivations) || 0) +
                                               (Number(r.internetBankingActivations) || 0) +
                                               (Number(r.merchantSolutions) || 0) +
                                               (Number(r.atmCardActivations) || 0);
    }
  }

  for (const grp of groups) {
    const d = results[grp];
    if (d.target > 0) {
      d.percentage = capPerformancePercentage((d.achieved / d.target) * 100);
    } else {
      d.percentage = d.achieved > 0 ? 100 : 0;
    }
  }

  return results;
}

