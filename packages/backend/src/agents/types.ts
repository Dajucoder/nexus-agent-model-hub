export interface AgentContext {
  tenantId: string;
  userId?: string;
  actorType: 'user' | 'apiKey';
  runId: string;
}

export interface AgentDefinition {
  type: string;
  name: string;
  description: string;
  version: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  execute(input: Record<string, unknown>, context: AgentContext): Promise<unknown>;
}
