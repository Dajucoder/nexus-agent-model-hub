import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { modelCatalog } from "./model-data";
import type {
  LeaderboardBundle,
  LeaderboardEntry,
  LeaderboardFeed,
  LeaderboardFeedId,
} from "./model-types";

type RawFeedEntry = {
  modelId: string;
  score: number;
  category: string;
};

type RawFeed = Omit<LeaderboardFeed, "entries" | "coverage"> & {
  entries: RawFeedEntry[];
};

type RawBundle = {
  updatedAt: string;
  feeds: Record<Exclude<LeaderboardFeedId, "combined">, RawFeed>;
};

const snapshotPath = join(process.cwd(), ".data/leaderboard-snapshots.json");

function lookupModel(modelId: string) {
  return modelCatalog.find((model) => model.id === modelId);
}

function normalizeRemoteName(input: string) {
  return input
    .toLowerCase()
    .replace(/\bby\b.*$/g, "")
    .replace(/\bpreview\b/g, "")
    .replace(/\bfree\b/g, "")
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9.+-]+/g, " ")
    .replace(/\bmodel\b/g, " ")
    .replace(/\bnew\b/g, " ")
    .replace(/\bopenrouter\b/g, " ")
    .replace(/\bgoogle\b/g, " ")
    .replace(/\banthropic\b/g, " ")
    .replace(/\bopenai\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchModelIdFromRemoteName(input: string) {
  const normalized = normalizeRemoteName(input);
  const aliases: Array<[string, string]> = [
    ["claude sonnet 4.6", "claude-sonnet-4-20250514"],
    ["claude sonnet 4", "claude-sonnet-4-20250514"],
    ["claude opus 4.6", "claude-sonnet-4-20250514"],
    ["deepseek v3.2", "deepseek-chat"],
    ["deepseek v3", "deepseek-chat"],
    ["deepseek r1", "deepseek-reasoner"],
    ["deepseek reasoner", "deepseek-reasoner"],
    ["gemini 2.5 flash", "gemini-2.5-flash"],
    ["gemini 3 flash", "gemini-2.5-flash"],
    ["gemini 2.5 pro", "gemini-2.5-pro"],
    ["gpt 4.1 mini", "gpt-4.1-mini"],
    ["gpt 4.1", "gpt-4.1"],
    ["gpt 4o", "gpt-4o"],
    ["o4 mini", "o4-mini"],
    ["mistral large", "mistral-large-latest"],
    ["mistral small", "mistral-small-latest"],
  ];

  for (const [alias, modelId] of aliases) {
    if (normalized.includes(alias)) {
      return modelId;
    }
  }

  return undefined;
}

function buildRemoteOpenRouterFeed(lines: string[]): RawFeed | null {
  const entries: RawFeedEntry[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(
      /^(\d+)\.\s+(.+?)\s+by\s+.+?(\d+(?:\.\d+)?)(?:T|B|M)\s+tokens/i,
    );
    if (!match) {
      continue;
    }

    const modelId = matchModelIdFromRemoteName(match[2]);
    if (!modelId) {
      continue;
    }

    const score = Math.max(
      1,
      110 - Number(match[1]) * 2 + Math.min(Number(match[3]), 9.9),
    );
    entries.push({
      modelId,
      score: Number(score.toFixed(1)),
      category: "usage",
    });
  }

  if (entries.length < 5) {
    return null;
  }

  return {
    id: "openrouter",
    title: "OpenRouter Live Snapshot",
    mode: "live",
    capturedAt: new Date().toISOString(),
    importedAt: new Date().toISOString(),
    methodology:
      "Parsed from the public OpenRouter rankings page and mapped onto the local model catalog, with repository snapshot fallback when parsing fails.",
    note: "该视图优先尝试抓取公开榜单页面；若网络、反爬或结构变化导致失败，会自动退回仓库内快照。",
    entries: entries.slice(0, 10),
  };
}

async function loadSnapshotBundle(): Promise<RawBundle> {
  const content = await readFile(snapshotPath, "utf8");
  return JSON.parse(content) as RawBundle;
}

async function fetchOpenRouterFeed(): Promise<RawFeed | null> {
  try {
    const response = await fetch("https://openrouter.ai/rankings", {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; NexusAgentModelHub/0.1; +https://github.com/Dajucoder/nexus-agent-model-hub)",
        accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, "\n")
      .replace(/&nbsp;/g, " ");
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    return buildRemoteOpenRouterFeed(lines);
  } catch {
    return null;
  }
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
        providerId: model.provider.id,
        provider: model.provider.name,
        score: entry.score,
        source: rawFeed.id,
        category: entry.category,
        contextWindow: model.contextWindow,
        inputPrice: model.pricing.inputPer1M,
        outputPrice: model.pricing.outputPer1M,
        openSource: model.openSource,
        reasoningScore: model.capabilities.reasoning,
        codingScore: model.capabilities.coding,
        multimodalScore: Math.round(
          (model.capabilities.vision +
            model.capabilities.audio +
            model.capabilities.toolUse) /
            3,
        ),
        updatedAt: rawFeed.importedAt,
      };
    })
    .filter((entry): entry is LeaderboardEntry => Boolean(entry))
    .sort((left, right) => right.score - left.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return {
    ...rawFeed,
    coverage: entries.length,
    entries,
  };
}

function buildCombinedFeed(
  arenaFeed: LeaderboardFeed,
  openrouterFeed: LeaderboardFeed,
): LeaderboardFeed {
  const arenaMap = new Map(
    arenaFeed.entries.map((entry) => [entry.modelId, entry.score]),
  );
  const openrouterMap = new Map(
    openrouterFeed.entries.map((entry) => [entry.modelId, entry.score]),
  );
  const arenaScores = [...arenaMap.values()];
  const minArena = Math.min(...arenaScores);
  const maxArena = Math.max(...arenaScores);
  const updatedAt =
    openrouterFeed.importedAt > arenaFeed.importedAt
      ? openrouterFeed.importedAt
      : arenaFeed.importedAt;

  type CombinedSeedEntry = Omit<LeaderboardEntry, "rank"> & {
    source: "combined";
  };

  const combinedCandidates: Array<CombinedSeedEntry | null> = [
    ...new Set([...arenaMap.keys(), ...openrouterMap.keys()]),
  ].map((modelId) => {
    const model = lookupModel(modelId);
    if (!model) {
      return null;
    }

    const arenaScore = arenaMap.get(modelId);
    const openrouterScore = openrouterMap.get(modelId);
    const normalizedArena =
      arenaScore === undefined || maxArena === minArena
        ? 0
        : ((arenaScore - minArena) / (maxArena - minArena)) * 100;
    const combinedScore = Number(
      (normalizedArena * 0.55 + (openrouterScore ?? 0) * 0.45).toFixed(1),
    );

    return {
      modelId: model.id,
      modelSlug: model.slug,
      modelName: model.name,
      providerId: model.provider.id,
      provider: model.provider.name,
      score: combinedScore,
      source: "combined" as const,
      category: "weighted snapshot",
      contextWindow: model.contextWindow,
      inputPrice: model.pricing.inputPer1M,
      outputPrice: model.pricing.outputPer1M,
      openSource: model.openSource,
      reasoningScore: model.capabilities.reasoning,
      codingScore: model.capabilities.coding,
      multimodalScore: Math.round(
        (model.capabilities.vision +
          model.capabilities.audio +
          model.capabilities.toolUse) /
          3,
      ),
      updatedAt,
    };
  });

  const entries: LeaderboardEntry[] = combinedCandidates
    .filter((entry): entry is CombinedSeedEntry => entry !== null)
    .sort((left, right) => right.score - left.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return {
    id: "combined",
    title: "Combined Snapshot",
    mode: openrouterFeed.mode === "live" ? "live" : "snapshot",
    capturedAt:
      arenaFeed.capturedAt > openrouterFeed.capturedAt
        ? arenaFeed.capturedAt
        : openrouterFeed.capturedAt,
    importedAt: updatedAt,
    coverage: entries.length,
    methodology:
      "55% normalized Arena score + 45% OpenRouter score. If OpenRouter live crawling fails, the repository snapshot remains the fallback source.",
    note: "Combined 视图不是第三方原始榜单，而是仓库内融合视图，用于稳定展示、自动摘要和模型选型。",
    entries,
  };
}

export async function getLeaderboardBundle(): Promise<LeaderboardBundle> {
  const snapshotBundle = await loadSnapshotBundle();
  const remoteOpenRouter = await fetchOpenRouterFeed();

  const arenaFeed = materializeFeed(snapshotBundle.feeds.arena);
  const openrouterFeed = materializeFeed(
    remoteOpenRouter ?? snapshotBundle.feeds.openrouter,
  );
  const combinedFeed = buildCombinedFeed(arenaFeed, openrouterFeed);

  return {
    updatedAt: combinedFeed.importedAt,
    feeds: {
      arena: arenaFeed,
      openrouter: openrouterFeed,
      combined: combinedFeed,
    },
  };
}

export function getLeaderboardMetadata(bundle: LeaderboardBundle) {
  const allEntries = Object.values(bundle.feeds).flatMap(
    (feed) => feed.entries,
  );
  const providerCount = new Set(allEntries.map((entry) => entry.providerId))
    .size;
  const openSourceCount = allEntries.filter((entry) => entry.openSource).length;

  return {
    providerCount,
    openSourceCount,
    totalEntries: allEntries.length,
  };
}
