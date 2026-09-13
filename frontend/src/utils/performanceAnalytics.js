// =============================================================================
// Bunna Bank EPMS - Performance Analytics Calculation Engine (Frontend Utility)
// =============================================================================

export function normalizeReport(raw) {
  if (!raw) return {};

  const kpis = Array.isArray(raw.kpiEntries) ? raw.kpiEntries : [];
  
  let deposits = Number(raw.depositsETB || 0);
  let fcy = Number(raw.foreignCurrencyETB || 0);
  let dfs = Number(raw.digitalFinancialServicesETB || 0);
  let accounts = Number(raw.customerOnboarding || 0);
  let mobile = Number(raw.mobileBanking || 0);
  let atm = Number(raw.atmDebitCards || 0);
  let merchant = Number(raw.merchantSolutions || 0);
  let internet = Number(raw.internetBanking || 0);

  for (const entry of kpis) {
    const code = (entry.kpiCode || '').toUpperCase();
    const val = Number(entry.actualValue || 0);
    if (code.includes('DEP') || code === 'KPI-001') deposits = Math.max(deposits, val);
    else if (code.includes('FCY') || code === 'KPI-002') fcy = Math.max(fcy, val);
    else if (code.includes('DFS') || code === 'KPI-003') dfs = Math.max(dfs, val);
    else if (code.includes('ACC') || code.includes('ONBOARD') || code === 'KPI-004') accounts = Math.max(accounts, val);
    else if (code.includes('MOB') || code === 'KPI-005') mobile = Math.max(mobile, val);
    else if (code.includes('ATM') || code.includes('CARD') || code === 'KPI-006') atm = Math.max(atm, val);
    else if (code.includes('MERCH') || code.includes('POS') || code === 'KPI-007') merchant = Math.max(merchant, val);
    else if (code.includes('NET') || code.includes('IB') || code === 'KPI-008') internet = Math.max(internet, val);
  }

  const totalScore = Number(raw.totalScore || raw.score || (raw.overallAchievementRate ? raw.overallAchievementRate : 0));

  return {
    ...raw,
    id: String(raw.id || ''),
    employeeId: String(raw.employeeId || raw.userId || ''),
    employeeName: String(raw.employeeName || raw.userName || 'Employee'),
    districtId: String(raw.districtId || ''),
    branchId: String(raw.branchId || ''),
    reportDate: String(raw.reportDate || raw.date || new Date().toISOString().split('T')[0]),
    status: String(raw.status || 'Pending'),
    totalScore: isNaN(totalScore) ? 0 : totalScore,
    depositsETB: deposits,
    foreignCurrencyETB: fcy,
    digitalFinancialServicesETB: dfs,
    customerOnboarding: accounts,
    mobileBanking: mobile,
    atmDebitCards: atm,
    merchantSolutions: merchant,
    internetBanking: internet
  };
}

export function calculateDistrictRankings(districts, reports, branches) {
  if (!Array.isArray(districts) || districts.length === 0) return [];
  const normalizedReports = (reports || []).map(normalizeReport);

  const districtMap = new Map();
  for (const d of districts) {
    districtMap.set(d.id || d.districtId, {
      districtId: d.id || d.districtId,
      districtName: d.name || d.districtName || 'Unknown District',
      region: d.region || 'Addis Ababa',
      totalDepositsETB: 0,
      totalFCY: 0,
      totalDFS: 0,
      totalCustomerOnboarding: 0,
      totalMobileBanking: 0,
      totalAtmCards: 0,
      totalMerchantSolutions: 0,
      totalInternetBanking: 0,
      approvedReportsCount: 0,
      totalReportsCount: 0,
      totalScoreSum: 0,
      branchCount: 0,
      activeStaffCount: 0
    });
  }

  // Count branches per district
  if (Array.isArray(branches)) {
    for (const b of branches) {
      const dId = b.districtId;
      if (dId && districtMap.has(dId)) {
        districtMap.get(dId).branchCount += 1;
      }
    }
  }

  for (const r of normalizedReports) {
    const dId = r.districtId;
    if (dId && districtMap.has(dId)) {
      const item = districtMap.get(dId);
      item.totalReportsCount += 1;
      if (r.status === 'Approved') {
        item.approvedReportsCount += 1;
        item.totalDepositsETB += r.depositsETB;
        item.totalFCY += r.foreignCurrencyETB;
        item.totalDFS += r.digitalFinancialServicesETB;
        item.totalCustomerOnboarding += r.customerOnboarding;
        item.totalMobileBanking += r.mobileBanking;
        item.totalAtmCards += r.atmDebitCards;
        item.totalMerchantSolutions += r.merchantSolutions;
        item.totalInternetBanking += r.internetBanking;
        item.totalScoreSum += r.totalScore;
      }
    }
  }

  const results = Array.from(districtMap.values()).map(d => {
    const avgScore = d.approvedReportsCount > 0 
      ? Number((d.totalScoreSum / d.approvedReportsCount).toFixed(2)) 
      : 0;
    
    // Performance score capped at 100%
    const compositeScore = Math.min(100, Math.max(0, avgScore));

    return {
      ...d,
      averageScore: avgScore,
      compositeScore,
      rank: 0
    };
  });

  results.sort((a, b) => b.compositeScore - a.compositeScore || b.totalDepositsETB - a.totalDepositsETB);
  results.forEach((item, index) => {
    item.rank = index + 1;
  });

  return results;
}

export function calculateBranchRankings(branches, reports) {
  if (!Array.isArray(branches) || branches.length === 0) return [];
  const normalizedReports = (reports || []).map(normalizeReport);

  const branchMap = new Map();
  for (const b of branches) {
    branchMap.set(b.id || b.branchId, {
      branchId: b.id || b.branchId,
      branchName: b.name || b.branchName || 'Unknown Branch',
      solId: b.solId || b.code || '',
      districtId: b.districtId || '',
      grade: b.grade || 'Grade I',
      totalDepositsETB: 0,
      totalFCY: 0,
      totalDFS: 0,
      totalCustomerOnboarding: 0,
      totalMobileBanking: 0,
      totalAtmCards: 0,
      totalMerchantSolutions: 0,
      totalInternetBanking: 0,
      approvedReportsCount: 0,
      totalScoreSum: 0,
      rank: 0
    });
  }

  for (const r of normalizedReports) {
    const bId = r.branchId;
    if (bId && branchMap.has(bId)) {
      const b = branchMap.get(bId);
      if (r.status === 'Approved') {
        b.approvedReportsCount += 1;
        b.totalDepositsETB += r.depositsETB;
        b.totalFCY += r.foreignCurrencyETB;
        b.totalDFS += r.digitalFinancialServicesETB;
        b.totalCustomerOnboarding += r.customerOnboarding;
        b.totalMobileBanking += r.mobileBanking;
        b.totalAtmCards += r.atmDebitCards;
        b.totalMerchantSolutions += r.merchantSolutions;
        b.totalInternetBanking += r.internetBanking;
        b.totalScoreSum += r.totalScore;
      }
    }
  }

  const results = Array.from(branchMap.values()).map(b => {
    const avgScore = b.approvedReportsCount > 0 
      ? Number((b.totalScoreSum / b.approvedReportsCount).toFixed(2)) 
      : 0;
    return {
      ...b,
      averageScore: avgScore,
      compositeScore: Math.min(100, Math.max(0, avgScore)),
      rank: 0
    };
  });

  results.sort((a, b) => b.compositeScore - a.compositeScore || b.totalDepositsETB - a.totalDepositsETB);
  results.forEach((item, index) => {
    item.rank = index + 1;
  });

  return results;
}

export function calculateEmployeeRankings(employees, reports) {
  if (!Array.isArray(employees) || employees.length === 0) return [];
  const normalizedReports = (reports || []).map(normalizeReport);

  const empMap = new Map();
  for (const e of employees) {
    empMap.set(e.id || e.userId, {
      employeeId: e.id || e.userId,
      employeeName: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.name || 'Employee',
      branchId: e.branchId || '',
      districtId: e.districtId || '',
      role: e.role || 'EMPLOYEE',
      totalDepositsETB: 0,
      totalFCY: 0,
      totalDFS: 0,
      totalCustomerOnboarding: 0,
      totalMobileBanking: 0,
      totalAtmCards: 0,
      totalMerchantSolutions: 0,
      totalInternetBanking: 0,
      approvedReportsCount: 0,
      totalScoreSum: 0,
      rank: 0
    });
  }

  for (const r of normalizedReports) {
    const eId = r.employeeId;
    if (eId && empMap.has(eId)) {
      const emp = empMap.get(eId);
      if (r.status === 'Approved') {
        emp.approvedReportsCount += 1;
        emp.totalDepositsETB += r.depositsETB;
        emp.totalFCY += r.foreignCurrencyETB;
        emp.totalDFS += r.digitalFinancialServicesETB;
        emp.totalCustomerOnboarding += r.customerOnboarding;
        emp.totalMobileBanking += r.mobileBanking;
        emp.totalAtmCards += r.atmDebitCards;
        emp.totalMerchantSolutions += r.merchantSolutions;
        emp.totalInternetBanking += r.internetBanking;
        emp.totalScoreSum += r.totalScore;
      }
    }
  }

  const results = Array.from(empMap.values()).map(e => {
    const avgScore = e.approvedReportsCount > 0 
      ? Number((e.totalScoreSum / e.approvedReportsCount).toFixed(2)) 
      : 0;
    return {
      ...e,
      averageScore: avgScore,
      compositeScore: Math.min(100, Math.max(0, avgScore)),
      rank: 0
    };
  });

  results.sort((a, b) => b.compositeScore - a.compositeScore || b.totalDepositsETB - a.totalDepositsETB);
  results.forEach((item, index) => {
    item.rank = index + 1;
  });

  return results;
}
