import { config } from '../config';
import type { AgentDefinition } from './types';
import { calculatorAgent } from './builtin/calculator';
import { echoAgent } from './builtin/echo';
import { fileProcessorAgent } from './builtin/fileProcessor';
import { createHttpToolAgent } from './builtin/httpTool';

class AgentRegistry {
  private readonly agents = new Map<string, AgentDefinition>();

  register(agent: AgentDefinition): void {
    if (this.agents.has(agent.type)) {
      throw new Error(`Agent ${agent.type} already registered`);
    }

    this.agents.set(agent.type, agent);
  }

  get(type: string): AgentDefinition | undefined {
    return this.agents.get(type);
  }

  list(): AgentDefinition[] {
    return [...this.agents.values()];
  }
}

export const agentRegistry = new AgentRegistry();

agentRegistry.register(echoAgent);
agentRegistry.register(calculatorAgent);
agentRegistry.register(fileProcessorAgent);
agentRegistry.register(createHttpToolAgent(config.agentHttpAllowedHostList));
