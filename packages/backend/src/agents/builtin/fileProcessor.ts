import type { AgentDefinition } from '../types';

export const fileProcessorAgent: AgentDefinition = {
  type: 'file_processor',
  name: 'File Processor',
  description: 'Count words, lines, and characters from text content.',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    required: ['content'],
    properties: {
      content: { type: 'string', maxLength: 102400 }
    }
  },
  outputSchema: {
    type: 'object',
    properties: {
      wordCount: { type: 'number' },
      lineCount: { type: 'number' },
      charCount: { type: 'number' }
    }
  },
  async execute(input) {
    const content = String(input.content ?? '');
    const words = content.trim().length > 0 ? content.trim().split(/\s+/) : [];
    const lines = content.length > 0 ? content.split('\n') : [];

    return {
      wordCount: words.length,
      lineCount: lines.length,
      charCount: content.length
    };
  }
};
