export type UserRole = 'ADMINISTRATOR' | 'MANAGER' | 'EMPLOYEE';

export * from './competitor';

export type Language = 'en' | 'am';

export type ApprovalStatus = 'Draft' | 'Submitted' | 'Pending' | 'Approved' | 'Rejected' | 'Returned' | 'Suspended';

export interface District {
  id: string;
  solId?: string;
  name: string;
  code: string;
  region: string;
  status?: 'Active' | 'Inactive';
  type?: 'District' | 'Area Office';
  branchCount: number;
  totalEmployees: number;
  managerName: string;
  phone?: string;
  email?: string;
  secEmail?: string;
  location?: string;
  operationManager?: string;
}

export interface Branch {
  id: string;
  solId?: string;
  districtId: string;
  districtName: string;
  name: string;
  code: string;
  phone?: string;
  type?: 'Main Branch' | 'Grade I' | 'Grade II' | 'Grade III' | 'Special Branch' | string;
  employeeCount: number;
  managerName: string;
  location: string;
  region?: string;
  status?: 'Active' | 'Inactive';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface User {
  id: string;
  userId: string;
  password?: string;
  email: string;
  firstName: string;
  middleName: string;
  lastName: string;
  role: UserRole;
  roleType?: string;
  managerId?: string;
  jobTitle: string;
  districtId: string;
  districtName: string;
  branchId: string;
  branchName: string;
  departmentId?: string;
  gender: 'Male' | 'Female';
  age: number;
  phone: string;
  avatarUrl?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
}

export function getUserFullName(user?: { firstName?: string; middleName?: string; lastName?: string } | null): string {
  if (!user) return '';
  const first = user.firstName || '';
  const middle = user.middleName || user.lastName || '';
  return `${first} ${middle}`.trim();
}

export interface KPI {
  id: string;
  code: string;
  name: string;
  category: 'Financial' | 'Digital Banking' | 'Customer Acquisition' | 'Operational Excellence';
  unit: 'ETB' | 'Count' | 'Percentage';
  weight: number; // percentage weight in overall score
  description: string;
}

export interface PerformanceTarget {
  id: string;
  kpiId: string;
  kpiCode?: string;
  kpiName: string;
  employeeId?: string;
  branchId?: string;
  period: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  year: number;
  month?: number;
  targetValue: number;
}

export interface DailyPerformanceReport {
  id: string;
  employeeId: string;
  employee_id?: string;
  employeeName: string;
  employee_name?: string;
  employeeUserId?: string;
  branchId: string;
  branch_id?: string;
  branchName: string;
  solId?: string;
  sol_id?: string;
  districtId?: string;
  districtName?: string;
  reportDate: string; // YYYY-MM-DD
  report_date?: string;
  date?: string;
  year?: number;
  month?: number;
  dayOfWeek: string;
  day_of_week?: string;
  status: ApprovalStatus;
  
  // Financial Metrics (ETB)
  depositsETB?: number;
  deposits_etb?: number;
  foreignCurrencyETB?: number;
  foreign_currency_etb?: number;
  digitalFinancialServicesETB?: number;
  digital_financial_services_etb?: number;
  actualValue?: number;
  kpiId?: string;
  
  // Core Daily KPI Fields (both camelCase and snake_case supported)
  customerOnboarding?: number;
  customer_onboarding?: number;
  accountOpenings: number; // alias
  
  mobileBanking?: number;
  mobile_banking?: number;
  mobileBankingActivations: number; // alias
  
  internetBanking?: number;
  internet_banking?: number;
  internetBankingActivations: number; // alias
  
  atmDebitCards?: number;
  atm_debit_cards?: number;
  atmCardActivations?: number; // alias
  atmCardsIssued?: number; // alias
  
  merchantSolutions: number;
  merchant_solutions?: number;
  merchantSolutionsActivations?: number; // alias
  
  managerComment?: string;
  
  submittedAt?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: ReportComment[];
  auditHistory?: AuditHistoryEntry[];
}

export interface EmployeeDailyKpiReport {
  id: string;
  employee_id: string;
  employee_name: string;
  branch_id: string;
  sol_id?: string;
  report_date: string;
  day_of_week: string;
  customer_onboarding: number;
  mobile_banking: number;
  internet_banking: number;
  atm_debit_cards: number;
  merchant_solutions: number;
  created_at: string;
  updated_at: string;
}

export interface KpiReportSummary {
  period: string;
  recordCount: number;
  customerOnboarding: number;
  mobileBanking: number;
  internetBanking: number;
  atmDebitCards: number;
  merchantSolutions: number;
  depositsETB: number;
}

export interface BranchKpiSummary {
  branchId: string;
  branchName: string;
  totalRecords: number;
  totals: {
    customerOnboarding: number;
    mobileBanking: number;
    internetBanking: number;
    atmDebitCards: number;
    merchantSolutions: number;
  };
  employees: Array<{
    employeeId: string;
    employeeName: string;
    customerOnboarding: number;
    mobileBanking: number;
    internetBanking: number;
    atmDebitCards: number;
    merchantSolutions: number;
    recordCount: number;
  }>;
}

export interface ReportComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
}

export interface AuditHistoryEntry {
  id: string;
  action: string;
  performedBy: string;
  performedByRole: string;
  timestamp: string;
  details: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'High' | 'Normal' | 'Urgent';
  targetRole: 'ALL' | 'MANAGER' | 'EMPLOYEE';
  publishedAt: string;
  author: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'approval' | 'rejection' | 'target' | 'announcement' | 'system';
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface BankHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  description: string;
  recurring: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  ipAddress: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
}

export interface PerformanceSummary {
  employeeId: string;
  period: string;
  totalDeposits: number;
  totalFCY: number;
  totalDFS: number;
  totalAccounts: number;
  totalMobileBanking: number;
  totalInternetBanking: number;
  totalMerchants: number;
  totalATMs: number;
  kpiAchievements: {
    kpiName: string;
    target: number;
    achieved: number;
    completionPercentage: number;
    remaining: number;
  }[];
  overallCompletionPercentage: number;
  grade: 'A+ (Outstanding)' | 'A (Exceeds Expectations)' | 'B (Meets Target)' | 'C (Needs Improvement)' | 'D (Unsatisfactory)';
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  roleOrUnit: string;
  branchName: string;
  districtName: string;
  score: number;
  depositsETB: number;
  digitalActivations: number;
  growthPercentage: number;
  badge: string;
}
