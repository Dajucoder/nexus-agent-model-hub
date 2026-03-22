import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

export type ModelArticle = {
  frontmatter: Record<string, string | string[]>;
  body: string;
  relativePath: string;
};

export type ModelArticleSummary = {
  slug: string;
  title: string;
  status: string;
  tags: string[];
  relativePath: string;
};

function parseFrontmatterValue(raw: string) {
  const trimmed = raw.trim();

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, ""))
      .filter(Boolean);
  }

  return trimmed.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
}

function parseFrontmatter(content: string) {
  if (!content.startsWith("---\n")) {
    return null;
  }

  const endIndex = content.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return null;
  }

  const rawFrontmatter = content.slice(4, endIndex);
  const body = content.slice(endIndex + 5).trim();
  const frontmatter: Record<string, string | string[]> = {};

  for (const line of rawFrontmatter.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);
    frontmatter[key] = parseFrontmatterValue(value);
  }

  return { frontmatter, body };
}

function resolveRepoRoot() {
  const candidates = [
    process.cwd(),
    path.resolve(process.cwd(), ".."),
    path.resolve(process.cwd(), "..", ".."),
  ];

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "content", "models"))) {
      return candidate;
    }
  }

  return path.resolve(process.cwd(), "..", "..");
}

export async function getModelArticle(
  slug: string,
): Promise<ModelArticle | null> {
  const repoRoot = resolveRepoRoot();
  const relativePath = path.posix.join("content", "models", `${slug}.mdx`);
  const absolutePath = path.join(repoRoot, relativePath);

  if (!existsSync(absolutePath)) {
    return null;
  }

  const content = await readFile(absolutePath, "utf8");
  const parsed = parseFrontmatter(content);
  if (!parsed) {
    return null;
  }

  return {
    frontmatter: parsed.frontmatter,
    body: parsed.body,
    relativePath,
  };
}

export async function listModelArticles(): Promise<ModelArticleSummary[]> {
  const repoRoot = resolveRepoRoot();
  const directory = path.join(repoRoot, "content", "models");
  const { readdir } = await import("node:fs/promises");
  const files = await readdir(directory);

  const articles = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
      .map(async (file) => {
        const slug = file.replace(/\.mdx$/, "");
        const article = await getModelArticle(slug);
        if (!article) {
          return null;
        }

        return {
          slug,
          title: String(article.frontmatter.name ?? slug),
          status: String(article.frontmatter.status ?? "active"),
          tags: Array.isArray(article.frontmatter.tags)
            ? article.frontmatter.tags.map(String)
            : [],
          relativePath: article.relativePath,
        } satisfies ModelArticleSummary;
      }),
  );

  return articles.filter(
    (article): article is ModelArticleSummary => article !== null,
  );
}
