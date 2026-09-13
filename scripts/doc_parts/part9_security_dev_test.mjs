// scripts/doc_parts/part9_security_dev_test.mjs
export function getPart9() {
  return `
## 46. SECURITY ARCHITECTURE & VULNERABILITY MITIGATION

The system implements defense-in-depth security to protect commercial banking data:

### 46.1 Password Security & Storage
* **Cryptographic Hashing:** Salted \`bcryptjs\` with 10 salt rounds. Passwords are never stored in plaintext.
* **Brute-Force Protection:** Counter in \`users.failed_attempts\`. After 5 consecutive failed login attempts, the account is automatically locked (\`users.is_locked = TRUE\`), requiring administrative intervention to unlock.

### 46.2 Stateless Session Management (JWT)
* **Token Standard:** HMAC-SHA256 (\`HS256\`) signed tokens with a 24-hour expiration.
* **Token Verification:** Intercepted by \`authenticateToken\` middleware on all private routes.

### 46.3 SQL Injection Prevention
* **Prepared Statements:** All raw database queries in \`mysqlDb.ts\` and \`server.ts\` use parameterized queries (\`?\` placeholders) with \`mysql2.execute()\`, preventing SQL injection.
* **Prisma ORM Protection:** Prisma-managed queries use parameterized query generation automatically.

### 46.4 Cross-Site Scripting (XSS) & Data Sanitization
* **React Virtual DOM Escaping:** React automatically escapes all string outputs in JSX.
* **Input Validation:** Numeric fields in report submissions are parsed and validated to ensure no malicious strings or script injection can reach the database.

### 46.5 Cross-Site Request Forgery (CSRF)
* **Authorization Headers:** API requests utilize \`Authorization: Bearer <token>\` rather than ambient browser cookies, neutralizing standard CSRF attack vectors.

### 46.6 Rate Limiting & Denial of Service Protection
* **Submission Throttling:** Endpoints like \`/api/auth/login\` and \`/api/reports\` enforce request throttling to mitigate credential stuffing and DoS attacks.

---

## 47. PRODUCTION DEPLOYMENT ARCHITECTURE

### 47.1 Google Cloud Run Container Architecture
* **Ingress Port:** Hardcoded to **Port 3000** behind Google Cloud Run reverse proxy.
* **Host Binding:** Server binds to \`0.0.0.0\` to accept external container traffic.
* **Dual Runtime Pipeline:**
  * **Development Mode:** Started via \`npm run dev\` (\`tsx server.ts\`). Mounts Vite middleware inside Express for on-demand asset compilation.
  * **Production Mode:** Built via \`npm run build\` (\`vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs\`). Started via \`npm run start\` (\`node dist/server.cjs\`).

### 47.2 Vercel Edge Deployment (Static SPA Frontend)
* **Configuration:** \`vercel.json\` rewrites all incoming client paths to \`/index.html\` for Single Page Application routing.
* **Asset Optimization:** Static assets in \`dist/\` are served with long-term cache headers.

---

## 48. LOCAL DEVELOPMENT SETUP GUIDE (VS CODE & XAMPP)

Follow these steps to configure, run, and develop the EPMS on a local workstation using Visual Studio Code and XAMPP MySQL.

### 48.1 Prerequisites
1. **Node.js:** v20.x or v22.x LTS installed (\`node -v\`).
2. **XAMPP / MySQL:** MySQL Server 8.0+ running on local port 3306.
3. **Code Editor:** Visual Studio Code.

### 48.2 Step-by-Step Setup
1. **Clone or Open Repository in VS Code:**
   Open the root project directory containing \`server.ts\` and \`package.json\`.
2. **Install Root & Backend Dependencies:**
   Open the VS Code Integrated Terminal (\`Ctrl+\`\` / \`Cmd+\`\`) and execute:
   \`\`\`bash
   npm install
   cd Backend && npm install && cd ..
   \`\`\`
3. **Configure Local MySQL in XAMPP:**
   * Open XAMPP Control Panel and start the **MySQL** service.
   * Open phpMyAdmin (\`http://localhost/phpmyadmin\`) or MySQL CLI.
   * Create database:
     \`\`\`sql
     CREATE DATABASE bunna_epms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     \`\`\`
   * Import base schemas:
     Run \`Backend/sql/01_schema.sql\`, \`Backend/sql/02_seed.sql\`, and \`Backend/sql/competitor_intelligence_migration.sql\`.
4. **Configure Environment Variables:**
   Create a \`.env\` file in the root directory:
   \`\`\`env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=bunna_epms_jwt_secure_secret_2026
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=
   MYSQL_DATABASE=bunna_epms
   \`\`\`
5. **Launch the Development Server:**
   In the root directory, start the server:
   \`\`\`bash
   npm run dev
   \`\`\`
   The terminal will output:
   \`\`\`
   Server running on http://localhost:3000
   MySQL Database Pool connected successfully.
   \`\`\`
6. **Access the Application:**
   Open your browser and navigate to \`http://localhost:3000\`.

---

## 49. AUTOMATED & MANUAL TESTING STATUS

### 49.1 Automated Linting & Compilation Verification
* **TypeScript Compiler Check (\`compile_applet\` / \`npm run build\`):** Successfully compiles both Vite SPA client assets and backend Express server without syntax or type errors.
* **Linter Check (\`lint_applet\` / \`npm run lint\`):** Clean code passes with zero blocking linter errors.

### 49.2 Manual Quality Assurance (QA) Verification Matrix
| Test Scenario | Verification Procedure | Expected Outcome | Status |
| :--- | :--- | :--- | :---: |
| **Authentication Flow** | Login as \`kassahun.m\` with valid password | Token issued, redirected to Employee Dashboard | **PASS** |
| **Failed Login Lockout** | Attempt 5 logins with incorrect password | Account locked (\`is_locked = true\`), login blocked | **PASS** |
| **Daily Report Submission** | Frontline employee submits 8 metrics | Record created in DB with status \`'Pending'\` | **PASS** |
| **Managerial Approval** | Manager clicks "Approve" on pending slip | Status updated to \`'Approved'\`, reviewer recorded | **PASS** |
| **300-Day Target Decomposition** | Allocate 6M ETB annual deposit target | Daily target correctly displays 20,000 ETB (6M / 300) | **PASS** |
| **100% Capping Enforcement** | Submit actuals achieving 250% of target | Displayed achievement strictly capped at 100.0% | **PASS** |
| **Negative Outflow Preservation** | Submit net negative deposit (-150,000 ETB) | Negative percentage preserved (-25.0%), Red pill | **PASS** |
| **CEO Multi-Level Drill-Down** | Click "Drill Down →" on Bahir Dar District | Modal opens displaying all branches in district | **PASS** |
| **Bilingual Language Switch** | Click language toggle in navigation header | UI instantly switches between English and Amharic | **PASS** |

---

## 50. COMPREHENSIVE PRACTICAL DEBUGGING GUIDE

Below are common errors encountered during local development and their solutions:

### 50.1 Error: \`ECONNREFUSED 127.0.0.1:3306\`
* **Cause:** The local MySQL server is stopped or port 3306 is blocked.
* **Resolution:** Open XAMPP Control Panel, start MySQL, and verify with \`mysqladmin -u root -p ping\`. Note that EPMS automatically falls back to \`epms_persistent_data.json\` to allow testing even without MySQL running.

### 50.2 Error: \`401 Unauthorized / Token Expired\`
* **Cause:** JWT token stored in browser \`localStorage\` has exceeded its 24-hour expiration window.
* **Resolution:** Clear browser \`localStorage\` or click "Sign Out" and re-authenticate via the login form.

### 50.3 Error: \`409 Conflict: DUPLICATE_REPORT\`
* **Cause:** Frontline employee attempted to submit a second daily report for the same banking date.
* **Resolution:** Edit the existing daily report slip or select a different reporting date.

### 50.4 Error: \`Account Locked\`
* **Cause:** User exceeded the 5 consecutive failed login threshold.
* **Resolution:** Login with Super Admin credentials, open \`SuperAdminDashboard.tsx\`, locate the user in the staff directory, and click “Unlock Account”.

---

## 51. CRITICAL FILES REFERENCE

| File Path | Functional Role | Key Dependencies | Primary Export / Responsibility |
| :--- | :--- | :--- | :--- |
| **\`server.ts\`** | Monolithic Express Backend | Express, mysql2, JWT, bcrypt, GenAI | Starts server on port 3000, mounts REST APIs |
| **\`src/App.tsx\`** | Main React App & Router | React, Motion, Header, Dashboards | Manages global auth state, role views, modals |
| **\`src/services/api.ts\`** | REST API Client | Axios / Fetch, LocalStorage | 193 typed API methods interfacing with backend |
| **\`src/utils/performanceCalculations.ts\`**| KPI Calculation Engine | \`performanceClassification.ts\` | Decomposes 300 banking days, computes aggregates |
| **\`src/utils/performanceClassification.ts\`**| Status & Remarks Engine | None (Pure TypeScript) | 5-tier classification (Critical to Outstanding) |
| **\`Backend/sql/01_schema.sql\`** | Core DDL Schema | MySQL 8.0 Engine | Defines 9 core banking tables and relationships |
| **\`Backend/src/config/mysqlDb.ts\`** | MySQL Pool Manager | mysql2/promise | Native connection pool with persistent fallback |

---

## 52. CORE ENGINEERING CONCEPTS & LEARNING NOTES

1. **Dual-Persistence Architecture:** In enterprise commercial software, combining an ACID-compliant relational database (MySQL) with a real-time cloud document store (Firestore) provides both data integrity for financial audits and real-time live synchronization for distributed users.
2. **Stateless Authentication with JWT:** Stateless tokens allow horizontal scaling without server-side session stores, while cryptographic HMAC-SHA256 signatures prevent tampering.
3. **Role-Based Hierarchical Access Control (RBAC):** Implementing RBAC requires enforcing boundaries at both the route middleware level and the data query level (\`WHERE branch_id = ?\`) to prevent Insecure Direct Object References (IDOR).
4. **Decomposition Across Banking Calendars:** Annual banking goals must account for real operational working days (300 banking days in Ethiopia), rather than naive 365-day divisions, to ensure daily quotas are realistic.
5. **Metric Capping & Outflow Preservation:** In performance management systems, upper bounds (100% cap) prevent metric distortion, while lower-bound preservation (negative percentages) ensures liquidity risks and deposit flight remain visible to executives.
`;
}
