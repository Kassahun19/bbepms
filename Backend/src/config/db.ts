let prismaInstance: any = null;

export function getPrismaClient(): any {
  const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!dbUrl) {
    return null;
  }

  if (!prismaInstance) {
    try {
      // Dynamic require to prevent module startup crashes when Prisma runtime is omitted
      const PrismaPkg = require('@prisma/client');
      const pg = require('pg');
      const { PrismaPg } = require('@prisma/adapter-pg');

      const PrismaClientClass = (PrismaPkg as any).PrismaClient || (PrismaPkg as any).default?.PrismaClient || PrismaPkg;

      if (typeof PrismaClientClass === 'function') {
        const pool = new pg.Pool({ connectionString: dbUrl });
        const adapter = new PrismaPg(pool);
        prismaInstance = new PrismaClientClass({
          adapter,
          log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        });
      }
    } catch (e) {
      console.warn('[Prisma] Adapter initialization notice:', e);
    }
  }
  return prismaInstance;
}

export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  provider: string;
  latencyMs?: number;
  error?: string;
}> {
  const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!dbUrl) {
    return {
      connected: false,
      provider: 'JSON / Cloud Firestore Fallback'
    };
  }

  const startTime = Date.now();
  try {
    const prisma = getPrismaClient();
    if (!prisma) {
      return {
        connected: false,
        provider: 'JSON / Cloud Firestore Fallback'
      };
    }
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      provider: 'PostgreSQL (Supabase / Cloud SQL)',
      latencyMs: Date.now() - startTime
    };
  } catch (err: any) {
    return {
      connected: false,
      provider: 'JSON / Cloud Firestore Fallback',
      error: err?.message || 'Database connection error'
    };
  }
}
