import { pathToFileURL } from 'node:url';
import type { AgentDefinition } from './types';
import { agentRegistry } from './registry';
import { config } from '../config';
import { logger } from '../utils/logger';

export async function loadExternalAgentPlugins(): Promise<void> {
  for (const pluginPath of config.agentPluginPathList) {
    try {
      const loaded = await import(pathToFileURL(pluginPath).href);
      const agent = loaded.default as AgentDefinition | undefined;
      if (!agent) {
        logger.warn({ pluginPath }, 'Skipping plugin without default export');
        continue;
      }

      agentRegistry.register(agent);
      logger.info({ pluginPath, type: agent.type }, 'Loaded external agent plugin');
    } catch (error) {
      logger.error({ error, pluginPath }, 'Failed to load agent plugin');
    }
  }
}
