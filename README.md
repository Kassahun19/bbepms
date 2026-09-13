# Bunna Bank Daily KPI Performance Management System (EPMS)

An enterprise-grade, full-stack Daily KPI Performance Management and Banking Competitor Intelligence platform designed for Bunna Bank S.C.

---

## 🚀 Quick Start in VS Code (Local Execution)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Node v20+ recommended)
- **MySQL** (Optional): If you have MySQL installed locally (e.g. MySQL Server, XAMPP, Laragon, or Docker).
  - Default database credentials:
    - **Host**: `localhost`
    - **Port**: `3306`
    - **Database**: `daily_kpi_2026`
    - **User**: `daily_kpi_2026`
    - **Password**: `daily_kpi_2026`
  *(Note: If MySQL is not running, the system will automatically utilize its high-performance, persistent relational engine with full offline durability.)*

---

### 2. Installation & Running

1. **Extract ZIP** and open the folder in **VS Code**.
2. Open the integrated terminal (`Ctrl + ~` or `Cmd + ~`) and run:
   ```bash
   npm install
   ```
3. Start the application in development mode:
   ```bash
   npm run dev
   ```
4. **Initialize Database Tables & Seed Data**:
   - Open your web browser and navigate to:
     ```
     http://localhost:3000/install
     ```
   - This automatically creates all **18 MySQL tables**, inserts seed KPI metrics, 565 official branches, 34 districts, test users, targets, and verifies SQL CRUD operations (`INSERT`, `SELECT`, `UPDATE`, `DELETE`).
5. **Access the Application**:
   - Navigate to:
     ```
     http://localhost:3000
     ```

---

## 🔐 Default Login Credentials

| Role | Username / User ID | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Bank Super Admin** | `kassahun.m` | `SuperAdmin@2026!` | Complete System & Database Administration |
| **CEO** | `ceo` | `Ceo@2026!` | Nationwide Executive Dashboard & BPI Rankings |
| **Board of Directors** | `board` | `Board@2026!` | High-level Strategic Performance Analytics |
| **Chief Officer (Retail)**| `chief.retail` | `Chief@2026!` | Retail Operations & District Performance |
| **Director (Performance)**| `director.kpi` | `Director@2026!` | Enterprise KPI Oversight & Audit Logs |
| **District Director** | `central.district` | `District@2026!` | District Oversight & Branch Aggregations |
| **Branch Manager** | `manager` | `Manager@2026!` | Branch Daily Approvals & Target Cascading |
| **Customer Service Staff** | `employee` | `Employee@2026!` | Daily 4:00 PM KPI Report Submission |

---

## 🗄️ Relational Database Schema (18 Tables)

1. `departments` - Organizational divisions
2. `districts` - 34 Banking Districts
3. `branches` - 565 Official Bunna Bank Branches
4. `fiscal_years` - Operating fiscal calendar (300 banking days)
5. `users` - 9 System Role Hierarchy with bcrypt hash & lockout protection
6. `kpi_metrics` - 8 Core Financial & Digital Banking KPIs
7. `performance_targets` - Cascaded Annual, Quarterly, Monthly, and Daily Targets
8. `daily_performance_reports` - Daily branch and employee KPI submissions & approvals
9. `audit_logs` - System-wide audit trail with IP and action tracking
10. `announcements` - Executive broadcasts and operational alerts
11. `system_settings` - Global configuration and thresholds
12. `competitor_banks` - Ethiopian commercial banking competitor landscape
13. `competitor_branches` - Mapped competitor branch networks across Ethiopian cities
14. `competitor_kpi_metrics` - Banking Performance Index (BPI) metric dimensions
15. `competitor_branch_kpi_values` - Competitor branch-level performance figures
16. `competitor_bpi_weights` - Weighted evaluation matrix
17. `competitor_ai_insights` - AI-generated market gap analysis
18. `competitor_catchment_gaps` - Identified geographical banking opportunities

---

## 📡 REST API & SQL Mapping

| HTTP Verb | SQL Operation | Endpoint Pattern | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `SELECT` | `/api/users`, `/api/branches`, `/api/reports` | Query entities with filters and search |
| `POST` | `INSERT` | `/api/reports`, `/api/targets`, `/api/users` | Create new records |
| `PUT` / `PATCH` | `UPDATE` | `/api/reports/:id`, `/api/reports/:id/approve` | Update data and approval status |
| `DELETE` | `DELETE` | `/api/reports/:id`, `/api/users/:id` | Remove records |

---

## 📦 Production Build

```bash
npm run build
npm start
```
