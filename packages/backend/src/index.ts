import { loadExternalAgentPlugins } from './agents/loader';
import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';

async function bootstrap() {
  await loadExternalAgentPlugins();
  const app = createApp();
  app.listen(config.port, () => {
    logger.info({ port: config.port }, 'Nexus Agent Model Hub backend listening');
  });
}

bootstrap().catch((error) => {
  logger.error({ error }, 'Failed to bootstrap backend');
  process.exit(1);
});
