import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { modelCatalog } from "./model-data";

export type RemoteModelSnapshot = {
  fetchedAt: string;
  source: string;
  totalModels: number;
  featured: Array<{
    id: string;
    name: string;
    provider: string;
    slug: string;
    contextLength: number;
    promptPricePer1M: number | null;
    completionPricePer1M: number | null;
    modality: string;
  }>;
};

export type RemoteCoverageItem = RemoteModelSnapshot["featured"][number] & {
  collected: boolean;
  preview: boolean;
  recommended: boolean;
  free: boolean;
  stage: "collected" | "recommended" | "preview" | "free" | "watchlist";
  providerLabel: string;
};

const snapshotPath = join(process.cwd(), ".data/openrouter-models.json");

export async function getRemoteModelSnapshot(): Promise<RemoteModelSnapshot | null> {
  if (!existsSync(snapshotPath)) {
    return null;
  }

  try {
    const content = await readFile(snapshotPath, "utf8");
    return JSON.parse(content) as RemoteModelSnapshot;
  } catch {
    return null;
  }
}

export async function getRemoteModelCoverage() {
  const snapshot = await getRemoteModelSnapshot();
  if (!snapshot) {
    return null;
  }

  const curatedIds = new Set(modelCatalog.map((model) => model.id));
  const curatedNames = new Set(
    modelCatalog.map((model) => model.name.toLowerCase()),
  );

  const items: RemoteCoverageItem[] = snapshot.featured.map((item) => {
    const normalizedName = item.name.toLowerCase();
    const collected =
      curatedIds.has(item.id) ||
      [...curatedNames].some(
        (name) =>
          normalizedName.includes(name) || name.includes(normalizedName),
      );

    const preview =
      /preview|beta|free/i.test(item.name) ||
      /preview|beta|free/i.test(item.id);
    const free =
      /free/i.test(item.name) ||
      /free/i.test(item.id) ||
      ((item.promptPricePer1M ?? 1) === 0 &&
        (item.completionPricePer1M ?? 1) === 0);
    const recommended =
      !collected &&
      !preview &&
      (item.contextLength >= 200000 ||
        (item.promptPricePer1M ?? Infinity) <= 1);

    const providerLabel = item.name.includes(":")
      ? item.name.split(":")[0].trim()
      : item.provider
          .split(/[-_/]+/)
          .map((segment) =>
            segment ? segment[0].toUpperCase() + segment.slice(1) : segment,
          )
          .join(" ");

    const stage = collected
      ? "collected"
      : recommended
        ? "recommended"
        : preview
          ? "preview"
          : free
            ? "free"
            : "watchlist";

    return {
      ...item,
      collected,
      preview,
      free,
      recommended,
      stage,
      providerLabel,
    };
  });

  return {
    snapshot,
    items,
    buckets: {
      collected: items.filter((item) => item.stage === "collected"),
      recommended: items.filter((item) => item.stage === "recommended"),
      preview: items.filter((item) => item.stage === "preview"),
      free: items.filter((item) => item.stage === "free"),
      watchlist: items.filter((item) => item.stage === "watchlist"),
    },
    collectedCount: items.filter((item) => item.collected).length,
    pendingCount: items.filter((item) => !item.collected).length,
    previewCount: items.filter((item) => item.preview).length,
    freeCount: items.filter((item) => item.free).length,
    recommendedCount: items.filter((item) => item.recommended).length,
  };
}
