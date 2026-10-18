// backend/controllers/adminController.js
import { District } from '../models/District.js';
import { Branch } from '../models/Branch.js';
import { User } from '../models/User.js';
import { KpiMetric } from '../models/KpiMetric.js';
import { DailyPerformanceReport } from '../models/DailyPerformanceReport.js';
import { PerformanceTarget } from '../models/PerformanceTarget.js';
import { AuditLog } from '../models/AuditLog.js';
import { loadPersistentData, savePersistentData } from '../config/db.js';

export const adminController = {
  // 1. Stats
  async getStats(req, res) {
    try {
      const [districts, branches, users, kpis, reports, targets] = await Promise.all([
        District.findAll(),
        Branch.findAll(),
        User.findAll(),
        KpiMetric.findAll(),
        DailyPerformanceReport.findAll(),
        PerformanceTarget.findAll()
      ]);

      const store = loadPersistentData();
      const securityAlerts = store.securityAlerts || [];
      const pendingAlerts = securityAlerts.filter(a => !a.resolved);
      const pendingApprovals = reports.filter(r => (r.status || '').toLowerCase() === 'pending').length;

      return res.status(200).json({
        success: true,
        stats: {
          totalDistricts: districts.length,
          totalBranches: branches.length,
          totalUsers: users.length,
          activeKpis: kpis.filter(k => k.status !== 'Inactive').length,
          totalKpis: kpis.length,
          totalReports: reports.length,
          pendingApprovals,
          totalKpiTargets: targets.length,
          totalCeos: (store.ceos || []).length || 1,
          totalChiefs: (store.chiefs || []).length || 8,
          totalDistrictDirectors: users.filter(u => u.role === 'DISTRICT_DIRECTOR' || u.role === 'DIRECTOR').length || 2,
          totalBranchManagers: users.filter(u => u.role === 'MANAGER').length || branches.length,
          unresolvedAlerts: pendingAlerts.length
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Districts CRUD
  async getDistricts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const search = (req.query.search || '').toLowerCase();

      let districts = await District.findAll();
      if (search) {
        districts = districts.filter(d => 
          (d.name && d.name.toLowerCase().includes(search)) ||
          (d.code && d.code.toLowerCase().includes(search)) ||
          (d.region && d.region.toLowerCase().includes(search))
        );
      }

      const total = districts.length;
      const start = (page - 1) * limit;
      const paginated = districts.slice(start, start + limit);

      return res.status(200).json({
        success: true,
        data: paginated,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createDistrict(req, res) {
    try {
      if (!req.body.name) return res.status(400).json({ success: false, error: 'District name is required.' });
      const newDistrict = await District.create(req.body);
      await AuditLog.create({
        user_id: req.user?.userId || 'ADMIN',
        user_name: req.user?.fullName || 'Administrator',
        action: 'CREATE_DISTRICT',
        entity_type: 'District',
        entity_id: newDistrict.district_id,
        details: { name: newDistrict.name }
      });
      return res.status(201).json({ success: true, district: newDistrict, data: newDistrict });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateDistrict(req, res) {
    try {
      const updated = await District.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'District not found' });
      return res.status(200).json({ success: true, district: updated, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async toggleDistrictStatus(req, res) {
    try {
      const { status } = req.body;
      const updated = await District.update(req.params.id, { status });
      if (!updated) return res.status(404).json({ success: false, error: 'District not found' });
      return res.status(200).json({ success: true, district: updated, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async assignDistrictDirector(req, res) {
    try {
      const { directorId, directorUserId, directorName } = req.body;
      const updated = await District.update(req.params.id, {
        manager_name: directorName || directorUserId || directorId,
        managerName: directorName || directorUserId || directorId
      });
      return res.status(200).json({ success: true, district: updated, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteDistrict(req, res) {
    try {
      await District.delete(req.params.id);
      return res.status(200).json({ success: true, message: 'District deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 3. Branches CRUD
  async getBranches(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const search = (req.query.search || '').toLowerCase();
      const districtId = req.query.districtId || req.query.district_id;

      let branches = districtId ? await Branch.findByDistrict(districtId) : await Branch.findAll();
      if (search) {
        branches = branches.filter(b => 
          (b.name && b.name.toLowerCase().includes(search)) ||
          (b.code && b.code.toLowerCase().includes(search)) ||
          (b.sol_id && b.sol_id.toLowerCase().includes(search)) ||
          (b.solId && b.solId.toLowerCase().includes(search))
        );
      }

      const total = branches.length;
      const start = (page - 1) * limit;
      const paginated = branches.slice(start, start + limit);

      return res.status(200).json({
        success: true,
        data: paginated,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createBranch(req, res) {
    try {
      if (!req.body.name) return res.status(400).json({ success: false, error: 'Branch name is required.' });
      const newBranch = await Branch.create(req.body);
      await AuditLog.create({
        user_id: req.user?.userId || 'ADMIN',
        user_name: req.user?.fullName || 'Administrator',
        action: 'CREATE_BRANCH',
        entity_type: 'Branch',
        entity_id: newBranch.branch_id,
        details: { name: newBranch.name, solId: newBranch.sol_id }
      });
      return res.status(201).json({ success: true, branch: newBranch, data: newBranch });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateBranch(req, res) {
    try {
      const updated = await Branch.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'Branch not found' });
      return res.status(200).json({ success: true, branch: updated, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async assignBranchManager(req, res) {
    try {
      const { managerId, managerUserId, managerName } = req.body;
      const updated = await Branch.update(req.params.id, {
        manager_name: managerName || managerUserId || managerId,
        managerName: managerName || managerUserId || managerId
      });
      return res.status(200).json({ success: true, branch: updated, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async transferBranchDistrict(req, res) {
    try {
      const { districtId, districtName } = req.body;
      const updated = await Branch.update(req.params.id, {
        district_id: districtId,
        districtId: districtId,
        district_name: districtName,
        districtName: districtName
      });
      return res.status(200).json({ success: true, branch: updated, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async toggleBranchStatus(req, res) {
    try {
      const { status } = req.body;
      const updated = await Branch.update(req.params.id, { status });
      if (!updated) return res.status(404).json({ success: false, error: 'Branch not found' });
      return res.status(200).json({ success: true, branch: updated, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteBranch(req, res) {
    try {
      await Branch.delete(req.params.id);
      return res.status(200).json({ success: true, message: 'Branch deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. Users CRUD
  async getUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const search = (req.query.search || '').toLowerCase();
      const role = req.query.role;
      const branchId = req.query.branchId || req.query.branch_id;
      const districtId = req.query.districtId || req.query.district_id;

      let users = await User.findAll();
      if (role) users = users.filter(u => u.role === role);
      if (branchId) users = users.filter(u => u.branch_id === branchId || u.branchId === branchId);
      if (districtId) users = users.filter(u => u.district_id === districtId || u.districtId === districtId);
      if (search) {
        users = users.filter(u => 
          (u.system_username && u.system_username.toLowerCase().includes(search)) ||
          (u.userId && u.userId.toLowerCase().includes(search)) ||
          (u.first_name && u.first_name.toLowerCase().includes(search)) ||
          (u.last_name && u.last_name.toLowerCase().includes(search)) ||
          (u.email && u.email.toLowerCase().includes(search))
        );
      }

      const total = users.length;
      const start = (page - 1) * limit;
      const paginated = users.slice(start, start + limit);

      return res.status(200).json({
        success: true,
        data: paginated,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createUser(req, res) {
    try {
      const newUser = await User.create(req.body);
      await AuditLog.create({
        user_id: req.user?.userId || 'ADMIN',
        user_name: req.user?.fullName || 'Administrator',
        action: 'CREATE_USER',
        entity_type: 'User',
        entity_id: newUser.user_id,
        details: { username: newUser.system_username, role: newUser.role }
      });
      return res.status(201).json({ success: true, user: newUser, data: newUser });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateUser(req, res) {
    try {
      const updated = await User.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'User not found' });
      return res.status(200).json({ success: true, user: updated, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async toggleUserStatus(req, res) {
    try {
      const { status } = req.body;
      const updated = await User.update(req.params.id, { status });
      if (!updated) return res.status(404).json({ success: false, error: 'User not found' });
      return res.status(200).json({ success: true, user: updated, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async toggleUserLock(req, res) {
    try {
      const { isLocked } = req.body;
      const updated = await User.update(req.params.id, { is_locked: Boolean(isLocked), failed_attempts: isLocked ? 5 : 0 });
      if (!updated) return res.status(404).json({ success: false, error: 'User not found' });
      return res.status(200).json({ success: true, user: updated, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async resetUserPassword(req, res) {
    try {
      const { newPassword } = req.body;
      const updated = await User.update(req.params.id, { password_hash: newPassword || 'NewPassword123!' });
      if (!updated) return res.status(404).json({ success: false, error: 'User not found' });
      return res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async bulkUserAction(req, res) {
    try {
      const { userIds, action, value } = req.body;
      const ids = Array.isArray(userIds) ? userIds : [];
      const results = [];

      for (const id of ids) {
        if (action === 'delete') {
          await User.delete(id);
          results.push({ id, status: 'Deleted' });
        } else if (action === 'lock') {
          const u = await User.update(id, { is_locked: true, failed_attempts: 5 });
          results.push(u);
        } else if (action === 'unlock') {
          const u = await User.unlock(id);
          results.push(u);
        } else if (action === 'status') {
          const u = await User.update(id, { status: value || 'Active' });
          results.push(u);
        }
      }

      return res.status(200).json({ success: true, message: `Bulk action '${action}' completed on ${results.length} users.`, count: results.length, data: results });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteUser(req, res) {
    try {
      await User.delete(req.params.id);
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 5. KPIs CRUD
  async getKpis(req, res) {
    try {
      const kpis = await KpiMetric.findAll();
      return res.status(200).json({ success: true, count: kpis.length, data: kpis });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createKpi(req, res) {
    try {
      const newKpi = await KpiMetric.create(req.body);
      return res.status(201).json({ success: true, kpi: newKpi, data: newKpi });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateKpi(req, res) {
    try {
      const updated = await KpiMetric.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'KPI not found' });
      return res.status(200).json({ success: true, kpi: updated, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteKpi(req, res) {
    try {
      await KpiMetric.delete(req.params.id);
      return res.status(200).json({ success: true, message: 'KPI deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 6. Organization Hierarchy & Structure
  async getOrganizationTree(req, res) {
    try {
      const [districts, branches, users] = await Promise.all([
        District.findAll(),
        Branch.findAll(),
        User.findAll()
      ]);

      const store = loadPersistentData();
      const ceos = store.ceos || [{ id: 'CEO-01', name: 'Ato Tilaye Wolde', status: 'Active' }];
      const chiefs = store.chiefs || [];

      return res.status(200).json({
        success: true,
        tree: {
          ceo: ceos[0] || null,
          chiefs,
          districts: districts.map(d => ({
            ...d,
            branches: branches.filter(b => b.district_id === d.district_id || b.districtId === d.district_id || b.district_id === d.id)
          }))
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async submitWizard(req, res) {
    try {
      const { district, branch, manager } = req.body;
      let createdDist = null;
      let createdBranch = null;
      let createdManager = null;

      if (district && district.name) {
        createdDist = await District.create(district);
      }

      if (branch && branch.name) {
        createdBranch = await Branch.create({
          ...branch,
          district_id: createdDist ? createdDist.district_id : (branch.districtId || branch.district_id)
        });
      }

      if (manager && (manager.name || manager.firstName)) {
        createdManager = await User.create({
          ...manager,
          role: 'MANAGER',
          branch_id: createdBranch ? createdBranch.branch_id : null,
          district_id: createdDist ? createdDist.district_id : null
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Organization wizard setup completed successfully',
        data: { district: createdDist, branch: createdBranch, manager: createdManager }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 7. CEOs
  async getCeos(req, res) {
    try {
      const store = loadPersistentData();
      return res.status(200).json({ success: true, data: store.ceos || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createCeo(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.ceos) store.ceos = [];
      const newCeo = { id: `CEO-${Date.now().toString().slice(-4)}`, status: 'Active', ...req.body };
      store.ceos.push(newCeo);
      savePersistentData(store);
      return res.status(201).json({ success: true, ceo: newCeo, data: newCeo });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateCeo(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.ceos) store.ceos = [];
      const idx = store.ceos.findIndex(c => c.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'CEO not found' });
      store.ceos[idx] = { ...store.ceos[idx], ...req.body };
      savePersistentData(store);
      return res.status(200).json({ success: true, ceo: store.ceos[idx], data: store.ceos[idx] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async toggleCeoStatus(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.ceos) store.ceos = [];
      const idx = store.ceos.findIndex(c => c.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'CEO not found' });
      store.ceos[idx].status = req.body.status || 'Active';
      savePersistentData(store);
      return res.status(200).json({ success: true, ceo: store.ceos[idx], data: store.ceos[idx] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async replaceCeo(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.ceos) store.ceos = [];
      const oldIdx = store.ceos.findIndex(c => c.id === req.params.id);
      if (oldIdx !== -1) store.ceos[oldIdx].status = 'Archived';
      const newCeo = { id: `CEO-${Date.now().toString().slice(-4)}`, status: 'Active', ...req.body };
      store.ceos.unshift(newCeo);
      savePersistentData(store);
      return res.status(200).json({ success: true, ceo: newCeo, data: newCeo });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 8. Chief Types & Chiefs
  async getChiefTypes(req, res) {
    try {
      const store = loadPersistentData();
      return res.status(200).json({ success: true, data: store.chiefTypes || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createChiefType(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.chiefTypes) store.chiefTypes = [];
      const newType = { id: `CT-${Date.now().toString().slice(-4)}`, ...req.body };
      store.chiefTypes.push(newType);
      savePersistentData(store);
      return res.status(201).json({ success: true, chiefType: newType, data: newType });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateChiefType(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.chiefTypes) store.chiefTypes = [];
      const idx = store.chiefTypes.findIndex(t => t.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Chief type not found' });
      store.chiefTypes[idx] = { ...store.chiefTypes[idx], ...req.body };
      savePersistentData(store);
      return res.status(200).json({ success: true, chiefType: store.chiefTypes[idx], data: store.chiefTypes[idx] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteChiefType(req, res) {
    try {
      const store = loadPersistentData();
      if (store.chiefTypes) {
        store.chiefTypes = store.chiefTypes.filter(t => t.id !== req.params.id);
        savePersistentData(store);
      }
      return res.status(200).json({ success: true, message: 'Chief type deleted' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getChiefs(req, res) {
    try {
      const store = loadPersistentData();
      return res.status(200).json({ success: true, data: store.chiefs || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createChief(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.chiefs) store.chiefs = [];
      const newChief = { id: `CHF-${Date.now().toString().slice(-4)}`, status: 'Active', ...req.body };
      store.chiefs.push(newChief);
      savePersistentData(store);
      return res.status(201).json({ success: true, chief: newChief, data: newChief });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateChief(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.chiefs) store.chiefs = [];
      const idx = store.chiefs.findIndex(c => c.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Chief not found' });
      store.chiefs[idx] = { ...store.chiefs[idx], ...req.body };
      savePersistentData(store);
      return res.status(200).json({ success: true, chief: store.chiefs[idx], data: store.chiefs[idx] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async assignChiefDistricts(req, res) {
    try {
      const { assignedDistrictIds } = req.body;
      const store = loadPersistentData();
      if (!store.chiefs) store.chiefs = [];
      const idx = store.chiefs.findIndex(c => c.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Chief not found' });
      store.chiefs[idx].assignedDistrictIds = assignedDistrictIds || [];
      savePersistentData(store);
      return res.status(200).json({ success: true, chief: store.chiefs[idx], data: store.chiefs[idx] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async toggleChiefStatus(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.chiefs) store.chiefs = [];
      const idx = store.chiefs.findIndex(c => c.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Chief not found' });
      store.chiefs[idx].status = req.body.status || 'Active';
      savePersistentData(store);
      return res.status(200).json({ success: true, chief: store.chiefs[idx], data: store.chiefs[idx] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteChief(req, res) {
    try {
      const store = loadPersistentData();
      if (store.chiefs) {
        store.chiefs = store.chiefs.filter(c => c.id !== req.params.id);
        savePersistentData(store);
      }
      return res.status(200).json({ success: true, message: 'Chief deleted' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 9. Roles & Permissions
  async getRoles(req, res) {
    try {
      const store = loadPersistentData();
      return res.status(200).json({ success: true, data: store.roles || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createRole(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.roles) store.roles = [];
      const newRole = { id: `ROLE-${Date.now().toString().slice(-4)}`, ...req.body };
      store.roles.push(newRole);
      savePersistentData(store);
      return res.status(201).json({ success: true, role: newRole, data: newRole });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateRole(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.roles) store.roles = [];
      const idx = store.roles.findIndex(r => r.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Role not found' });
      store.roles[idx] = { ...store.roles[idx], ...req.body };
      savePersistentData(store);
      return res.status(200).json({ success: true, role: store.roles[idx], data: store.roles[idx] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteRole(req, res) {
    try {
      const store = loadPersistentData();
      if (store.roles) {
        store.roles = store.roles.filter(r => r.id !== req.params.id);
        savePersistentData(store);
      }
      return res.status(200).json({ success: true, message: 'Role deleted' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getPermissions(req, res) {
    try {
      const store = loadPersistentData();
      return res.status(200).json({ success: true, data: store.permissions || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 10. System Settings & Approval Workflows
  async getSystemSettings(req, res) {
    try {
      const store = loadPersistentData();
      return res.status(200).json({ success: true, settings: store.systemSettings || {} });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateSystemSettings(req, res) {
    try {
      const store = loadPersistentData();
      store.systemSettings = { ...(store.systemSettings || {}), ...req.body };
      savePersistentData(store);
      return res.status(200).json({ success: true, settings: store.systemSettings });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getApprovalWorkflows(req, res) {
    try {
      const store = loadPersistentData();
      return res.status(200).json({ success: true, data: store.approvalRules || store.approvalWorkflows || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateApprovalWorkflows(req, res) {
    try {
      const store = loadPersistentData();
      store.approvalRules = req.body;
      store.approvalWorkflows = req.body;
      savePersistentData(store);
      return res.status(200).json({ success: true, data: store.approvalRules });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 11. Security Sessions & Alerts
  async getSecuritySessions(req, res) {
    try {
      const store = loadPersistentData();
      return res.status(200).json({ success: true, data: store.securitySessions || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async revokeSecuritySession(req, res) {
    try {
      const id = req.params.id || req.body.sessionId || req.body.id;
      const store = loadPersistentData();
      if (store.securitySessions) {
        store.securitySessions = store.securitySessions.filter(s => s.id !== id);
        savePersistentData(store);
      }
      return res.status(200).json({ success: true, message: 'Session revoked' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getSecurityAlerts(req, res) {
    try {
      const store = loadPersistentData();
      return res.status(200).json({ success: true, data: store.securityAlerts || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async resolveSecurityAlert(req, res) {
    try {
      const id = req.params.id || req.body.alertId || req.body.id;
      const store = loadPersistentData();
      if (store.securityAlerts) {
        const idx = store.securityAlerts.findIndex(a => a.id === id);
        if (idx !== -1) {
          store.securityAlerts[idx].resolved = true;
          store.securityAlerts[idx].resolvedAt = new Date().toISOString();
          savePersistentData(store);
        }
      }
      return res.status(200).json({ success: true, message: 'Alert resolved' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 12. Holidays CRUD
  async getHolidays(req, res) {
    try {
      const store = loadPersistentData();
      return res.status(200).json({ success: true, data: store.holidays || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createHoliday(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.holidays) store.holidays = [];
      const newHol = { id: `HOL-${Date.now().toString().slice(-4)}`, ...req.body };
      store.holidays.push(newHol);
      savePersistentData(store);
      return res.status(201).json({ success: true, holiday: newHol, data: newHol });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateHoliday(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.holidays) store.holidays = [];
      const idx = store.holidays.findIndex(h => h.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Holiday not found' });
      store.holidays[idx] = { ...store.holidays[idx], ...req.body };
      savePersistentData(store);
      return res.status(200).json({ success: true, holiday: store.holidays[idx], data: store.holidays[idx] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteHoliday(req, res) {
    try {
      const store = loadPersistentData();
      if (store.holidays) {
        store.holidays = store.holidays.filter(h => h.id !== req.params.id);
        savePersistentData(store);
      }
      return res.status(200).json({ success: true, message: 'Holiday deleted' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 13. Global Search
  async globalSearch(req, res) {
    try {
      const query = (req.query.q || '').toLowerCase();
      const [districts, branches, users, kpis] = await Promise.all([
        District.findAll(),
        Branch.findAll(),
        User.findAll(),
        KpiMetric.findAll()
      ]);

      const matchedDistricts = districts.filter(d => (d.name || '').toLowerCase().includes(query) || (d.code || '').toLowerCase().includes(query)).slice(0, 5);
      const matchedBranches = branches.filter(b => (b.name || '').toLowerCase().includes(query) || (b.code || '').toLowerCase().includes(query) || (b.sol_id || '').toLowerCase().includes(query)).slice(0, 5);
      const matchedUsers = users.filter(u => (u.system_username || '').toLowerCase().includes(query) || (u.first_name || '').toLowerCase().includes(query) || (u.last_name || '').toLowerCase().includes(query)).slice(0, 5);
      const matchedKpis = kpis.filter(k => (k.name || '').toLowerCase().includes(query) || (k.code || '').toLowerCase().includes(query)).slice(0, 5);

      return res.status(200).json({
        success: true,
        results: {
          districts: matchedDistricts,
          branches: matchedBranches,
          users: matchedUsers,
          kpis: matchedKpis
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default adminController;
