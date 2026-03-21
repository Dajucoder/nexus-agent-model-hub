import { describe, expect, it } from 'vitest';
import { calculatorAgent } from '../src/agents/builtin/calculator';

describe('calculator agent', () => {
  it('evaluates valid expressions', async () => {
    const result = await calculatorAgent.execute({ expression: '(2 + 3) * 4' }, {
      tenantId: 'tenant_1',
      actorType: 'user',
      userId: 'user_1',
      runId: 'run_1'
    });

    expect(result).toEqual({
      expression: '(2 + 3) * 4',
      result: 20
    });
  });
});
