import { createApp } from './app';
import { config } from './config/env';
import { checkMySqlConnection } from './config/mysqlDb';

async function bootstrap() {
  const app = createApp();
  const PORT = config.port || 3000;

  console.log('[Bootstrap] Initializing Bunna EPMS Enterprise Backend...');
  const mysqlStatus = await checkMySqlConnection();
  console.log(`[MySQL Database] Status: ${mysqlStatus.connected ? 'Connected' : 'Unavailable (Mock / Fallback active)'}`);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Bunna Bank EPMS Backend running on port ${PORT} [${config.nodeEnv}]`);
  });
}

bootstrap().catch(err => {
  console.error('[Bootstrap Error]:', err);
  process.exit(1);
});
