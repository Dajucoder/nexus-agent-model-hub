import type { AgentDefinition } from '../types';

function safeEval(expression: string): number {
  const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
  if (sanitized !== expression) {
    throw new Error('Expression contains unsupported characters');
  }

  const fn = new Function(`"use strict"; return (${sanitized});`);
  const result = fn();
  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new Error('Expression did not resolve to a finite number');
  }

  return result;
}

export const calculatorAgent: AgentDefinition = {
  type: 'calculator',
  name: 'Calculator',
  description: 'Safely evaluate a simple math expression.',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    required: ['expression'],
    properties: {
      expression: { type: 'string' }
    }
  },
  outputSchema: {
    type: 'object',
    properties: {
      expression: { type: 'string' },
      result: { type: 'number' }
    }
  },
  async execute(input) {
    const expression = String(input.expression ?? '');
    return {
      expression,
      result: safeEval(expression)
    };
  }
};
