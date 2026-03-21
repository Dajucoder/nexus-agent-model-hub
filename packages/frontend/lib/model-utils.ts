export const capabilityLabels: Record<string, string> = {
  reasoning: '推理',
  coding: '代码',
  math: '数学',
  creativeWriting: '创作',
  multilingual: '多语言',
  instructionFollowing: '指令遵循',
  vision: '视觉',
  audio: '音频',
  toolUse: '工具调用'
};

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPrice(value: number): string {
  return `$${value.toFixed(value < 1 ? 2 : 1)}`;
}

export function scoreColor(score: number): string {
  if (score >= 90) return 'score-high';
  if (score >= 75) return 'score-medium';
  return 'score-low';
}
