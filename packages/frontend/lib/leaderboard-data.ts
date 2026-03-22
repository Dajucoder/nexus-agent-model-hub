import { modelCatalog } from './model-data';
import type { LeaderboardBundle, LeaderboardEntry, LeaderboardFeed, LeaderboardFeedId } from './model-types';

type RawFeedEntry = {
  modelId: string;
  score: number;
  category: string;
};

type RawFeed = Omit<LeaderboardFeed, 'entries' | 'coverage'> & {
  entries: RawFeedEntry[];
};

const rawFeeds: Record<Exclude<LeaderboardFeedId, 'combined'>, RawFeed> = {
  arena: {
    id: 'arena',
    title: 'Arena Snapshot',
    mode: 'snapshot',
    capturedAt: '2026-03-20T00:00:00.000Z',
    importedAt: '2026-03-22T08:30:00.000Z',
    methodology: 'Versioned snapshot bundle imported into the repo for deterministic UI and deployment.',
    note: '当前环境使用仓库内快照，不是实时拉取。生产环境建议由定时任务或后台导入流程更新。',
    entries: [
      { modelId: 'claude-sonnet-4-20250514', score: 1406, category: 'overall' },
      { modelId: 'gpt-4.1', score: 1396, category: 'overall' },
      { modelId: 'deepseek-reasoner', score: 1384, category: 'reasoning' },
      { modelId: 'gpt-4o', score: 1378, category: 'multimodal' },
      { modelId: 'gemini-2.5-pro', score: 1372, category: 'multimodal' },
      { modelId: 'claude-3-5-sonnet-20241022', score: 1362, category: 'overall' },
      { modelId: 'deepseek-chat', score: 1354, category: 'open-source' },
      { modelId: 'o4-mini', score: 1349, category: 'reasoning' },
      { modelId: 'gemini-2.5-flash', score: 1342, category: 'speed' },
      { modelId: 'mistral-large-latest', score: 1331, category: 'enterprise' }
    ]
  },
  openrouter: {
    id: 'openrouter',
    title: 'OpenRouter Snapshot',
    mode: 'snapshot',
    capturedAt: '2026-03-19T00:00:00.000Z',
    importedAt: '2026-03-22T08:30:00.000Z',
    methodology: 'Curated score snapshot designed for deployment environments where upstream ranking APIs are not yet wired.',
    note: '这个榜单目前是版本化导入快照，优点是稳定可部署，缺点是不代表实时社区波动。',
    entries: [
      { modelId: 'gpt-4.1', score: 95.4, category: 'overall' },
      { modelId: 'claude-sonnet-4-20250514', score: 94.7, category: 'overall' },
      { modelId: 'deepseek-reasoner', score: 93.9, category: 'reasoning' },
      { modelId: 'deepseek-chat', score: 92.6, category: 'open-source' },
      { modelId: 'gpt-4o', score: 92.1, category: 'multimodal' },
      { modelId: 'claude-3-5-sonnet-20241022', score: 91.8, category: 'overall' },
      { modelId: 'gemini-2.5-pro', score: 90.9, category: 'multimodal' },
      { modelId: 'mistral-large-latest', score: 88.3, category: 'enterprise' },
      { modelId: 'gemini-2.5-flash', score: 87.6, category: 'speed' },
      { modelId: 'gpt-4.1-mini', score: 86.8, category: 'efficient' }
    ]
  }
};

function lookupModel(modelId: string) {
  return modelCatalog.find((model) => model.id === modelId);
}

function materializeFeed(rawFeed: RawFeed): LeaderboardFeed {
  const entries: LeaderboardEntry[] = rawFeed.entries
    .map((entry) => {
      const model = lookupModel(entry.modelId);
      if (!model) {
        return null;
      }

      return {
        rank: 0,
        modelId: model.id,
        modelSlug: model.slug,
        modelName: model.name,
        provider: model.provider.name,
        score: entry.score,
        source: rawFeed.id,
        category: entry.category,
        updatedAt: rawFeed.importedAt
      };
    })
    .filter((entry): entry is LeaderboardEntry => Boolean(entry))
    .sort((left, right) => right.score - left.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

  return {
    ...rawFeed,
    coverage: entries.length,
    entries
  };
}

function buildCombinedFeed(arenaFeed: LeaderboardFeed, openrouterFeed: LeaderboardFeed): LeaderboardFeed {
  const arenaMap = new Map(arenaFeed.entries.map((entry) => [entry.modelId, entry.score]));
  const openrouterMap = new Map(openrouterFeed.entries.map((entry) => [entry.modelId, entry.score]));
  const arenaScores = [...arenaMap.values()];
  const minArena = Math.min(...arenaScores);
  const maxArena = Math.max(...arenaScores);
  const updatedAt = openrouterFeed.importedAt > arenaFeed.importedAt ? openrouterFeed.importedAt : arenaFeed.importedAt;

  type CombinedSeedEntry = Omit<LeaderboardEntry, 'rank'> & { source: 'combined' };

  const combinedCandidates: Array<CombinedSeedEntry | null> = [...new Set([...arenaMap.keys(), ...openrouterMap.keys()])]
    .map((modelId) => {
      const model = lookupModel(modelId);
      if (!model) {
        return null;
      }

      const arenaScore = arenaMap.get(modelId);
      const openrouterScore = openrouterMap.get(modelId);
      const normalizedArena =
        arenaScore === undefined || maxArena === minArena ? 0 : ((arenaScore - minArena) / (maxArena - minArena)) * 100;
      const combinedScore = Number((((normalizedArena * 0.55) + ((openrouterScore ?? 0) * 0.45))).toFixed(1));

      return {
        modelId: model.id,
        modelSlug: model.slug,
        modelName: model.name,
        provider: model.provider.name,
        score: combinedScore,
        source: 'combined' as const,
        category: 'weighted snapshot',
        updatedAt
      };
    });

  const entries: LeaderboardEntry[] = combinedCandidates
    .filter((entry): entry is CombinedSeedEntry => entry !== null)
    .sort((left, right) => right.score - left.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

  return {
    id: 'combined',
    title: 'Combined Snapshot',
    mode: 'snapshot',
    capturedAt: arenaFeed.capturedAt > openrouterFeed.capturedAt ? arenaFeed.capturedAt : openrouterFeed.capturedAt,
    importedAt: updatedAt,
    coverage: entries.length,
    methodology: '55% normalized Arena score + 45% OpenRouter snapshot score, merged inside the repository for deterministic comparison.',
    note: 'Combined 视图不是第三方原始榜单，而是仓库内的加权快照，用于部署后的稳定展示与选型参考。',
    entries
  };
}

export function getLeaderboardBundle(): LeaderboardBundle {
  const arenaFeed = materializeFeed(rawFeeds.arena);
  const openrouterFeed = materializeFeed(rawFeeds.openrouter);
  const combinedFeed = buildCombinedFeed(arenaFeed, openrouterFeed);

  return {
    updatedAt: combinedFeed.importedAt,
    feeds: {
      arena: arenaFeed,
      openrouter: openrouterFeed,
      combined: combinedFeed
    }
  };
}
