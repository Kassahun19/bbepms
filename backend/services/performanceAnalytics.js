// backend/services/performanceAnalytics.js

// Ethiopian banking calendar: 300 operational days per annual cycle
export const BANKING_DAYS_PER_YEAR = 300;

export function capPerformancePercentage(percentage) {
  if (percentage == null || isNaN(percentage)) return 0;
  // Preserve negative outflow rates
  if (percentage < 0) return Number(percentage.toFixed(1));
  // Upper bound capping at 100.0%
  return Number(Math.min(100.0, percentage).toFixed(1));
}

export function getPerformanceClassification(percentage) {
  const p = percentage || 0;
  if (p >= 100) {
    return {
      tier: 'Outstanding',
      grade: 'A+',
      color: 'emerald',
      bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Outstanding Target Achievement'
    };
  }
  if (p >= 85) {
    return {
      tier: 'Excellent',
      grade: 'A',
      color: 'blue',
      bgColor: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'Excellent Performance'
    };
  }
  if (p >= 70) {
    return {
      tier: 'Satisfactory',
      grade: 'B',
      color: 'teal',
      bgColor: 'bg-teal-50 text-teal-700 border-teal-200',
      label: 'Satisfactory Progression'
    };
  }
  if (p >= 50) {
    return {
      tier: 'Unsatisfactory',
      grade: 'C',
      color: 'amber',
      bgColor: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Underperforming Target Gap'
    };
  }
  return {
    tier: 'Critical',
    grade: 'D',
    color: 'rose',
    bgColor: 'bg-rose-50 text-rose-700 border-rose-200',
    label: 'Critical Performance Deficit'
  };
}

export function decomposeAnnualTarget(annualTarget) {
  const annual = Number(annualTarget) || 0;
  const daily = Number((annual / BANKING_DAYS_PER_YEAR).toFixed(2));
  const weekly = Number((annual / 52).toFixed(2));
  const monthly = Number((annual / 12).toFixed(2));
  const quarterly = Number((annual / 4).toFixed(2));
  const semiAnnual = Number((annual / 2).toFixed(2));
  return { annual, daily, weekly, monthly, quarterly, semiAnnual };
}

export function calculateDistrictRankings(districts, reports, branches) {
  return districts.map(district => {
    const districtBranches = branches.filter(b => b.district_id === district.district_id || b.districtId === district.district_id);
    const branchIds = new Set(districtBranches.map(b => b.branch_id || b.id));
    
    const districtReports = reports.filter(r => 
      branchIds.has(r.branch_id || r.branchId) && 
      (r.status === 'Approved' || r.status === 'approved')
    );

    const totalDeposits = districtReports.reduce((acc, r) => acc + (Number(r.deposits_etb || r.depositsETB) || 0), 0);
    const totalFcy = districtReports.reduce((acc, r) => acc + (Number(r.foreign_currency_etb || r.foreignCurrencyETB) || 0), 0);
    const totalAccounts = districtReports.reduce((acc, r) => acc + (Number(r.customer_onboarding || r.customerOnboarding) || 0), 0);
    const totalDigital = districtReports.reduce((acc, r) => acc + (Number(r.digital_financial_services_etb || r.digitalFinancialServicesETB) || 0), 0);

    // Target benchmark (pro-rated 50B ETB national target across 33 districts)
    const annualDepositTarget = 1500000000; // 1.5B per district average
    const achievementPercent = capPerformancePercentage((totalDeposits / annualDepositTarget) * 100);
    const classification = getPerformanceClassification(achievementPercent);

    return {
      districtId: district.district_id || district.id,
      name: district.name,
      region: district.region,
      branchCount: districtBranches.length,
      totalDeposits,
      totalFcy,
      totalAccounts,
      totalDigital,
      achievementPercent,
      classification
    };
  }).sort((a, b) => b.totalDeposits - a.totalDeposits);
}

export default {
  BANKING_DAYS_PER_YEAR,
  capPerformancePercentage,
  getPerformanceClassification,
  decomposeAnnualTarget,
  calculateDistrictRankings
};
