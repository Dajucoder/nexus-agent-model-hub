export interface DashboardOverview {
  me: {
    id: string;
    email: string;
    displayName: string;
    locale: string;
    role: string;
    lastLoginAt: string | null;
  } | null;
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    _count: {
      users: number;
      agentRuns: number;
    };
  } | null;
  platform: {
    app: {
      name: string;
      version: string;
      environment: string;
    };
    agentRuntime: {
      builtinAgents: Array<{
        type: string;
        name: string;
        description: string;
      }>;
      timeoutMs: number;
      concurrencyLimit: number;
    };
  } | null;
  agentRuns: Array<{
    id: string;
    agentType: string;
    status: string;
    duration: number | null;
    createdAt: string;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    resource: string | null;
    createdAt: string;
    user?: {
      email?: string | null;
      displayName?: string | null;
    } | null;
  }>;
}
