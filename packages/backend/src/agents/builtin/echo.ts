import type { AgentDefinition } from '../types';

export const echoAgent: AgentDefinition = {
  type: 'echo',
  name: 'Echo',
  description: 'Return the provided message and request context.',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    required: ['message'],
    properties: {
      message: { type: 'string' }
    }
  },
  outputSchema: {
    type: 'object',
    properties: {
      message: { type: 'string' },
      context: { type: 'object' },
      timestamp: { type: 'string' }
    }
  },
  async execute(input, context) {
    return {
      message: String(input.message ?? ''),
      context,
      timestamp: new Date().toISOString()
    };
  }
};
