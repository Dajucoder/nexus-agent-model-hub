import type { AgentDefinition } from '../types';

const allowedMethods = ['GET', 'POST'] as const;

export function createHttpToolAgent(allowedHosts: string[]): AgentDefinition {
  return {
    type: 'http_tool',
    name: 'HTTP Tool',
    description: 'Make limited outbound HTTP requests to an allowlist.',
    version: '1.0.0',
    inputSchema: {
      type: 'object',
      required: ['url', 'method'],
      properties: {
        url: { type: 'string' },
        method: { type: 'string', enum: allowedMethods },
        headers: { type: 'object' },
        body: { type: 'object' }
      }
    },
    outputSchema: {
      type: 'object',
      properties: {
        status: { type: 'number' },
        headers: { type: 'object' },
        body: {}
      }
    },
    async execute(input) {
      const url = new URL(String(input.url ?? ''));
      if (!allowedHosts.includes(url.hostname)) {
        throw new Error(`Host ${url.hostname} is not allowlisted`);
      }

      const method = String(input.method ?? 'GET').toUpperCase();
      if (!allowedMethods.includes(method as (typeof allowedMethods)[number])) {
        throw new Error('Unsupported HTTP method');
      }

      const response = await fetch(url, {
        method,
        headers: {
          'content-type': 'application/json',
          'user-agent': 'Nexus-Agent/0.2.0',
          ...((input.headers as Record<string, string> | undefined) ?? {})
        },
        body: input.body ? JSON.stringify(input.body) : undefined
      });

      const text = await response.text();
      let body: unknown = text;
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }

      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body
      };
    }
  };
}
