// backend/routes/adminRoutes.js
import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authMiddleware, optionalAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();
const adminOnly = ['BANK_SUPER_ADMIN', 'ADMINISTRATOR'];
const elevated = ['BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'CEO', 'BOARD_OF_DIRECTORS', 'CHIEF_OFFICER'];

// Stats
router.get('/stats', optionalAuth, adminController.getStats);

// Districts
router.get('/districts', optionalAuth, adminController.getDistricts);
router.post('/districts', authMiddleware, requireRole(adminOnly), adminController.createDistrict);
router.put('/districts/:id', authMiddleware, requireRole(adminOnly), adminController.updateDistrict);
router.patch('/districts/:id/status', authMiddleware, requireRole(adminOnly), adminController.toggleDistrictStatus);
router.patch('/districts/:id/director', authMiddleware, requireRole(adminOnly), adminController.assignDistrictDirector);
router.delete('/districts/:id', authMiddleware, requireRole(adminOnly), adminController.deleteDistrict);

// Branches
router.get('/branches', optionalAuth, adminController.getBranches);
router.post('/branches', authMiddleware, requireRole(adminOnly), adminController.createBranch);
router.put('/branches/:id', authMiddleware, requireRole(adminOnly), adminController.updateBranch);
router.patch('/branches/:id/manager', authMiddleware, requireRole(adminOnly), adminController.assignBranchManager);
router.patch('/branches/:id/district', authMiddleware, requireRole(adminOnly), adminController.transferBranchDistrict);
router.patch('/branches/:id/status', authMiddleware, requireRole(adminOnly), adminController.toggleBranchStatus);
router.delete('/branches/:id', authMiddleware, requireRole(adminOnly), adminController.deleteBranch);

// Users
router.get('/users', optionalAuth, adminController.getUsers);
router.post('/users', authMiddleware, requireRole(adminOnly), adminController.createUser);
router.put('/users/:id', authMiddleware, requireRole(adminOnly), adminController.updateUser);
router.patch('/users/:id/status', authMiddleware, requireRole(adminOnly), adminController.toggleUserStatus);
router.patch('/users/:id/lock', authMiddleware, requireRole(adminOnly), adminController.toggleUserLock);
router.post('/users/:id/reset-password', authMiddleware, requireRole(adminOnly), adminController.resetUserPassword);
router.post('/users/bulk-action', authMiddleware, requireRole(adminOnly), adminController.bulkUserAction);
router.delete('/users/:id', authMiddleware, requireRole(adminOnly), adminController.deleteUser);

// KPIs
router.get('/kpis', optionalAuth, adminController.getKpis);
router.post('/kpis', authMiddleware, requireRole(adminOnly), adminController.createKpi);
router.put('/kpis/:id', authMiddleware, requireRole(adminOnly), adminController.updateKpi);
router.delete('/kpis/:id', authMiddleware, requireRole(adminOnly), adminController.deleteKpi);

// Organization Structure & Wizard
router.get('/organization-tree', optionalAuth, adminController.getOrganizationTree);
router.post('/organization/wizard', authMiddleware, requireRole(adminOnly), adminController.submitWizard);

// CEOs
router.get('/ceos', optionalAuth, adminController.getCeos);
router.post('/ceos', authMiddleware, requireRole(adminOnly), adminController.createCeo);
router.put('/ceos/:id', authMiddleware, requireRole(adminOnly), adminController.updateCeo);
router.patch('/ceos/:id/status', authMiddleware, requireRole(adminOnly), adminController.toggleCeoStatus);
router.post('/ceos/:id/replace', authMiddleware, requireRole(adminOnly), adminController.replaceCeo);

// Chief Types & Chiefs
router.get('/chief-types', optionalAuth, adminController.getChiefTypes);
router.post('/chief-types', authMiddleware, requireRole(adminOnly), adminController.createChiefType);
router.put('/chief-types/:id', authMiddleware, requireRole(adminOnly), adminController.updateChiefType);
router.delete('/chief-types/:id', authMiddleware, requireRole(adminOnly), adminController.deleteChiefType);

router.get('/chiefs', optionalAuth, adminController.getChiefs);
router.post('/chiefs', authMiddleware, requireRole(adminOnly), adminController.createChief);
router.put('/chiefs/:id', authMiddleware, requireRole(adminOnly), adminController.updateChief);
router.patch('/chiefs/:id/status', authMiddleware, requireRole(adminOnly), adminController.toggleChiefStatus);
router.patch('/chiefs/:id/districts', authMiddleware, requireRole(adminOnly), adminController.assignChiefDistricts);
router.delete('/chiefs/:id', authMiddleware, requireRole(adminOnly), adminController.deleteChief);

// Roles & Permissions
router.get('/roles', optionalAuth, adminController.getRoles);
router.post('/roles', authMiddleware, requireRole(adminOnly), adminController.createRole);
router.put('/roles/:id', authMiddleware, requireRole(adminOnly), adminController.updateRole);
router.delete('/roles/:id', authMiddleware, requireRole(adminOnly), adminController.deleteRole);
router.get('/permissions', optionalAuth, adminController.getPermissions);

// System Settings & Approval Workflows
router.get('/system-settings', optionalAuth, adminController.getSystemSettings);
router.put('/system-settings', authMiddleware, requireRole(adminOnly), adminController.updateSystemSettings);
router.get('/approval-workflows', optionalAuth, adminController.getApprovalWorkflows);
router.put('/approval-workflows', authMiddleware, requireRole(adminOnly), adminController.updateApprovalWorkflows);

// Security
router.get('/security/sessions', authMiddleware, requireRole(adminOnly), adminController.getSecuritySessions);
router.post('/security/revoke-session', authMiddleware, requireRole(adminOnly), adminController.revokeSecuritySession);
router.delete('/security/sessions/:id', authMiddleware, requireRole(adminOnly), adminController.revokeSecuritySession);

router.get('/security/alerts', authMiddleware, requireRole(adminOnly), adminController.getSecurityAlerts);
router.post('/security/resolve-alert', authMiddleware, requireRole(adminOnly), adminController.resolveSecurityAlert);
router.patch('/security/alerts/:id/resolve', authMiddleware, requireRole(adminOnly), adminController.resolveSecurityAlert);

// Holidays
router.get('/holidays', optionalAuth, adminController.getHolidays);
router.post('/holidays', authMiddleware, requireRole(adminOnly), adminController.createHoliday);
router.put('/holidays/:id', authMiddleware, requireRole(adminOnly), adminController.updateHoliday);
router.delete('/holidays/:id', authMiddleware, requireRole(adminOnly), adminController.deleteHoliday);

// Global Search
router.get('/search', optionalAuth, adminController.globalSearch);

export default router;
