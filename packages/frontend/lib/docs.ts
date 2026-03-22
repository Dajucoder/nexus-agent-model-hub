import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type DocLocale = 'en' | 'zh';

export type DocNavItem = {
  label: string;
  path: string;
  kind?: 'markdown' | 'raw';
};

export type DocNavGroup = {
  title: string;
  items: DocNavItem[];
};

const rootFiles = new Set([
  'README.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
  'CHANGELOG.md',
  'COMMERCIAL_LICENSE.md',
  'LICENSE',
  'NOTICE'
]);

const allowedExtensions = new Set(['.md', '.json', '.yaml', '.yml', '.svg', '.txt', '']);

export const localizedDocNames = [
  'README',
  'PRODUCT_READYNESS',
  'ARCHITECTURE',
  'DEPLOYMENT',
  'OPERATIONS',
  'CONTRIBUTING',
  'LICENSE_GUIDE',
  'REPOSITORY_MAP',
  'SCHEME_A_DECISIONS'
] as const;

const localizedLabels: Record<DocLocale, Record<(typeof localizedDocNames)[number], string>> = {
  en: {
    README: 'Overview',
    PRODUCT_READYNESS: 'Product Readiness',
    ARCHITECTURE: 'Architecture',
    DEPLOYMENT: 'Deployment',
    OPERATIONS: 'Operations',
    CONTRIBUTING: 'Contributing',
    LICENSE_GUIDE: 'License Guide',
    REPOSITORY_MAP: 'Repository Map',
    SCHEME_A_DECISIONS: 'Scheme A Decisions'
  },
  zh: {
    README: '文档总览',
    PRODUCT_READYNESS: '产品就绪度',
    ARCHITECTURE: '架构设计',
    DEPLOYMENT: '部署指南',
    OPERATIONS: '运维手册',
    CONTRIBUTING: '贡献指南',
    LICENSE_GUIDE: '许可证说明',
    REPOSITORY_MAP: '仓库结构',
    SCHEME_A_DECISIONS: '方案 A 决策'
  }
};

export function getDefaultDocPath(locale: DocLocale) {
  return `docs/${locale}/README.md`;
}

export function getDocLocale(input?: string | null): DocLocale {
  return input === 'en' ? 'en' : 'zh';
}

export function getDocsNavigation(locale: DocLocale): DocNavGroup[] {
  return [
    {
      title: locale === 'zh' ? '双语文档' : 'Localized Docs',
      items: localizedDocNames.map((name) => ({
        label: localizedLabels[locale][name],
        path: `docs/${locale}/${name}.md`
      }))
    },
    {
      title: locale === 'zh' ? '仓库文件' : 'Repository Files',
      items: [
        { label: locale === 'zh' ? '根 README' : 'Root README', path: 'README.md' },
        { label: 'CONTRIBUTING.md', path: 'CONTRIBUTING.md' },
        { label: 'CODE_OF_CONDUCT.md', path: 'CODE_OF_CONDUCT.md' },
        { label: 'SECURITY.md', path: 'SECURITY.md' },
        { label: 'CHANGELOG.md', path: 'CHANGELOG.md' },
        { label: 'COMMERCIAL_LICENSE.md', path: 'COMMERCIAL_LICENSE.md' }
      ]
    },
    {
      title: locale === 'zh' ? '接口与资源' : 'API And Assets',
      items: [
        { label: 'openapi.yaml', path: 'docs/api/openapi.yaml', kind: 'raw' },
        { label: 'model-card.schema.json', path: 'docs/api/model-card.schema.json', kind: 'raw' }
      ]
    },
    {
      title: locale === 'zh' ? '补充资料' : 'Additional References',
      items: [
        { label: 'MODEL_HUB_MASTER_PLAN.md', path: 'docs/zh/MODEL_HUB_MASTER_PLAN.md' },
        { label: 'MODEL_HUB_PAGE_SPEC.md', path: 'docs/zh/MODEL_HUB_PAGE_SPEC.md' }
      ]
    }
  ];
}

export function normalizeRepoRelativePath(input?: string | null) {
  if (!input) {
    return null;
  }

  const normalized = path.posix.normalize(input.replace(/\\/g, '/'));
  if (normalized.startsWith('../') || normalized === '..' || normalized.startsWith('/')) {
    return null;
  }

  return normalized;
}

export function resolveRepoRoot() {
  const candidates = [
    process.cwd(),
    path.resolve(process.cwd(), '..'),
    path.resolve(process.cwd(), '..', '..')
  ];

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, 'docs', 'en', 'README.md')) && existsSync(path.join(candidate, 'README.md'))) {
      return candidate;
    }
  }

  return path.resolve(process.cwd(), '..', '..');
}

export function isAllowedRepoPath(relativePath: string) {
  if (relativePath.startsWith('docs/')) {
    return true;
  }

  return rootFiles.has(relativePath);
}

export function resolveRepoPath(relativePath?: string | null) {
  const normalized = normalizeRepoRelativePath(relativePath);
  if (!normalized || !isAllowedRepoPath(normalized)) {
    return null;
  }

  const extension = path.extname(normalized);
  if (!allowedExtensions.has(extension)) {
    return null;
  }

  return {
    relativePath: normalized,
    absolutePath: path.join(resolveRepoRoot(), normalized)
  };
}

export async function readMarkdownDoc(relativePath: string) {
  const resolved = resolveRepoPath(relativePath);
  if (!resolved || !resolved.relativePath.endsWith('.md')) {
    return null;
  }

  try {
    const content = await readFile(resolved.absolutePath, 'utf8');
    return {
      path: resolved.relativePath,
      content
    };
  } catch {
    return null;
  }
}

export function inferLocaleFromPath(relativePath: string): DocLocale {
  return relativePath.startsWith('docs/en/') ? 'en' : 'zh';
}

export function getLocaleSwitchPath(relativePath: string, targetLocale: DocLocale) {
  const match = relativePath.match(/^docs\/(en|zh)\/([^/]+)\.md$/);
  if (!match) {
    return getDefaultDocPath(targetLocale);
  }

  const [, , filename] = match;
  const localizedName = filename as (typeof localizedDocNames)[number];
  if (!localizedDocNames.includes(localizedName)) {
    return getDefaultDocPath(targetLocale);
  }

  return `docs/${targetLocale}/${filename}.md`;
}

export function getRawDocHref(relativePath: string) {
  return `/api/docs?path=${encodeURIComponent(relativePath)}`;
}

export function getDocPageHref(relativePath: string) {
  return `/docs?path=${encodeURIComponent(relativePath)}`;
}

export function getContentType(relativePath: string) {
  const extension = path.extname(relativePath);
  switch (extension) {
    case '.md':
      return 'text/markdown; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.yaml':
    case '.yml':
      return 'application/yaml; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'text/plain; charset=utf-8';
  }
}
