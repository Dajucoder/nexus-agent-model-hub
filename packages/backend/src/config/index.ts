import { z } from 'zod';

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(4000),
  databaseUrl: z.string().default('postgresql://nexus:nexus_secret@localhost:5432/nexus_agent_model_hub'),
  redisUrl: z.string().default('redis://localhost:6379'),
  jwtSecret: z.string().min(32).default('change-me-to-a-random-string-at-least-64-characters-long-1234567890'),
  jwtRefreshSecret: z.string().min(32).default('change-me-to-another-random-string-at-least-64-characters-long'),
  jwtExpiresIn: z.string().default('15m'),
  jwtRefreshExpiresIn: z.string().default('7d'),
  bcryptRounds: z.coerce.number().default(12),
  corsOrigin: z.string().default('http://localhost:3000'),
  logLevel: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  logFormat: z.enum(['json', 'pretty']).default('pretty'),
  agentTimeoutMs: z.coerce.number().default(30000),
  agentMaxRetries: z.coerce.number().default(2),
  agentConcurrencyLimit: z.coerce.number().default(8),
  agentPluginPaths: z.string().default(''),
  agentHttpAllowedHosts: z.string().default('api.github.com,httpbin.org')
});

const parsed = configSchema.parse({
  nodeEnv: process.env.NODE_ENV,
  port: process.env.APP_PORT,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  bcryptRounds: process.env.BCRYPT_ROUNDS,
  corsOrigin: process.env.CORS_ORIGIN,
  logLevel: process.env.LOG_LEVEL,
  logFormat: process.env.LOG_FORMAT,
  agentTimeoutMs: process.env.AGENT_TIMEOUT_MS,
  agentMaxRetries: process.env.AGENT_MAX_RETRIES,
  agentConcurrencyLimit: process.env.AGENT_CONCURRENCY_LIMIT,
  agentPluginPaths: process.env.AGENT_PLUGIN_PATHS,
  agentHttpAllowedHosts: process.env.AGENT_HTTP_ALLOWED_HOSTS
});

export const config = {
  ...parsed,
  agentPluginPathList: parsed.agentPluginPaths
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean),
  agentHttpAllowedHostList: parsed.agentHttpAllowedHosts
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
};
