// scripts/doc_parts/part1_overview_hierarchy.mjs
export function getPart1() {
  return `
## 1. SYSTEM OVERVIEW

### 1.1 System Identity & Core Purpose
* **Official System Name:** Bunna Bank S.C. — Daily KPI Performance Management System (EPMS)
* **Institutional Context:** Bunna Bank S.C. is an established commercial private bank in Ethiopia, operating over 460 physical branches across 33 regional and metropolitan districts.
* **Core Purpose:** To replace opaque, lagging, paper-based, and ad-hoc quarterly performance reviews with a high-integrity, real-time, daily operational monitoring and cascading goal-execution platform. EPMS empowers leadership from the Board of Directors down to frontline Customer Service Officers (CSOs) to track daily deposit mobilization, foreign currency (FCY) inflows, digital banking adoption, and loan collections against mathematically decomposed daily targets.

### 1.2 Business Objectives & Core Problems Solved
1. **Elimination of Retrospective Blindness:** Commercial banking in Ethiopia faces volatile liquidity and foreign exchange shortages. Traditional quarterly audits discover deposit flight or missed targets months after they occur. EPMS enforces daily close-of-business reporting across all 460+ branches.
2. **Cascading Goal Alignment (300 Banking Days):** Strategic multi-billion Ethiopian Birr (ETB) annual targets set by the Board and CEO are systematically and transparently decomposed into monthly, weekly, and daily benchmarks across 300 active Ethiopian banking working days.
3. **Operational Accountability & Two-Way Target Acceptance:** Staff members are not subjected to arbitrary quotas. Targets cascade to frontline officers who must formally review and accept or reject (with mandatory justification) their daily KPIs.
4. **Fraud & Data Integrity Enforcement:** Dual-storage persistence with immutable audit logs, strict non-negative metric validation, and hierarchical authorization stops branch managers or employees from fabricating performance numbers.
5. **Competitor Catchment Intelligence:** Provides comparative benchmarking against major Ethiopian peers (Commercial Bank of Ethiopia, Dashen Bank, Awash Bank, Bank of Abyssinia, and Cooperative Bank of Oromia) with geospatial branch mapping and Banking Performance Index (BPI) analytics.
6. **Executive Decision Support:** Integrated Google Gemini 2.5 Flash EPMS Executive Coach delivers tactical recommendations to branch managers and district directors on improving deposit mobilization and foreign currency generation.

### 1.3 Target Users & Stakeholders
* **Frontline Banking Staff:** Customer Service Officers (CSOs), Relationship Officers, Foreign Exchange Specialists, and Digital Ambassadors.
* **Operational Supervisors:** Branch Business Managers (Grade I to IV) and Assistant Branch Managers.
* **Regional Executives:** 33 District Directors governing regional corridors (e.g., Hawassa, Bahir Dar, Dire Dawa, Addis Ababa Districts).
* **Corporate Banking Leadership:** Departmental Directors and Chief Officers (Chief Retail Banking Officer, Chief Digital Officer, Chief Risk & Compliance Officer).
* **Top-Level Governance:** Chief Executive Officer (CEO), Executive Committee, and the Board of Directors.
* **IT & Audit Engineers:** System Administrators, Database Engineers, and External NBE Compliance Auditors.

### 1.4 Primary System Workflows
1. **Cascading Target Allocation Workflow:** Board/CEO $\\rightarrow$ District $\\rightarrow$ Branch Manager $\\rightarrow$ Employee.
2. **Daily Performance Reporting & Approval Workflow:** Frontline Employee $\\rightarrow$ Validation $\\rightarrow$ Branch Manager Review Queue $\\rightarrow$ Bank-Wide Analytics Aggregation.
3. **Real-Time Performance Dashboard Workflow:** Instant recalculation of completion percentages, letter grades (A+ to D), RAG badges, and motivational remarks.
4. **Competitor Intelligence & Catchment Analysis:** Geospatial tracking of nearby competitor branches, monthly deposit share comparisons, and gap analyses.
5. **Telegram Bot Field Reporting:** Instant two-way synchronization allowing remote branch staff to query daily targets and submit operational actuals via Telegram.

### 1.5 Technology Stack Overview
* **Frontend:** React 19.0, Vite 6.2, Tailwind CSS v4, Motion 12.23 (framer-motion successor), Recharts 3.10, Lucide React 0.546, i18next (English & Amharic).
* **Backend:** Node.js 22 LTS, Express 4.21, TypeScript 5.8, \`tsx\` runtime, \`esbuild\` CJS compiler.
* **Database Architecture:** Dual persistence featuring MySQL 8.0+ Enterprise / Cloud SQL (relational ACID master), Google Cloud Firestore (real-time document synchronization), and persistent JSON fallback.
* **Authentication:** Stateless JSON Web Tokens (JWT) with salted \`bcryptjs\` password hashing, 24-hour expiration, and hierarchical data scoping.
* **AI & Intelligence:** Google GenAI TypeScript SDK (\`@google/genai\`) utilizing \`gemini-2.5-flash\` for real-time EPMS coaching.

---

## 2. ORGANIZATIONAL HIERARCHY

The Bunna Bank EPMS architecture is organized into a strict 9-tier organizational hierarchy. The table below outlines each level, its responsibilities, data access scope, KPI rights, and report privileges.

| Level | Role / Entity Code | Main Responsibilities | Data Access Scope | KPI Access | Performance Access | Reports Generated / Viewed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **\`BANK_SUPER_ADMIN\`** | Master system administration, infrastructure maintenance, audit log review, database sync, and emergency user unlocking. | Full unrestricted access to all 33 districts, 460+ branches, 24 tables, and all user accounts. | Full CRUD access to KPI metric definitions, weights, and global targets. | Global read/write access across all historical periods. | Complete system audit logs, raw database exports, API metrics, and user access reports. |
| **2** | **\`ADMINISTRATOR\`** | IT operational administration, staff onboarding, branch creation, password resets, and fiscal calendar management. | Bank-wide access across all branches and districts. Cannot alter audit logs. | Manages metric assignments, fiscal year activation, and calendar holiday tables. | Full view of all branch and district metrics. | Staff roster reports, branch inventory reports, and fiscal year performance summaries. |
| **3** | **\`BOARD_OF_DIRECTORS\`** | Fiduciary governance, macro banking policy approval, annual strategy verification, and shareholder representation. | High-level aggregate bank-wide views. Read-only access to strategic performance metrics. | Views annual corporate strategic targets. Does not allocate individual branch quotas. | Bank-wide high-level quarterly, semi-annual, and annual macro trends. | Board executive briefing decks, macro deposit mobilization reports, and annual scorecard summaries. |
| **4** | **\`CEO\`** | Executive steering, bank-wide resource allocation, district competition oversight, and regulatory liaison with NBE. | Full visibility across all 33 districts and 460+ branches with multi-level interactive drill-downs. | Approves bank-wide annual targets and assigns quotas to District Directors. | Full real-time visibility from national aggregates down to individual frontline employee slips. | Bank-wide daily executive league tables, district leaderboards, and macro variance reports. |
| **5** | **\`CHIEF_OFFICER\`** | Strategic departmental leadership (Chief Retail Banking, Chief Digital Banking, Chief Financial Officer, etc.). | Departmental and corporate division scope across all branches relevant to their portfolio. | Sets departmental KPI weights (e.g., Digital Banking Chief manages MB/IB/ATM targets). | Real-time analytics for all metrics under their corporate portfolio. | Departmental performance analyses, product adoption curves, and channel volume reports. |
| **6** | **\`DIRECTOR\`** | Headquarters departmental directors overseeing specialized banking operations (e.g., Credit, Forex, Marketing). | Functional division scope across all bank branches for their specific operational domain. | Manages operational benchmarks for domain-specific metrics. | Views branch performance across specific functional KPIs. | Division operational audit reports, specialized compliance reports, and training need analyses. |
| **7** | **\`DISTRICT_DIRECTOR\`** | Regional executive governance overseeing an assigned district (15 to 30 branches within a geographical corridor). | Scoped strictly to their assigned \`districtId\`. Can view all branches and staff within that district. | Cascades district targets down to individual branches based on branch grades (Grade I to IV). | Real-time district leaderboard, branch completion rankings, and overdue report alerts. | District daily performance summaries, branch league tables, and manager compliance audits. |
| **8** | **\`MANAGER\`** (Branch Manager) | Day-to-day branch leadership, staff supervision, customer relationship management, and daily report verification. | Scoped strictly to their assigned \`branchId\`. Can view all staff assigned to their branch. | Cascades branch annual targets into daily/weekly quotas and assigns them to frontline staff. | Full visibility of staff daily submissions, approved totals, and individual performance percentages. | Branch daily close-of-business reports, staff performance scorecards, and target agreement logs. |
| **9** | **\`EMPLOYEE\`** | Frontline customer service, teller operations, deposit mobilization, account opening, and card issuance. | Scoped strictly to their own user profile (\`employeeId\`) and read-only view of branch totals. | Reviews assigned targets; can formally Accept or Reject (with mandatory justification). | Views personal daily actuals, target achievement %, letter grade (A+ to D), and RAG status. | Personal daily performance report slips, target agreement receipts, and history logs. |

---

## 3. HIERARCHICAL DATA ACCESS

The organizational hierarchy is enforced across five architectural tiers: Database Relationships, Middleware Authorization, API Data Scoping, Frontend View Routing, and Operational Action Gates.

### 3.1 Downward Visibility & Information Flow
Information cascades downward from the Board and CEO down to the frontline employee, while performance actuals aggregate upward:

\`\`\`
[ Board of Directors / CEO ] 
      │  (Sets Annual Targets: 50B ETB Deposits, 100M USD FCY)
      ▼
[ District Directors (33 Districts) ]
      │  (Decomposes to Regional Quotas: e.g., Bahir Dar District: 4.2B ETB)
      ▼
[ Branch Managers (460+ Branches) ]
      │  (Decomposes to Branch Quotas: e.g., Bole Branch: 250M ETB)
      ▼
[ Frontline Employees (CSOs) ]
      │  (Decomposes to Daily Personal Target: e.g., 25,000 ETB / Day)
      ▼
========================================================================
                      UPWARD REPORTING AGGREGATION
========================================================================
[ Frontline Employee ] ──> Submits Daily Report (DEP, FCY, Digital, Accounts)
      ▲
      │ (Review, Verification & One-Click Approval)
[ Branch Manager ] ──────> Aggregates Branch Daily Total (Approved Reports Only)
      ▲
      │ (District Rollup)
[ District Director ] ───> Aggregates District Total & Branch Rankings
      ▲
      │ (Bank-Wide Synthesis)
[ CEO / Board / Chiefs ] ─> Bank-Wide Real-Time Scorecard & Executive Drill-Down
\`\`\`

### 3.2 Data Scoping Implementation (\`getCallerContext\`)
In \`server.ts\` (line 1366), every incoming API request is processed through \`getCallerContext(req)\`. This function inspects the authenticated user's JWT bearer token and verified database record to establish their hierarchical boundaries:

1. **Unrestricted Scope (\`BANK_SUPER_ADMIN\`, \`ADMINISTRATOR\`, \`CEO\`, \`BOARD_OF_DIRECTORS\`, \`CHIEF_OFFICER\`):**  
   * \`branchId = null\`, \`districtId = null\` (Access to all records nationwide).
2. **District-Scoped (\`DISTRICT_DIRECTOR\`):**  
   * The server injects \`WHERE b.district_id = ?\` into all branch, employee, and report queries. District Directors are strictly blocked from viewing branches in other districts.
3. **Branch-Scoped (\`MANAGER\`):**  
   * The server injects \`WHERE employee.branch_id = ?\` into all staff and report queries. A Branch Manager cannot inspect or approve reports from sibling branches.
4. **Self-Scoped (\`EMPLOYEE\`):**  
   * The server injects \`WHERE r.employee_id = ?\`. Frontline staff can only edit and view their own personal performance reports.

---

## 4. ROLE & PERMISSION MATRIX

The table below documents the authorization matrix across all system features, based on the backend role-checking middleware and frontend permission gates.

| Feature / System Action | Super Admin | Board | CEO | Chief Officer | Director | District Director | Branch Manager | Employee |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **View Executive Dashboard** | **YES** | **YES** | **YES** | **YES** | **YES** | **NO** | **NO** | **NO** |
| **View District Dashboard** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** (Own) | **NO** | **NO** |
| **View Branch Manager Dashboard** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** (District)| **YES** (Own) | **NO** |
| **View Personal Employee Hub** | **YES** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** | **YES** |
| **Manage Users (Create/Edit Staff)** | **YES** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** |
| **Unlock Locked Accounts** | **YES** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** |
| **Manage Branches & Districts** | **YES** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** |
| **Define KPI Metrics & Weights** | **YES** | **NO** | **NO** | **YES** (Dept) | **NO** | **NO** | **NO** | **NO** |
| **Cascade Targets to Districts** | **YES** | **NO** | **YES** | **YES** | **NO** | **NO** | **NO** | **NO** |
| **Cascade Targets to Branches** | **YES** | **NO** | **NO** | **NO** | **NO** | **YES** (Own) | **NO** | **NO** |
| **Cascade Targets to Employees** | **YES** | **NO** | **NO** | **NO** | **NO** | **NO** | **YES** (Own) | **NO** |
| **Accept / Reject Assigned Target** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** | **YES** |
| **Submit Daily Performance Report** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** | **YES** |
| **Approve / Reject Daily Reports** | **YES** | **NO** | **NO** | **NO** | **NO** | **NO** | **YES** (Own) | **NO** |
| **Drill-Down to Employee Raw Slips**| **YES** | **YES** | **YES** | **YES** | **YES** | **YES** (District)| **YES** (Branch)| **NO** |
| **View Competitor Intelligence Map**| **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** |
| **Query Gemini AI Executive Coach** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** |
| **Bind & Configure Telegram Bot** | **YES** | **NO** | **NO** | **NO** | **NO** | **NO** | **YES** | **YES** |
| **Publish Bank Circular / Memo** | **YES** | **NO** | **YES** | **YES** | **YES** | **NO** | **NO** | **NO** |
| **Export Scorecards (Excel / PDF)** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** |
| **View Immutable Audit Logs** | **YES** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** |

---

## 5. COMPLETE PROJECT STRUCTURE

\`\`\`
bunnabank-epms/
├── index.html                               # SPA HTML5 entry point with Bunna metadata
├── package.json                             # Root configuration, scripts & unified dependencies
├── tsconfig.json                            # TypeScript compiler configuration (ES2022 / React-JSX)
├── vite.config.ts                           # Vite 6.2 configuration with Tailwind CSS v4 plugin
├── metadata.json                            # AI Studio manifest declaring server-side capabilities
├── firestore.rules                          # Cloud Firestore RBAC rules for collections
├── firebase-blueprint.json                  # Firestore collection schemas & indexes
├── firebase-applet-config.json              # Firebase project configuration & web app ID
├── vercel.json                              # Vercel SPA routing rewrites configuration
├── epms_persistent_data.json                # Master JSON persistent store (30 collections)
├── official_branches.json                   # Master registry of 460+ Bunna Bank branches
├── server.ts                                # Monolithic Express 4 backend entry (port 3000)
│
├── Backend/                                 # Dedicated Backend Subsystem
│   ├── package.json                         # Backend-specific package definitions
│   ├── tsconfig.json                        # Backend TypeScript configuration
│   ├── prisma/
│   │   └── schema.prisma                    # Prisma ORM schema (24 models)
│   ├── sql/
│   │   ├── 01_schema.sql                    # Production DDL for 9 core tables
│   │   ├── 02_seed.sql                      # Production DML seeding 33 districts & branches
│   │   └── competitor_intelligence_migration.sql # DDL for 7 competitor tables
│   └── src/
│       ├── config/
│       │   ├── database.ts                  # Database connection pool manager
│       │   └── mysqlDb.ts                   # Native mysql2 connection pool with fallback
│       ├── controllers/                     # Modular controllers (auth, kpis, reports, etc.)
│       ├── middleware/                      # Auth, error, rate-limit, and audit interceptors
│       ├── routes/                          # Modular route definitions (106 endpoints)
│       └── services/                        # Business logic & calculation services
│
├── src/                                     # Frontend Application Root
│   ├── main.tsx                             # React 19 bootstrap entry
│   ├── App.tsx                              # Main application layout, routing & modal dispatcher
│   ├── index.css                            # Global Tailwind CSS imports (@import "tailwindcss";)
│   ├── i18n.ts                              # Internationalization configuration (English/Amharic)
│   ├── types/
│   │   ├── index.ts                         # Core TypeScript interfaces & types
│   │   └── competitor.ts                    # Competitor intelligence data types
│   ├── utils/
│   │   ├── performanceCalculations.ts       # 300 banking days & target decomposition engine
│   │   ├── performanceClassification.ts     # 5-tier classification (Critical to Outstanding)
│   │   ├── exportUtils.ts                   # Multi-format Excel & PDF report generation
│   │   ├── calendarUtils.ts                 # Ethiopian & Gregorian date conversion utilities
│   │   └── notificationService.ts           # In-app toast and notification dispatcher
│   ├── services/
│   │   ├── api.ts                           # Comprehensive API client (193 methods)
│   │   ├── firebaseService.ts               # Google Cloud Firestore synchronization
│   │   └── geminiService.ts                 # Client-side AI prompt helper
│   ├── data/
│   │   ├── mockData.ts                      # Offline fallback dataset
│   │   └── bunnaBranchDirectory.ts          # Embedded branch directory
│   └── components/                          # UI Components Library (70 components)
│       ├── common/                          # Headers, footers, notifications, search
│       ├── dashboard/                       # Executive & operational dashboards (9 roles)
│       ├── landing/                         # Public marketing pages & contact forms
│       ├── kpi/                             # KPI submission tables, agreement panels, forms
│       ├── branch/                          # Branch staff management & target cascading
│       ├── district/                        # District branch leaderboards & aggregations
│       ├── competitor/                      # Competitor benchmarking & Ethiopia map
│       ├── memos/                           # Bank memo & circular document repository
│       └── ai/                              # Floating Gemini coach button & drawer
\`\`\`

---

## 6. COMPLETE TECHNOLOGY STACK

Below is the verified inventory of technologies, libraries, and frameworks actively deployed in the codebase:

### 6.1 Programming Languages & Core Runtimes
* **TypeScript (v5.8.2):** Primary language for both frontend React components and backend Express server files, enforcing strict type-safety.
* **Node.js (v20+ / v22+ LTS):** Server-side execution environment.
* **SQL (ANSI SQL / MySQL Dialect):** Relational schema definition, constraints, and analytical query execution.

### 6.2 Frontend Architecture
* **React 19.0.1:** Modern declarative UI library utilizing functional components and hooks (\`useState\`, \`useEffect\`, \`useMemo\`, \`useCallback\`).
* **Vite 6.2.3:** Ultra-fast build tool and local development server with ES module support.
* **Tailwind CSS v4.1.14 & \`@tailwindcss/vite\`:** Next-generation utility-first styling engine without legacy PostCSS overhead.
* **Motion v12.23.24 (\`motion/react\`):** Hardware-accelerated animation engine for modal entrances, drawer transitions, and progress bars.
* **Recharts v3.10.1:** Declarative D3-based charting library for target-vs-actual bars, performance trends, and radar charts.
* **Lucide React v0.546.0:** Accessible, consistent vector iconography library.
* **i18next (v26.4.0) & \`react-i18next\` (v17.0.12):** Bilingual localization engine supporting real-time switching between English and Amharic (አማርኛ).

### 6.3 Backend & Server Architecture
* **Express v4.21.2:** Fast, robust HTTP web framework for REST API routing and middleware pipelines.
* **\`tsx\` (v4.21.0):** TypeScript Execute CLI enabling direct execution of \`server.ts\` in development without manual precompilation.
* **\`esbuild\` (v0.25.0):** High-performance bundler compiling backend TypeScript into a standalone CommonJS bundle (\`dist/server.cjs\`).
* **CORS v2.8.5:** Cross-Origin Resource Sharing security middleware.

### 6.4 Database & Persistence Stack
* **MySQL 8.0+ Enterprise / Google Cloud SQL:** Primary relational ACID master database managing 16 relational tables.
* **\`mysql2\` (v3.24.2):** High-performance MySQL driver utilizing connection pooling and prepared statements.
* **Prisma ORM (v7.9.1):** Next-generation TypeScript ORM managing 24 models in \`Backend/prisma/schema.prisma\`.
* **Google Cloud Firestore & \`firebase\` (v12.17.0):** Real-time NoSQL document synchronization backing 30 collections.
* **Persistent JSON Store (\`epms_persistent_data.json\`):** Zero-downtime file storage ensuring operational continuity if the database service is restarting.

### 6.5 Security & Artificial Intelligence
* **\`jsonwebtoken\` (v9.0.3):** Cryptographic signing and verification of stateless authentication tokens.
* **\`bcryptjs\` (v3.0.3):** Salted password hashing (10 salt rounds) securing staff credentials.
* **Google GenAI SDK (\`@google/genai\` v2.19.0):** Official TypeScript SDK connecting to \`gemini-2.5-flash\` for the EPMS Executive AI Coach.
`;
}
