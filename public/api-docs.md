# Bunna Bank EPMS - API Documentation

## Base URL
Production: `https://bbepms.vercel.app/api`
Development: `http://localhost:3000/api`

## Content-Type
All requests and responses use `application/json` unless otherwise specified.

---

## 1. System & Health

### Health Check
**Endpoint:** `GET /health`
Returns the operational status of the server and database connection.
**Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 2. Authentication & Users

### User Login
**Endpoint:** `POST /auth/login`
Authenticates a user and returns their profile.
**Payload:**
```json
{
  "userId": "USR-123",
  "password": "password123"
}
```

### User Registration
**Endpoint:** `POST /auth/register`
Registers a new employee/user.

### Change Password
**Endpoint:** `POST /auth/change-password`
Changes the current user's password.

### Check Branch Manager Status
**Endpoint:** `GET /auth/branch-manager-status/:branchId`
Checks if a given branch currently has an assigned manager.

### Validate User ID
**Endpoint:** `GET /auth/validate-userid?userId=USR-123`
Checks if a user ID is available or already taken.

---

## 3. KPI Targets

### Get All Targets
**Endpoint:** `GET /targets`
Retrieves all global/branch targets.

### Get Targets by Employee
**Endpoint:** `GET /targets/employee/:employeeId`
Retrieves KPI targets assigned to a specific employee.

### Get Targets by Branch
**Endpoint:** `GET /targets/branch/:branchId`
Retrieves KPI targets assigned to a specific branch.

### Create/Update Target
**Endpoint:** `POST /targets`
Creates a new target and automatically calculates daily, weekly, monthly, quarterly, and semi-annual allocations.
**Payload:**
```json
{
  "employeeId": "USR-123",
  "kpiCode": "dep_vol",
  "targetValue": 5600000
}
```

### Allocate Targets (Batch)
**Endpoint:** `POST /targets/allocate`
Distributes targets in batch across branch employees.

### Delete Target
**Endpoint:** `DELETE /targets/:id`

---

## 4. KPI Reports & Approvals

### Get All Reports
**Endpoint:** `GET /kpi-reports` (or `/reports`)
Retrieves all daily performance reports.

### Get Report by ID
**Endpoint:** `GET /kpi-reports/:id`

### Get Reports by Employee
**Endpoint:** `GET /kpi-reports/employee/:employeeId`

### Submit Daily Report
**Endpoint:** `POST /kpi-reports`
Submits a new daily KPI report. Instantly synced to Firestore.
**Payload:**
```json
{
  "employeeId": "USR-123",
  "branchId": "BR-001",
  "reportDate": "2026-08-12",
  "depositsETB": 150000,
  "foreignCurrencyETB": 500,
  "accountOpenings": 10
}
```

### Update Report
**Endpoint:** `PUT /kpi-reports/:id`

### Delete Report
**Endpoint:** `DELETE /kpi-reports/:id`

### Manager Approval Action
**Endpoint:** `POST /approvals/action`
Approves or rejects an employee's submitted report.
**Payload:**
```json
{
  "reportId": "REP-123",
  "status": "APPROVED",
  "comments": "Great work today."
}
```

---

## 5. Analytics & Performance

### Employee Performance Summary
**Endpoint:** `GET /kpi-reports/employee/:employeeId/summary`
Calculates an employee's aggregated performance against their targets.
Formula used: `(Actual / Target) * 100`

### Employee Analytics Detail
**Endpoint:** `GET /analytics/employee/:employeeId`
Returns detailed analytical data (trends, time-series) for an employee.

### Branch Performance Summary
**Endpoint:** `GET /kpi-reports/branch/:branchId/summary`
Returns aggregated performance metrics for an entire branch.

### Global Overview
**Endpoint:** `GET /analytics/overview`
Retrieves system-wide analytics for administrators.

### Export Reports
**Endpoint:** `POST /reports/export`
Generates an exportable format (CSV/JSON) of filtered reports.

---

## 6. Manager Tools

### Add Employee to Branch
**Endpoint:** `POST /manager/employees`
Allows a branch manager to onboard a new employee to their branch.

### Update Employee Details
**Endpoint:** `PUT /manager/employees/:id`

### Delete Employee
**Endpoint:** `DELETE /manager/employees/:id`

### Reset Employee Password
**Endpoint:** `POST /manager/employees/:id/reset-password`

### Change Employee Status (Active/Inactive)
**Endpoint:** `PUT /manager/employees/:id/status`

---

## 7. Configuration

### Get KPI Configurations
**Endpoint:** `GET /kpi-config`

### Update KPI Configurations
**Endpoint:** `PUT /kpi-config`

---

## 8. Telegram Bot

### Telegram Webhook Status
**Endpoint:** `GET /telegram/status`
Returns the current connection status of the Telegram Bot.

### Telegram Webhook Receiver
**Endpoint:** `POST /telegram/webhook`
The secure endpoint used by Telegram to push live messages and callbacks. Automatically triggers `ensureDbSynced()` for Firestore consistency.

---

## 9. AI Assistant

### Chat Assistant
**Endpoint:** `POST /ai/assistant`
Interacts with the AI Coach/Assistant for banking guidance.

### Generate AI Insights
**Endpoint:** `POST /ai/insights`
Analyzes employee/branch performance and generates data-driven AI coaching insights.
