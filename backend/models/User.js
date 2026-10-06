// backend/models/User.js
import { getMySqlPool, loadPersistentData, savePersistentData, executeSqlQuery } from '../config/db.js';

export const User = {
  async findAll() {
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.query(`
          SELECT user_id, system_username, first_name, middle_name, last_name,
                 email, phone, role, role_type, job_title, branch_id, branch_name,
                 district_id, district_name, department_id, gender, age, avatar_url,
                 status, is_locked, failed_attempts, created_at, updated_at
          FROM users ORDER BY first_name ASC
        `);
        if (rows && rows.length > 0) return rows;
      } catch (err) {
        // Fallback
      }
    }
    const store = loadPersistentData();
    return store.users || [];
  },

  async findById(userId) {
    if (!userId) return null;
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.execute(`
          SELECT * FROM users WHERE user_id = ? OR system_username = ? LIMIT 1
        `, [userId, userId]);
        if (rows && rows.length > 0) return rows[0];
      } catch (err) {
        // Fallback
      }
    }
    const store = loadPersistentData();
    return (store.users || []).find(u => 
      u.user_id === userId || 
      u.id === userId || 
      u.system_username === userId || 
      u.userId === userId ||
      u.email === userId
    ) || null;
  },

  async findByUsernameOrEmail(identifier) {
    if (!identifier) return null;
    const raw = String(identifier).trim();
    const id = raw.toLowerCase();
    const cleanId = id.replace(/[-_.\s]/g, '');

    const roleAliases = {
      ceo: 'CEO',
      board: 'BOARD_OF_DIRECTORS',
      chief: 'CHIEF_OFFICER',
      director: 'DISTRICT_DIRECTOR',
      district: 'DISTRICT_DIRECTOR',
      districtdirector: 'DISTRICT_DIRECTOR',
      manager: 'MANAGER',
      branchmanager: 'MANAGER',
      employee: 'EMPLOYEE',
      cso: 'EMPLOYEE',
      teller: 'EMPLOYEE',
      officer: 'EMPLOYEE',
      admin: 'ADMINISTRATOR',
      administrator: 'ADMINISTRATOR',
      superadmin: 'BANK_SUPER_ADMIN',
      super_admin: 'BANK_SUPER_ADMIN',
      banksuperadmin: 'BANK_SUPER_ADMIN'
    };

    const targetRole = roleAliases[id] || roleAliases[cleanId] || null;

    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows] = await pool.execute(`
          SELECT * FROM users 
          WHERE LOWER(system_username) = ? 
             OR LOWER(email) = ? 
             OR user_id = ? 
             OR LOWER(REPLACE(REPLACE(system_username, '.', ''), '_', '')) = ?
             OR (? IS NOT NULL AND role = ?)
          LIMIT 1
        `, [id, id, raw, cleanId, targetRole, targetRole || '']);
        if (rows && rows.length > 0) return rows[0];
      } catch (err) {
        // Fallback
      }
    }
    const store = loadPersistentData();
    const users = store.users || [];

    // 1. Direct match on username, email, user_id, or stripped clean ID
    let user = users.find(u => {
      const uSys = (u.system_username || u.userId || '').toLowerCase();
      const uEmail = (u.email || '').toLowerCase();
      const uUid = (u.user_id || u.id || '').toLowerCase();
      const uClean = uSys.replace(/[-_.\s]/g, '');
      return uSys === id || uEmail === id || uUid === id || (cleanId && uClean === cleanId);
    });

    // 2. Role alias match (e.g. 'ceo' -> CEO, 'board' -> BOARD_OF_DIRECTORS)
    if (!user && targetRole) {
      user = users.find(u => u.role === targetRole);
    }

    // 3. Prefix match (e.g. "ceo" matching "ceo.bunna", "board" matching "board.chair")
    if (!user) {
      user = users.find(u => {
        const uSys = (u.system_username || u.userId || '').toLowerCase();
        const uEmail = (u.email || '').toLowerCase();
        return uSys.startsWith(id + '.') || uSys.startsWith(id + '_') || uEmail.startsWith(id + '@');
      });
    }

    return user || null;
  },

  async create(userData) {
    const userId = userData.user_id || userData.id || `USR-${Date.now().toString(36).toUpperCase()}`;
    const user = {
      user_id: userId,
      system_username: userData.system_username || userData.userId || userId,
      password_hash: userData.password_hash || '',
      first_name: userData.first_name || userData.firstName || '',
      middle_name: userData.middle_name || userData.middleName || '',
      last_name: userData.last_name || userData.lastName || '',
      email: userData.email || `${userId.toLowerCase()}@bunnabanksc.com`,
      phone: userData.phone || '',
      role: userData.role || 'EMPLOYEE',
      role_type: userData.role_type || userData.roleType || '',
      job_title: userData.job_title || userData.jobTitle || 'Officer',
      branch_id: userData.branch_id || userData.branchId || null,
      branch_name: userData.branch_name || userData.branchName || null,
      district_id: userData.district_id || userData.districtId || null,
      district_name: userData.district_name || userData.districtName || null,
      department_id: userData.department_id || userData.departmentId || null,
      gender: userData.gender || 'Male',
      age: Number(userData.age) || 30,
      avatar_url: userData.avatar_url || userData.avatarUrl || null,
      status: userData.status || 'Active',
      is_locked: Boolean(userData.is_locked),
      failed_attempts: Number(userData.failed_attempts) || 0
    };

    const sql = `
      INSERT INTO users (
        user_id, system_username, password_hash, first_name, middle_name, last_name,
        email, phone, role, role_type, job_title, branch_id, branch_name,
        district_id, district_name, department_id, gender, age, avatar_url,
        status, is_locked, failed_attempts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        role = VALUES(role),
        status = VALUES(status),
        is_locked = VALUES(is_locked);
    `;

    const params = [
      user.user_id, user.system_username, user.password_hash, user.first_name,
      user.middle_name, user.last_name, user.email, user.phone, user.role,
      user.role_type, user.job_title, user.branch_id, user.branch_name,
      user.district_id, user.district_name, user.department_id, user.gender,
      user.age, user.avatar_url, user.status, user.is_locked, user.failed_attempts
    ];

    await executeSqlQuery(sql, params);

    // Sync persistent storage
    const store = loadPersistentData();
    if (!store.users) store.users = [];
    const idx = store.users.findIndex(u => u.user_id === user.user_id || u.id === user.user_id);
    if (idx >= 0) {
      store.users[idx] = { ...store.users[idx], ...user };
    } else {
      store.users.push(user);
    }
    savePersistentData(store);

    return user;
  },

  async update(userId, updates) {
    const user = await this.findById(userId);
    if (!user) return null;

    const fields = [];
    const params = [];
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'user_id' && key !== 'id') {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (fields.length > 0) {
      params.push(userId);
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;
      await executeSqlQuery(sql, params);
    }

    // Sync persistent storage
    const store = loadPersistentData();
    if (store.users) {
      const idx = store.users.findIndex(u => (u.user_id === userId || u.id === userId));
      if (idx >= 0) {
        store.users[idx] = { ...store.users[idx], ...updates };
        savePersistentData(store);
      }
    }

    return await this.findById(userId);
  },

  async unlock(userId) {
    return await this.update(userId, { is_locked: false, failed_attempts: 0 });
  },

  async delete(userId) {
    const sql = `DELETE FROM users WHERE user_id = ?`;
    await executeSqlQuery(sql, [userId]);

    const store = loadPersistentData();
    if (store.users) {
      store.users = store.users.filter(u => u.user_id !== userId && u.id !== userId);
      savePersistentData(store);
    }
    return true;
  }
};

export default User;
