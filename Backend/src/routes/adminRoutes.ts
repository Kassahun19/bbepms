import { Router } from 'express';
import bcrypt from 'bcryptjs';

export function createAdminRoutes(
  db: any,
  saveDb: () => Promise<void>,
  saveFirestoreDoc: (coll: string, id: string, data: any) => Promise<void>,
  deleteFirestoreDoc?: (coll: string, id: string) => Promise<void>
) {
  const router = Router();

  // Helper to record audit log
  const logAudit = (userId: string, userName: string, userRole: string, action: string, entity: string, entityId: string, details: string, previousValue?: any, newValue?: any) => {
    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: userId || 'Admin',
      userName: userName || 'Bank Super Admin',
      userRole: userRole || 'BANK_SUPER_ADMIN',
      action,
      entity,
      entityId,
      details,
      previousValue: previousValue ? JSON.stringify(previousValue) : undefined,
      newValue: newValue ? JSON.stringify(newValue) : undefined,
      timestamp: new Date().toISOString()
    });
    if (db.auditLogs.length > 1000) db.auditLogs.pop();
  };

  // Helper for pagination
  const paginate = (items: any[], pageStr?: any, limitStr?: any) => {
    if (!pageStr && !limitStr) return items;
    const page = parseInt(pageStr as string) || 1;
    let limit = parseInt(limitStr as string) || 25;
    if (limitStr === 'All' || limitStr === 'all' || limit === -1) {
      limit = items.length;
    }
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return {
      data: items.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  };

  // ==========================================
  // 1. ADMIN SYSTEM-WIDE STATS
  // ==========================================
  router.get('/stats', (req, res) => {
    const users = db.users || [];
    const districts = db.districts || [];
    const branches = db.branches || [];
    const kpis = db.kpis || [];
    const targets = db.targets || [];
    const reports = db.reports || [];
    const securityAlerts = db.securityAlerts || [];
    const auditLogs = db.auditLogs || [];

    const activeUsers = users.filter((u: any) => u.status !== 'Inactive' && !u.isLocked).length;
    const inactiveUsers = users.length - activeUsers;
    const totalBoardMembers = users.filter((u: any) => u.role === 'BOARD_OF_DIRECTORS').length;
    const totalCeos = users.filter((u: any) => u.role === 'CEO').length;
    const totalChiefs = users.filter((u: any) => u.role === 'CHIEF_OFFICER' || u.role === 'DIRECTOR').length;
    const totalDistrictDirectors = users.filter((u: any) => u.role === 'DISTRICT_DIRECTOR').length;
    const totalBranchManagers = users.filter((u: any) => u.role === 'MANAGER').length;
    const totalEmployees = users.filter((u: any) => u.role === 'EMPLOYEE').length;
    const activeKpis = kpis.filter((k: any) => k.status !== 'Inactive').length;

    // Unique KPI categories
    const kpiGroupsSet = new Set<string>();
    kpis.forEach((k: any) => {
      if (k.category) kpiGroupsSet.add(k.category);
    });
    if (kpiGroupsSet.size === 0) {
      ['Finance', 'Stakeholder', 'Internal Business', 'Learning & Growth'].forEach(g => kpiGroupsSet.add(g));
    }

    const pendingApprovals = reports.filter((r: any) => r.status === 'Pending').length;
    const completedReviews = reports.filter((r: any) => r.status === 'Approved' || r.status === 'approved' || r.status === 'Rejected').length;
    const unresolvedAlerts = securityAlerts.filter((a: any) => !a.resolved).length;

    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        activeUsers,
        inactiveUsers,
        totalBoardMembers,
        totalCeos,
        totalChiefs,
        totalDistricts: districts.length,
        totalDistrictDirectors,
        totalBranches: branches.length,
        totalBranchManagers,
        totalEmployees,
        activeKpis,
        totalKpiGroups: kpiGroupsSet.size,
        totalKpiTargets: targets.length,
        pendingApprovals,
        completedReviews,
        systemAlertsCount: unresolvedAlerts,
        recentActivities: auditLogs.slice(0, 10),
        databaseHealth: {
          status: 'HEALTHY',
          totalRecords: users.length + districts.length + branches.length + kpis.length + targets.length + reports.length,
          lastSyncTime: new Date().toISOString()
        }
      }
    });
  });

  // ==========================================
  // 2. ORGANIZATION HIERARCHY TREE
  // ==========================================
  router.get('/organization-tree', (req, res) => {
    const users = db.users || [];
    const districts = db.districts || [];
    const branches = db.branches || [];
    const chiefTypes = db.chiefTypes || [];

    const boardMembers = users.filter((u: any) => u.role === 'BOARD_OF_DIRECTORS');
    const ceos = users.filter((u: any) => u.role === 'CEO');
    const chiefs = users.filter((u: any) => u.role === 'CHIEF_OFFICER' || u.role === 'DIRECTOR');

    const tree = {
      name: 'Bunna Bank S.C. Governance & Executive Hierarchy',
      bankCode: 'BUNNA-ET',
      board: boardMembers.map((b: any) => ({
        id: b.id,
        name: `${b.firstName || ''} ${b.middleName || b.lastName || ''}`.trim() || b.userId,
        jobTitle: b.jobTitle || 'Board Chairman',
        email: b.email,
        status: b.status || 'Active'
      })),
      ceo: ceos.map((c: any) => ({
        id: c.id,
        name: `${c.firstName || ''} ${c.middleName || c.lastName || ''}`.trim() || c.userId,
        jobTitle: c.jobTitle || 'Chief Executive Officer (CEO)',
        email: c.email,
        status: c.status || 'Active'
      }))[0] || null,
      chiefs: chiefs.map((ch: any) => {
        const assignedDistIds: string[] = ch.assignedDistrictIds || [];
        const chDistricts = districts.filter((d: any) => assignedDistIds.includes(d.id) || assignedDistIds.length === 0);
        return {
          id: ch.id,
          name: `${ch.firstName || ''} ${ch.middleName || ch.lastName || ''}`.trim() || ch.userId,
          jobTitle: ch.jobTitle || 'Chief Officer',
          email: ch.email,
          status: ch.status || 'Active',
          assignedDistrictsCount: chDistricts.length,
          districts: chDistricts.map((d: any) => {
            const dDirector = users.find((u: any) => u.role === 'DISTRICT_DIRECTOR' && (u.districtId === d.id || u.districtName === d.name));
            const dBranches = branches.filter((br: any) => br.districtId === d.id || br.districtName === d.name);
            return {
              id: d.id,
              name: d.name,
              director: dDirector ? `${dDirector.firstName} ${dDirector.middleName || dDirector.lastName}`.trim() : 'Unassigned',
              branchesCount: dBranches.length,
              branches: dBranches.map((br: any) => {
                const bManager = users.find((u: any) => u.role === 'MANAGER' && (u.branchId === br.id || u.branchName === br.name));
                const bStaffCount = users.filter((u: any) => u.role === 'EMPLOYEE' && (u.branchId === br.id || u.branchName === br.name)).length;
                return {
                  id: br.id,
                  name: br.name,
                  solId: br.solId || br.id,
                  manager: bManager ? `${bManager.firstName} ${bManager.middleName || bManager.lastName}`.trim() : 'Unassigned',
                  staffCount: bStaffCount
                };
              })
            };
          })
        };
      })
    };

    res.json({ success: true, tree });
  });

  // ==========================================
  // 3. ORGANIZATION SETUP WIZARD (11-STEP ENGINE)
  // ==========================================
  router.post('/organization/wizard', async (req, res) => {
    try {
      const { 
        bankConfig, 
        ceoData, 
        chiefsData, 
        districtsData, 
        branchesData, 
        managersData, 
        employeesData, 
        kpisData, 
        targetsData 
      } = req.body;

      // 1. Bank Config
      if (bankConfig) {
        db.systemSettings = { ...db.systemSettings, ...bankConfig, updatedAt: new Date().toISOString() };
      }

      // 2. CEO
      if (ceoData && ceoData.userId) {
        let existingCeo = db.users.find((u: any) => u.role === 'CEO');
        if (!existingCeo) {
          existingCeo = {
            id: `USR-CEO-${Date.now()}`,
            userId: ceoData.userId,
            email: ceoData.email || 'ceo@bunnabanksc.com',
            firstName: ceoData.firstName || 'CEO',
            middleName: ceoData.middleName || '',
            lastName: ceoData.lastName || 'Executive',
            password: ceoData.password || 'CEO@2026',
            role: 'CEO',
            jobTitle: ceoData.jobTitle || 'Chief Executive Officer (CEO)',
            districtId: 'DIST-HO',
            districtName: 'Head Office',
            branchId: 'BR-HQ',
            branchName: 'Head Office',
            gender: ceoData.gender || 'Male',
            age: Number(ceoData.age) || 50,
            phone: ceoData.phone || '+251900000000',
            status: 'Active',
            createdAt: new Date().toISOString()
          };
          db.users.push(existingCeo);
        } else {
          Object.assign(existingCeo, ceoData);
        }
      }

      // 3. Chiefs
      if (Array.isArray(chiefsData)) {
        for (const ch of chiefsData) {
          if (!ch.userId) continue;
          let user = db.users.find((u: any) => u.userId?.toLowerCase() === ch.userId?.toLowerCase());
          if (!user) {
            user = {
              id: `USR-CHIEF-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              userId: ch.userId,
              email: ch.email || `${ch.userId.toLowerCase()}@bunnabanksc.com`,
              firstName: ch.firstName || ch.userId,
              middleName: ch.middleName || '',
              lastName: ch.lastName || 'Chief',
              password: ch.password || `${ch.userId}@2026`,
              role: 'CHIEF_OFFICER',
              jobTitle: ch.jobTitle || 'Chief Officer',
              districtId: 'DIST-HO',
              districtName: 'Head Office',
              branchId: 'BR-HQ',
              branchName: 'Head Office',
              assignedDistrictIds: ch.assignedDistrictIds || [],
              gender: ch.gender || 'Male',
              age: Number(ch.age) || 45,
              phone: ch.phone || '+251900000000',
              status: 'Active',
              createdAt: new Date().toISOString()
            };
            db.users.push(user);
          } else {
            Object.assign(user, ch);
          }
        }
      }

      // 4. Districts
      if (Array.isArray(districtsData)) {
        for (const d of districtsData) {
          if (!d.id && !d.name) continue;
          const distId = d.id || `DIST-${d.name.substring(0, 3).toUpperCase()}`;
          let dist = db.districts.find((item: any) => item.id === distId || item.name === d.name);
          if (!dist) {
            dist = { id: distId, name: d.name, region: d.region || 'Addis Ababa', status: 'Active' };
            db.districts.push(dist);
          } else {
            Object.assign(dist, d);
          }
        }
      }

      // 5. Branches
      if (Array.isArray(branchesData)) {
        for (const b of branchesData) {
          if (!b.id && !b.name) continue;
          const brId = b.id || `BR-${Date.now()}`;
          let br = db.branches.find((item: any) => item.id === brId || (item.solId && item.solId === b.solId));
          if (!br) {
            br = { 
              id: brId, 
              name: b.name, 
              districtId: b.districtId || 'DIST-HO', 
              districtName: b.districtName || 'Head Office', 
              solId: b.solId || '101', 
              grade: b.grade || 'Grade 1', 
              status: 'Active' 
            };
            db.branches.push(br);
          } else {
            Object.assign(br, b);
          }
        }
      }

      // 6. KPIs
      if (Array.isArray(kpisData)) {
        for (const k of kpisData) {
          if (!k.code && !k.id) continue;
          const kId = k.id || k.code;
          let kpi = db.kpis.find((item: any) => item.id === kId || item.code === k.code);
          if (!kpi) {
            kpi = {
              id: kId,
              code: k.code || kId,
              name: k.name,
              category: k.category || 'Finance',
              unit: k.unit || 'ETB',
              weight: Number(k.weight) || 15,
              description: k.description || '',
              status: 'Active'
            };
            db.kpis.push(kpi);
          } else {
            Object.assign(kpi, k);
          }
        }
      }

      logAudit('Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'SETUP_WIZARD', 'ORGANIZATION', 'WIZARD', 'Completed Organization Setup Wizard updates');
      await saveDb();

      res.json({
        success: true,
        message: 'Organization setup wizard processed successfully.',
        counts: {
          users: (db.users || []).length,
          districts: (db.districts || []).length,
          branches: (db.branches || []).length,
          kpis: (db.kpis || []).length
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to process wizard' });
    }
  });

  // ==========================================
  // 4. CEO MANAGEMENT
  // ==========================================
  router.get('/ceos', (req, res) => {
    const ceos = (db.users || []).filter((u: any) => u.role === 'CEO');
    res.json(paginate(ceos, req.query.page, req.query.limit));
  });

  router.post('/ceos', async (req, res) => {
    const data = req.body;
    if (!data.userId || !data.firstName) {
      return res.status(400).json({ error: 'User ID and First Name are required for CEO creation.' });
    }
    const newCeo = {
      id: `USR-CEO-${Date.now()}`,
      userId: data.userId,
      email: data.email || `${data.userId.toLowerCase()}@bunnabanksc.com`,
      firstName: data.firstName,
      middleName: data.middleName || '',
      lastName: data.lastName || '',
      password: data.password || 'CEO@2026',
      role: 'CEO',
      jobTitle: data.jobTitle || 'Chief Executive Officer (CEO)',
      districtId: 'DIST-HO',
      districtName: 'Head Office',
      branchId: 'BR-HQ',
      branchName: 'Head Office',
      gender: data.gender || 'Male',
      age: Number(data.age) || 50,
      phone: data.phone || '+251900000000',
      status: data.status || 'Active',
      createdAt: new Date().toISOString()
    };
    db.users.push(newCeo);
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'CREATE', 'CEO', newCeo.id, `Created CEO user ${newCeo.userId}`);
    await saveDb();
    res.json({ success: true, ceo: newCeo });
  });

  router.put('/ceos/:id', async (req, res) => {
    const ceo = (db.users || []).find((u: any) => u.id === req.params.id && u.role === 'CEO');
    if (!ceo) return res.status(404).json({ error: 'CEO not found.' });
    const prev = { ...ceo };
    Object.assign(ceo, req.body, { id: ceo.id, role: 'CEO' });
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'UPDATE', 'CEO', ceo.id, `Updated CEO details for ${ceo.userId}`, prev, ceo);
    await saveDb();
    res.json({ success: true, ceo });
  });

  router.patch('/ceos/:id/status', async (req, res) => {
    const ceo = (db.users || []).find((u: any) => u.id === req.params.id);
    if (!ceo) return res.status(404).json({ error: 'CEO not found.' });
    ceo.status = req.body.status || (ceo.status === 'Active' ? 'Inactive' : 'Active');
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'STATUS_CHANGE', 'CEO', ceo.id, `Changed CEO status to ${ceo.status}`);
    await saveDb();
    res.json({ success: true, ceo });
  });

  router.post('/ceos/:id/replace', async (req, res) => {
    const oldCeo = (db.users || []).find((u: any) => u.id === req.params.id && u.role === 'CEO');
    if (oldCeo) {
      oldCeo.status = 'Inactive';
      oldCeo.jobTitle = 'Former Chief Executive Officer (Archived)';
    }
    const data = req.body;
    const newCeo = {
      id: `USR-CEO-${Date.now()}`,
      userId: data.userId || `CEO_${Date.now()}`,
      email: data.email || 'ceo@bunnabanksc.com',
      firstName: data.firstName || 'New',
      middleName: data.middleName || '',
      lastName: data.lastName || 'CEO',
      password: data.password || 'CEO@2026',
      role: 'CEO',
      jobTitle: data.jobTitle || 'Chief Executive Officer (CEO)',
      districtId: 'DIST-HO',
      districtName: 'Head Office',
      branchId: 'BR-HQ',
      branchName: 'Head Office',
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    db.users.push(newCeo);
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'REPLACE', 'CEO', newCeo.id, `Replaced CEO. Archived ${oldCeo?.userId}, Activated ${newCeo.userId}`);
    await saveDb();
    res.json({ success: true, newCeo, oldCeo });
  });

  // ==========================================
  // 5. CHIEF TYPES & CHIEFS MANAGEMENT
  // ==========================================
  router.get('/chief-types', (req, res) => {
    res.json(db.chiefTypes || []);
  });

  router.post('/chief-types', async (req, res) => {
    const data = req.body;
    if (!data.code || !data.name) return res.status(400).json({ error: 'Code and Name required.' });
    const newType = {
      id: `CT-${Date.now()}`,
      code: data.code,
      name: data.name,
      shortName: data.shortName || data.code,
      category: data.category || 'Executive',
      description: data.description || '',
      assignedDistrictIds: data.assignedDistrictIds || [],
      status: data.status || 'Active',
      createdAt: new Date().toISOString()
    };
    if (!db.chiefTypes) db.chiefTypes = [];
    db.chiefTypes.push(newType);
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'CREATE', 'CHIEF_TYPE', newType.id, `Created Chief Type ${newType.name}`);
    await saveFirestoreDoc('chiefTypes', newType.id, newType);
    await saveDb();
    res.json({ success: true, chiefType: newType });
  });

  router.put('/chief-types/:id', async (req, res) => {
    const ct = (db.chiefTypes || []).find((c: any) => c.id === req.params.id || c.code === req.params.id);
    if (!ct) return res.status(404).json({ error: 'Chief Type not found.' });
    Object.assign(ct, req.body);
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'UPDATE', 'CHIEF_TYPE', ct.id, `Updated Chief Type ${ct.name}`);
    await saveFirestoreDoc('chiefTypes', ct.id, ct);
    await saveDb();
    res.json({ success: true, chiefType: ct });
  });

  router.delete('/chief-types/:id', async (req, res) => {
    const targetId = String(req.params.id);
    const index = (db.chiefTypes || []).findIndex((c: any) => String(c.id) === targetId || String(c.code) === targetId);
    if (index === -1) return res.status(404).json({ error: 'Chief Type not found.' });
    const removed = db.chiefTypes.splice(index, 1)[0];
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'DELETE', 'CHIEF_TYPE', removed.id, `Deleted Chief Type ${removed.name}`);
    if (deleteFirestoreDoc) await deleteFirestoreDoc('chiefTypes', removed.id);
    await saveDb();
    res.json({ success: true, message: 'Chief Type deleted successfully.' });
  });

  router.get('/chiefs', (req, res) => {
    const chiefs = (db.users || []).filter((u: any) => u.role === 'CHIEF_OFFICER' || u.role === 'DIRECTOR');
    res.json(paginate(chiefs, req.query.page, req.query.limit));
  });

  router.post('/chiefs', async (req, res) => {
    const data = req.body;
    if (!data.userId || !data.firstName) return res.status(400).json({ error: 'User ID and First Name required.' });
    const newChief = {
      id: `USR-CHIEF-${Date.now()}`,
      userId: data.userId,
      email: data.email || `${data.userId.toLowerCase()}@bunnabanksc.com`,
      firstName: data.firstName,
      middleName: data.middleName || '',
      lastName: data.lastName || '',
      password: data.password || `${data.userId}@2026`,
      role: 'CHIEF_OFFICER',
      jobTitle: data.jobTitle || 'Chief Officer',
      districtId: 'DIST-HO',
      districtName: 'Head Office',
      branchId: 'BR-HQ',
      branchName: 'Head Office',
      assignedDistrictIds: data.assignedDistrictIds || [],
      gender: data.gender || 'Male',
      age: Number(data.age) || 45,
      phone: data.phone || '+251900000000',
      status: data.status || 'Active',
      createdAt: new Date().toISOString()
    };
    db.users.push(newChief);
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'CREATE', 'CHIEF', newChief.id, `Created Chief Officer ${newChief.userId}`);
    await saveFirestoreDoc('users', newChief.id, newChief);
    await saveDb();
    res.json({ success: true, chief: newChief });
  });

  router.put('/chiefs/:id', async (req, res) => {
    const chief = (db.users || []).find((u: any) => u.id === req.params.id || u.userId === req.params.id);
    if (!chief) return res.status(404).json({ error: 'Chief not found.' });
    const prev = { ...chief };
    Object.assign(chief, req.body, { id: chief.id, role: chief.role });
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'UPDATE', 'CHIEF', chief.id, `Updated Chief Officer ${chief.userId}`, prev, chief);
    await saveFirestoreDoc('users', chief.id, chief);
    await saveDb();
    res.json({ success: true, chief });
  });

  router.delete('/chiefs/:id', async (req, res) => {
    const targetId = String(req.params.id);
    const index = (db.users || []).findIndex((u: any) => String(u.id) === targetId || String(u.userId) === targetId);
    if (index === -1) return res.status(404).json({ error: 'Chief not found.' });
    const removed = db.users.splice(index, 1)[0];
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'DELETE', 'CHIEF', removed.id, `Deleted Chief Officer ${removed.userId}`);
    if (deleteFirestoreDoc) await deleteFirestoreDoc('users', removed.id);
    await saveDb();
    res.json({ success: true, message: 'Chief deleted successfully.' });
  });

  router.patch('/chiefs/:id/districts', async (req, res) => {
    const chief = (db.users || []).find((u: any) => u.id === req.params.id || u.userId === req.params.id);
    if (!chief) return res.status(404).json({ error: 'Chief not found.' });
    chief.assignedDistrictIds = req.body.assignedDistrictIds || [];
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'REASSIGN_DISTRICTS', 'CHIEF', chief.id, `Assigned ${chief.assignedDistrictIds.length} districts to Chief ${chief.userId}`);
    await saveFirestoreDoc('users', chief.id, chief);
    await saveDb();
    res.json({ success: true, chief });
  });

  router.patch('/chiefs/:id/status', async (req, res) => {
    const chief = (db.users || []).find((u: any) => u.id === req.params.id || u.userId === req.params.id);
    if (!chief) return res.status(404).json({ error: 'Chief not found.' });
    chief.status = req.body.status || (chief.status === 'Active' ? 'Inactive' : 'Active');
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'STATUS_CHANGE', 'CHIEF', chief.id, `Changed Chief status to ${chief.status}`);
    await saveFirestoreDoc('users', chief.id, chief);
    await saveDb();
    res.json({ success: true, chief });
  });

  // ==========================================
  // 6. DISTRICTS & DIRECTORS MANAGEMENT
  // ==========================================
  router.get('/districts', (req, res) => {
    const districts = db.districts || [];
    const users = db.users || [];
    const branches = db.branches || [];

    const enriched = districts.map((d: any) => {
      const director = users.find((u: any) => u.role === 'DISTRICT_DIRECTOR' && (u.districtId === d.id || u.districtName === d.name));
      const dBranches = branches.filter((br: any) => br.districtId === d.id || br.districtName === d.name);
      return {
        ...d,
        directorName: director ? `${director.firstName} ${director.middleName || director.lastName}`.trim() : 'Unassigned',
        directorUserId: director ? director.userId : null,
        directorId: director ? director.id : null,
        branchCount: dBranches.length,
        status: d.status || 'Active'
      };
    });

    res.json(paginate(enriched, req.query.page, req.query.limit));
  });

  router.post('/districts', async (req, res) => {
    const data = req.body;
    if (!data.name) return res.status(400).json({ error: 'District Name is required.' });
    const distId = data.id || `DIST-${data.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()}_${Date.now().toString().slice(-4)}`;
    const newDistrict = {
      id: distId,
      name: data.name,
      region: data.region || 'Regional',
      code: data.code || distId,
      status: data.status || 'Active',
      createdAt: new Date().toISOString()
    };
    if (!db.districts) db.districts = [];
    db.districts.push(newDistrict);
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'CREATE', 'DISTRICT', newDistrict.id, `Created District ${newDistrict.name}`);
    await saveFirestoreDoc('districts', newDistrict.id, newDistrict);
    await saveDb();
    res.json({ success: true, district: newDistrict });
  });

  router.put('/districts/:id', async (req, res) => {
    const targetId = String(req.params.id);
    if (!db.districts) db.districts = [];
    let dist = db.districts.find((d: any) => 
      String(d.id).toLowerCase() === targetId.toLowerCase() || 
      (d.code && String(d.code).toLowerCase() === targetId.toLowerCase()) ||
      (d.name && String(d.name).toLowerCase() === targetId.toLowerCase())
    );
    const prev = dist ? { ...dist } : null;
    if (!dist) {
      dist = { id: targetId, ...req.body };
      db.districts.push(dist);
    } else {
      Object.assign(dist, req.body, { id: dist.id });
    }
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'UPDATE', 'DISTRICT', dist.id, `Updated District ${dist.name}`, prev, dist);
    await saveFirestoreDoc('districts', dist.id, dist);
    await saveDb();
    res.json({ success: true, district: dist });
  });

  router.delete('/districts/:id', async (req, res) => {
    const targetId = String(req.params.id);
    const index = (db.districts || []).findIndex((d: any) => 
      String(d.id) === targetId || 
      (d.code && String(d.code) === targetId)
    );
    if (index === -1) return res.status(404).json({ error: 'District not found.' });
    const removed = db.districts.splice(index, 1)[0];
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'DELETE', 'DISTRICT', removed.id, `Deleted District ${removed.name}`);
    if (deleteFirestoreDoc) await deleteFirestoreDoc('districts', removed.id);
    await saveDb();
    res.json({ success: true, message: 'District deleted successfully.' });
  });

  router.patch('/districts/:id/director', async (req, res) => {
    const targetId = String(req.params.id);
    const dist = (db.districts || []).find((d: any) => String(d.id) === targetId || (d.code && String(d.code) === targetId));
    if (!dist) return res.status(404).json({ error: 'District not found.' });
    const { directorUserId, directorId } = req.body;
    const user = (db.users || []).find((u: any) => u.id === directorId || u.userId === directorUserId);
    if (user) {
      user.role = 'DISTRICT_DIRECTOR';
      user.districtId = dist.id;
      user.districtName = dist.name;
      await saveFirestoreDoc('users', user.id, user);
    }
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'ASSIGN_DIRECTOR', 'DISTRICT', dist.id, `Assigned Director ${user?.userId} to District ${dist.name}`);
    await saveFirestoreDoc('districts', dist.id, dist);
    await saveDb();
    res.json({ success: true, district: dist, director: user });
  });

  router.patch('/districts/:id/status', async (req, res) => {
    const targetId = String(req.params.id);
    const dist = (db.districts || []).find((d: any) => String(d.id) === targetId || (d.code && String(d.code) === targetId));
    if (!dist) return res.status(404).json({ error: 'District not found.' });
    dist.status = req.body.status || (dist.status === 'Active' ? 'Inactive' : 'Active');
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'STATUS_CHANGE', 'DISTRICT', dist.id, `Changed District status to ${dist.status}`);
    await saveFirestoreDoc('districts', dist.id, dist);
    await saveDb();
    res.json({ success: true, district: dist });
  });

  // ==========================================
  // 7. BRANCHES & BRANCH MANAGERS MANAGEMENT
  // ==========================================
  router.get('/branches', (req, res) => {
    const branches = db.branches || [];
    const users = db.users || [];

    const enriched = branches.map((b: any) => {
      const manager = users.find((u: any) => u.role === 'MANAGER' && (u.branchId === b.id || u.branchName === b.name));
      const staffCount = users.filter((u: any) => u.role === 'EMPLOYEE' && (u.branchId === b.id || u.branchName === b.name)).length;
      return {
        ...b,
        managerName: manager ? `${manager.firstName} ${manager.middleName || manager.lastName}`.trim() : 'Unassigned',
        managerUserId: manager ? manager.userId : null,
        managerId: manager ? manager.id : null,
        staffCount,
        status: b.status || 'Active'
      };
    });

    res.json(paginate(enriched, req.query.page, req.query.limit));
  });

  router.post('/branches', async (req, res) => {
    const data = req.body;
    if (!data.name || !data.districtId) return res.status(400).json({ error: 'Branch Name and District are required.' });
    const dist = (db.districts || []).find((d: any) => d.id === data.districtId || d.code === data.districtId);
    const newBranch = {
      id: data.id || `BR-${Date.now().toString().slice(-6)}`,
      name: data.name,
      districtId: data.districtId,
      districtName: dist?.name || data.districtName || 'District',
      solId: data.solId || `${Math.floor(100 + Math.random() * 900)}`,
      grade: data.grade || 'Grade 1',
      city: data.city || 'Addis Ababa',
      status: data.status || 'Active',
      createdAt: new Date().toISOString()
    };
    if (!db.branches) db.branches = [];
    db.branches.push(newBranch);
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'CREATE', 'BRANCH', newBranch.id, `Created Branch ${newBranch.name} (SOL: ${newBranch.solId})`);
    await saveFirestoreDoc('branches', newBranch.id, newBranch);
    await saveDb();
    res.json({ success: true, branch: newBranch });
  });

  router.put('/branches/:id', async (req, res) => {
    const targetId = String(req.params.id);
    if (!db.branches) db.branches = [];
    let branch = db.branches.find((b: any) => 
      String(b.id).toLowerCase() === targetId.toLowerCase() || 
      (b.code && String(b.code).toLowerCase() === targetId.toLowerCase()) || 
      (b.solId && String(b.solId).toLowerCase() === targetId.toLowerCase()) ||
      (b.name && String(b.name).toLowerCase() === targetId.toLowerCase())
    );
    const prev = branch ? { ...branch } : null;
    if (!branch) {
      branch = { id: targetId, ...req.body };
      db.branches.push(branch);
    } else {
      Object.assign(branch, req.body, { id: branch.id });
    }
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'UPDATE', 'BRANCH', branch.id, `Updated Branch ${branch.name} (SOL: ${branch.solId})`, prev, branch);
    await saveFirestoreDoc('branches', branch.id, branch);
    await saveDb();
    res.json({ success: true, branch });
  });

  router.delete('/branches/:id', async (req, res) => {
    const targetId = String(req.params.id);
    const index = (db.branches || []).findIndex((b: any) => 
      String(b.id) === targetId || 
      (b.code && String(b.code) === targetId) || 
      (b.solId && String(b.solId) === targetId)
    );
    if (index === -1) return res.status(404).json({ error: 'Branch not found.' });
    const removed = db.branches.splice(index, 1)[0];
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'DELETE', 'BRANCH', removed.id, `Deleted Branch ${removed.name} (SOL: ${removed.solId})`);
    if (deleteFirestoreDoc) await deleteFirestoreDoc('branches', removed.id);
    await saveDb();
    res.json({ success: true, message: 'Branch deleted successfully.' });
  });

  router.patch('/branches/:id/manager', async (req, res) => {
    const targetId = String(req.params.id);
    const branch = (db.branches || []).find((b: any) => String(b.id) === targetId || (b.code && String(b.code) === targetId) || (b.solId && String(b.solId) === targetId));
    if (!branch) return res.status(404).json({ error: 'Branch not found.' });
    const { managerUserId, managerId } = req.body;
    const user = (db.users || []).find((u: any) => u.id === managerId || u.userId === managerUserId);
    if (user) {
      user.role = 'MANAGER';
      user.branchId = branch.id;
      user.branchName = branch.name;
      user.districtId = branch.districtId;
      user.districtName = branch.districtName;
      await saveFirestoreDoc('users', user.id, user);
    }
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'ASSIGN_MANAGER', 'BRANCH', branch.id, `Assigned Branch Manager ${user?.userId} to Branch ${branch.name}`);
    await saveFirestoreDoc('branches', branch.id, branch);
    await saveDb();
    res.json({ success: true, branch, manager: user });
  });

  router.patch('/branches/:id/district', async (req, res) => {
    const targetId = String(req.params.id);
    const branch = (db.branches || []).find((b: any) => String(b.id) === targetId || (b.code && String(b.code) === targetId) || (b.solId && String(b.solId) === targetId));
    if (!branch) return res.status(404).json({ error: 'Branch not found.' });
    const { districtId } = req.body;
    const dist = (db.districts || []).find((d: any) => d.id === districtId || d.code === districtId);
    if (dist) {
      branch.districtId = dist.id;
      branch.districtName = dist.name;
    }
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'TRANSFER_DISTRICT', 'BRANCH', branch.id, `Transferred Branch ${branch.name} to District ${dist?.name}`);
    await saveFirestoreDoc('branches', branch.id, branch);
    await saveDb();
    res.json({ success: true, branch });
  });

  router.patch('/branches/:id/status', async (req, res) => {
    const targetId = String(req.params.id);
    const branch = (db.branches || []).find((b: any) => String(b.id) === targetId || (b.code && String(b.code) === targetId) || (b.solId && String(b.solId) === targetId));
    if (!branch) return res.status(404).json({ error: 'Branch not found.' });
    branch.status = req.body.status || (branch.status === 'Active' ? 'Inactive' : 'Active');
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'STATUS_CHANGE', 'BRANCH', branch.id, `Changed Branch status to ${branch.status}`);
    await saveFirestoreDoc('branches', branch.id, branch);
    await saveDb();
    res.json({ success: true, branch });
  });

  // ==========================================
  // 8. USER MANAGEMENT CENTER (ALL USERS)
  // ==========================================
  router.get('/users', (req, res) => {
    let users = db.users || [];
    const { search, role, districtId, branchId, status } = req.query as Record<string, string>;

    if (search) {
      const q = search.toLowerCase().trim();
      users = users.filter((u: any) => 
        (u.userId && u.userId.toLowerCase().includes(q)) ||
        (u.firstName && u.firstName.toLowerCase().includes(q)) ||
        (u.lastName && u.lastName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.jobTitle && u.jobTitle.toLowerCase().includes(q)) ||
        (u.branchName && u.branchName.toLowerCase().includes(q)) ||
        (u.districtName && u.districtName.toLowerCase().includes(q))
      );
    }

    if (role && role !== 'ALL') {
      users = users.filter((u: any) => u.role === role);
    }
    if (districtId && districtId !== 'ALL') {
      users = users.filter((u: any) => u.districtId === districtId);
    }
    if (branchId && branchId !== 'ALL') {
      users = users.filter((u: any) => u.branchId === branchId);
    }
    if (status && status !== 'ALL') {
      users = users.filter((u: any) => (u.status || 'Active') === status);
    }

    res.json(paginate(users, req.query.page, req.query.limit));
  });

  router.post('/users', async (req, res) => {
    const data = req.body;
    if (!data.userId || !data.firstName || !data.role) {
      return res.status(400).json({ error: 'User ID, First Name, and Role are required.' });
    }
    const existing = (db.users || []).find((u: any) => u.userId?.toLowerCase() === data.userId?.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'User ID already exists in the system.' });
    }

    let hashedPassword = data.password || 'password123';
    try {
      hashedPassword = bcrypt.hashSync(hashedPassword, 10);
    } catch {}

    const newUser = {
      id: data.id || `USR-${Date.now()}`,
      userId: data.userId,
      email: data.email || `${data.userId.toLowerCase()}@bunnabanksc.com`,
      firstName: data.firstName,
      middleName: data.middleName || '',
      lastName: data.lastName || '',
      password: hashedPassword,
      role: data.role,
      jobTitle: data.jobTitle || 'Bank Officer',
      districtId: data.districtId || 'DIST-HO',
      districtName: data.districtName || 'Head Office',
      branchId: data.branchId || 'BR-HQ',
      branchName: data.branchName || 'Head Office',
      gender: data.gender || 'Male',
      age: Number(data.age) || 30,
      phone: data.phone || '+251900000000',
      status: data.status || 'Active',
      isLocked: false,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'CREATE', 'USER', newUser.id, `Created user account ${newUser.userId} (${newUser.role})`);
    await saveFirestoreDoc('users', newUser.id, newUser);
    await saveDb();
    res.json({ success: true, user: newUser });
  });

  router.put('/users/:id', async (req, res) => {
    const targetId = String(req.params.id);
    if (!db.users) db.users = [];
    let user = db.users.find((u: any) => 
      String(u.id).toLowerCase() === targetId.toLowerCase() || 
      (u.userId && String(u.userId).toLowerCase() === targetId.toLowerCase()) ||
      (u.email && String(u.email).toLowerCase() === targetId.toLowerCase())
    );
    const prev = user ? { ...user } : null;
    const { password, ...rest } = req.body;
    if (!user) {
      user = { id: targetId, ...rest };
      db.users.push(user);
    } else {
      Object.assign(user, rest, { id: user.id });
    }
    if (password) {
      try {
        user.password = bcrypt.hashSync(password, 10);
      } catch {
        user.password = password;
      }
    }
    if (req.body.districtId) {
      const d = (db.districts || []).find((dist: any) => dist.id === req.body.districtId);
      if (d) user.districtName = d.name;
    }
    if (req.body.branchId) {
      const b = (db.branches || []).find((br: any) => br.id === req.body.branchId);
      if (b) user.branchName = b.name;
    }
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'UPDATE', 'USER', user.id, `Updated user details for ${user.userId || user.firstName || user.id}`, prev, user);
    await saveFirestoreDoc('users', user.id, user);
    await saveDb();
    res.json({ success: true, user });
  });

  router.delete('/users/:id', async (req, res) => {
    const targetId = String(req.params.id);
    const index = (db.users || []).findIndex((u: any) => 
      String(u.id) === targetId || 
      (u.userId && String(u.userId) === targetId)
    );
    if (index === -1) return res.status(404).json({ error: 'User not found.' });
    const removed = db.users.splice(index, 1)[0];
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'DELETE', 'USER', removed.id, `Deleted user account ${removed.userId}`);
    if (deleteFirestoreDoc) await deleteFirestoreDoc('users', removed.id);
    await saveDb();
    res.json({ success: true, message: 'User deleted successfully.' });
  });

  router.patch('/users/:id/status', async (req, res) => {
    const user = (db.users || []).find((u: any) => u.id === req.params.id || u.userId === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.status = req.body.status || (user.status === 'Active' ? 'Inactive' : 'Active');
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'STATUS_CHANGE', 'USER', user.id, `Changed user status to ${user.status} for ${user.userId}`);
    await saveFirestoreDoc('users', user.id, user);
    await saveDb();
    res.json({ success: true, user });
  });

  router.patch('/users/:id/lock', async (req, res) => {
    const user = (db.users || []).find((u: any) => u.id === req.params.id || u.userId === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.isLocked = req.body.isLocked !== undefined ? req.body.isLocked : !user.isLocked;
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', user.isLocked ? 'LOCK_ACCOUNT' : 'UNLOCK_ACCOUNT', 'USER', user.id, `${user.isLocked ? 'Locked' : 'Unlocked'} account for ${user.userId}`);
    await saveFirestoreDoc('users', user.id, user);
    await saveDb();
    res.json({ success: true, user });
  });

  router.patch('/users/:id/reset-password', async (req, res) => {
    const user = (db.users || []).find((u: any) => u.id === req.params.id || u.userId === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const newPass = req.body.password || 'Bunna@2026!';
    try {
      user.password = bcrypt.hashSync(newPass, 10);
    } catch {
      user.password = newPass;
    }
    user.mustChangePassword = true;
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'RESET_PASSWORD', 'USER', user.id, `Admin reset password for user ${user.userId}`);
    await saveFirestoreDoc('users', user.id, user);
    await saveDb();
    res.json({ success: true, message: `Password reset successfully for ${user.userId}.` });
  });

  router.post('/users/bulk-action', async (req, res) => {
    const { userIds, action, value } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array required.' });
    }
    let modifiedCount = 0;
    for (const uid of userIds) {
      const u = (db.users || []).find((user: any) => user.id === uid || user.userId === uid);
      if (!u) continue;
      if (action === 'ACTIVATE') u.status = 'Active';
      else if (action === 'DEACTIVATE') u.status = 'Inactive';
      else if (action === 'LOCK') u.isLocked = true;
      else if (action === 'UNLOCK') u.isLocked = false;
      else if (action === 'CHANGE_ROLE' && value) u.role = value;
      else if (action === 'TRANSFER_DISTRICT' && value) {
        const d = (db.districts || []).find((dist: any) => dist.id === value);
        if (d) { u.districtId = d.id; u.districtName = d.name; }
      }
      else if (action === 'TRANSFER_BRANCH' && value) {
        const b = (db.branches || []).find((br: any) => br.id === value);
        if (b) { u.branchId = b.id; u.branchName = b.name; u.districtId = b.districtId; u.districtName = b.districtName; }
      }
      modifiedCount++;
    }
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'BULK_ACTION', 'USER', 'BATCH', `Performed bulk action ${action} on ${modifiedCount} users`);
    await saveDb();
    res.json({ success: true, modifiedCount });
  });

  // ==========================================
  // 9. ROLES & PERMISSIONS
  // ==========================================
  router.get('/roles', (req, res) => {
    const roles = db.roles || [];
    const users = db.users || [];
    const enriched = roles.map((r: any) => ({
      ...r,
      userCount: users.filter((u: any) => u.role === r.role || u.role === r.code).length
    }));
    res.json(enriched);
  });

  router.post('/roles', async (req, res) => {
    const data = req.body;
    if (!data.name || !data.code) return res.status(400).json({ error: 'Role Name and Code are required.' });
    const newRole = {
      id: `ROLE-${Date.now()}`,
      role: data.code.toUpperCase(),
      name: data.name,
      code: data.code.toUpperCase(),
      description: data.description || '',
      permissions: data.permissions || [],
      scopeType: data.scopeType || 'GLOBAL',
      status: data.status || 'Active',
      createdAt: new Date().toISOString()
    };
    if (!db.roles) db.roles = [];
    db.roles.push(newRole);
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'CREATE', 'ROLE', newRole.id, `Created Role ${newRole.name}`);
    await saveFirestoreDoc('roles', newRole.id, newRole);
    await saveDb();
    res.json({ success: true, role: newRole });
  });

  router.put('/roles/:id', async (req, res) => {
    const targetId = String(req.params.id);
    if (!db.roles) db.roles = [];
    let role = db.roles.find((r: any) => 
      String(r.id).toLowerCase() === targetId.toLowerCase() || 
      (r.code && String(r.code).toLowerCase() === targetId.toLowerCase()) ||
      (r.name && String(r.name).toLowerCase() === targetId.toLowerCase())
    );
    if (!role) {
      role = { id: targetId, ...req.body };
      db.roles.push(role);
    } else {
      Object.assign(role, req.body, { id: role.id });
    }
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'UPDATE', 'ROLE', role.id, `Updated Role ${role.name}`);
    await saveFirestoreDoc('roles', role.id, role);
    await saveDb();
    res.json({ success: true, role });
  });

  router.delete('/roles/:id', async (req, res) => {
    const targetId = String(req.params.id);
    const index = (db.roles || []).findIndex((r: any) => String(r.id) === targetId || String(r.code) === targetId);
    if (index === -1) return res.status(404).json({ error: 'Role not found.' });
    const removed = db.roles.splice(index, 1)[0];
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'DELETE', 'ROLE', removed.id, `Deleted Role ${removed.name}`);
    if (deleteFirestoreDoc) await deleteFirestoreDoc('roles', removed.id);
    await saveDb();
    res.json({ success: true, message: 'Role deleted successfully.' });
  });

  router.get('/permissions', (req, res) => {
    res.json(db.permissions || []);
  });

  // ==========================================
  // 10. KPI & TARGET MANAGEMENT
  // ==========================================
  router.get('/kpis', (req, res) => {
    res.json(paginate(db.kpis || [], req.query.page, req.query.limit));
  });

  router.post('/kpis', async (req, res) => {
    const data = req.body;
    if (!data.name || !data.code) return res.status(400).json({ error: 'KPI Name and Code required.' });
    const newKpi = {
      id: data.id || data.code,
      code: data.code,
      name: data.name,
      category: data.category || 'Finance',
      unit: data.unit || 'ETB',
      weight: Number(data.weight) || 10,
      description: data.description || '',
      calculationMethod: data.calculationMethod || 'Actual vs Target',
      frequency: data.frequency || 'Daily',
      status: data.status || 'Active',
      createdAt: new Date().toISOString()
    };
    if (!db.kpis) db.kpis = [];
    db.kpis.push(newKpi);
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'CREATE', 'KPI', newKpi.id, `Created KPI ${newKpi.name} (${newKpi.weight}%)`);
    await saveFirestoreDoc('kpis', newKpi.id, newKpi);
    await saveDb();
    res.json({ success: true, kpi: newKpi });
  });

  router.put('/kpis/:id', async (req, res) => {
    const targetId = String(req.params.id);
    if (!db.kpis) db.kpis = [];
    let kpi = db.kpis.find((k: any) => 
      String(k.id).toLowerCase() === targetId.toLowerCase() || 
      (k.code && String(k.code).toLowerCase() === targetId.toLowerCase()) ||
      (k.name && String(k.name).toLowerCase() === targetId.toLowerCase())
    );
    if (!kpi) {
      kpi = { id: targetId, ...req.body };
      db.kpis.push(kpi);
    } else {
      Object.assign(kpi, req.body, { id: kpi.id });
    }
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'UPDATE', 'KPI', kpi.id, `Updated KPI ${kpi.name}`);
    await saveFirestoreDoc('kpis', kpi.id, kpi);
    await saveDb();
    res.json({ success: true, kpi });
  });

  router.delete('/kpis/:id', async (req, res) => {
    const index = (db.kpis || []).findIndex((k: any) => k.id === req.params.id || k.code === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'KPI not found.' });
    const removed = db.kpis.splice(index, 1)[0];
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'DELETE', 'KPI', removed.id, `Deleted KPI ${removed.name}`);
    if (deleteFirestoreDoc) await deleteFirestoreDoc('kpis', removed.id);
    await saveDb();
    res.json({ success: true, message: 'KPI deleted successfully.' });
  });

  // ==========================================
  // 11. SYSTEM SETTINGS & BANK HOLIDAYS
  // ==========================================
  router.get('/system-settings', (req, res) => {
    res.json(db.systemSettings || {});
  });

  router.put('/system-settings', async (req, res) => {
    const prev = { ...db.systemSettings };
    db.systemSettings = { ...db.systemSettings, ...req.body, updatedAt: new Date().toISOString() };
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'UPDATE', 'SYSTEM_SETTINGS', 'SETTINGS', 'Updated Bank System Settings', prev, db.systemSettings);
    await saveDb();
    res.json({ success: true, settings: db.systemSettings });
  });

  router.get('/holidays', (req, res) => {
    res.json(db.holidays || []);
  });

  router.post('/holidays', async (req, res) => {
    const data = req.body;
    if (!data.name || !data.date) return res.status(400).json({ error: 'Holiday Name and Date required.' });
    const newHol = {
      id: `HOL-${Date.now()}`,
      name: data.name,
      date: data.date,
      description: data.description || 'Public & Banking Holiday',
      recurring: !!data.recurring,
      createdAt: new Date().toISOString()
    };
    if (!db.holidays) db.holidays = [];
    db.holidays.push(newHol);
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'CREATE', 'HOLIDAY', newHol.id, `Added Bank Holiday ${newHol.name} (${newHol.date})`);
    await saveFirestoreDoc('holidays', newHol.id, newHol);
    await saveDb();
    res.json({ success: true, holiday: newHol });
  });

  router.delete('/holidays/:id', async (req, res) => {
    const index = (db.holidays || []).findIndex((h: any) => h.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Holiday not found.' });
    const removed = db.holidays.splice(index, 1)[0];
    logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'DELETE', 'HOLIDAY', removed.id, `Deleted Bank Holiday ${removed.name}`);
    if (deleteFirestoreDoc) await deleteFirestoreDoc('holidays', removed.id);
    await saveDb();
    res.json({ success: true, message: 'Holiday deleted.' });
  });

  // ==========================================
  // 12. APPROVAL WORKFLOWS
  // ==========================================
  router.get('/approval-workflows', (req, res) => {
    res.json(db.approvalRules || []);
  });

  router.put('/approval-workflows', async (req, res) => {
    const { rules } = req.body;
    if (Array.isArray(rules)) {
      db.approvalRules = rules;
      logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'UPDATE', 'APPROVAL_WORKFLOW', 'CONFIG', `Updated approval workflow hierarchy (${rules.length} stages)`);
      await saveDb();
    }
    res.json({ success: true, rules: db.approvalRules });
  });

  // ==========================================
  // 13. SECURITY CENTER & SESSIONS
  // ==========================================
  router.get('/security/sessions', (req, res) => {
    res.json(db.securitySessions || []);
  });

  router.post('/security/revoke-session', async (req, res) => {
    const { sessionId } = req.body;
    const session = (db.securitySessions || []).find((s: any) => s.id === sessionId);
    if (session) {
      session.status = 'REVOKED';
      logAudit(req.headers['x-user-id'] as string || 'Admin', 'Bank Super Admin', 'BANK_SUPER_ADMIN', 'REVOKE_SESSION', 'SECURITY', session.id, `Revoked active session for ${session.userName} (${session.userId})`);
      await saveDb();
    }
    res.json({ success: true, message: 'Session revoked.' });
  });

  router.get('/security/alerts', (req, res) => {
    res.json(db.securityAlerts || []);
  });

  router.post('/security/resolve-alert', async (req, res) => {
    const { alertId } = req.body;
    const alert = (db.securityAlerts || []).find((a: any) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      await saveDb();
    }
    res.json({ success: true });
  });

  // ==========================================
  // 14. AUDIT LOGS
  // ==========================================
  router.get('/audit-logs', (req, res) => {
    let logs = db.auditLogs || [];
    const { search, action, entity, userId } = req.query as Record<string, string>;
    if (search) {
      const q = search.toLowerCase().trim();
      logs = logs.filter((l: any) => 
        (l.userName && l.userName.toLowerCase().includes(q)) ||
        (l.userId && l.userId.toLowerCase().includes(q)) ||
        (l.details && l.details.toLowerCase().includes(q)) ||
        (l.action && l.action.toLowerCase().includes(q)) ||
        (l.entity && l.entity.toLowerCase().includes(q))
      );
    }
    if (action && action !== 'ALL') logs = logs.filter((l: any) => l.action === action);
    if (entity && entity !== 'ALL') logs = logs.filter((l: any) => l.entity === entity);
    if (userId && userId !== 'ALL') logs = logs.filter((l: any) => l.userId === userId);

    res.json(paginate(logs, req.query.page, req.query.limit));
  });

  // ==========================================
  // 15. CROSS-ENTITY GLOBAL SEARCH
  // ==========================================
  router.get('/search', (req, res) => {
    const q = (req.query.q as string || '').toLowerCase().trim();
    if (!q) {
      return res.json({ users: [], districts: [], branches: [], kpis: [], reports: [] });
    }

    const matchedUsers = (db.users || []).filter((u: any) => 
      (u.userId && u.userId.toLowerCase().includes(q)) ||
      (u.firstName && u.firstName.toLowerCase().includes(q)) ||
      (u.lastName && u.lastName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.jobTitle && u.jobTitle.toLowerCase().includes(q))
    ).slice(0, 8);

    const matchedDistricts = (db.districts || []).filter((d: any) => 
      d.name && d.name.toLowerCase().includes(q)
    ).slice(0, 8);

    const matchedBranches = (db.branches || []).filter((b: any) => 
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.solId && b.solId.toLowerCase().includes(q))
    ).slice(0, 8);

    const matchedKpis = (db.kpis || []).filter((k: any) => 
      (k.name && k.name.toLowerCase().includes(q)) ||
      (k.code && k.code.toLowerCase().includes(q))
    ).slice(0, 8);

    res.json({
      success: true,
      query: q,
      results: {
        users: matchedUsers,
        districts: matchedDistricts,
        branches: matchedBranches,
        kpis: matchedKpis
      }
    });
  });

  // ==========================================
  // 16. SYSTEM BACKUP & HEALTH
  // ==========================================
  router.get('/backup/export', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=bunna_bank_epms_backup_${new Date().toISOString().substring(0, 10)}.json`);
    res.json({
      system: 'Bunna Bank S.C. Employee Performance Management System',
      version: '2.0.0-ENTERPRISE-SUPERADMIN',
      backupTimestamp: new Date().toISOString(),
      database: db
    });
  });

  return router;
}
