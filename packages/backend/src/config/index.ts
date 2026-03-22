import { z } from "zod";

const configSchema = z.object({
  appName: z.string().default("Nexus Agent Model Hub"),
  appVersion: z.string().default("0.2.0"),
  nodeEnv: z.enum(["development", "production", "test"]).default("development"),
  port: z.coerce.number().default(4000),
  databaseUrl: z
    .string()
    .default(
      "postgresql://nexus:nexus_secret@localhost:5432/nexus_agent_model_hub",
    ),
  redisUrl: z.string().default("redis://localhost:6379"),
  jwtSecret: z
    .string()
    .min(32)
    .default(
      "change-me-to-a-random-string-at-least-64-characters-long-1234567890",
    ),
  jwtRefreshSecret: z
    .string()
    .min(32)
    .default("change-me-to-another-random-string-at-least-64-characters-long"),
  jwtExpiresIn: z.string().default("15m"),
  jwtRefreshExpiresIn: z.string().default("7d"),
  bcryptRounds: z.coerce.number().default(12),
  corsOrigin: z.string().default("http://localhost:3000"),
  logLevel: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  logFormat: z.enum(["json", "pretty"]).default("pretty"),
  agentTimeoutMs: z.coerce.number().default(30000),
  agentMaxRetries: z.coerce.number().default(2),
  agentConcurrencyLimit: z.coerce.number().default(8),
  agentPluginPaths: z.string().default(""),
  agentHttpAllowedHosts: z.string().default("api.github.com,httpbin.org"),
  rateLimitWindowMs: z.coerce.number().default(15 * 60 * 1000),
  rateLimitMax: z.coerce.number().default(200),
  authRateLimitMax: z.coerce.number().default(20),
  agentRateLimitWindowMs: z.coerce.number().default(60 * 1000),
  agentRateLimitMax: z.coerce.number().default(30),
});

const parsed = configSchema.parse({
  appName: process.env.APP_NAME,
  appVersion: process.env.APP_VERSION,
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
  agentHttpAllowedHosts: process.env.AGENT_HTTP_ALLOWED_HOSTS,
  rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: process.env.RATE_LIMIT_MAX,
  authRateLimitMax: process.env.AUTH_RATE_LIMIT_MAX,
  agentRateLimitWindowMs: process.env.AGENT_RATE_LIMIT_WINDOW_MS,
  agentRateLimitMax: process.env.AGENT_RATE_LIMIT_MAX,
});

export const config = {
  ...parsed,
  corsOriginList: parsed.corsOrigin
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean),
  agentPluginPathList: parsed.agentPluginPaths
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean),
  agentHttpAllowedHostList: parsed.agentHttpAllowedHosts
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean),
};
