// =============================================================================
// Bunna Bank S.C. EPMS - Prisma Client & Database Manager
// =============================================================================
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;
import { config } from './env';

let prismaClient: PrismaClient | null = null;
let isConnected = false;

export function getPrismaClient(): PrismaClient | null {
  if (prismaClient) {
    return prismaClient;
  }

  const databaseUrl = config.databaseUrl || process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.trim() === '') {
    return null;
  }

  try {
    const pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    prismaClient = new PrismaClient({
      adapter,
      log: [],
    } as any);
    return prismaClient;
  } catch (err: any) {
    console.warn('[Prisma Init Warning]: Unable to create Prisma instance with pg adapter:', err?.message || err);
    return null;
  }
}

export async function checkDatabaseConnection(): Promise<{ connected: boolean; provider: string }> {
  const client = getPrismaClient();
  if (!client) {
    return { connected: false, provider: 'None (Prisma not configured)' };
  }

  try {
    // Perform a fast lightweight query to verify connectivity
    await client.$queryRaw`SELECT 1`;
    isConnected = true;
    return { connected: true, provider: 'Supabase PostgreSQL' };
  } catch (err: any) {
    isConnected = false;
    return { connected: false, provider: 'Supabase PostgreSQL (Offline/Unreachable)' };
  }
}

export async function disconnectPrisma(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
    isConnected = false;
  }
}

export const prisma = getPrismaClient();
