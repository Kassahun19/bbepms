// scripts/section7_to_12.mjs
export function getSection7to12() {
  return `
## 7. COMPLETE MASTER API DOCUMENTATION

The Daily KPI Performance Management System provides an enterprise REST API surface with 126+ endpoints in \`server.ts\` and 106+ endpoints in the modular backend (\`Backend/src/routes/\`). Below is the canonical Master API Table documenting the production routes.

### Master API Endpoint Table

| # | HTTP Method | Endpoint Path | Primary Purpose | Required Auth | Allowed Roles | Request Body Summary | Response Status & Type |
| :-: | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| 1 | \`GET\` | \`/api/health\` | System health & DB connection status | None | Public | None | \`200 OK\` JSON: \`{ status, database, timestamp }\` |
| 2 | \`POST\` | \`/api/auth/login\` | Authenticate user & issue session/JWT | None | Public | \`{ userId, password }\` | \`200 OK\` JSON: User profile & token |
| 3 | \`POST\` | \`/api/auth/register\` | Self-registration for bank employees | None | Public | \`{ userId, password, firstName, lastName, email, branchId, role }\` | \`201 Created\` JSON: Created user |
| 4 | \`POST\` | \`/api/auth/change-password\` | Change user password | JWT / User | Authenticated | \`{ userId, oldPassword, newPassword }\` | \`200 OK\` JSON: \`{ message: "Success" }\` |
| 5 | \`GET\` | \`/api/auth/validate-userid\` | Check if user ID is taken | None | Public | Query: \`?userId=...\` | \`200 OK\` JSON: \`{ valid: boolean }\` |
| 6 | \`GET\` | \`/api/auth/branch-manager-status/:branchId\` | Check if branch has active manager | None | Authenticated | Param: \`branchId\` | \`200 OK\` JSON: \`{ hasManager: boolean }\` |
| 7 | \`GET\` | \`/api/fiscal-years\` | List all fiscal years | None | Authenticated | Query: \`?active=true\` | \`200 OK\` JSON array of fiscal years |
| 8 | \`GET\` | \`/api/fiscal-years/current\` | Get current active fiscal year | None | Authenticated | None | \`200 OK\` JSON: Active fiscal year object |
| 9 | \`POST\` | \`/api/fiscal-years\` | Create new fiscal year | JWT | Admin, Super Admin | \`{ name, startDate, endDate, isActive }\` | \`201 Created\` JSON: Fiscal year object |
| 10 | \`PATCH\` | \`/api/fiscal-years/:id/activate\` | Activate a fiscal year | JWT | Admin, Super Admin | Param: \`id\` | \`200 OK\` JSON: Activated year object |
| 11 | \`PATCH\` | \`/api/fiscal-years/:id/close\` | Close fiscal year | JWT | Admin, Super Admin | Param: \`id\` | \`200 OK\` JSON: Closed year object |
| 12 | \`GET\` | \`/api/districts\` | List all 33 banking districts | None | Authenticated | Query filters: \`?region=...\` | \`200 OK\` JSON array of districts |
| 13 | \`POST\` | \`/api/districts\` | Create a new district | JWT | Admin, Super Admin | \`{ code, name, region, managerName, phone, email }\` | \`201 Created\` JSON: District object |
| 14 | \`PUT\` | \`/api/districts/:id\` | Update district details | JWT | Admin, Super Admin, District Director | Param: \`id\`, Partial district object | \`200 OK\` JSON: Updated district |
| 15 | \`DELETE\` | \`/api/districts/:id\` | Deactivate/delete district | JWT | Admin, Super Admin | Param: \`id\` | \`200 OK\` JSON: \`{ success: true }\` |
| 16 | \`GET\` | \`/api/districts/:districtId/branches\` | Get all branches in a district | None | Authenticated | Param: \`districtId\` | \`200 OK\` JSON array of branches |
| 17 | \`GET\` | \`/api/branches\` | List all 460+ Bunna branches | None | Authenticated | Query: \`?districtId=...&grade=...\` | \`200 OK\` JSON array of branches |
| 18 | \`POST\` | \`/api/branches\` | Register new branch | JWT | Admin, Super Admin | \`{ solId, code, name, districtId, grade, managerName }\` | \`201 Created\` JSON: Branch object |
| 19 | \`PUT\` | \`/api/branches/:id\` | Update branch details | JWT | Admin, Super Admin, Branch Manager | Param: \`id\`, Partial branch object | \`200 OK\` JSON: Updated branch |
| 20 | \`DELETE\` | \`/api/branches/:id\` | Deactivate/delete branch | JWT | Admin, Super Admin | Param: \`id\` | \`200 OK\` JSON: \`{ success: true }\` |
| 21 | \`GET\` | \`/api/branches/:branchId/employees\` | Get employees in a branch | None | Authenticated | Param: \`branchId\` | \`200 OK\` JSON array of employees |
| 22 | \`GET\` | \`/api/employees\` | List employees across bank | None | Authenticated | Query: \`?branchId=...&role=...\` | \`200 OK\` JSON array of employees |
| 23 | \`POST\` | \`/api/employees\` | Create employee record | JWT | Admin, Super Admin, Branch Manager | \`{ userId, firstName, lastName, role, branchId, ... }\` | \`201 Created\` JSON: Employee object |
| 24 | \`PUT\` | \`/api/employees/:id\` | Update employee record | JWT | Admin, Super Admin, Branch Manager | Param: \`id\`, Partial employee object | \`200 OK\` JSON: Updated employee |
| 25 | \`DELETE\` | \`/api/employees/:id\` | Deactivate/delete employee | JWT | Admin, Super Admin | Param: \`id\` | \`200 OK\` JSON: \`{ success: true }\` |
| 26 | \`GET\` | \`/api/kpis\` | List all registered KPI metrics | None | Authenticated | Query: \`?category=...&status=Active\` | \`200 OK\` JSON array of KPI metrics |
| 27 | \`POST\` | \`/api/kpis\` | Define new KPI metric | JWT | Admin, Super Admin | \`{ code, name, category, unit, weight, frequency }\` | \`201 Created\` JSON: KPI object |
| 28 | \`PUT\` | \`/api/kpis/:id\` | Update KPI definition | JWT | Admin, Super Admin | Param: \`id\`, Partial KPI object | \`200 OK\` JSON: Updated KPI |
| 29 | \`DELETE\` | \`/api/kpis/:id\` | Deactivate/delete KPI | JWT | Admin, Super Admin | Param: \`id\` | \`200 OK\` JSON: \`{ success: true }\` |
| 30 | \`GET\` | \`/api/targets\` | List performance targets | None | Authenticated | Query: \`?employeeId=...&branchId=...&fiscalYear=...\` | \`200 OK\` JSON array of targets |
| 31 | \`POST\` | \`/api/targets\` | Assign target manually | JWT | Admin, Super Admin, Branch Manager | \`{ kpiId, employeeId, branchId, annualTarget, ... }\` | \`201 Created\` JSON: Target object |
| 32 | \`POST\` | \`/api/targets/allocate\` | Automated cascading allocation | JWT | Branch Manager, District Dir, Admin | \`{ branchId, fiscalYearId, allocations: [...] }\` | \`200 OK\` JSON: Allocated targets array |
| 33 | \`POST\` | \`/api/targets/:id/respond\` | Employee accept or reject target | JWT | Employee | \`{ status: "ACCEPTED"|"REJECTED", rejectionReason }\` | \`200 OK\` JSON: Updated target |
| 34 | \`POST\` | \`/api/targets/batch-respond\` | Batch accept/reject targets | JWT | Employee | \`{ targetIds: [...], status, rejectionReason }\` | \`200 OK\` JSON: \`{ updatedCount: N }\` |
| 35 | \`GET\` | \`/api/reports\` / \`/api/kpi-reports\` | Get daily KPI reports | None | Authenticated | Query: \`?branchId=...&employeeId=...&date=...\` | \`200 OK\` JSON array of daily reports |
| 36 | \`POST\` | \`/api/reports\` / \`/api/kpi-reports\`| Submit daily KPI report | JWT | Employee, Branch Manager | Daily report payload with all 8 metrics | \`201 Created\` JSON: Submitted report |
| 37 | \`GET\` | \`/api/reports/:id\` | Get single daily report by ID | None | Authenticated | Param: \`id\` | \`200 OK\` JSON: Report object |
| 38 | \`PUT\` | \`/api/reports/:id\` | Update submitted daily report | JWT | Employee (if Pending), Branch Manager | Param: \`id\`, Partial report payload | \`200 OK\` JSON: Updated report |
| 39 | \`DELETE\` | \`/api/reports/:id\` | Delete daily report | JWT | Admin, Branch Manager | Param: \`id\` | \`200 OK\` JSON: \`{ success: true }\` |
| 40 | \`POST\` | \`/api/approvals/action\` | Manager approve/reject report | JWT | Branch Manager, Admin | \`{ reportId, action: "Approved"|"Rejected", comment }\` | \`200 OK\` JSON: Reviewed report |
| 41 | \`GET\` | \`/api/analytics/overview\` | Bank-wide executive overview | None | Board, CEO, Chiefs, Admin | Query: \`?period=...&fiscalYear=...\` | \`200 OK\` JSON: Macro aggregates |
| 42 | \`GET\` | \`/api/performance/rankings/districts\`| District performance rankings | None | Board, CEO, Chiefs, Admin | Query: \`?period=...&sortBy=deposits\` | \`200 OK\` JSON array of district ranks |
| 43 | \`GET\` | \`/api/performance/rankings/branches\` | Branch performance rankings | None | Board, CEO, Chiefs, District Dir, Admin | Query: \`?districtId=...&period=...\` | \`200 OK\` JSON array of branch ranks |
| 44 | \`GET\` | \`/api/performance/rankings/employees\`| Employee performance rankings | None | District Dir, Branch Manager, Admin | Query: \`?branchId=...&period=...\` | \`200 OK\` JSON array of employee ranks |
| 45 | \`POST\` | \`/api/reports/export\` | Export performance reports | JWT | Authenticated | \`{ format: "xlsx"|"csv"|"pdf", filters: {...} }\` | Binary / Download stream |
| 46 | \`GET\` | \`/api/competitors/banks\` | List monitored commercial banks | None | Authenticated | Query: \`?status=Active\` | \`200 OK\` JSON array of banks |
| 47 | \`POST\` | \`/api/competitors/banks\` | Add commercial bank | JWT | Admin, Super Admin | Bank profile payload | \`201 Created\` JSON: Bank object |
| 48 | \`GET\` | \`/api/competitors/branches\` | List competitor branch coordinates | None | Authenticated | Query: \`?city=...&bankId=...\` | \`200 OK\` JSON array of branches |
| 49 | \`POST\` | \`/api/competitors/branches\` | Add competitor branch location | JWT | Admin, Super Admin | Branch geolocation payload | \`201 Created\` JSON: Branch object |
| 50 | \`GET\` | \`/api/competitors/kpis\` | List BPI KPI metrics | None | Authenticated | None | \`200 OK\` JSON array of BPI metrics |
| 51 | \`GET\` | \`/api/competitors/performance\` | Get competitor monthly data | None | Authenticated | Query: \`?period=...&bankId=...\` | \`200 OK\` JSON array of monthly stats |
| 52 | \`GET\` | \`/api/competitors/area-rankings\` | Get area BPI rankings & gaps | None | Authenticated | Query: \`?area=...&period=...\` | \`200 OK\` JSON array of area rankings |
| 53 | \`POST\` | \`/api/competitors/insights/generate\`| Generate AI competitor strategy | JWT | Board, CEO, Chiefs, District Dir | \`{ areaName, period, kpis: [...] }\` | \`200 OK\` JSON: AI Insights object |
| 54 | \`POST\` | \`/api/ai/assistant\` | Query Gemini 2.5 Flash EPMS Coach | JWT | Authenticated | \`{ prompt, userContext: { role, branch, ... } }\` | \`200 OK\` JSON: \`{ reply, timestamp }\` |
| 55 | \`POST\` | \`/api/ai/insights\` | Generate executive strategic brief | JWT | Board, CEO, Chiefs, Admin | \`{ districtId, branchId, period }\` | \`200 OK\` JSON: Strategic insight text |
| 56 | \`GET\` | \`/api/telegram/config\` | Get Telegram Bot configuration | None | Authenticated | None | \`200 OK\` JSON: Bot status & username |
| 57 | \`POST\` | \`/api/telegram/generate-link-code\`| Generate 6-digit sync code | JWT | Authenticated | \`{ userId }\` | \`200 OK\` JSON: \`{ code, expiresAt }\` |
| 58 | \`POST\` | \`/api/telegram/verify-link-code\` | Verify code & bind chat ID | None | Public (Bot) | \`{ code, telegramChatId, telegramUsername }\` | \`200 OK\` JSON: \`{ success, user }\` |
| 59 | \`POST\` | \`/api/telegram/webhook\` | Handle Telegram incoming messages | Secret | Telegram Servers | Telegram Update payload | \`200 OK\` JSON: \`{ ok: true }\` |
| 60 | \`GET\` | \`/api/audit-logs\` | Inspect system audit trail | JWT | Admin, Super Admin, Board, CEO | Query: \`?userId=...&action=...&limit=100\` | \`200 OK\` JSON array of audit logs |
| 61 | \`GET\` | \`/api/holidays\` | List Ethiopian banking holidays | None | Authenticated | Query: \`?year=2026\` | \`200 OK\` JSON array of holidays |
| 62 | \`POST\` | \`/api/holidays\` | Add Ethiopian banking holiday | JWT | Admin, Super Admin | \`{ name, date, isWorkingDay: false }\` | \`201 Created\` JSON: Holiday object |
| 63 | \`GET\` | \`/api/documents\` | List circulars & bank memos | None | Authenticated | Query: \`?category=...&status=PUBLISHED\` | \`200 OK\` JSON array of documents |
| 64 | \`POST\` | \`/api/documents\` | Upload/publish official memo | JWT | CEO, Chiefs, Directors, Admin | Document metadata & content payload | \`201 Created\` JSON: Document object |
| 65 | \`POST\` | \`/api/messages/send\` | Send internal direct message | JWT | Authenticated | \`{ senderId, receiverId, content, subject }\` | \`201 Created\` JSON: Message object |
| 66 | \`POST\` | \`/api/messages/broadcast\` | Broadcast bank-wide message | JWT | Admin, Super Admin, CEO | \`{ senderId, title, content, targetRole }\` | \`201 Created\` JSON: Broadcast record |
| 67 | \`GET\` | \`/api/messages/inbox/:userId\`| Fetch user's direct messages | JWT | Authenticated | Param: \`userId\` | \`200 OK\` JSON array of messages |
| 68 | \`GET\` | \`/api/notifications\` | Fetch user notifications | None | Authenticated | Query: \`?userId=...\` | \`200 OK\` JSON array of notifications |
| 69 | \`POST\` | \`/api/notifications/mark-read\`| Mark notification as read | JWT | Authenticated | \`{ notificationId, userId }\` | \`200 OK\` JSON: \`{ success: true }\` |
| 70 | \`GET\` | \`/api/admin/dashboard\` | Consolidated admin statistics | JWT | Admin, Super Admin | None | \`200 OK\` JSON: Admin metrics |

---

## 8. DETAILED API ROUTE SPECIFICATIONS

### 8.1 Authentication Endpoints

#### Endpoint: \`POST /api/auth/login\`
* **Description:** Authenticates bank personnel against MySQL and Firestore stores using salted bcrypt password comparison.
* **Headers:** \`Content-Type: application/json\`
* **Request Body:**
\`\`\`json
{
  "userId": "CEO",
  "password": "CEO@2026"
}
\`\`\`
* **Successful Response (\`200 OK\`):**
\`\`\`json
{
  "user": {
    "id": "USR-CEO-001",
    "userId": "CEO",
    "firstName": "Executive",
    "lastName": "CEO",
    "email": "ceo@bunnabanksc.com",
    "role": "CEO",
    "jobTitle": "Chief Executive Officer",
    "branchId": "BR-HQ",
    "branchName": "Head Office",
    "districtId": "DIST-HQ",
    "districtName": "Head Office District",
    "status": "Active"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Authentication successful"
}
\`\`\`
* **Error Responses:**
  * \`400 Bad Request\`: \`{ "error": "Username and password are required" }\`
  * \`401 Unauthorized\`: \`{ "error": "Invalid credentials or account locked" }\`
  * \`500 Internal Server Error\`: \`{ "error": "Authentication processing error" }\`

---

### 8.2 Daily Report Submission Endpoint

#### Endpoint: \`POST /api/reports\` (or \`POST /api/kpi-reports\`)
* **Description:** Submits daily operational metrics for an employee. Automatically validates non-negativity and creates a pending review record for the Branch Manager.
* **Headers:** \`Content-Type: application/json\`, \`Authorization: Bearer <token>\`
* **Request Body:**
\`\`\`json
{
  "employeeId": "USR-EMP-101",
  "employeeName": "Almaz Ayana",
  "employeeUserId": "almaz.ayana",
  "branchId": "BR-101",
  "branchName": "Bole Branch",
  "solId": "101",
  "districtId": "DIST-AAS",
  "districtName": "Addis Ababa South District",
  "reportDate": "2026-08-10",
  "depositsETB": 1500000.00,
  "foreignCurrencyETB": 45000.00,
  "digitalFinancialServicesETB": 850000.00,
  "customerOnboarding": 12,
  "mobileBanking": 8,
  "internetBanking": 3,
  "atmDebitCards": 10,
  "merchantSolutions": 2,
  "comments": "Substantial corporate deposit mobilized from local exporter."
}
\`\`\`
* **Successful Response (\`201 Created\`):**
\`\`\`json
{
  "id": "REP-BR101-20260810-USR101",
  "employeeId": "USR-EMP-101",
  "employeeName": "Almaz Ayana",
  "branchId": "BR-101",
  "reportDate": "2026-08-10",
  "status": "Pending",
  "depositsETB": 1500000.00,
  "foreignCurrencyETB": 45000.00,
  "digitalFinancialServicesETB": 850000.00,
  "customerOnboarding": 12,
  "mobileBanking": 8,
  "internetBanking": 3,
  "atmDebitCards": 10,
  "merchantSolutions": 2,
  "submittedAt": "2026-08-10T17:15:00.000Z"
}
\`\`\`

---

### 8.3 Target Cascading & Allocation Endpoint

#### Endpoint: \`POST /api/targets/allocate\`
* **Description:** Cascades annual branch targets down to individual branch employees based on weighting factors, branch grade, and the standard 300-day Ethiopian banking calendar.
* **Headers:** \`Content-Type: application/json\`, \`Authorization: Bearer <token>\`
* **Request Body:**
\`\`\`json
{
  "branchId": "BR-101",
  "fiscalYearId": "FY-2026-27",
  "allocations": [
    {
      "employeeId": "USR-EMP-101",
      "kpiId": "KPI-DEP",
      "annualTarget": 12000000.00
    },
    {
      "employeeId": "USR-EMP-102",
      "kpiId": "KPI-DEP",
      "annualTarget": 10000000.00
    }
  ]
}
\`\`\`
* **Decomposition Logic:**
  * \`dailyTarget = annualTarget / 300\`
  * \`weeklyTarget = annualTarget / 52\`
  * \`monthlyTarget = annualTarget / 12\`
  * \`quarterlyTarget = annualTarget / 4\`
  * \`semiAnnualTarget = annualTarget / 2\`
  * Target status set to \`PENDING_ACCEPTANCE\` awaiting employee confirmation.

---

### 8.4 Manager Report Approval / Rejection

#### Endpoint: \`POST /api/approvals/action\`
* **Description:** Allows Branch Managers or Admins to formally approve or reject submitted daily performance reports.
* **Headers:** \`Content-Type: application/json\`, \`Authorization: Bearer <token>\`
* **Request Body:**
\`\`\`json
{
  "reportId": "REP-BR101-20260810-USR101",
  "action": "Approved",
  "managerComment": "Excellent performance on foreign currency acquisition today.",
  "reviewerName": "Abebe Kebede (Branch Manager)"
}
\`\`\`
* **Successful Response (\`200 OK\`):**
\`\`\`json
{
  "reportId": "REP-BR101-20260810-USR101",
  "status": "Approved",
  "managerComment": "Excellent performance on foreign currency acquisition today.",
  "reviewedAt": "2026-08-10T18:05:22.000Z",
  "reviewedBy": "Abebe Kebede (Branch Manager)"
}
\`\`\`

---

## 9. HTTP METHODS USAGE REFERENCE

The Daily KPI Performance Management System adheres to standard REST architectural patterns:

| HTTP Method | Standard Architectural Usage in EPMS | Example Real Route |
| :--- | :--- | :--- |
| **\`GET\`** | Idempotent, cache-safe retrieval of resources, summaries, rankings, and lists without modifying server state. | \`GET /api/districts\`, \`GET /api/kpi-reports/branch/:branchId/summary\` |
| **\`POST\`** | Creation of new entities (reports, targets, users, audit logs), execution of batch business operations, or secure credential submission. | \`POST /api/reports\`, \`POST /api/auth/login\`, \`POST /api/targets/allocate\` |
| **\`PUT\`** | Complete or idempotent replacement of an existing resource by primary key or identifier. | \`PUT /api/branches/:id\`, \`PUT /api/kpis/:id\`, \`PUT /api/employees/:id\` |
| **\`PATCH\`** | Partial, focused status transition or state mutation without replacing the entire entity. | \`PATCH /api/fiscal-years/:id/activate\`, \`PATCH /api/messages/:id/read\` |
| **\`DELETE\`** | Removal, soft-delete, or deactivation of an entity from the active database. | \`DELETE /api/targets/:id\`, \`DELETE /api/branches/:id\`, \`DELETE /api/kpi-reports/:id\` |

---

## 10. AUTHENTICATION & SECURITY SYSTEM ARCHITECTURE

\`\`\`
+-------------------+       1. POST /api/auth/login        +---------------------+
|                   |  --------------------------------->  |                     |
|  React Client     |      { userId, password }            |  Express API Server |
|  (Browser / SPA)  |                                      |                     |
|                   |  <---------------------------------  |  - Verify bcrypt    |
+-------------------+       2. 200 OK { token, user }      |  - Sign JWT Token   |
         |                                                 +---------------------+
         | 3. Subsequent Request:
         |    Authorization: Bearer <JWT>
         |    x-user-role: "CEO"
         v
+--------------------------------------------------------------------------------+
|                           EXPRESS SECURITY MIDDLEWARE                          |
|                                                                                |
|  [ authMiddleware ]  --> Decodes JWT, validates signature, extracts payload    |
|  [ checkRole ]       --> Verifies role against permitted roles for route       |
|  [ getCallerContext] --> Scopes district and branch IDs to prevent data leakage |
+--------------------------------------------------------------------------------+
\`\`\`

### 10.1 Key Security Mechanisms
1. **Password Hashing:** All user passwords in production are encrypted using \`bcryptjs\` with a minimum salt round factor of 10.
2. **Stateless JWT Tokens:** Authentication tokens are signed using HMAC-SHA256 (\`jsonwebtoken\`) with a 24-hour expiration window (\`24h\`).
3. **Role-Based Context Scoping (\`getCallerContext\`):**
   * Board, CEO, and Admins have bank-wide visibility.
   * Chiefs are scoped to their sectoral departments.
   * District Directors are strictly restricted to branches within their assigned \`districtId\`.
   * Branch Managers are strictly restricted to employees and reports within their assigned \`branchId\`.
   * Employees can only view their own targets, historical reports, and personal analytics.
4. **Audit Logging (\`recordServerAuditLog\`):** Every authentication event, report approval, target allocation, and master data edit generates an immutable audit record containing actor ID, role, action, target entity, previous value, new value, and timestamp.

---

## 11. FRONTEND ARCHITECTURE & COMPONENT REFERENCE

The user interface is built as a single-page application (SPA) in **React 19** with **Vite 6** and **Tailwind CSS v4**. Below is the complete catalog of all **72 primary frontend components and pages** reviewed across \`src/\` and \`Frontend/\`.

### Master Frontend Components Catalog

| # | Component / Page Name | File Relative Path | Purpose & Responsibilities | APIs Consumed | Target User Role(s) |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | \`App.tsx\` | \`/src/App.tsx\` | Root application shell, state management, modal router, and dashboard switcher | \`/api/health\`, \`/api/districts\`, \`/api/branches\` | All Roles |
| 2 | \`CeoDashboard.tsx\` | \`/src/components/dashboard/CeoDashboard.tsx\` | Executive CEO command center with district rankings, macro aggregates, and drill-down modals | \`/api/performance/rankings/districts\`, \`/api/districts/:id/branches\`, \`/api/analytics/overview\` | CEO, Board, Super Admin |
| 3 | \`AdminDashboard.tsx\` | \`/src/components/dashboard/AdminDashboard.tsx\` | Administrator management portal for users, branches, districts, and system settings | \`/api/admin/dashboard\`, \`/api/districts\`, \`/api/branches\`, \`/api/employees\` | Admin, Super Admin |
| 4 | \`SuperAdminDashboard.tsx\` | \`/src/components/dashboard/SuperAdminDashboard.tsx\` | Enterprise tenant settings, database backups, audit logs, and system security | \`/api/admin/system-stats\`, \`/api/admin/audit-logs\`, \`/api/mysql/status\` | Super Admin |
| 5 | \`BoardDashboard.tsx\` | \`/src/components/dashboard/BoardDashboard.tsx\` | Strategic board-level dashboard with macro trend graphs and compliance summaries | \`/api/analytics/overview\`, \`/api/performance/comparison\` | Board of Directors, CEO |
| 6 | \`ChiefOfficerDashboard.tsx\` | \`/src/components/dashboard/ChiefOfficerDashboard.tsx\` | Sectoral executive view for Chief Retail, Digital, and Operations Officers | \`/api/chiefs/:id/districts\`, \`/api/analytics/overview\` | Chief Officers |
| 7 | \`DirectorDashboard.tsx\` | \`/src/components/dashboard/DirectorDashboard.tsx\` | Departmental governance dashboard for operational division directors | \`/api/departments\`, \`/api/documents\` | Directors |
| 8 | \`DistrictManagementDashboard.tsx\` | \`/src/components/dashboard/DistrictManagementDashboard.tsx\` | District director operational console for supervising 15-30 regional branches | \`/api/districts/:id/branches\`, \`/api/performance/rankings/branches\` | District Directors |
| 9 | \`ManagerDashboard.tsx\` | \`/src/components/dashboard/ManagerDashboard.tsx\` | Branch manager command center with daily approvals, staff target allocations, and summaries | \`/api/reports\`, \`/api/targets\`, \`/api/branches/:id/employees\`, \`/api/approvals/action\` | Branch Managers |
| 10 | \`EmployeeDashboard.tsx\` | \`/src/components/dashboard/EmployeeDashboard.tsx\` | Frontline employee daily performance hub, target agreement, and report submission | \`/api/targets/employee/:id\`, \`/api/reports\`, \`/api/kpis\` | Branch Employees |
| 11 | \`SubmitReportSection.tsx\` | \`/src/components/reports/SubmitReportSection.tsx\` | Form for submitting daily banking metrics (Deposits, FCY, Digital, Accounts, Cards, POS) | \`/api/reports\` (POST) | Employees, Branch Managers |
| 12 | \`EmployeeKpiAgreementPanel.tsx\` | \`/src/components/dashboard/EmployeeKpiAgreementPanel.tsx\` | Formal review, acceptance, or rejection of assigned KPI targets with reasons | \`/api/targets/:id/respond\`, \`/api/targets/batch-respond\` | Employees |
| 13 | \`BranchEmployeeTargetManager.tsx\`| \`/src/components/dashboard/BranchEmployeeTargetManager.tsx\` | Cascading allocation interface to divide branch annual targets among staff | \`/api/targets/allocate\`, \`/api/branches/:id/employees\` | Branch Managers |
| 14 | \`ManagerDailyKpiReportsTable.tsx\`| \`/src/components/dashboard/ManagerDailyKpiReportsTable.tsx\` | Review table for branch managers to inspect and approve/reject staff submissions | \`/api/reports\`, \`/api/approvals/action\` | Branch Managers |
| 15 | \`EmployeeDailyKpiHistoryTable.tsx\`| \`/src/components/dashboard/EmployeeDailyKpiHistoryTable.tsx\` | Searchable historical table of employee submitted daily reports and status | \`/api/reports/employee/:id\` | Employees, Branch Managers |
| 16 | \`BranchPerformanceView.tsx\` | \`/src/components/dashboard/BranchPerformanceView.tsx\` | Detailed branch performance metrics, historical trend charts, and staff rosters | \`/api/kpi-reports/branch/:id/summary\`, \`/api/targets/branch/:id\` | Branch Managers, District Dirs |
| 17 | \`BranchPerformanceDetailsModal.tsx\`| \`/src/components/dashboard/BranchPerformanceDetailsModal.tsx\` | Modal drill-down displaying granular branch metrics and employee breakdown | \`/api/kpi-reports/branch/:id/summary\` | CEO, Board, District Dirs |
| 18 | \`EmployeePerformanceModal.tsx\` | \`/src/components/dashboard/EmployeePerformanceModal.tsx\` | Detailed drill-down modal inspecting an individual employee's KPI record | \`/api/analytics/employee/:id\`, \`/api/targets/employee/:id\` | Managers, District Dirs |
| 19 | \`PeriodPerformanceDashboard.tsx\` | \`/src/components/dashboard/PeriodPerformanceDashboard.tsx\` | Multi-period analytics selector (Daily, Weekly, Monthly, Quarterly, Semi-Annual, Annual) | \`/api/reports\`, \`/api/targets\` | All Roles |
| 20 | \`PeriodicPerformanceAnalytics.tsx\`| \`/src/components/dashboard/PeriodicPerformanceAnalytics.tsx\` | Recharts trend graphs comparing actuals vs targets over selected fiscal periods | \`/api/analytics/overview\`, \`/api/reports\` | Executives, Managers |
| 21 | \`AdminPerformanceRankingDashboard.tsx\`| \`/src/components/dashboard/AdminPerformanceRankingDashboard.tsx\` | Multi-tier leaderboard ranking districts, branches, and top performers | \`/api/performance/rankings/districts\`, \`/api/performance/rankings/branches\` | Executives, Admins |
| 22 | \`CompetitorIntelligenceModule.tsx\`| \`/src/components/competitor/CompetitorIntelligenceModule.tsx\` | Master dashboard for banking competitor analytics, BPI rankings, and market share | \`/api/competitors/banks\`, \`/api/competitors/branches\`, \`/api/competitors/performance\` | All Roles |
| 23 | \`EthiopiaCompetitorMap.tsx\` | \`/src/components/competitor/EthiopiaCompetitorMap.tsx\` | Interactive regional map plotting Bunna branches alongside CBE, Dashen, and Awash | \`/api/competitors/branches\` | All Roles |
| 24 | \`GapAnalysisPanel.tsx\` | \`/src/components/competitor/GapAnalysisPanel.tsx\` | Metric-by-metric gap analysis between Bunna Bank and market leaders | \`/api/competitors/area-rankings\` | Executives, Managers |
| 25 | \`AiInsightsPanel.tsx\` | \`/src/components/competitor/AiInsightsPanel.tsx\` | Automated AI-generated competitive strategy and tactical intervention plans | \`/api/competitors/insights/generate\` | Executives, Managers |
| 26 | \`BankManagementPanel.tsx\` | \`/src/components/competitor/BankManagementPanel.tsx\` | Administration interface for adding and updating Ethiopian commercial banks | \`/api/competitors/banks\` (POST, PUT) | Administrators |
| 27 | \`BranchManagementPanel.tsx\` | \`/src/components/competitor/BranchManagementPanel.tsx\` | Map-based administration of competitor branch locations and opening dates | \`/api/competitors/branches\` (POST, PUT) | Administrators |
| 28 | \`KpiBpiConfigPanel.tsx\` | \`/src/components/competitor/KpiBpiConfigPanel.tsx\` | Weight configuration tool for Banking Performance Index (BPI) metrics | \`/api/competitors/kpis\` (PUT) | Administrators |
| 29 | \`AIAssistantDrawer.tsx\` | \`/src/components/ai/AIAssistantDrawer.tsx\` | Gemini 2.5 Flash EPMS AI Executive Coach drawer for natural language KPI advice | \`/api/ai/assistant\` (POST) | All Roles |
| 30 | \`FloatingAiCoachButton.tsx\` | \`/src/components/ai/FloatingAiCoachButton.tsx\` | Persistent floating action button to summon the AI Executive Coach | Local state toggle | All Roles |
| 31 | \`TelegramBotModal.tsx\` | \`/src/components/common/TelegramBotModal.tsx\` | Account linking interface to generate 6-digit sync codes for Telegram notifications | \`/api/telegram/generate-link-code\`, \`/api/telegram/status\` | All Roles |
| 32 | \`BankMemoLibrary.tsx\` | \`/src/components/common/BankMemoLibrary.tsx\` | Central repository for official banking policies, operational circulars, and memos | \`/api/documents\`, \`/api/documents/:id/read\` | All Roles |
| 33 | \`BankDocumentsManagementPanel.tsx\`| \`/src/components/dashboard/BankDocumentsManagementPanel.tsx\`| Administrative portal for uploading, publishing, and archiving bank circulars | \`/api/documents\` (POST, PUT, DELETE) | Executives, Admins |
| 34 | \`MessagingCenter.tsx\` | \`/src/components/common/MessagingCenter.tsx\` | Internal messaging portal for direct messages, broadcast alerts, and announcements | \`/api/messages/send\`, \`/api/messages/inbox/:id\` | All Roles |
| 35 | \`CalendarView.tsx\` | \`/src/components/calendar/CalendarView.tsx\` | Banking calendar displaying Ethiopian public holidays and 300 active working days | \`/api/holidays\` | All Roles |
| 36 | \`ReportExportModal.tsx\` | \`/src/components/reports/ReportExportModal.tsx\` | Modal for configuring and downloading performance reports in Excel, CSV, or PDF | \`/api/reports/export\` (POST) | All Roles |
| 37 | \`LoginModal.tsx\` | \`/src/components/auth/LoginModal.tsx\` | Modal for authenticating users, selecting demo credentials, and changing passwords | \`/api/auth/login\` | Public / All |
| 38 | \`RegisterModal.tsx\` | \`/src/components/auth/RegisterModal.tsx\` | Self-service registration modal for newly onboarded bank personnel | \`/api/auth/register\`, \`/api/branches\` | Public / Staff |
| 39 | \`UserProfileModal.tsx\` | \`/src/components/profile/UserProfileModal.tsx\` | Profile inspection modal with password update and activity logs | \`/api/auth/change-password\` | Authenticated Staff |
| 40 | \`Header.tsx\` | \`/src/components/common/Header.tsx\` | Global executive navigation bar with role badge, language selector, and quick actions | Local context & i18n | All Roles |
| 41 | \`Footer.tsx\` | \`/src/components/common/Footer.tsx\` | Institutional footer displaying Bunna Bank heritage, quick links, and system version | Static / Local | All Roles |
| 42 | \`NotificationDrawer.tsx\` | \`/src/components/common/NotificationDrawer.tsx\` | Slide-out tray displaying real-time system alerts, target notifications, and memos | \`/api/notifications\`, \`/api/notifications/mark-read\` | All Roles |
| 43 | \`GlobalSearchModal.tsx\` | \`/src/components/common/GlobalSearchModal.tsx\` | Universal quick search (Ctrl+K) indexing branches, districts, employees, and KPIs | In-memory search & client cache | All Roles |
| 44 | \`PerformanceStatusBadge.tsx\` | \`/src/components/common/PerformanceStatusBadge.tsx\` | Visual badge component rendering Critical, Unsatisfactory, Satisfactory, Excellent, or Outstanding | None (Pure UI) | All Roles |
| 45 | \`PerformanceCard.tsx\` | \`/src/components/common/PerformanceCard.tsx\` | Metric visualizer card showing Target vs Achieved, progress bar, and percentage | None (Pure UI) | All Roles |
| 46 | \`ApiDocsModal.tsx\` | \`/src/components/docs/ApiDocsModal.tsx\` | Interactive developer documentation viewer displaying REST endpoints and curl snippets | Static documentation | Admins, Developers |
| 47 | \`LandingPage.tsx\` | \`/src/components/landing/LandingPage.tsx\` | Public institutional entry portal introducing Bunna EPMS features and quick sign-in | Local state | Public |
| 48 | \`AboutPage.tsx\` | \`/src/components/common/AboutPage.tsx\` | Bunna Bank institutional profile, vision, mission, and EPMS architectural objectives | Static / i18n | Public / All |
| 49 | \`ContactPage.tsx\` | \`/src/components/common/ContactPage.tsx\` | Helpdesk inquiry submission form and head office contact directory | Local state | Public / All |
| 50 | \`HowItWorksPage.tsx\` | \`/src/components/common/HowItWorksPage.tsx\` | Step-by-step visual workflow explaining Target Allocation, Daily Reporting, and Approvals | Static / i18n | Public / All |

---

## 12. ROLE-SPECIFIC EXECUTIVE & OPERATIONAL DASHBOARDS

The Daily KPI Performance Management System dynamically routes authenticated users to dedicated, role-optimized dashboards:

### 12.1 CEO Dashboard (\`CeoDashboard.tsx\`)
* **Target Role:** Chief Executive Officer (\`CEO\`)
* **Key Visuals:**
  * Top Metric Banner: Total Mobilized Deposits (ETB), Total Foreign Currency (FCY Inflow in ETB & USD), Net Digital Volume, and Active Branch Coverage.
  * District Performance Leaderboard: Sorted table of all 33 districts showing Net Deposit achievement vs target, FCY contribution, branch count, and color-coded status badges.
  * Interactive Drill-Down Action: Clicking **“Drill Down →”** opens the \`BranchPerformanceDetailsModal\` showing all branches within that district, ranked by performance. Clicking a branch further displays individual branch staff records.
  * Direct Executive Actions: Quick broadcast message to all District Directors, instant Excel export of nationwide standings, and direct access to the Gemini AI Executive Advisor.

### 12.2 District Management Dashboard (\`DistrictManagementDashboard.tsx\`)
* **Target Role:** District Director (\`DISTRICT_DIRECTOR\`)
* **Key Visuals:**
  * District Summary Card: Total branches supervised (e.g., 22 branches in Addis Ababa South), total employees, and aggregate deposit mobilization.
  * Branch Performance Grid: Real-time status cards for each branch in the district showing daily target adherence, pending report counts, and Grade classification.
  * Intervention Trigger: Direct flagging of branches in the *Critical* or *Unsatisfactory* performance tiers (<50% target achievement) for managerial support.

### 12.3 Branch Manager Command Center (\`ManagerDashboard.tsx\`)
* **Target Role:** Branch Manager / Assistant Manager (\`MANAGER\`)
* **Key Visuals:**
  * Daily Review & Approval Queue: Pending daily reports submitted by branch staff requiring formal review. Supports one-click approval or rejection with mandatory feedback comments.
  * Cascading Target Allocator: Tool to divide the branch's assigned annual targets across branch staff based on experience, seniority, and role type.
  * Staff Performance Trajectory: Visual leaderboard of branch officers with RAG status indicators and completion percentages.
  * Daily Branch Rollup: Aggregated daily branch figures compared against the daily target (\`annual / 300\`).

### 12.4 Employee Performance Hub (\`EmployeeDashboard.tsx\`)
* **Target Role:** Branch Performer / Customer Service Officer (\`EMPLOYEE\`)
* **Key Visuals:**
  * Daily Reporting Form: Clean, rapid data entry for daily accomplishments across the 8 primary banking KPIs.
  * Target Agreement Panel: Visual review of newly assigned targets with **Accept** or **Reject** buttons (requiring formal justification if rejected).
  * Personal Performance Radar & Progress Bar: Real-time calculation of overall daily, weekly, and monthly achievement percentages against assigned targets.
  * Historical Report Archive: Table of past submissions showing approval status, manager comments, and submission timestamps.
`;
}
