# Security Audit Plan: Role-Based CRUD Operations

## 1. Objectives
- Audit role-based access control (RBAC) across all CRUD operations.
- Ensure API routes, controllers, and services enforce authorization.
- Verify UI actions are connected correctly.
- Test CRUD operations for all roles:
  - BANK_SUPER_ADMIN
  - ADMINISTRATOR
  - CEO
  - BOARD_OF_DIRECTORS
  - CHIEF_OFFICER
  - DIRECTOR
  - DISTRICT_DIRECTOR
  - MANAGER
  - EMPLOYEE

## 2. Audit Scope (Controllers)
- [ ] adminController.js
- [ ] analyticsController.js
- [ ] approvalController.js
- [ ] authController.js
- [ ] branchController.js
- [ ] districtController.js
- [ ] kpiController.js
- [ ] managerController.js
- [ ] reportController.js
- [ ] targetController.js
- [ ] userController.js

## 3. Findings & Actions
| Controller | Route | Role | Findings | Action | Status |
|---|---|---|---|---|---|
| adminController | /api/admin | BANK_SUPER_ADMIN, ADMINISTRATOR | ... | ... | Pending |
| ... | ... | ... | ... | ... | Pending |

## 4. Testing Plan
- For each role, login, perform Create/Read/Update/Delete operations on authorized entities.
- Verify unauthorized roles receive 403 Forbidden.
- Verify unauthenticated users receive 401 Unauthorized.
