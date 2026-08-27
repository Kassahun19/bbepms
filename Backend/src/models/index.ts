// =============================================================================
// Bunna Bank S.C. EPMS - Backend Domain Models & Interfaces
// =============================================================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  HR_ADMIN = 'HR_ADMIN',
  DISTRICT_MANAGER = 'DISTRICT_MANAGER',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  EMPLOYEE = 'EMPLOYEE',
  ADMINISTRATOR = 'ADMINISTRATOR',
  MANAGER = 'MANAGER'
}

export enum ApprovalStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Returned = 'Returned',
  Suspended = 'Suspended'
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  role: UserRole | string;
  roleType?: 'Managerial' | 'Non-Managerial';
  jobTitle: string;
  department: string;
  districtId: string;
  districtName?: string;
  branchId: string;
  branchName?: string;
  branchCode?: string;
  branchSolId?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt?: string;
  updatedAt?: string;
}

export interface District {
  id: string;
  code: string;
  name: string;
  region: string;
  directorName: string;
  directorPhone?: string;
  directorEmail?: string;
  branchCount: number;
  employeeCount: number;
  performanceScore: number;
  status: 'Active' | 'Inactive';
}

export interface Branch {
  id: string;
  districtId: string;
  districtName?: string;
  code: string;
  solId?: string;
  name: string;
  type: string;
  location: string;
  managerName: string;
  managerPhone?: string;
  managerEmail?: string;
  employeeCount: number;
  performanceScore: number;
  status: 'Active' | 'Inactive';
}

export interface KPI {
  id: string;
  code: string;
  name: string;
  category: 'Financial' | 'DigitalBanking' | 'CustomerAcquisition' | 'OperationalExcellence';
  targetRole: 'ALL' | 'MANAGER' | 'EMPLOYEE' | 'SUPERVISOR';
  unit: 'ETB' | 'Count' | 'Percentage' | 'Score';
  weight: number;
  defaultTarget?: number;
  isMandatory: boolean;
  priorityTier: 'Urgent' | 'High' | 'Normal';
  description?: string;
}

export interface DailyReport {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole?: string;
  employeeJobTitle?: string;
  districtId: string;
  districtName?: string;
  branchId: string;
  branchName?: string;
  branchSolId?: string;
  reportDate: string;
  status: ApprovalStatus | string;
  totalScore: number;
  kpiEntries: Array<{
    kpiId: string;
    kpiCode: string;
    kpiName: string;
    category: string;
    unit: string;
    weight: number;
    targetValue: number;
    actualValue: number;
    achievementRate: number;
    score: number;
    remarks?: string;
  }>;
  overallRemarks?: string;
  managerComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
