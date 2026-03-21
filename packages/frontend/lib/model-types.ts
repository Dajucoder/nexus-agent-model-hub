export interface ProviderInfo {
  id: string;
  name: string;
  docsUrl: string;
  apiKeyUrl: string;
  officialUrl: string;
}

export interface ModelCapabilityScore {
  reasoning: number;
  coding: number;
  math: number;
  creativeWriting: number;
  multilingual: number;
  instructionFollowing: number;
  vision: number;
  audio: number;
  toolUse: number;
}

export interface BenchmarkResult {
  name: string;
  score: number;
  unit: string;
}

export interface ModelCard {
  id: string;
  name: string;
  slug: string;
  provider: ProviderInfo;
  version: string;
  releaseDate: string;
  family: string;
  architecture: 'dense' | 'moe' | 'other';
  contextWindow: number;
  maxOutputTokens: number;
  modalities: string[];
  languages: string[];
  pricing: {
    inputPer1M: number;
    outputPer1M: number;
  };
  capabilities: ModelCapabilityScore;
  benchmarks: BenchmarkResult[];
  openSource: boolean;
  license?: string;
  description: string;
  strengths: string[];
  limitations: string[];
  useCases: string[];
  tags: string[];
  arenaScore?: number;
  arenaRank?: number;
  openRouterScore?: number;
}

export interface LeaderboardEntry {
  rank: number;
  modelId: string;
  modelName: string;
  provider: string;
  score: number;
  source: 'arena' | 'openrouter' | 'combined';
  category: string;
  updatedAt: string;
}
