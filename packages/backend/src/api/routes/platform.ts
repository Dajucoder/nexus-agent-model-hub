import { Router } from 'express';
import { agentRegistry } from '../../agents/registry';
import { config } from '../../config';

export const platformRouter = Router();

platformRouter.get('/summary', (_req, res) => {
  res.json({
    app: {
      name: config.appName,
      version: config.appVersion,
      environment: config.nodeEnv
    },
    auth: {
      strategy: 'jwt-access-token + refresh-token',
      accessTokenExpiresIn: config.jwtExpiresIn,
      refreshTokenExpiresIn: config.jwtRefreshExpiresIn,
      totpSupported: true,
      apiKeySupported: true
    },
    agentRuntime: {
      timeoutMs: config.agentTimeoutMs,
      maxRetries: config.agentMaxRetries,
      concurrencyLimit: config.agentConcurrencyLimit,
      builtinAgents: agentRegistry.list().map((agent) => ({
        type: agent.type,
        name: agent.name,
        description: agent.description
      })),
      httpAllowedHosts: config.agentHttpAllowedHostList
    },
    frontend: {
      locales: ['zh-CN', 'en-US'],
      sessionStorage: 'browser-local-storage-bootstrap',
      productionRecommendation: 'Use HttpOnly cookies, a BFF, or another server-managed browser session strategy in production.'
    },
    deployment: {
      dockerCompose: true,
      kubernetes: true,
      helm: true
    },
    cors: {
      allowedOrigins: config.corsOriginList
    },
    docs: {
      inApp: '/docs',
      openApi: '/docs/api/openapi.yaml'
    },
    timestamp: new Date().toISOString()
  });
});
