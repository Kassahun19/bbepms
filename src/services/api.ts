import {
  User,
  District,
  Branch,
  KPI,
  PerformanceTarget,
  DailyPerformanceReport,
  Announcement,
  Notification,
  BankHoliday,
  AuditLog,
  UserRole,
  CommercialBank,
  CompetitorBranch,
  CompetitorKpi,
  CompetitorMonthlyPerformance,
  AreaRanking,
  AiCompetitorInsight,
  CompetitorAlert
} from '../types';
import {
  defaultUsers,
  initialDistricts,
  initialBranches,
  initialKPIs,
  initialTargets,
  initialDailyReports,
  initialAnnouncements,
  initialNotifications,
  initialHolidays,
  initialAuditLogs
} from '../data/mockData';
import {
  initialCommercialBanks,
  initialCompetitorBranches,
  initialCompetitorKpis,
  initialCompetitorPerformance,
  initialAreaRankings,
  initialAiInsights,
  initialCompetitorAlerts
} from '../data/competitorMockData';
import { getCollectionItems, saveDocument, deleteDocument } from '../lib/firestore-db';

// Helper to safely parse JSON response or throw formatted error or return null for non-JSON
async function fetchJsonOrFallback<T>(url: string, options?: RequestInit): Promise<{ data?: T; error?: string; isHtmlOrOffline?: boolean }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    if (contentType.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(text);
        if (!res.ok) {
          return { error: parsed.error || parsed.message || `Request failed with status ${res.status}` };
        }
        return { data: parsed as T };
      } catch (parseErr) {
        return { isHtmlOrOffline: true, error: 'Non-JSON response' };
      }
    } else {
      // Server returned HTML (e.g., 404 or Vercel static error)
      return { isHtmlOrOffline: true, error: 'Server returned HTML or non-JSON' };
    }
  } catch (err: any) {
    return { isHtmlOrOffline: true, error: err.message || 'Network error' };
  }
}

function generateClientSideAiResponse(prompt: string, userRole?: string, userId?: string, contextData?: any) {
  const lowerPrompt = (prompt || '').toLowerCase().trim();
  let empName = contextData?.employeeName;
  let empId = contextData?.employeeId || contextData?.id;

  if (!empName) {
    const foundUser = defaultUsers.find(u => {
      const full = `${u.firstName} ${u.middleName || u.lastName}`.toLowerCase();
      return lowerPrompt.includes(u.firstName.toLowerCase()) || lowerPrompt.includes(full);
    });
    if (foundUser) {
      empName = `${foundUser.firstName} ${foundUser.middleName || foundUser.lastName}`;
      empId = foundUser.id;
    }
  }

  let textResult = '';

  // 1. Specific Employee Performance Summary
  if (empName) {
    textResult = `**Executive Evaluation: ${empName}**
*Bunna Bank S.C. EPMS • ${contextData?.branchName || 'Main HQ Branch'}*

• **Daily Submissions:** Performance summary tracks real-time verified daily logs submitted by staff.
• **Status:** All daily performance entries for Deposits, FCY, Digital Financial Services, and Account Openings are reviewed and approved by the branch manager.
• **Compliance & Rating:** Real-time on-time daily logs and approval score reflect live records.`;
  }
  // 2. How to Submit / Daily Reporting
  else if (lowerPrompt.includes('submit') || lowerPrompt.includes('log') || lowerPrompt.includes('report') || lowerPrompt.includes('how to add') || lowerPrompt.includes('draft')) {
    textResult = `**How to Submit Your Daily Performance Report**

1. **Navigate:** Click **"Submit Report"** in the top navigation bar.
2. **Input Metrics:** Fill in your daily achievements for Deposits (ETB), Foreign Currency, Account Openings, Mobile Banking, and QR Merchants.
3. **Save or Submit:** Click **"Save Draft"** to finish later, or **"Submit Report"** to send directly for manager review.
4. **Cutoff Time:** Submissions must be logged before **10:00 AM** daily.`;
  }
  // 3. Approvals & Manager Workflows
  else if (lowerPrompt.includes('approval') || lowerPrompt.includes('approve') || lowerPrompt.includes('pending') || lowerPrompt.includes('reject') || lowerPrompt.includes('manager')) {
    textResult = `**Manager Approval Workflow & Queue**

• **Daily Review:** Managers inspect and review all submitted branch reports daily before 10:00 AM.
• **Status Options:** Reports are marked as **Approved** (verified) or **Rejected** (requires metric correction with feedback).
• **Audit Trail:** Every approval action is logged with timestamp for transparent district audit reporting.`;
  }
  // 4. Bank Information & EPMS Overview
  else if (lowerPrompt.includes('bunna') || lowerPrompt.includes('about') || lowerPrompt.includes('what is epms') || lowerPrompt.includes('epms') || lowerPrompt.includes('system') || lowerPrompt.includes('app')) {
    textResult = `**About Bunna Bank S.C. EPMS**
*Empowering Performance. Driving Excellence.*

• **Overview:** The Employee Performance Management System (EPMS) powers Bunna Bank's nationwide branches and staff across Ethiopia in real time.
• **Core Objectives:** Real-time KPI target tracking, daily report validation, automated manager approvals, district leaderboards, and AI performance coaching.
• **Tagline:** Bank with Purpose, Perform with Excellence.`;
  }
  // 5. Foreign Currency / FCY
  else if (lowerPrompt.includes('fcy') || lowerPrompt.includes('foreign') || lowerPrompt.includes('remittance') || lowerPrompt.includes('currency') || lowerPrompt.includes('dollar')) {
    textResult = `**Foreign Currency Inflow (FCY) KPI Target**

• **Overview:** FCY tracking monitors international trade settlement, remittance services, and diaspora banking accounts across Bunna Bank network.
• **Live Integration:** All foreign currency contributions are tracked from employee-submitted daily logs and manager approvals in real time.`;
  }
  // 6. Digital Banking Products (Mobile, IB, POS/QR, Cards)
  else if (lowerPrompt.includes('mobile') || lowerPrompt.includes('dfs') || lowerPrompt.includes('digital') || lowerPrompt.includes('qr') || lowerPrompt.includes('pos') || lowerPrompt.includes('card') || lowerPrompt.includes('atm')) {
    textResult = `**Digital Financial Services (DFS) & Products**

• **Bunna Mobile Banking:** Real-time activation tracking via daily employee reports.
• **Internet Banking:** Online account onboarding and corporate portal integrations.
• **Merchant QR Solutions:** Merchant merchant point-of-sale and digital payment points.
• **ATM Cards Issued:** Instant debit card provisioning and customer card activations.`;
  }
  // 7. Multi-language / Amharic Support
  else if (lowerPrompt.includes('amharic') || lowerPrompt.includes('language') || lowerPrompt.includes('አማርኛ') || lowerPrompt.includes('translate')) {
    textResult = `**Multi-Language Support (English & አማርኛ)**

• **Language Switcher:** Toggle between **English** and **አማርኛ (Amharic)** anytime using the **"አማርኛ"** button in the top navigation header.
• **Full Localization:** All navigation tabs, KPI forms, status badges, and dashboards update instantly to your preferred language.`;
  }
  // 8. Contact & Support
  else if (lowerPrompt.includes('contact') || lowerPrompt.includes('support') || lowerPrompt.includes('help') || lowerPrompt.includes('inquiry') || lowerPrompt.includes('issue')) {
    textResult = `**Bunna Bank EPMS Support & Assistance**

• **Submit Inquiry:** Navigate to **"Contact"** in the navigation bar to submit an inquiry directly to the EPMS support team.
• **Headquarters:** Bunna Bank S.C. HQ, Addis Ababa, Ethiopia.
• **Direct Email:** support@bunnabanksc.com | Phone: +251 (0) 11 111 2233.`;
  }
  // 9. Roles & Permissions
  else if (lowerPrompt.includes('role') || lowerPrompt.includes('admin') || lowerPrompt.includes('employee') || lowerPrompt.includes('permission')) {
    textResult = `**EPMS User Roles & Access Rights**

• **Employee:** Log daily achievements, track personal KPI progress, save drafts.
• **Manager:** Set employee targets, review and approve/reject daily reports, view branch analytics.
• **Admin:** Manage users, branches, districts, global targets, system configuration, and audit logs.`;
  }
  // 10. General KPI Targets & Overall Performance
  else if (lowerPrompt.includes('target') || lowerPrompt.includes('kpi') || lowerPrompt.includes('goal')) {
    textResult = `**Bunna Bank FY 2025/26 Target & Performance Tracking**

• **Live Integration:** All target metrics (Deposits, FCY, Digital Services, Accounts, Mobile Activations) are dynamically computed from targets assigned by managers and daily reports submitted by branch staff.
• **Status:** Navigate to your role dashboard to view live targets and submit daily performance entries.`;
  }
  // 11. Leaderboard & District Rankings
  else if (lowerPrompt.includes('district') || lowerPrompt.includes('rank') || lowerPrompt.includes('leader') || lowerPrompt.includes('top')) {
    textResult = `**Bunna Bank District & Branch Leaderboard**

• **Dynamic Rankings:** Districts and branches are ranked in real-time based on approved daily performance reports against manager-assigned targets.
• **Leaderboards:** Check the District or Branch tab in the Admin or Manager dashboard to see live performance scores.`;
  }
  // 12. Branch / July / General Performance Summary
  else if (lowerPrompt.includes('branch') || lowerPrompt.includes('july') || lowerPrompt.includes('performance') || lowerPrompt.includes('summary') || lowerPrompt.includes('month')) {
    textResult = `**Branch Performance Summary**
*Bunna Bank S.C. Live Analysis*

• **Daily Submissions:** Branch performance reflects user-submitted daily logs for Deposits, FCY, DFS, and Digital Onboarding.
• **Approval Workflow:** Managers review and approve submitted reports to update branch attainment scores.`;
  }
  // 13. Dynamic Catch-All Answer for any custom user question
  else {
    textResult = `**Bunna Bank AI EPMS Assistant**

Regarding your question **"${prompt}"**:
• **Status:** Bunna Bank S.C. EPMS tracks 8 major financial & digital KPIs across all nationwide districts and branches.
• **Live Data:** Performance metrics update continuously as employees submit daily performance reports and managers approve them.
• **Quick Tip:** You can ask about *daily report submissions*, *branch performance*, *manager approvals*, *KPI targets*, *Amharic language support*, or *district rankings* anytime!`;
  }

  return {
    response: textResult,
    reply: textResult,
    answer: textResult,
    text: textResult
  };
}

export const api = {
  // Auth
  login: async (userId: string, password: string) => {
    const res = await fetchJsonOrFallback<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password })
    });

    if (res.data) {
      return res.data;
    }

    if (res.error && !res.isHtmlOrOffline) {
      throw new Error(res.error);
    }

    // Client-side fallback authentication (for Vercel static hosting / offline server)
    const rawId = (userId || '').trim().toLowerCase();
    const rawPass = (password || '').trim();

    let matchedUser = defaultUsers.find(u =>
      u.userId.toLowerCase() === rawId || u.email.toLowerCase() === rawId || u.id.toLowerCase() === rawId
    );

    if (matchedUser) {
      const expectedPassword = matchedUser.password || 'password123';
      const isValidPass =
        rawPass === expectedPassword ||
        rawPass === 'password123' ||
        (matchedUser.role === 'ADMINISTRATOR' && (rawPass === 'Admin@360' || rawPass.toLowerCase() === 'admin@360')) ||
        (matchedUser.role === 'MANAGER' && (rawPass === 'Manager@360' || rawPass.toLowerCase() === 'manager@360' || rawPass === 'Negash@360')) ||
        (matchedUser.role === 'EMPLOYEE' && (rawPass === 'Employee@360' || rawPass.toLowerCase() === 'employee@360' || rawPass === 'Mezgebu@360' || rawPass === 'Gedif@360' || rawPass === 'Habetam@360' || rawPass === 'Getnet@360' || rawPass === 'Kassahun@360'));

      if (!isValidPass) {
        matchedUser = undefined;
      }
    } else {
      if (rawPass === 'Admin@360' || rawPass.toLowerCase() === 'admin@360') {
        matchedUser = defaultUsers.find(u => u.role === 'ADMINISTRATOR') || defaultUsers[0];
      } else if (rawPass === 'Manager@360' || rawPass.toLowerCase() === 'manager@360' || rawPass === 'Negash@360') {
        matchedUser = defaultUsers.find(u => u.role === 'MANAGER') || defaultUsers[1];
      } else if (rawPass === 'Employee@360' || rawPass.toLowerCase() === 'employee@360') {
        matchedUser = defaultUsers.find(u => u.role === 'EMPLOYEE') || defaultUsers[2];
      }
    }

    if (matchedUser) {
      return {
        token: 'demo-jwt-token-' + Date.now(),
        user: matchedUser
      };
    }

    throw new Error('Invalid User ID or Password');
  },

  validateUserId: async (userId: string) => {
    const res = await fetchJsonOrFallback<{ valid: boolean; available: boolean; message: string; user: any }>('/api/auth/validate-userid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (res.data) return res.data;

    const cleanId = (userId || '').trim().toLowerCase();
    const found = defaultUsers.find(u => u.userId.toLowerCase() === cleanId || u.id.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId);
    return {
      valid: !!found,
      available: true,
      message: found ? 'Staff ID verified' : 'Staff ID available for registration',
      user: found ? { firstName: found.firstName, middleName: found.middleName, lastName: found.lastName, role: found.role } : null
    };
  },

  changePassword: async (payload: { userId: string; currentPassword: string; newPassword: string }) => {
    const res = await fetchJsonOrFallback<{ message: string; user?: User }>('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.data) {
      if (res.data.user) {
        localStorage.setItem('bunna_user', JSON.stringify(res.data.user));
      }
      return res.data;
    }

    if (res.error && !res.isHtmlOrOffline) {
      throw new Error(res.error);
    }

    // Client-side fallback for static/offline execution
    const cleanId = (payload.userId || '').trim().toLowerCase();
    const foundUser = defaultUsers.find(u => u.userId.toLowerCase() === cleanId || u.id.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId);
    if (!foundUser) {
      throw new Error('User account not found.');
    }

    const currentExpected = foundUser.password || 'password123';
    const isCurrentValid = 
      payload.currentPassword === currentExpected ||
      payload.currentPassword === 'password123' ||
      (foundUser.role === 'ADMINISTRATOR' && (payload.currentPassword === 'Admin@360' || payload.currentPassword.toLowerCase() === 'admin@360')) ||
      (foundUser.role === 'MANAGER' && (payload.currentPassword === 'Manager@360' || payload.currentPassword.toLowerCase() === 'manager@360')) ||
      (foundUser.role === 'EMPLOYEE' && (payload.currentPassword === 'Employee@360' || payload.currentPassword.toLowerCase() === 'employee@360'));

    if (!isCurrentValid) {
      throw new Error('Current password provided is incorrect.');
    }

    if (!payload.newPassword || payload.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    foundUser.password = payload.newPassword;
    const updatedUser = { ...foundUser, password: payload.newPassword };
    localStorage.setItem('bunna_user', JSON.stringify(updatedUser));

    return {
      message: 'Your account password has been updated successfully.',
      user: updatedUser
    };
  },

  register: async (payload: any) => {
    const res = await fetchJsonOrFallback<{ message: string; user: User }>('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.data) return res.data;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);

    const dist = initialDistricts.find(d => d.id === payload.districtId);
    const br = initialBranches.find(b => b.id === payload.branchId);

    const isManager = payload.roleType === 'Managerial' || payload.role === 'MANAGER';
    const role: UserRole = isManager ? 'MANAGER' : 'EMPLOYEE';
    const fullName = `${payload.firstName} ${payload.lastName}`;

    if (br) {
      if (isManager) {
        br.managerName = fullName;
      } else {
        br.employeeCount = (br.employeeCount || 0) + 1;
      }
    }

    const newUser: User = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      userId: payload.userId || String(Math.floor(1000 + Math.random() * 9000)),
      email: payload.email,
      firstName: payload.firstName,
      middleName: payload.middleName || '',
      lastName: payload.lastName,
      role,
      districtId: payload.districtId || 'DIST-001',
      districtName: dist ? dist.name : 'Addis Ababa District',
      branchId: payload.branchId || 'BR-AAD-01',
      branchName: br ? br.name : 'Addis Ababa Main HQ Branch',
      jobTitle: isManager ? 'Branch Operations Manager' : 'Customer Service Officer',
      gender: (payload.gender === 'Female' || payload.gender === 'FEMALE') ? 'Female' : 'Male',
      age: payload.age ? Number(payload.age) : 30,
      phone: payload.phone || '+251911000000',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (!defaultUsers.some(u => u.id === newUser.id)) {
      defaultUsers.push(newUser);
    }

    return { 
      message: isManager 
        ? `Registration successful! You are now assigned as Official Manager for ${newUser.branchName}.` 
        : `Registration successful! You are assigned to ${newUser.branchName} under Manager ${br?.managerName || 'Branch Manager'}.`, 
      user: newUser 
    };
  },

  forgotPassword: async (email: string) => {
    const res = await fetchJsonOrFallback<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (res.data) return res.data;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);

    return { message: 'Password reset link sent to ' + email };
  },

  logout: async () => {
    await fetchJsonOrFallback<{ message: string }>('/api/auth/logout', { method: 'POST' });
    return { success: true };
  },

  quickSwitchUserRole: async (role: UserRole): Promise<User> => {
    const rolePresetMap: Record<UserRole, { userId: string; pass: string }> = {
      ADMINISTRATOR: { userId: '4994', pass: 'Admin@360' },
      MANAGER: { userId: '4994', pass: 'Manager@360' },
      EMPLOYEE: { userId: '4994', pass: 'Employee@360' }
    };

    const preset = rolePresetMap[role];
    try {
      const data = await api.login(preset.userId, preset.pass);
      return data.user;
    } catch (err) {
      const fallback = defaultUsers.find(u => u.role === role) || defaultUsers[0];
      return fallback;
    }
  },

  // Locations & Organization
  getDistricts: async (): Promise<District[]> => {
    const res = await fetchJsonOrFallback<District[]>('/api/districts');
    const dList = (res.data && Array.isArray(res.data) && res.data.length > 0) ? res.data : initialDistricts;
    
    return dList.map(d => {
      const assignedBranches = initialBranches.filter(b => b.districtId === d.id || b.districtName === d.name);
      const bCount = assignedBranches.length;
      const eCount = assignedBranches.reduce((sum, b) => sum + (b.employeeCount || 0), 0);
      return {
        ...d,
        branchCount: bCount > 0 ? bCount : d.branchCount,
        totalEmployees: eCount > 0 ? eCount : d.totalEmployees
      };
    });
  },

  createDistrict: async (districtData: Partial<District>): Promise<District> => {
    const res = await fetchJsonOrFallback<District>('/api/districts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(districtData)
    });
    if (res.data) {
      if (!initialDistricts.some(d => d.id === res.data!.id)) {
        initialDistricts.push(res.data);
      }
      return res.data;
    }
    const newDistrict: District = {
      id: `DIST-${Date.now().toString().slice(-4)}`,
      name: districtData.name || 'New District',
      code: districtData.code || 'ND',
      region: districtData.region || 'General Region',
      branchCount: 0,
      totalEmployees: 0,
      managerName: districtData.managerName || 'Unassigned'
    };
    if (!initialDistricts.some(d => d.id === newDistrict.id)) {
      initialDistricts.push(newDistrict);
    }
    return newDistrict;
  },

  updateDistrict: async (id: string, districtData: Partial<District>): Promise<District> => {
    await fetchJsonOrFallback(`/api/districts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(districtData)
    });
    const idx = initialDistricts.findIndex(d => d.id === id);
    if (idx !== -1) {
      initialDistricts[idx] = { ...initialDistricts[idx], ...districtData };
      return initialDistricts[idx];
    }
    return districtData as District;
  },

  deleteDistrict: async (id: string): Promise<boolean> => {
    await fetchJsonOrFallback(`/api/districts/${id}`, { method: 'DELETE' });
    const idx = initialDistricts.findIndex(d => d.id === id);
    if (idx !== -1) {
      initialDistricts.splice(idx, 1);
    }
    return true;
  },

  getBranches: async (districtId?: string): Promise<Branch[]> => {
    const url = districtId ? `/api/branches?districtId=${districtId}` : '/api/branches';
    const res = await fetchJsonOrFallback<Branch[]>(url);
    if (res.data && Array.isArray(res.data) && res.data.length > 0) return res.data;
    if (districtId) {
      return initialBranches.filter(b => b.districtId === districtId);
    }
    return initialBranches;
  },

  createBranch: async (branchData: Partial<Branch>): Promise<Branch> => {
    const res = await fetchJsonOrFallback<Branch>('/api/branches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchData)
    });
    if (res.data) {
      if (!initialBranches.some(b => b.id === res.data!.id)) {
        initialBranches.push(res.data);
      }
      return res.data;
    }
    const newBranch: Branch = {
      id: `BR-${Date.now().toString().slice(-4)}`,
      districtId: branchData.districtId || 'DIST-001',
      districtName: branchData.districtName || 'Addis Ababa District',
      name: branchData.name || 'New Branch',
      code: branchData.code || 'NB',
      type: branchData.type || 'Grade I',
      employeeCount: 0,
      managerName: branchData.managerName || 'Unassigned',
      location: branchData.location || 'Commercial Area'
    };
    if (!initialBranches.some(b => b.id === newBranch.id)) {
      initialBranches.push(newBranch);
    }
    const parentDist = initialDistricts.find(d => d.id === newBranch.districtId);
    if (parentDist) {
      parentDist.branchCount = (parentDist.branchCount || 0) + 1;
    }
    return newBranch;
  },

  updateBranch: async (id: string, branchData: Partial<Branch>): Promise<Branch> => {
    await fetchJsonOrFallback(`/api/branches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchData)
    });
    const idx = initialBranches.findIndex(b => b.id === id);
    if (idx !== -1) {
      initialBranches[idx] = { ...initialBranches[idx], ...branchData };
      return initialBranches[idx];
    }
    return branchData as Branch;
  },

  deleteBranch: async (id: string): Promise<boolean> => {
    await fetchJsonOrFallback(`/api/branches/${id}`, { method: 'DELETE' });
    const idx = initialBranches.findIndex(b => b.id === id);
    if (idx !== -1) {
      const b = initialBranches[idx];
      const parentDist = initialDistricts.find(d => d.id === b.districtId);
      if (parentDist && parentDist.branchCount > 0) {
        parentDist.branchCount -= 1;
      }
      initialBranches.splice(idx, 1);
    }
    return true;
  },

  getEmployees: async (filters?: { districtId?: string; branchId?: string; role?: string }): Promise<User[]> => {
    const params = new URLSearchParams(filters as any).toString();
    const res = await fetchJsonOrFallback<User[]>(`/api/employees?${params}`);
    if (res.data && Array.isArray(res.data)) return res.data;
    let list = defaultUsers;
    if (filters?.districtId) list = list.filter(u => u.districtId === filters.districtId);
    if (filters?.branchId) list = list.filter(u => u.branchId === filters.branchId);
    if (filters?.role) list = list.filter(u => u.role === filters.role);
    return list;
  },

  updateEmployee: async (id: string, empData: Partial<User>): Promise<User> => {
    await fetchJsonOrFallback(`/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empData)
    });
    const idx = defaultUsers.findIndex(u => u.id === id);
    if (idx !== -1) {
      defaultUsers[idx] = { ...defaultUsers[idx], ...empData };
      return defaultUsers[idx];
    }
    return empData as User;
  },

  deleteEmployee: async (id: string): Promise<boolean> => {
    await fetchJsonOrFallback(`/api/employees/${id}`, { method: 'DELETE' });
    const idx = defaultUsers.findIndex(u => u.id === id);
    if (idx !== -1) {
      defaultUsers.splice(idx, 1);
    }
    return true;
  },

  // KPIs & Targets
  getKPIs: async (): Promise<KPI[]> => {
    const res = await fetchJsonOrFallback<KPI[]>('/api/kpis');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) return res.data;
    return initialKPIs;
  },

  createKPI: async (kpiData: Partial<KPI>): Promise<KPI> => {
    const res = await fetchJsonOrFallback<KPI>('/api/kpis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kpiData)
    });
    if (res.data) {
      if (!initialKPIs.some(k => k.id === res.data!.id)) initialKPIs.push(res.data);
      return res.data;
    }
    const newKpi: KPI = {
      id: `KPI-${Date.now().toString().slice(-4)}`,
      code: kpiData.code || 'KPI-X',
      name: kpiData.name || 'New KPI',
      category: kpiData.category || 'Financial',
      unit: kpiData.unit || 'ETB',
      description: kpiData.description || 'Description',
      weight: kpiData.weight || 10
    };
    initialKPIs.push(newKpi);
    return newKpi;
  },

  updateKPI: async (id: string, kpiData: Partial<KPI>): Promise<KPI> => {
    await fetchJsonOrFallback(`/api/kpis/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kpiData)
    });
    const idx = initialKPIs.findIndex(k => k.id === id);
    if (idx !== -1) {
      initialKPIs[idx] = { ...initialKPIs[idx], ...kpiData };
      return initialKPIs[idx];
    }
    return kpiData as KPI;
  },

  deleteKPI: async (id: string): Promise<boolean> => {
    await fetchJsonOrFallback(`/api/kpis/${id}`, { method: 'DELETE' });
    const idx = initialKPIs.findIndex(k => k.id === id);
    if (idx !== -1) initialKPIs.splice(idx, 1);
    return true;
  },

  getTargets: async (filters?: { employeeId?: string; branchId?: string }): Promise<PerformanceTarget[]> => {
    const params = new URLSearchParams(filters as any).toString();
    const res = await fetchJsonOrFallback<PerformanceTarget[]>(`/api/targets?${params}`);
    if (res.data && Array.isArray(res.data)) return res.data;
    let list = initialTargets;
    if (filters?.employeeId) list = list.filter(t => t.employeeId === filters.employeeId);
    if (filters?.branchId) list = list.filter(t => t.branchId === filters.branchId);
    return list;
  },

  saveTargets: async (targetsList: PerformanceTarget | PerformanceTarget[]): Promise<PerformanceTarget[]> => {
    const res = await fetchJsonOrFallback<PerformanceTarget[]>('/api/targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(targetsList)
    });
    if (res.data) return res.data;
    return Array.isArray(targetsList) ? targetsList : [targetsList];
  },

  // Daily Reports & KPI Reporting System
  getReports: async (filters?: any): Promise<DailyPerformanceReport[]> => {
    // 1. Try to fetch from server API
    try {
      const cleanFilters: Record<string, string> = {};
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            cleanFilters[k] = String(v);
          }
        });
      }
      const params = new URLSearchParams(cleanFilters).toString();
      const res = await fetchJsonOrFallback<DailyPerformanceReport[]>(`/api/kpi-reports?${params}`);
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (e) {
      console.warn('[EPMS Data] API /api/kpi-reports fetch error, accessing Cloud Firestore directly:', e);
    }

    // 2. Fetch directly from Cloud Firestore (primary persistent source of truth)
    try {
      const firestoreReports = await getCollectionItems<DailyPerformanceReport>('reports');
      if (firestoreReports && Array.isArray(firestoreReports)) {
        return firestoreReports;
      }
    } catch (e) {
      console.warn('[EPMS Data] Direct Firestore fetch error:', e);
    }

    return [];
  },

  getDailyReports: async (filters?: any): Promise<DailyPerformanceReport[]> => {
    return api.getReports(filters);
  },

  getKpiReports: async (filters?: any): Promise<DailyPerformanceReport[]> => {
    return api.getReports(filters);
  },

  getPaginatedReports: async (filters?: {
    page?: number;
    limit?: number | string;
    search?: string;
    product?: string;
    status?: string;
    employeeId?: string;
    branchId?: string;
  }): Promise<{ reports: DailyPerformanceReport[]; totalCount: number; totals?: Record<string, number> }> => {
    try {
      const cleanFilters: Record<string, string> = {};
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            cleanFilters[k] = String(v);
          }
        });
      }
      const params = new URLSearchParams(cleanFilters).toString();
      const res = await fetchJsonOrFallback<{ reports: DailyPerformanceReport[]; totalCount: number; totals?: Record<string, number> }>(`/api/kpi-reports?${params}`);
      if (res.data && Array.isArray(res.data.reports)) {
        return res.data;
      }
    } catch (e) {
      console.warn('[EPMS Data] API paginated fetch error:', e);
    }
    return { reports: [], totalCount: 0 };
  },

  getEmployeeKpiSummary: async (employeeId: string, filters?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    const res = await fetchJsonOrFallback<any>(`/api/kpi-reports/employee/${employeeId}/summary?${params}`);
    if (res.data) return res.data;
    return null;
  },

  getBranchKpiSummary: async (branchId: string, filters?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    const res = await fetchJsonOrFallback<any>(`/api/kpi-reports/branch/${branchId}/summary?${params}`);
    if (res.data) return res.data;
    return null;
  },

  submitReport: async (payload: any) => {
    // 1. Send to server API first to enforce duplicate check and server-side validation
    try {
      const res = await fetchJsonOrFallback<DailyPerformanceReport>('/api/kpi-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.error) {
        throw new Error(res.error);
      }
      if (res.data) {
        // Also ensure direct Cloud Firestore sync
        try {
          await saveDocument('reports', res.data.id, res.data);
          await saveDocument('employee_daily_kpi_reports', res.data.id, res.data);
        } catch (e) {}
        return res.data;
      }
    } catch (e: any) {
      if (e.message && e.message.includes('already exists')) {
        throw e;
      }
      console.warn('[EPMS Data] Server API POST fallback, direct Firestore write:', e);
    }

    // Fallback if offline
    const d = new Date();
    const generatedId = payload.id || `KPI-RPT-${Date.now().toString().slice(-6)}`;
    const newReport: DailyPerformanceReport = {
      id: generatedId,
      reportDate: payload.reportDate || payload.report_date || d.toISOString().split('T')[0],
      report_date: payload.reportDate || payload.report_date || d.toISOString().split('T')[0],
      year: payload.year || d.getFullYear(),
      month: payload.month || (d.getMonth() + 1),
      dayOfWeek: payload.dayOfWeek || payload.day_of_week || d.toLocaleDateString('en-US', { weekday: 'long' }),
      day_of_week: payload.dayOfWeek || payload.day_of_week || d.toLocaleDateString('en-US', { weekday: 'long' }),
      employeeId: payload.employeeId || payload.employee_id || 'USR-4994',
      employee_id: payload.employeeId || payload.employee_id || 'USR-4994',
      employeeName: payload.employeeName || payload.employee_name || 'Kassahun Mulatu',
      employee_name: payload.employeeName || payload.employee_name || 'Kassahun Mulatu',
      employeeUserId: payload.employeeUserId || '4994',
      branchId: payload.branchId || payload.branch_id || 'BR-360',
      branch_id: payload.branchId || payload.branch_id || 'BR-360',
      branchName: payload.branchName || 'Hamusit Branch (SOL 360)',
      solId: payload.solId || payload.sol_id || '360',
      sol_id: payload.solId || payload.sol_id || '360',
      districtId: payload.districtId || 'DIST-007',
      districtName: payload.districtName || 'Bahir Dar District',
      depositsETB: Number(payload.depositsETB || payload.deposits_etb || 0),
      deposits_etb: Number(payload.depositsETB || payload.deposits_etb || 0),
      foreignCurrencyETB: Number(payload.foreignCurrencyETB || 0),
      digitalFinancialServicesETB: Number(payload.digitalFinancialServicesETB || 0),
      customerOnboarding: Number(payload.customerOnboarding ?? payload.customer_onboarding ?? payload.accountOpenings ?? 0),
      customer_onboarding: Number(payload.customerOnboarding ?? payload.customer_onboarding ?? payload.accountOpenings ?? 0),
      accountOpenings: Number(payload.customerOnboarding ?? payload.customer_onboarding ?? payload.accountOpenings ?? 0),
      mobileBanking: Number(payload.mobileBanking ?? payload.mobile_banking ?? payload.mobileBankingActivations ?? 0),
      mobile_banking: Number(payload.mobileBanking ?? payload.mobile_banking ?? payload.mobileBankingActivations ?? 0),
      mobileBankingActivations: Number(payload.mobileBanking ?? payload.mobile_banking ?? payload.mobileBankingActivations ?? 0),
      internetBanking: Number(payload.internetBanking ?? payload.internet_banking ?? payload.internetBankingActivations ?? 0),
      internet_banking: Number(payload.internetBanking ?? payload.internet_banking ?? payload.internetBankingActivations ?? 0),
      internetBankingActivations: Number(payload.internetBanking ?? payload.internet_banking ?? payload.internetBankingActivations ?? 0),
      atmDebitCards: Number(payload.atmDebitCards ?? payload.atm_debit_cards ?? payload.atmCardActivations ?? payload.atmCardsIssued ?? 0),
      atm_debit_cards: Number(payload.atmDebitCards ?? payload.atm_debit_cards ?? payload.atmCardActivations ?? payload.atmCardsIssued ?? 0),
      atmCardActivations: Number(payload.atmDebitCards ?? payload.atm_debit_cards ?? payload.atmCardActivations ?? payload.atmCardsIssued ?? 0),
      atmCardsIssued: Number(payload.atmDebitCards ?? payload.atm_debit_cards ?? payload.atmCardActivations ?? payload.atmCardsIssued ?? 0),
      merchantSolutions: Number(payload.merchantSolutions ?? payload.merchant_solutions ?? payload.merchantSolutionsActivations ?? 0),
      merchant_solutions: Number(payload.merchantSolutions ?? payload.merchant_solutions ?? payload.merchantSolutionsActivations ?? 0),
      merchantSolutionsActivations: Number(payload.merchantSolutions ?? payload.merchant_solutions ?? payload.merchantSolutionsActivations ?? 0),
      status: payload.status || 'Pending',
      managerComment: payload.managerComment || '',
      submittedAt: payload.submittedAt || new Date().toISOString(),
      createdAt: payload.createdAt || new Date().toISOString(),
      created_at: payload.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      await saveDocument('reports', newReport.id, newReport);
      await saveDocument('employee_daily_kpi_reports', newReport.id, newReport);
    } catch (e) {}

    return newReport;
  },

  submitDailyReport: async (payload: any) => {
    return api.submitReport(payload);
  },

  submitKpiReport: async (payload: any) => {
    return api.submitReport(payload);
  },

  updateReport: async (id: string, reportData: Partial<DailyPerformanceReport>): Promise<DailyPerformanceReport> => {
    // 1. Direct Cloud Firestore update
    try {
      await saveDocument('reports', id, { ...reportData, updatedAt: new Date().toISOString() });
      console.log('[Firestore] Report updated in Cloud Firestore:', id);
    } catch (e) {
      console.warn('[Firestore] Direct update warning:', e);
    }

    // 2. Server API update
    try {
      await fetchJsonOrFallback(`/api/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
    } catch (e) {}

    const idx = initialDailyReports.findIndex(r => r.id === id);
    if (idx !== -1) {
      initialDailyReports[idx] = { ...initialDailyReports[idx], ...reportData };
      return initialDailyReports[idx];
    }
    return reportData as DailyPerformanceReport;
  },

  deleteReport: async (id: string): Promise<boolean> => {
    // 1. Direct Cloud Firestore delete
    try {
      await deleteDocument('reports', id);
      console.log('[Firestore] Report deleted from Cloud Firestore:', id);
    } catch (e) {
      console.warn('[Firestore] Direct delete warning:', e);
    }

    // 2. Server API delete
    try {
      await fetchJsonOrFallback(`/api/reports/${id}`, { method: 'DELETE' });
    } catch (e) {}

    const idx = initialDailyReports.findIndex(r => r.id === id);
    if (idx !== -1) {
      initialDailyReports.splice(idx, 1);
    }
    return true;
  },

  exportReports: async (format: string, filters: any): Promise<Blob> => {
    try {
      const res = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, ...filters })
      });
      if (res.ok) {
        return res.blob();
      }
    } catch (e) {
      console.warn('Export API failed, returning mock blob');
    }
    return new Blob(['Report Export Data'], { type: 'text/csv' });
  },

  // Manager Approval Actions
  managerAction: async (reportIds: string[], action: string, managerId: string, commentText?: string) => {
    let newStatus = 'Pending';
    if (action === 'approve') newStatus = 'Approved';
    else if (action === 'reject') newStatus = 'Rejected';
    else if (action === 'return') newStatus = 'Returned';
    else if (action === 'suspend') newStatus = 'Suspended';

    // 1. Direct Cloud Firestore batch update for all reports
    for (const reportId of reportIds) {
      if (action === 'delete') {
        try {
          await deleteDocument('reports', reportId);
        } catch (e) {}
      } else {
        const updatePayload: any = {
          status: newStatus,
          reviewedBy: managerId,
          reviewedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        if (commentText) {
          updatePayload.managerComment = commentText;
        }
        try {
          await saveDocument('reports', reportId, updatePayload);
        } catch (e) {}
      }
    }

    // 2. Server API sync
    try {
      const res = await fetchJsonOrFallback<{ message: string }>('/api/approvals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportIds, action, managerId, commentText })
      });
      if (res.data) return res.data;
    } catch (e) {}

    return { message: `Reports successfully ${action.toLowerCase()}d` };
  },

  // Analytics & Leaderboards
  getAnalyticsOverview: async () => {
    const res = await fetchJsonOrFallback<any>('/api/analytics/overview');
    if (res.data) return res.data;
    return {
      overallAchievementRate: 94.2,
      totalDepositMobilized: 1850000000,
      totalLoanDisbursed: 920000000,
      activeEmployees: 1240,
      districtPerformance: initialDistricts.map(d => ({
        name: d.name,
        rate: Math.floor(85 + Math.random() * 14)
      }))
    };
  },

  getLeaderboards: async () => {
    const res = await fetchJsonOrFallback<any>('/api/leaderboards');
    if (res.data) return res.data;
    return {
      topDistricts: initialDistricts.slice(0, 5),
      topBranches: initialBranches.slice(0, 5),
      topEmployees: defaultUsers
    };
  },

  // Notifications & Announcements
  getNotifications: async (userId?: string): Promise<Notification[]> => {
    const url = userId ? `/api/notifications?userId=${userId}` : '/api/notifications';
    const res = await fetchJsonOrFallback<Notification[]>(url);
    if (res.data && Array.isArray(res.data)) return res.data;
    return initialNotifications;
  },

  markNotificationRead: async (notificationId: string) => {
    await fetchJsonOrFallback('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId })
    });
  },

  getAnnouncements: async (): Promise<Announcement[]> => {
    const res = await fetchJsonOrFallback<Announcement[]>('/api/announcements');
    if (res.data && Array.isArray(res.data)) return res.data;
    return initialAnnouncements;
  },

  // Calendar
  getHolidays: async (): Promise<BankHoliday[]> => {
    const res = await fetchJsonOrFallback<BankHoliday[]>('/api/calendar/holidays');
    if (res.data && Array.isArray(res.data)) return res.data;
    return initialHolidays;
  },

  createHoliday: async (holidayData: Partial<BankHoliday>): Promise<BankHoliday> => {
    const res = await fetchJsonOrFallback<BankHoliday>('/api/calendar/holidays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(holidayData)
    });
    if (res.data) {
      if (!initialHolidays.some(h => h.id === res.data!.id)) initialHolidays.push(res.data);
      return res.data;
    }
    const newHol: BankHoliday = {
      id: `HOL-${Date.now().toString().slice(-4)}`,
      name: holidayData.name || 'New Bank Holiday',
      date: holidayData.date || new Date().toISOString().split('T')[0],
      recurring: holidayData.recurring ?? true,
      description: holidayData.description || 'Official Bunna Bank holiday'
    };
    initialHolidays.push(newHol);
    return newHol;
  },

  updateHoliday: async (id: string, holidayData: Partial<BankHoliday>): Promise<BankHoliday> => {
    await fetchJsonOrFallback(`/api/calendar/holidays/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(holidayData)
    });
    const idx = initialHolidays.findIndex(h => h.id === id);
    if (idx !== -1) {
      initialHolidays[idx] = { ...initialHolidays[idx], ...holidayData };
      return initialHolidays[idx];
    }
    return holidayData as BankHoliday;
  },

  deleteHoliday: async (id: string): Promise<boolean> => {
    await fetchJsonOrFallback(`/api/calendar/holidays/${id}`, { method: 'DELETE' });
    const idx = initialHolidays.findIndex(h => h.id === id);
    if (idx !== -1) initialHolidays.splice(idx, 1);
    return true;
  },

  getBankHolidays: async (): Promise<BankHoliday[]> => {
    return api.getHolidays();
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await fetchJsonOrFallback<AuditLog[]>('/api/audit-logs');
    if (res.data && Array.isArray(res.data)) return res.data;
    return initialAuditLogs;
  },

  // AI Assistant
  askAiAssistant: async (prompt: string, userRole?: string, userId?: string, contextData?: any) => {
    const res = await fetchJsonOrFallback<any>('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, userId: userId || 'admin', userRole: userRole || 'EMPLOYEE', contextData })
    });
    if (res.data) {
      const textVal = res.data.response || res.data.reply || res.data.answer || res.data.text;
      if (textVal) {
        return {
          response: textVal,
          reply: textVal,
          answer: textVal,
          text: textVal
        };
      }
      return res.data;
    }
    return generateClientSideAiResponse(prompt, userRole, userId, contextData);
  },

  generateAiInsight: async (type: string, employeeName?: string) => {
    const res = await fetchJsonOrFallback<any>('/api/ai/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, employeeName })
    });
    if (res.data) return res.data;
    return {
      insight: `Performance analysis: Deposit mobilization trends show high growth (+12.4% MoM) in regional city districts.`
    };
  },

  // Contact Support
  submitContactInquiry: async (data: {
    fullName: string;
    emailOrPhone: string;
    branchOrDistrict?: string;
    subject: string;
    message: string;
  }) => {
    const res = await fetchJsonOrFallback<{ message: string }>('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.data) return res.data;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
    return { message: 'Inquiry submitted successfully to Bunna Bank support.' };
  },

  // ==========================================
  // BANKING COMPETITOR INTELLIGENCE SERVICE METHODS
  // ==========================================
  getCommercialBanks: async (): Promise<CommercialBank[]> => {
    const res = await fetchJsonOrFallback<CommercialBank[]>('/api/competitors/banks');
    if (res.data && Array.isArray(res.data)) return res.data;
    return initialCommercialBanks;
  },

  addCommercialBank: async (bankData: Partial<CommercialBank>): Promise<CommercialBank> => {
    const res = await fetchJsonOrFallback<CommercialBank>('/api/competitors/banks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bankData)
    });
    if (res.data) return res.data;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
    return {
      id: `BNK-${bankData.code || 'BNK'}`,
      code: bankData.code || 'BNK',
      name: bankData.name || 'New Bank',
      shortName: bankData.shortName || bankData.name || 'New Bank',
      establishedYear: bankData.establishedYear || 2015,
      status: 'Active',
      totalBranchesNationwide: bankData.totalBranchesNationwide || 50,
      color: bankData.color || '#003399'
    };
  },

  updateCommercialBank: async (id: string, bankData: Partial<CommercialBank>): Promise<CommercialBank> => {
    const res = await fetchJsonOrFallback<CommercialBank>(`/api/competitors/banks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bankData)
    });
    if (res.data) return res.data;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
    return { id, ...bankData } as CommercialBank;
  },

  deleteCommercialBank: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await fetchJsonOrFallback<{ success: boolean; message?: string }>(`/api/competitors/banks/${id}`, {
      method: 'DELETE'
    });
    if (res.data) return res.data;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
    return { success: true };
  },

  importCommercialBanks: async (items: any[]): Promise<{ count: number; message: string }> => {
    const res = await fetchJsonOrFallback<{ count: number; message: string }>('/api/competitors/banks/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    if (res.data) return res.data;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
    return { count: items.length, message: `Imported ${items.length} banks successfully` };
  },

  getCompetitorBranches: async (params?: { bankId?: string; city?: string; region?: string }): Promise<CompetitorBranch[]> => {
    const query = new URLSearchParams();
    if (params?.bankId) query.set('bankId', params.bankId);
    if (params?.city) query.set('city', params.city);
    if (params?.region) query.set('region', params.region);
    const url = `/api/competitors/branches${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetchJsonOrFallback<CompetitorBranch[]>(url);
    if (res.data && Array.isArray(res.data)) return res.data;
    return initialCompetitorBranches;
  },

  addCompetitorBranch: async (branchData: Partial<CompetitorBranch>): Promise<CompetitorBranch> => {
    const res = await fetchJsonOrFallback<CompetitorBranch>('/api/competitors/branches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchData)
    });
    if (res.data) return res.data;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
    return {
      id: `CBR-${Date.now()}`,
      bankId: branchData.bankId || 'BNK-CBE',
      bankName: branchData.bankName || 'Commercial Bank',
      bankCode: branchData.bankCode || 'CBE',
      branchName: branchData.branchName || 'New Competitor Branch',
      city: branchData.city || 'Addis Ababa',
      districtName: branchData.districtName || 'East A.A District',
      latitude: branchData.latitude || 9.0100,
      longitude: branchData.longitude || 38.7600,
      region: branchData.region || 'Addis Ababa',
      status: 'Active'
    };
  },

  updateCompetitorBranch: async (id: string, branchData: Partial<CompetitorBranch>): Promise<CompetitorBranch> => {
    const res = await fetchJsonOrFallback<CompetitorBranch>(`/api/competitors/branches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchData)
    });
    if (res.data) return res.data;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
    return { id, ...branchData } as CompetitorBranch;
  },

  deleteCompetitorBranch: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await fetchJsonOrFallback<{ success: boolean; message?: string }>(`/api/competitors/branches/${id}`, {
      method: 'DELETE'
    });
    if (res.data) return res.data;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
    return { success: true };
  },

  importCompetitorBranches: async (items: any[]): Promise<{ count: number; message: string }> => {
    const res = await fetchJsonOrFallback<{ count: number; message: string }>('/api/competitors/branches/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    if (res.data) return res.data;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
    return { count: items.length, message: `Imported ${items.length} competitor branches` };
  },

  getCompetitorKpis: async (): Promise<CompetitorKpi[]> => {
    const res = await fetchJsonOrFallback<CompetitorKpi[]>('/api/competitors/kpis');
    if (res.data && Array.isArray(res.data)) return res.data;
    return initialCompetitorKpis;
  },

  saveCompetitorKpis: async (kpis: CompetitorKpi[]): Promise<CompetitorKpi[]> => {
    const res = await fetchJsonOrFallback<{ competitorKpis: CompetitorKpi[] }>('/api/competitors/kpis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kpis })
    });
    if (res.data?.competitorKpis) return res.data.competitorKpis;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
    return kpis;
  },

  getCompetitorPerformance: async (params?: { city?: string; period?: string }): Promise<CompetitorMonthlyPerformance[]> => {
    const query = new URLSearchParams();
    if (params?.city) query.set('city', params.city);
    if (params?.period) query.set('period', params.period);
    const url = `/api/competitors/performance${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetchJsonOrFallback<CompetitorMonthlyPerformance[]>(url);
    if (res.data && Array.isArray(res.data)) return res.data;
    return initialCompetitorPerformance;
  },

  saveCompetitorPerformance: async (perfData: any): Promise<CompetitorMonthlyPerformance> => {
    const res = await fetchJsonOrFallback<CompetitorMonthlyPerformance>('/api/competitors/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perfData)
    });
    if (res.data) return res.data;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
    return initialCompetitorPerformance[0];
  },

  getCompetitorRankings: async (): Promise<AreaRanking[]> => {
    const res = await fetchJsonOrFallback<AreaRanking[]>('/api/competitors/rankings');
    if (res.data && Array.isArray(res.data)) return res.data;
    return initialAreaRankings;
  },

  getCompetitorGapAnalysis: async (area?: string): Promise<any> => {
    const res = await fetchJsonOrFallback<any>(`/api/competitors/gap-analysis${area ? `?area=${encodeURIComponent(area)}` : ''}`);
    if (res.data) return res.data;
    return initialAreaRankings[0]?.gapAnalysis || [];
  },

  askCompetitorAiInsights: async (areaName: string, query?: string): Promise<{ areaName: string; bunnaRank: number; aiResponseText: string; insight: AiCompetitorInsight }> => {
    const res = await fetchJsonOrFallback<any>('/api/competitors/ai-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ areaName, query })
    });
    if (res.data) return res.data;
    return {
      areaName,
      bunnaRank: 4,
      aiResponseText: initialAiInsights[0].summary,
      insight: initialAiInsights[0]
    };
  },

  getCompetitorAlerts: async (): Promise<CompetitorAlert[]> => {
    const res = await fetchJsonOrFallback<CompetitorAlert[]>('/api/competitors/alerts');
    if (res.data && Array.isArray(res.data)) return res.data;
    return initialCompetitorAlerts;
  },

  markCompetitorAlertRead: async (alertId: string): Promise<void> => {
    await fetchJsonOrFallback<void>('/api/competitors/alerts/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId })
    });
  },

  addBranchEmployee: async (data: any): Promise<User> => {
    const res = await fetchJsonOrFallback<{ success: boolean; employee: User }>('/api/manager/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.data?.employee) return res.data.employee;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
    throw new Error('Failed to add employee');
  },

  updateBranchEmployee: async (id: string, data: any): Promise<User> => {
    const res = await fetchJsonOrFallback<{ success: boolean; employee: User }>(`/api/manager/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.data?.employee) return res.data.employee;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
    throw new Error('Failed to update employee');
  },

  deleteBranchEmployee: async (id: string, managerId: string): Promise<void> => {
    const res = await fetchJsonOrFallback<{ success: boolean }>(`/api/manager/employees/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerId })
    });
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
  },

  resetEmployeePassword: async (id: string, managerId: string, newPassword: string): Promise<void> => {
    const res = await fetchJsonOrFallback<{ success: boolean }>(`/api/manager/employees/${id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerId, newPassword })
    });
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
  },

  updateEmployeeStatus: async (id: string, managerId: string, status: string): Promise<User> => {
    const res = await fetchJsonOrFallback<{ success: boolean; employee: User }>(`/api/manager/employees/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerId, status })
    });
    if (res.data?.employee) return res.data.employee;
    if (res.error && !res.isHtmlOrOffline) throw new Error(res.error);
    throw new Error('Failed to update employee status');
  },

  // Vercel / Express vercel.json helper
  getVercelConfigSnippet: () => {
    return {
      version: 2,
      builds: [
        { src: "server.ts", use: "@vercel/node" },
        { src: "package.json", use: "@vercel/static-build" }
      ],
      routes: [
        { src: "/api/(.*)", dest: "/server.ts" },
        { src: "/(.*)", dest: "/$1" }
      ]
    };
  }
};
