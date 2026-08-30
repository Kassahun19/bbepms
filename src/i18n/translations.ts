import { Language } from '../types';

const translationData: Record<string, Record<string, string>> = {
  en: {
    // Brand & Header
    bankName: "Daily KPI Performance",
    appTitle: "Daily KPI Performance Management System",
    tagline: "Empowering Performance. Driving Excellence.",
    login: "Log In",
    getStarted: "Get Started",
    logout: "Log Out",
    home: "Home",
    about: "About",
    howItWorks: "How It Works",
    features: "Features",
    contact: "How It Works",
    language: "Language",
    
    // Roles
    adminRole: "Administrator",
    managerRole: "Manager",
    employeeRole: "Employee",
    
    // Common Actions
    save: "Save",
    submit: "Submit for Approval",
    update: "Update",
    delete: "Delete",
    cancel: "Cancel",
    approve: "Approve",
    reject: "Reject",
    suspend: "Suspend",
    returnForCorrection: "Return for Correction",
    export: "Export Report",
    downloadMyReport: "Download My Report",
    search: "Search...",
    print: "Print",
    
    // Statuses
    draft: "Draft",
    submitted: "Submitted",
    pending: "Pending Approval",
    approved: "Approved",
    rejected: "Rejected",
    returned: "Returned",
    suspended: "Suspended",
    
    // Metrics & KPIs
    deposits: "Deposits (ETB)",
    fcy: "Foreign Currency (USD)",
    dfs: "Digital Financial Services (ETB)",
    accountOpening: "Account Opening",
    mobileBanking: "Mobile Banking Activation",
    internetBanking: "Internet Banking Activation",
    merchantSolutions: "Merchant Solutions",
    atmCard: "ATM Card Activation",
    
    // Dashboard Cards
    totalEmployees: "Total Employees",
    totalManagers: "Total Managers",
    totalBranches: "Total Branches",
    districts: "Districts",
    todayReports: "Today's Reports",
    pendingApprovals: "Pending Approvals",
    approvedReports: "Approved Reports",
    rejectedReports: "Rejected Reports",
    overallCompletion: "Overall Completion Rate",
    
    // Employee Performance & Reports
    dailyPerformance: "Daily Performance Submission",
    selectDate: "Select Working Date",
    enterMetrics: "Enter Daily Performance Figures",
    sundayHolidayAlert: "Submissions are disabled on Sundays and Official Bank Holidays.",
    duplicateReportAlert: "A report for this date has already been created.",
    createReportMenu: "Create Daily Report",
    financialMobilization: "Financial Mobilization Metrics (ETB)",
    digitalActivations: "Digital Banking & Customer Activations",
    mySubmittedReports: "My Submitted Reports Log",
    workingDaysOnly: "Working Days Only",
    saveDraft: "Save Draft",
    submitToManager: "Submit for Approval",

    // Profile & Navigation
    personalProfile: "Personal Profile",
    roleNavigation: "Role Navigation Menus",
    targetAssignments: "Target & KPI Assignments",
    badgesRecognition: "Badges & Recognition",
    securityPermissions: "Security & Permissions",
    auditTrail: "Audit Trail",
    myRoleProfile: "My Role Profile",
    askAiCoach: "Ask Bunna AI",
    
    // AI Assistant
    aiAssistantTitle: "Daily KPI AI Performance Assistant",
    aiPromptPlaceholder: "Ask about KPIs, policies, target projections, or summaries...",
    askAi: "Ask Bunna AI",
    
    // Landing & Footer
    heroTitle: "Daily KPI Performance Management System",
    heroSubtitle: "Real-time performance tracking, multi-level approvals, and automated analytics for operational excellence.",
    statsDistricts: "Districts",
    statsBranches: "Branches",
    statsEmployees: "Employees",
    statsEfficiency: "Approval Efficiency",
    copyright: "© 2026 Daily KPI Performance Management System. All rights reserved.",
    
    // Progress & Targets
    expectedTarget: "Expected Target",
    actualAchieved: "Actual Achieved",
    difference: "Variance",
    completionPercentage: "Completion %",
    remainingTarget: "Remaining Target",
  },
  am: {
    // Brand & Header
    bankName: "ዕለታዊ የ KPI አፈፃፀም",
    appTitle: "ዕለታዊ የ KPI አፈፃፀም ማኔጅመንት ስርዓት (EPMS)",
    tagline: "አፈፃፀምን ማጎልበት። ብቃትን መምራት።",
    login: "ግቡ",
    getStarted: "ይምረጡ / ይጀምሩ",
    logout: "ውጣ",
    home: "ዋና ገፅ",
    about: "ስለ እኛ",
    howItWorks: "እንዴት እንደሚሰራ",
    features: "አገልግሎቶች",
    contact: "እንዴት እንደሚሰራ",
    language: "ቋንቋ",
    
    // Roles
    adminRole: "አስተዳዳሪ",
    managerRole: "ሥራ አስኪያጅ",
    employeeRole: "ሰራተኛ",
    
    // Common Actions
    save: "አስቀምጥ",
    submit: "ለማጽደቅ ያስገቡ",
    update: "ያሻሽሉ",
    delete: "ሰርዝ",
    cancel: "ሰርዝ/ተመለስ",
    approve: "አጽድቅ",
    reject: "ውድቅ አድርግ",
    suspend: "እግድ",
    returnForCorrection: "ለማስተካከያ መልስ",
    export: "ሪፖርት ላክ/አውርድ",
    downloadMyReport: "የእኔን ሪፖርት አውርድ",
    search: "ፈልግ...",
    print: "አትም",
    
    // Statuses
    draft: "ረቂቅ",
    submitted: "ተላከ",
    pending: "በመጠበቅ ላይ",
    approved: "ፅድቋል",
    rejected: "ውድቅ ተደርጓል",
    returned: "ተመልሷል",
    suspended: "ታግዷል",
    
    // Metrics & KPIs
    deposits: "ተቀማጭ ገንዘብ (ብር)",
    fcy: "የውጭ ምንዛሪ (USD)",
    dfs: "ዲጂታል ፋይናንስ አገልግሎት (ብር)",
    accountOpening: "አዲስ ሂሳብ መክፈት",
    mobileBanking: "ሞባይል ባንኪንግ ማግበር",
    internetBanking: "ኢንተርኔት ባንኪንግ ማግበር",
    merchantSolutions: "የመርቻንት መፍትሄዎች",
    atmCard: "የኤቲኤም ካርድ ማግበር",
    
    // Dashboard Cards
    totalEmployees: "ጠቅላላ ሰራተኞች",
    totalManagers: "ጠቅላላ ሥራ አስኪያጆች",
    totalBranches: "ጠቅላላ ቅርንጫፎች",
    districts: "ዲስትሪክቶች",
    todayReports: "የዛሬ ሪፖርቶች",
    pendingApprovals: "የሚጠብቁ ማጽደቂያዎች",
    approvedReports: "የጸደቁ ሪፖርቶች",
    rejectedReports: "ውድቅ የተደረጉ ሪፖርቶች",
    overallCompletion: "አጠቃላይ የአፈፃፀም ምጣኔ",
    
    // Employee Performance & Reports
    dailyPerformance: "የዕለታዊ ስራ አፈፃፀም ማስገቢያ",
    selectDate: "የስራ ቀንን ይምረጡ",
    enterMetrics: "የዕለቱን የአፈፃፀም ቁጥሮች ያስገቡ",
    sundayHolidayAlert: "በእሁድ ቀናት እና በባንክ በዓላት ሪፖርት ማስገባት አይቻልም።",
    duplicateReportAlert: "ለዚህ ቀን ቀደም ብሎ ሪፖርት ተዘጋጅቷል።",
    createReportMenu: "ዕለታዊ ሪፖርት አዘጋጅ/አስገባ",
    financialMobilization: "የፋይናንስ ማሰባሰብ አፈፃፀም (ብር)",
    digitalActivations: "የዲጂታል ባንክ እና የደንበኞች ማግበር",
    mySubmittedReports: "የቀረቡ ሪፖርቶች መዝገብ",
    workingDaysOnly: "በስራ ቀናት ብቻ",
    saveDraft: "ረቂቅ አስቀምጥ",
    submitToManager: "ለማጽደቅ ያስገቡ",

    // Profile & Navigation
    personalProfile: "ግላዊ መገለጫ",
    roleNavigation: "የስርዓት መመሪያ እና የሥራ ድርሻ",
    targetAssignments: "የግብ እና የ KPI ምደባዎች",
    badgesRecognition: "ባጆች እና እውቅናዎች",
    securityPermissions: "ደህንነት እና ፈቃዶች",
    auditTrail: "የኦዲት መዝገብ",
    myRoleProfile: "የእኔ የሥራ መገለጫ",
    askAiCoach: "ቡና AIን ይጠይቁ",
    
    // AI Assistant
    aiAssistantTitle: "ዕለታዊ የ KPI AI አፈፃፀም ረዳት",
    aiPromptPlaceholder: "ስለ KPI፣ ደንቦች፣ ትንበያ ወይም አጠቃላይ ማጠቃለያ ይጠይቁ...",
    askAi: "ቡና AIን ይጠይቁ",
    
    // Landing & Footer
    heroTitle: "ዕለታዊ የ KPI አፈፃፀም ማኔጅመንት ስርዓት",
    heroSubtitle: "የእውነተኛ ጊዜ አፈፃፀም ክትትል፣ ባለብዙ ደረጃ ማጽደቂያ እና አጠቃላይ የአፈፃፀም ትንተና።",
    statsDistricts: "ዲስትሪክቶች",
    statsBranches: "ቅርንጫፎች",
    statsEmployees: "ሰራተኞች",
    statsEfficiency: "የማጽደቅ ቀልጣፋነት",
    copyright: "© 2026 ዕለታዊ የ KPI አፈፃፀም ማኔጅመንት ስርዓት። መብቱ በህግ የተጠበቀ ነው።",
    
    // Progress & Targets
    expectedTarget: "የሚጠበቅ ግብ",
    actualAchieved: "የተከናወነ",
    difference: "ልዩነት",
    completionPercentage: "የማጠናቀቅያ %",
    remainingTarget: "ቀሪ ግብ",
  }
};

translationData.EN = translationData.en;
translationData.AM = translationData.am;

export const translations: Record<string, Record<string, string>> = new Proxy(translationData, {
  get(target, prop: string) {
    if (typeof prop === 'string') {
      const lower = prop.toLowerCase();
      if (target[lower]) return target[lower];
    }
    return target.en;
  }
});
