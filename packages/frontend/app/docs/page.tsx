import Link from 'next/link';
import { MarkdownRenderer } from '../../components/markdown-renderer';
import {
  getDefaultDocPath,
  getDocLocale,
  getDocPageHref,
  getDocsNavigation,
  getLocaleSwitchPath,
  getRawDocHref,
  inferLocaleFromPath,
  readMarkdownDoc
} from '../../lib/docs';

export const metadata = {
  title: 'Documentation | Nexus Agent Model Hub',
  description: 'Browse the bilingual project documentation directly from the repository.'
};

export default async function DocsPage(props: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const searchParams = props.searchParams ?? {};
  const requestedPath = typeof searchParams.path === 'string' ? searchParams.path : undefined;
  const requestedLocale = typeof searchParams.lang === 'string' ? searchParams.lang : undefined;
  const locale = getDocLocale(requestedLocale);
  const fallbackPath = getDefaultDocPath(locale);
  const doc = (await readMarkdownDoc(requestedPath ?? fallbackPath)) ?? (await readMarkdownDoc(fallbackPath));

  if (!doc) {
    return (
      <main className="shell">
        <section className="panel stack">
          <div className="eyebrow">Documentation</div>
          <h1 className="page-title">文档不可用</h1>
          <p className="fine">当前无法从仓库中读取说明文档，请检查文件路径或部署产物是否包含 `docs/` 目录。</p>
        </section>
      </main>
    );
  }

  const activeLocale = inferLocaleFromPath(doc.path);
  const navGroups = getDocsNavigation(activeLocale);
  const zhPath = getLocaleSwitchPath(doc.path, 'zh');
  const enPath = getLocaleSwitchPath(doc.path, 'en');
  const featuredDocs = navGroups[0]?.items.slice(0, 4) ?? [];

  return (
    <main className="shell docs-shell">
      <section className="docs-layout">
        <aside className="panel docs-sidebar">
          <div className="stack">
            <div>
              <div className="eyebrow">Documentation</div>
              <h1 className="section-title">文档中心</h1>
              <p className="fine">直接读取仓库中的 Markdown，中文和英文入口保持并行。</p>
            </div>

            <div className="pill-row">
              <Link className={activeLocale === 'zh' ? 'btn' : 'ghost'} href={getDocPageHref(zhPath)}>
                中文
              </Link>
              <Link className={activeLocale === 'en' ? 'btn' : 'ghost'} href={getDocPageHref(enPath)}>
                English
              </Link>
            </div>

            {navGroups.map((group) => (
              <div key={group.title} className="stack">
                <div className="fine docs-group-title">{group.title}</div>
                <div className="stack docs-nav">
                  {group.items.map((item) => {
                    const href = item.kind === 'raw' ? getRawDocHref(item.path) : getDocPageHref(item.path);
                    const className = item.path === doc.path ? 'ghost docs-link docs-link-active' : 'ghost docs-link';

                    if (item.kind === 'raw') {
                      return (
                        <a key={item.path} className={className} href={href} target="_blank" rel="noreferrer">
                          {item.label}
                        </a>
                      );
                    }

                    return (
                      <Link key={item.path} className={className} href={href}>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="panel docs-content">
          <div className="topbar docs-topbar">
            <div>
              <div className="fine mono">{doc.path}</div>
              <h2 className="section-title docs-title">完整说明文档</h2>
              <p className="fine">这里直接读取仓库内的 Markdown，你可以在左侧导航切换，也可以打开原始文件地址。</p>
            </div>
            <a className="ghost" href={getRawDocHref(doc.path)} target="_blank" rel="noreferrer">
              Open Raw
            </a>
          </div>

          <div className="docs-overview-grid">
            {featuredDocs.map((item) => (
              <Link key={item.path} className="panel docs-mini-card" href={getDocPageHref(item.path)}>
                <div className="eyebrow">Docs</div>
                <h3 className="section-title">{item.label}</h3>
                <p className="fine">{item.path}</p>
              </Link>
            ))}
          </div>

          <MarkdownRenderer content={doc.content} currentPath={doc.path} />
        </section>
      </section>
    </main>
  );
}
