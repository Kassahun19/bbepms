// =============================================================================
// Bunna Bank S.C. EPMS - Hybrid Data Service (Prisma PostgreSQL + JSON Fallback)
// =============================================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPrismaClient } from '../config/db';

const _resolvedFilename = typeof __filename !== 'undefined' ? __filename : process.cwd();
const _resolvedDirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

const possiblePaths = [
  path.join(process.cwd(), 'epms_persistent_data.json'),
  path.join(_resolvedDirname, '../../epms_persistent_data.json'),
  './epms_persistent_data.json'
];

let cachedJsonData: any = null;

export function loadLocalJsonDb() {
  if (cachedJsonData) return cachedJsonData;
  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        cachedJsonData = JSON.parse(raw);
        console.log(`[HybridData] Successfully loaded fallback JSON from ${filePath}`);
        return cachedJsonData;
      }
    } catch (e) {
      // Continue trying paths
    }
  }
  // Default structure if none found
  cachedJsonData = {
    users: [],
    reports: [],
    branches: [],
    districts: [],
    targets: [],
    kpis: [],
    announcements: [],
    notifications: [],
    messages: [],
    auditLogs: [],
    competitorBanks: [],
    competitorBranches: [],
    competitorMonthlyPerformance: [],
    areaRankings: [],
    aiInsights: [],
    competitorAlerts: [],
    telegramSessions: [],
    contactInquiries: [],
    systemSettings: []
  };
  return cachedJsonData;
}

export function saveLocalJsonDb(data: any) {
  cachedJsonData = data;
  for (const filePath of possiblePaths) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      // Try next path
    }
  }
  return false;
}

export async function getDbCollection(collectionName: string) {
  const prisma = getPrismaClient();
  if (prisma) {
    try {
      switch (collectionName) {
        case 'users': return await prisma.user.findMany({ include: { branch: true, district: true } });
        case 'branches': return await prisma.branch.findMany({ include: { district: true } });
        case 'districts': return await prisma.district.findMany({ include: { branches: true } });
        case 'reports': return await prisma.dailyPerformanceReport.findMany({ include: { employee: true, comments: true } });
        case 'targets': return await prisma.performanceTarget.findMany();
        case 'kpis': return await prisma.kpi.findMany();
        case 'announcements': return await prisma.announcement.findMany();
        case 'notifications': return await prisma.notification.findMany();
        case 'auditLogs': return await prisma.auditLog.findMany();
        case 'competitorBanks': return await prisma.commercialBank.findMany();
        case 'competitorBranches': return await prisma.competitorBranch.findMany();
        case 'competitorMonthlyPerformance': return await prisma.competitorMonthlyPerformance.findMany();
        case 'areaRankings': return await prisma.areaRanking.findMany();
        case 'aiInsights': return await prisma.aiCompetitorInsight.findMany();
        case 'competitorAlerts': return await prisma.competitorAlert.findMany();
        case 'contactInquiries': return await prisma.contactInquiry.findMany();
        case 'systemSettings': return await prisma.systemSetting.findMany();
        default: break;
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Database query failed for ${collectionName}: ${err?.message || err}`);
      }
      console.warn(`[Prisma Query Warning] Falling back to JSON for collection ${collectionName}:`, err);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Database not available (Prisma client not initialized) in production for collection ${collectionName}`);
  }

  // Fallback to local JSON storage (development only)
  const db = loadLocalJsonDb();
  return db[collectionName] || [];
}
