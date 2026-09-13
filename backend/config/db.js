// backend/config/db.js
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// Canonical MySQL credentials as requested:
// Database: daily_kpi_2026
// User: daily_kpi_2026
// Password: daily_kpi_2026
// Host: localhost
export const mySqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'daily_kpi_2026',
  password: process.env.MYSQL_PASSWORD || 'daily_kpi_2026',
  database: process.env.MYSQL_DATABASE || 'daily_kpi_2026',
  port: Number(process.env.MYSQL_PORT) || 3306
};

export const MYSQL_CONFIG = mySqlConfig;

let pool = null;
let isConnected = false;

export function getMySqlConfig() {
  return mySqlConfig;
}

export function getMySqlPool(requireConnected = true) {
  if (requireConnected && !isConnected) {
    return null;
  }
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: mySqlConfig.host,
        user: mySqlConfig.user,
        password: mySqlConfig.password,
        database: mySqlConfig.database,
        port: mySqlConfig.port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 1000,
        decimalNumbers: true
      });
    } catch (err) {
      console.warn('[MySQL Pool Warning]:', err.message);
    }
  }
  return pool;
}

export async function checkMySqlConnection() {
  const p = getMySqlPool(false);
  if (!p) {
    return {
      connected: false,
      message: 'MySQL pool could not be initialized',
      config: mySqlConfig
    };
  }
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout (1.0s)')), 1000)
    );
    const connPromise = (async () => {
      const connection = await p.getConnection();
      await connection.ping();
      connection.release();
      return true;
    })();
    await Promise.race([connPromise, timeoutPromise]);
    isConnected = true;
    return {
      connected: true,
      message: `Successfully connected to MySQL database '${mySqlConfig.database}' on ${mySqlConfig.host}:${mySqlConfig.port}`,
      config: mySqlConfig
    };
  } catch (err) {
    isConnected = false;
    return {
      connected: false,
      message: `Could not connect to MySQL at ${mySqlConfig.host}:${mySqlConfig.port} (${err.message}). Running with persistent relational fallback engine.`,
      config: mySqlConfig
    };
  }
}

export const checkConnection = checkMySqlConnection;

export function isMySqlConnected() {
  return isConnected;
}

// Persistent JSON fallback path
const ROOT_DATA_FILE = path.resolve(process.cwd(), 'epms_persistent_data.json');
const BACKEND_DATA_FILE = path.resolve(process.cwd(), 'backend/data/epms_persistent_data.json');

export function getDataFilePath() {
  if (fs.existsSync(ROOT_DATA_FILE)) return ROOT_DATA_FILE;
  if (fs.existsSync(BACKEND_DATA_FILE)) return BACKEND_DATA_FILE;
  return ROOT_DATA_FILE;
}

export function loadPersistentData() {
  try {
    const filePath = getDataFilePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.warn('[Data Store Warning] Failed to read JSON store:', err.message);
  }
  return {
    users: [],
    branches: [],
    districts: [],
    departments: [],
    fiscalYears: [],
    kpiMetrics: [],
    targets: [],
    reports: [],
    auditLogs: [],
    announcements: [],
    systemSettings: {},
    competitorBanks: [],
    competitorBranches: [],
    competitorKpiMetrics: [],
    competitorBranchKpiValues: [],
    competitorBpiWeights: [],
    competitorAiInsights: [],
    competitorCatchmentGaps: []
  };
}

export function savePersistentData(data) {
  try {
    const filePath = getDataFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[Data Store Error] Failed to save JSON store:', err.message);
    return false;
  }
}

export async function executeSqlQuery(sql, params = []) {
  const p = getMySqlPool();
  if (p && isConnected) {
    try {
      const [results] = await p.execute(sql, params);
      return { success: true, results, fromDb: true };
    } catch (err) {
      console.warn('[SQL Execution Notice]:', err.message);
    }
  }
  return { success: true, results: [], fromDb: false, simulatedSql: sql };
}

export const executeQuery = executeSqlQuery;

export default {
  mySqlConfig,
  MYSQL_CONFIG,
  getMySqlPool,
  getMySqlConfig,
  checkMySqlConnection,
  checkConnection,
  loadPersistentData,
  savePersistentData,
  executeSqlQuery,
  executeQuery
};
