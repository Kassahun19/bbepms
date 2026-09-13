// backend/controllers/installController.js
import { getMySqlPool, checkMySqlConnection, getMySqlConfig, executeSqlQuery } from '../config/db.js';
import { TABLE_SCHEMAS, createAllTables } from '../models/schema.js';
import { seedInitialDatabase } from '../services/seedService.js';
import { User } from '../models/User.js';
import { District } from '../models/District.js';
import { Branch } from '../models/Branch.js';
import { KpiMetric } from '../models/KpiMetric.js';
import { DailyPerformanceReport } from '../models/DailyPerformanceReport.js';
import { PerformanceTarget } from '../models/PerformanceTarget.js';
import { AuditLog } from '../models/AuditLog.js';

export const installController = {
  async runInstall(req, res) {
    const wantsJson = req.query.format === 'json' || req.headers.accept?.includes('application/json') || req.path.startsWith('/api/');
    const isHtml = !wantsJson && req.accepts('html') && !req.xhr;
    const results = {
      timestamp: new Date().toISOString(),
      databaseConfig: getMySqlConfig(),
      connectionStatus: null,
      tablesCreated: [],
      crudVerification: {
        create: null,
        read: null,
        update: null,
        delete: null
      },
      seedData: null,
      summary: {}
    };

    try {
      // 1. Check MySQL connection
      const connCheck = await checkMySqlConnection();
      results.connectionStatus = connCheck;

      const pool = getMySqlPool();

      // 2. Table creation of ALL tables at once
      const createdTables = await createAllTables(pool, connCheck.connected);
      results.tablesCreated = createdTables;

      // 3. Seed Initial Data (insertion)
      const seedResult = await seedInitialDatabase();
      results.seedData = seedResult;

      // 4. SQL CRUD Operations Execution & Verification
      // (C) CREATE: Insert sample audit log
      const testLogId = `TEST-INSTALL-${Date.now()}`;
      const insertSql = `
        INSERT INTO audit_logs (log_id, user_id, user_name, action, entity_type, entity_id, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const insertParams = [testLogId, 'USR-SUPERADMIN', 'Kassahun Mulatu', 'TEST_INSTALL_ACTION', 'SystemInstall', 'SYS-001', 'Verified SQL CREATE via /install'];
      await executeSqlQuery(insertSql, insertParams);
      results.crudVerification.create = {
        operation: 'INSERT (CREATE)',
        sql: insertSql.trim(),
        params: insertParams,
        success: true
      };

      // (R) READ: Select users and districts count
      const readSql = `SELECT user_id, system_username, first_name, role FROM users LIMIT 5`;
      const readRes = await executeSqlQuery(readSql);
      results.crudVerification.read = {
        operation: 'SELECT (READ)',
        sql: readSql.trim(),
        sampleRows: readRes.results || [],
        success: true
      };

      // (U) UPDATE: Update user failed attempts reset
      const updateSql = `UPDATE users SET failed_attempts = 0, is_locked = 0 WHERE system_username = ?`;
      await executeSqlQuery(updateSql, ['kassahun.m']);
      results.crudVerification.update = {
        operation: 'UPDATE',
        sql: updateSql.trim(),
        params: ['kassahun.m'],
        success: true
      };

      // (D) DELETE: Delete the test audit log
      const deleteSql = `DELETE FROM audit_logs WHERE log_id = ?`;
      await executeSqlQuery(deleteSql, [testLogId]);
      results.crudVerification.delete = {
        operation: 'DELETE',
        sql: deleteSql.trim(),
        params: [testLogId],
        success: true
      };

      // Summary counts
      const usersCount = (await User.findAll()).length;
      const districtsCount = (await District.findAll()).length;
      const branchesCount = (await Branch.findAll()).length;
      const kpisCount = (await KpiMetric.findAll()).length;
      const targetsCount = (await PerformanceTarget.findAll()).length;
      const reportsCount = (await DailyPerformanceReport.findAll()).length;

      results.summary = {
        status: 'SUCCESS',
        message: 'All 18 tables created successfully, seed data inserted, and SQL CRUD operations verified.',
        counts: {
          tables: Object.keys(TABLE_SCHEMAS).length,
          users: usersCount,
          districts: districtsCount,
          branches: branchesCount,
          kpis: kpisCount,
          targets: targetsCount,
          reports: reportsCount
        }
      };

      if (isHtml) {
        return res.send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bunna Bank EPMS - Installation & Database Setup</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
              body { font-family: 'Plus Jakarta Sans', sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; }
              .container { max-width: 900px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; }
              h1 { color: #f59e0b; margin-top: 0; display: flex; align-items: center; gap: 12px; }
              .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; background: #10b981; color: white; }
              .card { background: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #334155; }
              .card-title { font-size: 16px; font-weight: 600; color: #94a3b8; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
              pre { background: #020617; padding: 12px; border-radius: 6px; overflow-x: auto; color: #38bdf8; font-size: 13px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { text-align: left; padding: 10px; border-bottom: 1px solid #334155; font-size: 14px; }
              th { color: #94a3b8; }
              .btn { display: inline-block; background: #d97706; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
              .btn:hover { background: #b45309; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>
                <span>☕ Bunna Bank EPMS</span>
                <span class="badge">Installation Complete</span>
              </h1>
              <p style="color: #94a3b8; font-size: 15px;">Database connection, table creation, seed data insertion, and SQL CRUD operations have been executed successfully.</p>
              
              <div class="card">
                <div class="card-title">MySQL Database Configuration</div>
                <table>
                  <tr><th>Host</th><td>${results.databaseConfig.host}</td></tr>
                  <tr><th>Port</th><td>${results.databaseConfig.port}</td></tr>
                  <tr><th>Database</th><td>${results.databaseConfig.database}</td></tr>
                  <tr><th>User</th><td>${results.databaseConfig.user}</td></tr>
                  <tr><th>Status</th><td><span style="color: #10b981; font-weight: 600;">${results.connectionStatus.message}</span></td></tr>
                </table>
              </div>

              <div class="card">
                <div class="card-title">Table Creation & Schema Initialization (${results.tablesCreated.length} Tables)</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
                  ${results.tablesCreated.map(t => `<div style="background: #1e293b; padding: 8px 12px; border-radius: 4px; font-size: 13px; display: flex; justify-content: space-between;"><span>${t.table}</span><span style="color: #10b981;">✓ ${t.status}</span></div>`).join('')}
                </div>
              </div>

              <div class="card">
                <div class="card-title">SQL CRUD Operations Verification</div>
                <table>
                  <tr><th>[C] INSERT</th><td><code style="color: #a7f3d0;">INSERT INTO audit_logs ...</code> (Success)</td></tr>
                  <tr><th>[R] SELECT</th><td><code style="color: #a7f3d0;">SELECT * FROM users ...</code> (Success)</td></tr>
                  <tr><th>[U] UPDATE</th><td><code style="color: #a7f3d0;">UPDATE users SET ...</code> (Success)</td></tr>
                  <tr><th>[D] DELETE</th><td><code style="color: #a7f3d0;">DELETE FROM audit_logs ...</code> (Success)</td></tr>
                </table>
              </div>

              <div class="card">
                <div class="card-title">Populated Records Summary</div>
                <table>
                  <tr><th>Districts</th><td>${results.summary.counts.districts}</td><th>Branches</th><td>${results.summary.counts.branches}</td></tr>
                  <tr><th>Users</th><td>${results.summary.counts.users}</td><th>KPI Metrics</th><td>${results.summary.counts.kpis}</td></tr>
                  <tr><th>Targets</th><td>${results.summary.counts.targets}</td><th>Approved Reports</th><td>${results.summary.counts.reports}</td></tr>
                </table>
              </div>

              <a href="/" class="btn">Launch Daily KPI System →</a>
            </div>
          </body>
          </html>
        `);
      }

      return res.status(200).json(results);
    } catch (err) {
      console.error('[Install Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'Installation failed: ' + err.message,
        results
      });
    }
  }
};

export default installController;
