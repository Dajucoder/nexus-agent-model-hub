import type { LeaderboardEntry, ModelCard, ProviderInfo } from './model-types';

const providers: Record<string, ProviderInfo> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    docsUrl: 'https://platform.openai.com/docs',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    officialUrl: 'https://openai.com'
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    docsUrl: 'https://docs.anthropic.com',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    officialUrl: 'https://www.anthropic.com'
  },
  google: {
    id: 'google',
    name: 'Google',
    docsUrl: 'https://ai.google.dev/docs',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    officialUrl: 'https://ai.google.dev'
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    docsUrl: 'https://platform.deepseek.com/docs',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    officialUrl: 'https://www.deepseek.com'
  }
};

export const modelCatalog: ModelCard[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    slug: 'gpt-4o',
    provider: providers.openai,
    version: '2024-08-06',
    releaseDate: '2024-05-13',
    family: 'GPT-4',
    architecture: 'dense',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    modalities: ['text', 'image', 'audio', 'code'],
    languages: ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es'],
    pricing: { inputPer1M: 2.5, outputPer1M: 10 },
    capabilities: {
      reasoning: 92,
      coding: 90,
      math: 85,
      creativeWriting: 88,
      multilingual: 90,
      instructionFollowing: 93,
      vision: 95,
      audio: 90,
      toolUse: 92
    },
    benchmarks: [
      { name: 'MMLU', score: 88.7, unit: '%' },
      { name: 'HumanEval', score: 90.2, unit: 'pass@1' },
      { name: 'MATH', score: 76.6, unit: '%' }
    ],
    openSource: false,
    description: 'OpenAI 的旗舰多模态模型，适合需要文本、图像和音频统一处理的通用工作流。',
    strengths: ['多模态能力强', '延迟较低', '指令遵循稳定', '工具调用成熟'],
    limitations: ['闭源', '高复杂推理不一定最强', '商业成本相对较高'],
    useCases: ['通用聊天', '代码生成', '图像理解', '文档分析'],
    tags: ['multimodal', 'general-purpose', 'tool-use'],
    arenaScore: 1320,
    arenaRank: 1,
    openRouterScore: 92.5
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    slug: 'claude-3-5-sonnet',
    provider: providers.anthropic,
    version: '20241022',
    releaseDate: '2024-06-20',
    family: 'Claude 3.5',
    architecture: 'dense',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    modalities: ['text', 'image', 'code'],
    languages: ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es'],
    pricing: { inputPer1M: 3, outputPer1M: 15 },
    capabilities: {
      reasoning: 95,
      coding: 94,
      math: 82,
      creativeWriting: 95,
      multilingual: 85,
      instructionFollowing: 96,
      vision: 88,
      audio: 0,
      toolUse: 94
    },
    benchmarks: [
      { name: 'MMLU', score: 88.3, unit: '%' },
      { name: 'HumanEval', score: 92, unit: 'pass@1' },
      { name: 'GPQA', score: 59.4, unit: '%' }
    ],
    openSource: false,
    description: 'Anthropic 高性能模型，偏向复杂推理、编程与长文档分析。',
    strengths: ['推理稳定', '代码能力强', '长上下文表现好', '写作质量高'],
    limitations: ['不支持音频', '闭源', '输出成本较高'],
    useCases: ['复杂分析', '代码开发', '长文档处理', '高质量写作'],
    tags: ['reasoning', 'coding', 'long-context'],
    arenaScore: 1286,
    arenaRank: 2,
    openRouterScore: 93.8
  },
  {
    id: 'gemini-2-0-flash',
    name: 'Gemini 2.0 Flash',
    slug: 'gemini-2-0-flash',
    provider: providers.google,
    version: '2.0',
    releaseDate: '2025-02-05',
    family: 'Gemini',
    architecture: 'moe',
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    modalities: ['text', 'image', 'audio', 'video', 'code'],
    languages: ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'pt'],
    pricing: { inputPer1M: 0.1, outputPer1M: 0.4 },
    capabilities: {
      reasoning: 88,
      coding: 86,
      math: 80,
      creativeWriting: 82,
      multilingual: 92,
      instructionFollowing: 88,
      vision: 93,
      audio: 90,
      toolUse: 85
    },
    benchmarks: [
      { name: 'MMLU', score: 86.2, unit: '%' },
      { name: 'HumanEval', score: 84.1, unit: 'pass@1' }
    ],
    openSource: false,
    description: 'Google 的高速多模态模型，特点是 1M 级上下文窗口与较低价格。',
    strengths: ['超长上下文', '多模态全面', '价格低', '速度快'],
    limitations: ['深度推理不如更重型模型', '输出精细度因任务而异'],
    useCases: ['超长文档处理', '多媒体理解', '成本敏感场景'],
    tags: ['long-context', 'multimodal', 'cost-effective'],
    arenaScore: 1271,
    arenaRank: 4,
    openRouterScore: 85.2
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3',
    slug: 'deepseek-v3',
    provider: providers.deepseek,
    version: '3',
    releaseDate: '2024-12-26',
    family: 'DeepSeek',
    architecture: 'moe',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    modalities: ['text', 'code'],
    languages: ['en', 'zh'],
    pricing: { inputPer1M: 0.27, outputPer1M: 1.1 },
    capabilities: {
      reasoning: 90,
      coding: 92,
      math: 90,
      creativeWriting: 80,
      multilingual: 72,
      instructionFollowing: 88,
      vision: 0,
      audio: 0,
      toolUse: 82
    },
    benchmarks: [
      { name: 'MMLU', score: 87.1, unit: '%' },
      { name: 'HumanEval', score: 82.6, unit: 'pass@1' },
      { name: 'MATH', score: 90.2, unit: '%' }
    ],
    openSource: true,
    license: 'MIT',
    description: '深度求索的高性能开源 MoE 模型，在数学和代码任务中表现尤其亮眼。',
    strengths: ['开源', '数学推理强', '代码能力强', '价格低'],
    limitations: ['多模态不足', '多语言覆盖有限'],
    useCases: ['开源部署', '数学研究', '代码生成', '成本优化'],
    tags: ['open-source', 'math', 'coding', 'moe'],
    arenaScore: 1315,
    arenaRank: 3,
    openRouterScore: 90.5
  }
];

export const providerConfigs = [
  {
    id: 'openai',
    name: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    docsUrl: providers.openai.docsUrl,
    keyUrl: providers.openai.apiKeyUrl
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    docsUrl: providers.anthropic.docsUrl,
    keyUrl: providers.anthropic.apiKeyUrl
  },
  {
    id: 'google',
    name: 'Google AI',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    docsUrl: providers.google.docsUrl,
    keyUrl: providers.google.apiKeyUrl
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    docsUrl: providers.deepseek.docsUrl,
    keyUrl: providers.deepseek.apiKeyUrl
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    docsUrl: 'https://openrouter.ai/docs',
    keyUrl: 'https://openrouter.ai/keys'
  }
] as const;

export function getModelBySlug(slug: string): ModelCard | undefined {
  return modelCatalog.find((model) => model.slug === slug);
}

export function searchModels(query: string, provider = 'all'): ModelCard[] {
  const normalized = query.trim().toLowerCase();
  return modelCatalog.filter((model) => {
    const providerMatch = provider === 'all' || model.provider.id === provider;
    const queryMatch =
      normalized.length === 0 ||
      model.name.toLowerCase().includes(normalized) ||
      model.description.toLowerCase().includes(normalized) ||
      model.tags.some((tag) => tag.toLowerCase().includes(normalized));
    return providerMatch && queryMatch;
  });
}

export function leaderboardData(): {
  arena: LeaderboardEntry[];
  openrouter: LeaderboardEntry[];
  combined: LeaderboardEntry[];
} {
  const updatedAt = '2026-03-21';
  const arena = modelCatalog
    .filter((model) => model.arenaScore)
    .sort((left, right) => (right.arenaScore ?? 0) - (left.arenaScore ?? 0))
    .map((model, index) => ({
      rank: index + 1,
      modelId: model.id,
      modelName: model.name,
      provider: model.provider.id,
      score: model.arenaScore ?? 0,
      source: 'arena' as const,
      category: 'overall',
      updatedAt
    }));

  const openrouter = modelCatalog
    .filter((model) => model.openRouterScore)
    .sort((left, right) => (right.openRouterScore ?? 0) - (left.openRouterScore ?? 0))
    .map((model, index) => ({
      rank: index + 1,
      modelId: model.id,
      modelName: model.name,
      provider: model.provider.id,
      score: model.openRouterScore ?? 0,
      source: 'openrouter' as const,
      category: 'blended',
      updatedAt
    }));

  const combined = modelCatalog
    .map((model) => ({
      ...model,
      combinedScore: ((model.arenaScore ?? 0) / 20) + (model.openRouterScore ?? 0)
    }))
    .sort((left, right) => right.combinedScore - left.combinedScore)
    .map((model, index) => ({
      rank: index + 1,
      modelId: model.id,
      modelName: model.name,
      provider: model.provider.id,
      score: Number(model.combinedScore.toFixed(1)),
      source: 'combined' as const,
      category: 'weighted',
      updatedAt
    }));

  return { arena, openrouter, combined };
}
