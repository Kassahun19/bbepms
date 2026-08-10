import { Language } from '../types';

const translationData: Record<string, Record<string, string>> = {
  en: {
    // Brand & Header
    bankName: "Bunna Bank S.C.",
    appTitle: "Employee Performance Management System",
    tagline: "Empowering Performance. Driving Excellence.",
    login: "Log In",
    getStarted: "Get Started",
    logout: "Log Out",
    home: "Home",
    about: "About",
    features: "Features",
    contact: "Contact",
    language: "Language",
    
    // Roles
    adminRole: "Administrator",
    managerRole: "Manager",
    employeeRole: "Employee",
    
    // Common Actions
    save: "Save",
    submit: "Submit to Manager",
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
    submitToManager: "Submit To Branch Manager",

    // Profile & Navigation
    personalProfile: "Personal Profile",
    roleNavigation: "Role Navigation Menus",
    targetAssignments: "Target & KPI Assignments",
    badgesRecognition: "Badges & Recognition",
    securityPermissions: "Security & Permissions",
    auditTrail: "Audit Trail",
    myRoleProfile: "My Role Profile",
    askAiCoach: "Ask AI Performance Coach",
    
    // AI Assistant
    aiAssistantTitle: "Bunna Bank AI Performance Assistant",
    aiPromptPlaceholder: "Ask about KPIs, policies, target projections, or summaries...",
    askAi: "Ask Bunna AI",
    
    // Landing & Footer
    heroTitle: "Next-Generation Employee Performance Platform",
    heroSubtitle: "Real-time performance tracking, AI-driven insights, and seamless multi-level approvals for Bunna Bank S.C.",
    statsDistricts: "Districts",
    statsBranches: "Branches",
    statsEmployees: "Employees",
    statsEfficiency: "Approval Efficiency",
    copyright: "© 2026 Bunna Bank S.C. All Rights Reserved. Built by Kassahun Mulatu",
    
    // Progress & Targets
    expectedTarget: "Expected Target",
    actualAchieved: "Actual Achieved",
    difference: "Variance",
    completionPercentage: "Completion %",
    remainingTarget: "Remaining Target",
  },
  am: {
    // Brand & Header
    bankName: "ቡና ባንክ አ.ማ.",
    appTitle: "የሰራተኞች የስራ አፈፃፀም ማኔጅመንት ስርዓት (EPMS)",
    tagline: "አፈፃፀምን ማጎልበት። ብቃትን መምራት።",
    login: "ግቡ",
    getStarted: "ይምረጡ / ይጀምሩ",
    logout: "ውጣ",
    home: "ዋና ገፅ",
    about: "ስለ እኛ",
    features: "አገልግሎቶች",
    contact: "ግንኙነት",
    language: "ቋንቋ",
    
    // Roles
    adminRole: "አስተዳዳሪ",
    managerRole: "ሥራ አስኪያጅ",
    employeeRole: "ሰራተኛ",
    
    // Common Actions
    save: "አስቀምጥ",
    submit: "ለስራ አስኪያጅ ያስገቡ",
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
    submitToManager: "ለቅርንጫፍ ሥራ አስኪያጅ ያስገቡ",

    // Profile & Navigation
    personalProfile: "ግላዊ መገለጫ",
    roleNavigation: "የስርዓት መመሪያ እና የሥራ ድርሻ",
    targetAssignments: "የግብ እና የ KPI ምደባዎች",
    badgesRecognition: "ባጆች እና እውቅናዎች",
    securityPermissions: "ደህንነት እና ፈቃዶች",
    auditTrail: "የኦዲት መዝገብ",
    myRoleProfile: "የእኔ የሥራ መገለጫ",
    askAiCoach: "የ AI አፈፃፀም አሰልጣኝን ጠይቁ",
    
    // AI Assistant
    aiAssistantTitle: "የቡና ባንክ AI አፈፃፀም ረዳት",
    aiPromptPlaceholder: "ስለ KPI፣ ደንቦች፣ ትንበያ ወይም አጠቃላይ ማጠቃለያ ይጠይቁ...",
    askAi: "የ AI ረዳቱን ይጠይቁ",
    
    // Landing & Footer
    heroTitle: "ዘመናዊ የሰራተኞች የስራ አፈፃፀም መከታተያ ስርዓት",
    heroSubtitle: "የእውነተኛ ጊዜ አፈፃፀም ክትትል፣ የ AI ትንተና እና ፈጣን ማጽደቂያ ስርዓት ለቡና ባንክ አ.ማ.",
    statsDistricts: "ዲስትሪክቶች",
    statsBranches: "ቅርንጫፎች",
    statsEmployees: "ሰራተኞች",
    statsEfficiency: "የማጽደቅ ቀልጣፋነት",
    copyright: "© 2026 ቡና ባንክ አ.ማ. መብቱ በህግ የተጠበቀ ነው። በ ካሳሁን ሙላቱ የተሰራ።",
    
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
