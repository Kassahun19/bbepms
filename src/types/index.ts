export type UserRole = 
  | 'BANK_SUPER_ADMIN'
  | 'ADMINISTRATOR' 
  | 'BOARD_OF_DIRECTORS' 
  | 'CEO' 
  | 'CHIEF_OFFICER' 
  | 'DIRECTOR' 
  | 'DISTRICT_DIRECTOR' 
  | 'MANAGER' 
  | 'EMPLOYEE';

export interface ChiefType {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  category: string;
  description: string;
  assignedDistrictIds?: string[];
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

export interface SystemSettings {
  bankName: string;
  bankShortName: string;
  bankCode: string;
  tagline: string;
  logoUrl?: string;
  activeFiscalYearId: string;
  workingDays: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[];
  saturdayWorkingHours: 'Half Day' | 'Full Day' | 'Non-Working';
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
    maxFailedAttempts: number;
  };
  sessionTimeoutMinutes: number;
  enableAuditLogging: boolean;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  theme: 'Light' | 'Dark' | 'System';
  updatedAt?: string;
}

export interface PermissionDefinition {
  code: string;
  name: string;
  category: 'Organization' | 'Users' | 'KPI & Targets' | 'Performance & Reports' | 'System & Security' | 'Audit';
  description: string;
}

export interface RoleDefinition {
  id: string;
  role: UserRole | string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  scopeType: 'GLOBAL' | 'DISTRICT' | 'BRANCH' | 'SELF';
  userCount?: number;
  isSystemRole?: boolean;
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

export interface SecuritySession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  loginTime: string;
  lastActiveTime: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface SecurityAlert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  userId?: string;
  resolved: boolean;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalBoardMembers: number;
  totalCeos: number;
  totalChiefs: number;
  totalDistricts: number;
  totalDistrictDirectors: number;
  totalBranches: number;
  totalBranchManagers: number;
  totalEmployees: number;
  activeKpis: number;
  totalKpiGroups: number;
  totalKpiTargets: number;
  pendingApprovals: number;
  completedReviews: number;
  systemAlertsCount: number;
  recentActivities: AuditLog[];
}

export interface ApprovalWorkflowRule {
  id: string;
  name: string;
  stageOrder: number;
  fromRole: UserRole;
  approverRole: UserRole;
  scopeRequirement: 'SAME_BRANCH' | 'SAME_DISTRICT' | 'BANK_WIDE';
  autoEscalateDays: number;
  requireCommentOnReject: boolean;
  status: 'Active' | 'Inactive';
}

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
  grade?: string;
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
  isLocked?: boolean;
  createdAt: string;
}

export function getUserFullName(user?: { firstName?: string; middleName?: string; lastName?: string } | null): string {
  if (!user) return '';
  const first = user.firstName || '';
  const middle = user.middleName || user.lastName || '';
  return `${first} ${middle}`.trim();
}

export type KpiGroup = 'Finance' | 'Stakeholder' | 'Internal Business' | 'Learning & Growth';

export interface KPI {
  id: string;
  code: string;
  name: string;
  category: KpiGroup;
  unit: 'ETB' | 'Count' | 'Percentage' | 'Users' | 'Accounts' | 'Merchants' | 'Cards' | 'USD';
  weight: number; // percentage weight in overall score
  description: string;
  frequency?: string;
  status?: 'Active' | 'Inactive';
}

export interface PeriodTargetAllocations {
  daily: number;
  weekly: number;
  monthly: number;
  quarterly: number;
  semiAnnual: number;
  annual: number;
}

export interface FiscalYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'CLOSED';
  isActive: boolean;
  is_active: number;
  createdAt?: string;
  updatedAt?: string;
}

export type TargetStatus = 'DRAFT' | 'PENDING_ACCEPTANCE' | 'ACCEPTED' | 'REJECTED';

export interface TargetAuditEntry {
  action: 'CREATED' | 'UPDATED' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'REVISED';
  performedBy: string;
  performedByName?: string;
  performedAt: string;
  previousStatus?: TargetStatus;
  newStatus: TargetStatus;
  rejectionReason?: string;
  notes?: string;
  targetValue?: number;
}

export interface PerformanceTarget {
  id: string;
  kpiId: string;
  kpiCode?: string;
  kpi_id?: string;
  kpi_code?: string;
  kpiName: string;
  kpi_name?: string;
  kpiCategory?: string;
  kpiUnit?: string;
  kpiWeight?: number;
  employeeId?: string;
  employee_id?: string;
  employeeName?: string;
  employee_name?: string;
  branchId?: string;
  branch_id?: string;
  branchName?: string;
  branch_name?: string;
  solId?: string;
  sol_id?: string;
  districtId?: string;
  districtName?: string;
  fiscal_year_id?: string;
  fiscalYearId?: string;
  period: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  year: number;
  month?: number;
  targetValue: number;
  annualTarget?: number;
  periodTargets?: PeriodTargetAllocations;
  status?: TargetStatus;
  assignedBy?: string;
  assignedByName?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  created_at?: string;
  sentBy?: string;
  sentByName?: string;
  sentAt?: string;
  employeeResponse?: 'ACCEPTED' | 'REJECTED';
  employeeResponseDate?: string;
  rejectionReason?: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedAt?: string;
  updated_at?: string;
  revisionCount?: number;
  auditHistory?: TargetAuditEntry[];
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
  fiscal_year_id?: string;
  fiscalYearId?: string;
  fiscalYearName?: string;
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
  entity?: string;
  details?: string;
  previousValue?: any;
  newValue?: any;
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
