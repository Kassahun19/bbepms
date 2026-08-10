export interface CommercialBank {
  id: string;
  code: string;
  name: string;
  shortName: string;
  establishedYear: number;
  logoUrl?: string;
  swiftCode?: string;
  status: 'Active' | 'Inactive';
  totalBranchesNationwide: number;
  color: string;
  isBunna?: boolean;
}

export interface CompetitorBranch {
  id: string;
  bankId: string;
  bankName: string;
  bankCode: string;
  branchName: string;
  solId?: string;
  region: string;
  zone?: string;
  city: string;
  woreda?: string;
  districtId?: string;
  districtName: string;
  latitude: number;
  longitude: number;
  openingDate?: string;
  status: 'Active' | 'Inactive';
}

export interface CompetitorKpi {
  id: string;
  code: string;
  name: string;
  category: 'Financial' | 'Customer & Growth' | 'Digital Banking' | 'Profitability & Operations';
  unit: 'ETB' | 'Count' | 'Percentage' | 'Score';
  bpiWeight: number; // Weight percentage in Banking Performance Index (BPI) score
  description: string;
  isCustom?: boolean;
}

export interface CompetitorPerformanceMetrics {
  totalCustomers: number;
  newCustomers: number;
  depositsETB: number;
  casaETB: number;
  loanPortfolioETB: number;
  mobileBankingUsers: number;
  internetBankingUsers: number;
  atmUsers: number;
  posUsers: number;
  qrUsers: number;
  revenueETB: number;
  profitETB: number;
  costToIncomeRatio: number; // percentage
  customerSatisfactionScore: number; // 0-100
  complaintResolutionRate: number; // percentage
  employeeProductivityScore: number; // score
  branchGrowthRate: number; // percentage
  marketSharePercentage: number; // percentage
}

export interface CompetitorMonthlyPerformance {
  id: string;
  branchId: string;
  bankId: string;
  bankName: string;
  bankCode: string;
  branchName: string;
  city: string;
  districtName: string;
  year: number;
  month: number;
  period: string; // YYYY-MM
  metrics: CompetitorPerformanceMetrics;
  bpiScore: number; // Calculated Banking Performance Index out of 100
}

export interface AreaRankingEntry {
  rank: number;
  bankId: string;
  bankName: string;
  bankCode: string;
  branchName: string;
  bpiScore: number;
  depositsETB: number;
  customerCount: number;
  loanPortfolioETB: number;
  digitalUsers: number;
  profitETB: number;
  csatScore: number;
  marketSharePercentage: number;
  isBunna: boolean;
}

export interface AreaGapAnalysisItem {
  kpiCode: string;
  kpiName: string;
  bunnaValue: number;
  bestCompetitorValue: number;
  bestCompetitorBank: string;
  difference: number;
  gapPercentage: number;
  unit: string;
  trend: 'improving' | 'declining' | 'stable';
  targetToRankOne: number;
}

export interface AreaRanking {
  id: string;
  areaName: string;
  districtName: string;
  region: string;
  totalBanks: number;
  totalBranches: number;
  bunnaRank: number;
  bunnaBpiScore: number;
  rankings: AreaRankingEntry[];
  gapAnalysis: AreaGapAnalysisItem[];
}

export interface AiRecommendationItem {
  id: string;
  category?: string;
  title: string;
  actionItem: string;
  expectedRankImprovement: string;
  estimatedCustomerIncrease: number;
  estimatedDepositIncreaseETB: number;
  expectedMarketShareGrowthPct: number;
  confidenceScore: number; // e.g. 94
  businessImpact: 'HIGH' | 'CRITICAL' | 'MEDIUM';
}

export interface AiCompetitorInsight {
  id: string;
  areaName: string;
  bunnaRank: number;
  totalCompetitors: number;
  summary: string;
  keyWeaknessKpi: string;
  fastestGrowingCompetitor: string;
  urgentAttentionBranch: string;
  managerFirstStep: string;
  bestPerformingDistrict: string;
  highestGrowthPotentialBranch: string;
  recommendations: AiRecommendationItem[];
  generatedAt: string;
}

export interface CompetitorAlert {
  id: string;
  type: 'RANK_LOSS' | 'COMPETITOR_OVERTAKE' | 'DEPOSIT_DECLINE' | 'CUSTOMER_SLOWDOWN' | 'DIGITAL_DROP' | 'KPI_MISSED';
  title: string;
  message: string;
  areaName: string;
  branchName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  timestamp: string;
  read: boolean;
}
