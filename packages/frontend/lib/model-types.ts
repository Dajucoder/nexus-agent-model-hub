export interface ProviderInfo {
  id: string;
  name: string;
  docsUrl: string;
  apiKeyUrl: string;
  officialUrl: string;
  defaultBaseUrl?: string;
  chatApiStyle?: "openai-compatible" | "anthropic" | "google" | "none";
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
  architecture: "dense" | "moe" | "other";
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
}

export interface LeaderboardEntry {
  rank: number;
  modelId: string;
  modelSlug: string;
  modelName: string;
  providerId: string;
  provider: string;
  score: number;
  source: "arena" | "openrouter" | "combined";
  category: string;
  contextWindow: number;
  inputPrice: number;
  outputPrice: number;
  openSource: boolean;
  reasoningScore: number;
  codingScore: number;
  multimodalScore: number;
  updatedAt: string;
}

export type LeaderboardFeedId = "arena" | "openrouter" | "combined";

export interface LeaderboardFeed {
  id: LeaderboardFeedId;
  title: string;
  mode: "snapshot" | "live";
  capturedAt: string;
  importedAt: string;
  coverage: number;
  methodology: string;
  note: string;
  entries: LeaderboardEntry[];
}

export interface LeaderboardBundle {
  updatedAt: string;
  feeds: Record<LeaderboardFeedId, LeaderboardFeed>;
  diagnostics?: {
    openrouter: {
      source: "live" | "snapshot";
      status: "ok" | "fallback";
      message: string;
    };
  };
}
