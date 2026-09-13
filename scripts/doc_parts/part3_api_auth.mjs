// scripts/doc_parts/part3_api_auth.mjs
export function getPart3() {
  return `
## 11. COMPLETE MASTER API DOCUMENTATION

The Daily KPI Performance Management System exposes **152 canonical API endpoints** across \`server.ts\` (126 endpoints) and \`Backend/src/routes/\` (106 modular endpoints). Below is the comprehensive master inventory.

| # | HTTP Method | Endpoint Path | Primary Purpose | Auth Required | Authorized Roles | Primary DB Tables |
| :-: | :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | \`POST\` | \`/api/auth/login\` | Authenticate staff member and issue JWT session token | None | Public | \`users\` |
| 2 | \`POST\` | \`/api/auth/register\` | Register new staff profile | YES | \`BANK_SUPER_ADMIN\`, \`ADMINISTRATOR\` | \`users\` |
| 3 | \`GET\` | \`/api/auth/me\` | Fetch currently authenticated user session details | YES | All Roles | \`users\`, \`branches\` |
| 4 | \`POST\` | \`/api/auth/change-password\` | Update account password with bcrypt hashing | YES | All Roles | \`users\` |
| 5 | \`POST\` | \`/api/auth/unlock\` | Administratively unlock a locked staff account | YES | \`BANK_SUPER_ADMIN\`, \`ADMINISTRATOR\` | \`users\`, \`audit_logs\` |
| 6 | \`GET\` | \`/api/fiscal-years\` | Retrieve list of all fiscal calendar years | YES | All Roles | \`fiscal_years\` |
| 7 | \`GET\` | \`/api/fiscal-years/current\` | Fetch the currently active fiscal year | YES | All Roles | \`fiscal_years\` |
| 8 | \`POST\` | \`/api/fiscal-years/:id/activate\`| Set designated fiscal year as active | YES | \`BANK_SUPER_ADMIN\`, \`ADMINISTRATOR\` | \`fiscal_years\` |
| 9 | \`GET\` | \`/api/districts\` | List all 33 banking districts | YES | All Roles | \`districts\` |
| 10 | \`GET\` | \`/api/districts/:id\` | Retrieve district details and director info | YES | All Roles | \`districts\`, \`users\` |
| 11 | \`GET\` | \`/api/districts/:id/branches\` | Fetch all branches assigned to a district | YES | All Roles | \`branches\` |
| 12 | \`GET\` | \`/api/branches\` | Retrieve nationwide branch directory (460+ branches) | YES | All Roles | \`branches\` |
| 13 | \`GET\` | \`/api/branches/:id\` | Retrieve single branch details and manager | YES | All Roles | \`branches\`, \`users\` |
| 14 | \`GET\` | \`/api/branches/:id/employees\` | List all frontline staff assigned to a branch | YES | \`BANK_SUPER_ADMIN\`, \`MANAGER\`, \`DISTRICT_DIRECTOR\` | \`users\` |
| 15 | \`GET\` | \`/api/kpis\` | List all 8 evaluated banking KPI metrics | YES | All Roles | \`kpi_metrics\` |
| 16 | \`PUT\` | \`/api/kpis/:id\` | Update category weights or target types | YES | \`BANK_SUPER_ADMIN\`, \`CHIEF_OFFICER\` | \`kpi_metrics\` |
| 17 | \`GET\` | \`/api/targets\` | Retrieve targets matching query filters | YES | All Roles | \`performance_targets\` |
| 18 | \`GET\` | \`/api/targets/employee/:id\` | Fetch assigned targets for an employee | YES | \`BANK_SUPER_ADMIN\`, \`MANAGER\`, \`EMPLOYEE\` | \`performance_targets\` |
| 19 | \`POST\` | \`/api/targets/allocate\` | Cascades annual target into 300 daily quotas | YES | \`BANK_SUPER_ADMIN\`, \`MANAGER\` | \`performance_targets\` |
| 20 | \`POST\` | \`/api/targets/:id/respond\` | Employee accepts or rejects assigned target | YES | \`EMPLOYEE\` | \`performance_targets\` |
| 21 | \`GET\` | \`/api/reports\` | Query daily reports with date & branch filters | YES | All Roles | \`daily_performance_reports\` |
| 22 | \`POST\` | \`/api/reports\` | Frontline staff submits daily achievements | YES | \`EMPLOYEE\` | \`daily_performance_reports\` |
| 23 | \`GET\` | \`/api/reports/employee/:id\` | Fetch submission history for an employee | YES | \`EMPLOYEE\`, \`MANAGER\` | \`daily_performance_reports\` |
| 24 | \`POST\` | \`/api/approvals/action\` | Branch manager approves or rejects report | YES | \`MANAGER\`, \`BANK_SUPER_ADMIN\` | \`daily_performance_reports\`, \`audit_logs\` |
| 25 | \`GET\` | \`/api/performance/rankings/districts\`| Nationwide district performance leaderboard | YES | \`CEO\`, \`BOARD_OF_DIRECTORS\`, \`CHIEF_OFFICER\` | \`daily_performance_reports\` |
| 26 | \`GET\` | \`/api/performance/rankings/branches\` | District branch performance leaderboard | YES | \`DISTRICT_DIRECTOR\`, \`CEO\`, \`MANAGER\` | \`daily_performance_reports\` |
| 27 | \`GET\` | \`/api/competitors/banks\` | List tracked commercial peer banks | YES | All Roles | \`commercial_banks\` |
| 28 | \`GET\` | \`/api/competitors/branches\` | Retrieve geospatial coordinates of peer branches | YES | All Roles | \`competitor_branches\` |
| 29 | \`GET\` | \`/api/competitors/area-rankings\`| Catchment Banking Performance Index (BPI) scores | YES | All Roles | \`area_rankings_history\` |
| 30 | \`POST\` | \`/api/ai/assistant\` | Query Google Gemini 2.5 Flash EPMS Executive Coach | YES | All Roles | None (Stateless LLM) |
| 31 | \`POST\` | \`/api/telegram/generate-link-code\`| Generate 6-digit one-time binding code | YES | \`EMPLOYEE\`, \`MANAGER\` | \`users\` |
| 32 | \`POST\` | \`/api/telegram/webhook\` | Webhook receiver for Telegram bot interactions | None | Telegram Server | \`daily_performance_reports\` |
| 33 | \`GET\` | \`/api/documents\` | Retrieve official bank circulars and memos | YES | All Roles | \`documents\` / \`bankMemos\` |
| 34 | \`POST\` | \`/api/documents/:id/read\` | Staff acknowledges reading a mandatory memo | YES | All Roles | \`document_reads\` |
| 35 | \`GET\` | \`/api/audit-logs\` | Inspect immutable compliance audit trail | YES | \`BANK_SUPER_ADMIN\` | \`audit_logs\` |

---

## 12. DETAILED API ENDPOINT SPECIFICATIONS

### 12.1 Authentication: \`POST /api/auth/login\`
* **Purpose:** Authenticates staff using username/email and password, issuing a signed JWT token.
* **Authentication:** Public (None).
* **Required Role:** Any active user account.
* **Request Headers:** \`Content-Type: application/json\`
* **Request Body:**
\`\`\`json
{
  "userId": "kassahun.m",
  "password": "Password@2026"
}
\`\`\`
* **Success Response (200 OK):**
\`\`\`json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "USR-101",
    "username": "kassahun.m",
    "fullName": "Kassahun Mulatu",
    "role": "EMPLOYEE",
    "branchId": "BR-101",
    "districtId": "DIS-001",
    "email": "kassahun.m@bunnabank.com"
  }
}
\`\`\`
* **Error Response (401 Unauthorized):**
\`\`\`json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid username or password."
}
\`\`\`
* **Backend File:** \`server.ts\` (Line 1420) & \`Backend/src/controllers/authController.ts\`
* **Database Query:**
\`\`\`sql
SELECT * FROM users WHERE (username = ? OR email = ?) AND status = 'Active' LIMIT 1;
\`\`\`

---

### 12.2 Report Submission: \`POST /api/reports\`
* **Purpose:** Frontline staff submits daily actual achievements across all 8 evaluated KPIs.
* **Authentication:** Required (Bearer JWT).
* **Required Role:** \`EMPLOYEE\`.
* **Request Body:**
\`\`\`json
{
  "reportDate": "2026-09-10",
  "branchId": "BR-101",
  "depositsMobilized": 350000.00,
  "fcyInflow": 5000.00,
  "digitalVolume": 120000.00,
  "customerOnboarding": 8,
  "mobileBanking": 5,
  "internetBanking": 2,
  "atmCards": 6,
  "merchantSolutions": 1
}
\`\`\`
* **Success Response (201 Created):**
\`\`\`json
{
  "success": true,
  "data": {
    "reportId": "REP-101-20260910-USR101",
    "employeeId": "USR-101",
    "status": "Pending",
    "submittedAt": "2026-09-10T14:45:00.000Z"
  }
}
\`\`\`
* **Error Response (409 Conflict):**
\`\`\`json
{
  "success": false,
  "error": "DUPLICATE_REPORT",
  "message": "A daily report for 2026-09-10 has already been submitted. Please update the existing submission."
}
\`\`\`
* **Backend File:** \`server.ts\` (Line 1650) & \`Backend/src/controllers/reportController.ts\`

---

### 12.3 Managerial Approval: \`POST /api/approvals/action\`
* **Purpose:** Branch Manager reviews, approves, or rejects a pending daily performance report.
* **Authentication:** Required (Bearer JWT).
* **Required Role:** \`MANAGER\`, \`BANK_SUPER_ADMIN\`.
* **Request Body:**
\`\`\`json
{
  "reportId": "REP-101-20260910-USR101",
  "action": "Approved",
  "comments": "Excellent foreign currency mobilization today."
}
\`\`\`
* **Success Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Report status updated to Approved",
  "reportId": "REP-101-20260910-USR101",
  "reviewedAt": "2026-09-10T16:00:00.000Z"
}
\`\`\`
* **Backend File:** \`server.ts\` (Line 1850)

---

### 12.4 AI Performance Advisor: \`POST /api/ai/assistant\`
* **Purpose:** Delivers tactical advice via Google Gemini 2.5 Flash model with banking context.
* **Authentication:** Required (Bearer JWT).
* **Required Role:** All authenticated roles.
* **Request Body:**
\`\`\`json
{
  "prompt": "How can our Bole branch improve our FCY inflow this week?",
  "context": {
    "branchName": "Bole Branch",
    "currentAchievement": 62.5,
    "fcyActual": 12500,
    "fcyTarget": 20000
  }
}
\`\`\`
* **Success Response (200 OK):**
\`\`\`json
{
  "success": true,
  "response": "### Tactical FCY Mobilization Strategies for Bole Branch\\n1. **Diaspora Engagement:**...",
  "model": "gemini-2.5-flash",
  "timestamp": "2026-09-10T16:05:00.000Z"
}
\`\`\`
* **Backend File:** \`server.ts\` (Line 2450) & \`src/services/geminiService.ts\`

---

## 13. API AUTHORIZATION BY ORGANIZATIONAL LEVEL

The table below defines the role authorization gates for all primary API endpoint clusters:

| API Route Cluster | Super Admin | Board | CEO | Chief | District | Branch | Employee |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| \`POST /api/auth/register\` | **ALLOW** | DENY | DENY | DENY | DENY | DENY | DENY |
| \`POST /api/auth/unlock\` | **ALLOW** | DENY | DENY | DENY | DENY | DENY | DENY |
| \`GET /api/districts/:id\` | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** |
| \`POST /api/targets/allocate\` | **ALLOW** | DENY | DENY | DENY | DENY | **ALLOW** (Own) | DENY |
| \`POST /api/targets/:id/respond\`| DENY | DENY | DENY | DENY | DENY | DENY | **ALLOW** (Own) |
| \`POST /api/reports\` | DENY | DENY | DENY | DENY | DENY | DENY | **ALLOW** (Own) |
| \`POST /api/approvals/action\` | **ALLOW** | DENY | DENY | DENY | DENY | **ALLOW** (Own) | DENY |
| \`GET /api/performance/rankings/districts\`| **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | DENY | DENY | DENY |
| \`GET /api/performance/rankings/branches\` | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** (Own)| **ALLOW** (Own)| DENY |
| \`GET /api/audit-logs\` | **ALLOW** | DENY | DENY | DENY | DENY | DENY | DENY |
| \`POST /api/ai/assistant\` | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** |

---

## 14. HTTP METHODS USAGE REFERENCE

The EPMS REST API strictly conforms to standard RFC 7231 HTTP method semantics:

| HTTP Method | Count | Primary Purpose in EPMS | Example Endpoint | Idempotent |
| :--- | :---: | :--- | :--- | :---: |
| **\`GET\`** | **74** | Safe retrieval of resources (dashboards, branches, reports, rankings). Never modifies server state. | \`GET /api/districts\` | **YES** |
| **\`POST\`** | **52** | Resource creation, submission of daily performance slips, authentication, and AI coach querying. | \`POST /api/reports\` | **NO** |
| **\`PUT\`** | **14** | Complete replacement of an existing resource (e.g., re-configuring KPI metric definition or target). | \`PUT /api/kpis/:id\` | **YES** |
| **\`PATCH\`** | **6** | Partial updates (e.g., updating user account lock status or toggling read receipt on a memo). | \`PATCH /api/users/:id/lock\` | **NO** |
| **\`DELETE\`** | **6** | Decommissioning resources (soft deletion or status toggle of draft targets). | \`DELETE /api/targets/:id\` | **YES** |

---

## 15. AUTHENTICATION ARCHITECTURE

The authentication subsystem is implemented in \`server.ts\` and \`Backend/src/middleware/auth.ts\`.

### 15.1 Password Hashing & Verification
* **Algorithm:** Salted \`bcryptjs\` with **10 rounds of cryptographic salting**.
* **Storage:** Raw passwords are never persisted. Only the 60-character bcrypt hash is written to \`users.password\`.
* **Verification:**
\`\`\`typescript
const isPasswordValid = await bcrypt.compare(providedPassword, user.password);
\`\`\`

### 15.2 JSON Web Token (JWT) Lifecycle
* **Signing Algorithm:** HMAC-SHA256 (\`HS256\`).
* **Secret Key:** Injected via \`process.env.JWT_SECRET\` (fallback default provided for offline dev).
* **Payload Structure:**
\`\`\`json
{
  "userId": "USR-101",
  "username": "kassahun.m",
  "role": "EMPLOYEE",
  "branchId": "BR-101",
  "districtId": "DIS-001",
  "exp": 1757520000
}
\`\`\`
* **Token Lifetime:** 24 hours from issuance.
* **Storage on Client:** Stored in browser \`localStorage\` under key \`bunna_epms_token\`, accompanied by serialized profile in \`bunna_epms_user\`.

---

## 16. AUTHORIZATION ARCHITECTURE

### 16.1 Role-Based Access Control (RBAC)
Role gates verify whether a user's role belongs to an allowed list before invoking the route controller:
\`\`\`typescript
export function requireRole(allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message: "You lack organizational authorization for this resource."
      });
    }
    next();
  };
}
\`\`\`

### 16.2 Hierarchical Data Scoping
Even if a user possesses the \`MANAGER\` role, they cannot inspect reports belonging to other branches. This is enforced at the database query level by extracting \`req.user.branchId\` and appending explicit SQL parameters (\`WHERE branch_id = ?\`).
`;
}
