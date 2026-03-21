export default {
  type: 'reverse_text',
  name: 'Reverse Text',
  description: 'Returns the reversed form of the provided text.',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    required: ['text'],
    properties: {
      text: { type: 'string' }
    }
  },
  outputSchema: {
    type: 'object',
    properties: {
      original: { type: 'string' },
      reversed: { type: 'string' }
    }
  },
  async execute(input) {
    const original = String(input.text ?? '');
    return {
      original,
      reversed: original.split('').reverse().join('')
    };
  }
};
