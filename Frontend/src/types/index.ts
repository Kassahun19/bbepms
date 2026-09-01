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

export interface User {
  id: string;
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: UserRole;
  jobTitle: string;
  branchId?: string;
  branchName?: string;
  districtId?: string;
  districtName?: string;
  departmentId?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

export interface KpiMetric {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  weight: number;
  description?: string;
  frequency?: string;
  status?: string;
}

export interface DailyReport {
  id: string;
  employeeId: string;
  employeeName: string;
  branchId: string;
  branchName: string;
  districtId?: string;
  districtName?: string;
  reportDate: string;
  dayOfWeek: string;
  status: 'Draft' | 'Submitted' | 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  customerOnboarding: number;
  mobileBanking: number;
  internetBanking: number;
  atmDebitCards: number;
  merchantSolutions: number;
  depositsETB: number;
  foreignCurrencyETB: number;
  digitalFinancialServicesETB: number;
  managerComment?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface PerformanceTarget {
  id: string;
  kpiId: string;
  kpiName?: string;
  employeeId?: string;
  branchId?: string;
  districtId?: string;
  period: string;
  year: number;
  targetValue: number;
  annualTarget: number;
  dailyTarget?: number;
  weeklyTarget?: number;
  monthlyTarget?: number;
  status: string;
}

export interface Branch {
  id: string;
  solId: string;
  code: string;
  name: string;
  districtId: string;
  districtName?: string;
  grade: string;
  type: string;
  managerName?: string;
  location?: string;
  status: string;
}

export interface District {
  id: string;
  code: string;
  name: string;
  region: string;
  managerName?: string;
  branchCount: number;
  totalEmployees: number;
  status: string;
}
