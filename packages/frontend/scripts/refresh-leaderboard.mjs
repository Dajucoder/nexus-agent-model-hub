import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const snapshotPath = resolve(process.cwd(), ".data/leaderboard-snapshots.json");

function normalizeRemoteName(input) {
  return input
    .toLowerCase()
    .replace(/\bby\b.*$/g, "")
    .replace(/[^a-z0-9.+-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchModelIdFromRemoteName(input) {
  const normalized = normalizeRemoteName(input);
  const aliases = [
    ["claude sonnet 4.6", "claude-sonnet-4-20250514"],
    ["claude sonnet 4", "claude-sonnet-4-20250514"],
    ["deepseek v3.2", "deepseek-chat"],
    ["deepseek r1", "deepseek-reasoner"],
    ["gpt 4.1 mini", "gpt-4.1-mini"],
    ["gpt 4.1", "gpt-4.1"],
    ["gpt 4o", "gpt-4o"],
    ["gemini 2.5 pro", "gemini-2.5-pro"],
    ["gemini 2.5 flash", "gemini-2.5-flash"],
    ["gemini 3 flash", "gemini-2.5-flash"],
    ["o4 mini", "o4-mini"],
    ["mistral large", "mistral-large-latest"],
  ];

  for (const [alias, modelId] of aliases) {
    if (normalized.includes(alias)) {
      return modelId;
    }
  }

  return undefined;
}

function buildRemoteEntries(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const entries = [];

  for (const line of lines) {
    const match = line.match(
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

  return entries.slice(0, 10);
}

async function main() {
  const existing = JSON.parse(await readFile(snapshotPath, "utf8"));

  try {
    const response = await fetch("https://openrouter.ai/rankings", {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; NexusAgentModelHub/0.1; +https://github.com/Dajucoder/nexus-agent-model-hub)",
        accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch rankings: ${response.status}`);
    }

    const html = await response.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, "\n")
      .replace(/&nbsp;/g, " ");

    const entries = buildRemoteEntries(text);
    if (entries.length < 5) {
      throw new Error("Could not parse enough ranking rows from remote page");
    }

    existing.updatedAt = new Date().toISOString();
    existing.feeds.openrouter = {
      ...existing.feeds.openrouter,
      title: "OpenRouter Live Snapshot",
      mode: "live",
      capturedAt: new Date().toISOString(),
      importedAt: new Date().toISOString(),
      methodology:
        "Parsed from the public OpenRouter rankings page and normalized into the local model catalog.",
      note: "这个文件由刷新脚本生成，远程抓取失败时前端仍会自动回退到最近一次可用快照。",
      entries,
    };

    await writeFile(
      snapshotPath,
      `${JSON.stringify(existing, null, 2)}\n`,
      "utf8",
    );
    console.log(
      `Updated leaderboard snapshot with ${entries.length} OpenRouter entries.`,
    );
  } catch (error) {
    console.error(
      "Failed to refresh leaderboard snapshot. Keeping existing fallback file.",
    );
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 0;
  }
}

await main();
