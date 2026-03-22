import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outputPath = resolve(process.cwd(), ".data/openrouter-models.json");

function toPerMillion(value) {
  if (!value) {
    return null;
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return null;
  }

  return Number((numeric * 1_000_000).toFixed(2));
}

async function main() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; NexusAgentModelHub/0.1; +https://github.com/Dajucoder/nexus-agent-model-hub)",
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch model catalog: ${response.status}`);
    }

    const payload = await response.json();
    const models = Array.isArray(payload.data) ? payload.data : [];
    const featured = models.slice(0, 12).map((model) => ({
      id: String(model.id ?? ""),
      name: String(model.name ?? model.id ?? "unknown"),
      provider: String(model.id ?? "").split("/")[0] || "unknown",
      slug: String(model.canonical_slug ?? model.id ?? "unknown").replace(
        /[/.]+/g,
        "-",
      ),
      contextLength: Number(
        model.context_length ?? model.top_provider?.context_length ?? 0,
      ),
      promptPricePer1M: toPerMillion(model.pricing?.prompt),
      completionPricePer1M: toPerMillion(model.pricing?.completion),
      modality: String(model.architecture?.modality ?? "unknown"),
    }));

    const snapshot = {
      fetchedAt: new Date().toISOString(),
      source: "https://openrouter.ai/api/v1/models",
      totalModels: models.length,
      featured,
    };

    await writeFile(
      outputPath,
      `${JSON.stringify(snapshot, null, 2)}\n`,
      "utf8",
    );
    console.log(
      `Saved ${featured.length} featured models from ${models.length} remote models.`,
    );
  } catch (error) {
    console.error("Failed to refresh remote model catalog snapshot.");
    console.error(error instanceof Error ? error.message : String(error));
    try {
      await readFile(outputPath, "utf8");
      process.exitCode = 0;
    } catch {
      process.exitCode = 1;
    }
  }
}

await main();
