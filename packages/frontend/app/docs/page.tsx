import Link from "next/link";
import { MarkdownRenderer } from "../../components/markdown-renderer";
import { getRemoteModelCoverage } from "../../lib/model-remote";
import {
  getDefaultDocPath,
  getDocLocale,
  getDocPageHref,
  getDocsNavigation,
  getLocaleSwitchPath,
  getRawDocHref,
  inferLocaleFromPath,
  readMarkdownDoc,
} from "../../lib/docs";

export const metadata = {
  title: "Help Center | Nexus Agent Model Hub",
  description:
    "Browse bilingual help, setup, deployment, and troubleshooting guidance directly from the repository.",
};

export default async function DocsPage(props: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const searchParams = props.searchParams ?? {};
  const requestedPath =
    typeof searchParams.path === "string" ? searchParams.path : undefined;
  const requestedLocale =
    typeof searchParams.lang === "string" ? searchParams.lang : undefined;
  const locale = getDocLocale(requestedLocale);
  const fallbackPath = getDefaultDocPath(locale);
  const doc =
    (await readMarkdownDoc(requestedPath ?? fallbackPath)) ??
    (await readMarkdownDoc(fallbackPath));

  if (!doc) {
    return (
      <main className="shell">
        <section className="panel stack">
          <div className="eyebrow">Documentation</div>
          <h1 className="page-title">帮助中心暂不可用</h1>
          <p className="fine">
            当前无法从仓库中读取帮助文档，请检查文件路径或部署产物是否包含
            `docs/` 目录。
          </p>
        </section>
      </main>
    );
  }

  const activeLocale = inferLocaleFromPath(doc.path);
  const navGroups = getDocsNavigation(activeLocale);
  const zhPath = getLocaleSwitchPath(doc.path, "zh");
  const enPath = getLocaleSwitchPath(doc.path, "en");
  const featuredDocs = navGroups[0]?.items.slice(0, 4) ?? [];
  const remoteCoverage = await getRemoteModelCoverage();
  const remoteSnapshot = remoteCoverage?.snapshot ?? null;
  const helpQueues = remoteCoverage
    ? [
        {
          title:
            activeLocale === "zh" ? "优先补充模型卡" : "Prioritize model cards",
          copy:
            activeLocale === "zh"
              ? `当前有 ${remoteCoverage.recommendedCount} 个候选值得优先进入 curated 目录。`
              : `${remoteCoverage.recommendedCount} candidates are strong fits for the curated catalog next.`,
          href: "/models",
        },
        {
          title:
            activeLocale === "zh"
              ? "跟踪预览与 beta"
              : "Track preview and beta",
          copy:
            activeLocale === "zh"
              ? `目前有 ${remoteCoverage.previewCount} 个预览阶段模型，需要持续观察稳定性与定价。`
              : `${remoteCoverage.previewCount} preview-stage models still need stability and pricing checks.`,
          href: "/leaderboard",
        },
        {
          title: activeLocale === "zh" ? "补齐帮助内容" : "Fill help coverage",
          copy:
            activeLocale === "zh"
              ? "把模型收录、排行榜来源和登录排障流程也纳入帮助中心。"
              : "Document model intake, leaderboard sourcing, and login troubleshooting inside help center paths.",
          href: "/docs?path=docs/zh/OPERATIONS.md",
        },
      ]
    : [];
  const troubleshootingIndex = [
    {
      code: "AUTH-01",
      title:
        activeLocale === "zh"
          ? "登录后没有租户上下文"
          : "No tenant context after login",
      copy:
        activeLocale === "zh"
          ? "检查种子数据、当前租户初始化和浏览器中保存的 token。"
          : "Check seed data, current tenant initialization, and stored browser tokens.",
    },
    {
      code: "DATA-02",
      title:
        activeLocale === "zh"
          ? "排行榜退回快照"
          : "Leaderboard fell back to snapshot",
      copy:
        activeLocale === "zh"
          ? "说明远程抓取暂时失败，但本地快照仍可支撑页面展示。"
          : "Remote fetch failed temporarily, but local snapshots still keep the page usable.",
    },
    {
      code: "MODEL-03",
      title:
        activeLocale === "zh"
          ? "远程模型未进入目录"
          : "Remote model not curated yet",
      copy:
        activeLocale === "zh"
          ? "先进入模型库工作台查看该模型位于 recommended、preview、free 还是 watchlist。"
          : "Open the model intake workbench first to see whether the model sits in recommended, preview, free, or watchlist.",
    },
  ];
  const quickTroubleshooting = [
    {
      title:
        activeLocale === "zh" ? "本地环境起不来" : "Local stack will not start",
      copy:
        activeLocale === "zh"
          ? "先看部署指南和运维手册，再检查 `.env`、Docker 服务、数据库迁移和健康检查。"
          : "Check deployment and operations docs first, then verify `.env`, Docker services, migrations, and health endpoints.",
    },
    {
      title: activeLocale === "zh" ? "登录后没有数据" : "No data after login",
      copy:
        activeLocale === "zh"
          ? "优先确认当前租户、种子账号、审计日志与 Agent 运行记录是否已经写入。"
          : "Verify the current tenant, seeded account, audit logs, and Agent runs are present first.",
    },
    {
      title: activeLocale === "zh" ? "想接手开发" : "Ready to contribute",
      copy:
        activeLocale === "zh"
          ? "建议按“帮助总览 → 仓库结构 → 贡献指南 → 许可证说明”的顺序阅读。"
          : "Follow the order help overview → repository map → contributing → license guide.",
    },
  ];

  return (
    <main className="shell docs-shell">
      <section className="docs-layout">
        <aside className="panel docs-sidebar">
          <div className="stack">
            <div>
              <div className="eyebrow">Help Center</div>
              <h1 className="section-title">帮助中心</h1>
              <p className="fine">
                把部署、运维、贡献、许可证与产品说明收敛为一个可搜索的帮助界面，中文和英文入口保持并行。
              </p>
            </div>

            <div className="help-sidebar-banner">
              <span className="eyebrow">Support Focus</span>
              <h2 className="section-title">先解决问题，再读完整文档</h2>
              <p className="fine">
                这个界面优先帮助你完成安装、登录、部署、排障和合规判断，而不是单纯浏览原始
                Markdown。
              </p>
            </div>

            <div className="pill-row">
              <Link
                className={activeLocale === "zh" ? "btn" : "ghost"}
                href={getDocPageHref(zhPath)}
              >
                中文
              </Link>
              <Link
                className={activeLocale === "en" ? "btn" : "ghost"}
                href={getDocPageHref(enPath)}
              >
                English
              </Link>
            </div>

            <div className="help-triage-grid">
              {quickTroubleshooting.map((item) => (
                <article key={item.title} className="panel docs-mini-card">
                  <div className="eyebrow">Quick Support</div>
                  <h3 className="section-title">{item.title}</h3>
                  <p className="fine">{item.copy}</p>
                </article>
              ))}
            </div>

            <section className="panel help-reading-path">
              <div className="eyebrow">Support Modes</div>
              <h3 className="section-title">帮助中心优先解决三类问题</h3>
              <div className="pill-row">
                <span className="pill">安装与启动</span>
                <span className="pill">登录与工作区</span>
                <span className="pill">部署与排障</span>
              </div>
            </section>

            <section className="panel help-reading-path">
              <div className="eyebrow">Role Paths</div>
              <h3 className="section-title">按角色快速进入帮助路径</h3>
              <div className="pill-row">
                <span className="pill">维护者：部署 → 运维 → 许可证</span>
                <span className="pill">
                  开发者：帮助总览 → 仓库结构 → 贡献指南
                </span>
                <span className="pill">
                  演示者：登录 → Dashboard → Models → Leaderboard
                </span>
              </div>
            </section>

            <section className="panel help-reading-path">
              <div className="eyebrow">Support Checklist</div>
              <h3 className="section-title">常见支持动作</h3>
              <div className="support-checklist-grid">
                <article className="support-checklist-card">
                  <strong>01</strong>
                  <p className="fine">
                    先确认 `.env`、数据库迁移、Redis 和鉴权配置是否完整。
                  </p>
                </article>
                <article className="support-checklist-card">
                  <strong>02</strong>
                  <p className="fine">
                    再检查租户、审计日志、Agent 运行记录和示例账号是否已准备。
                  </p>
                </article>
                <article className="support-checklist-card">
                  <strong>03</strong>
                  <p className="fine">
                    最后再进入部署、运维和许可证文档做深入判断。
                  </p>
                </article>
              </div>
            </section>

            {navGroups.map((group) => (
              <div key={group.title} className="stack">
                <div className="fine docs-group-title">{group.title}</div>
                <div className="stack docs-nav">
                  {group.items.map((item) => {
                    const href =
                      item.kind === "raw"
                        ? getRawDocHref(item.path)
                        : getDocPageHref(item.path);
                    const className =
                      item.path === doc.path
                        ? "ghost docs-link docs-link-active"
                        : "ghost docs-link";

                    if (item.kind === "raw") {
                      return (
                        <a
                          key={item.path}
                          className={className}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                        >
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
              <h2 className="section-title docs-title">帮助文档内容</h2>
              <p className="fine">
                这里直接读取仓库内的
                Markdown，并按帮助中心的方式组织。你可以先看顶部摘要卡，再进入完整说明。
              </p>
            </div>
            <a
              className="ghost"
              href={getRawDocHref(doc.path)}
              target="_blank"
              rel="noreferrer"
            >
              Open Raw
            </a>
          </div>

          <div className="help-overview-grid">
            <article className="panel docs-mini-card">
              <div className="eyebrow">Quick Help</div>
              <h3 className="section-title">如果你刚接手这个项目</h3>
              <p className="fine">
                建议先看总览、部署、运维，再根据需要查看贡献与许可证说明。
              </p>
            </article>
            <article className="panel docs-mini-card">
              <div className="eyebrow">Recommended Order</div>
              <h3 className="section-title">概览 → 部署 → 运维 → 贡献</h3>
              <p className="fine">
                这样更容易先把系统跑起来，再理解仓库结构、运维方式和协作规则。
              </p>
            </article>
            <article className="panel docs-mini-card">
              <div className="eyebrow">Current Locale</div>
              <h3 className="section-title">
                {activeLocale === "zh" ? "中文帮助" : "English Help"}
              </h3>
              <p className="fine">
                当前帮助界面和左侧导航会跟随语言切换保持一致。
              </p>
            </article>
          </div>

          <section className="panel help-reading-path">
            <div className="eyebrow">Reading Path</div>
            <h3 className="section-title">推荐阅读路径</h3>
            <div className="pill-row">
              <span className="pill">1. Help Overview</span>
              <span className="pill">2. Deployment</span>
              <span className="pill">3. Operations</span>
              <span className="pill">4. Contributing</span>
              <span className="pill">5. License Guide</span>
            </div>
          </section>

          <section className="panel help-faq-grid">
            <article className="docs-mini-card">
              <div className="eyebrow">FAQ</div>
              <h3 className="section-title">我应该先看哪篇？</h3>
              <p className="fine">
                第一次接手项目时，优先阅读帮助总览、部署指南和运维手册。
              </p>
            </article>
            <article className="docs-mini-card">
              <div className="eyebrow">FAQ</div>
              <h3 className="section-title">为什么登录后可能没有数据？</h3>
              <p className="fine">
                优先检查当前租户是否正确、种子账号是否已初始化，以及 Agent
                运行和审计日志是否已有记录。
              </p>
            </article>
            <article className="docs-mini-card">
              <div className="eyebrow">FAQ</div>
              <h3 className="section-title">模型列表和排行榜来自哪里？</h3>
              <p className="fine">
                当前页面会同时使用本地 curated
                模型目录、排行榜快照/抓取结果，以及远程模型公开目录快照。
              </p>
            </article>
          </section>

          <section className="help-queue-grid">
            {troubleshootingIndex.map((item) => (
              <article key={item.code} className="panel docs-mini-card">
                <div className="eyebrow">{item.code}</div>
                <h3 className="section-title">{item.title}</h3>
                <p className="fine">{item.copy}</p>
              </article>
            ))}
          </section>

          {remoteSnapshot ? (
            <section className="panel help-reading-path">
              <div className="eyebrow">Remote Model Feed</div>
              <h3 className="section-title">最近一次公开模型目录同步</h3>
              <p className="fine">
                当前已同步 {remoteSnapshot.totalModels} 个公开模型，最近时间为{" "}
                {remoteSnapshot.fetchedAt}。
              </p>
              {remoteCoverage ? (
                <p className="fine">
                  当前 featured 模型中，已收录 {remoteCoverage.collectedCount}{" "}
                  个，待收录 {remoteCoverage.pendingCount} 个。
                </p>
              ) : null}
              {remoteCoverage ? (
                <p className="fine">
                  其中预览或 beta 模型 {remoteCoverage.previewCount}{" "}
                  个，建议优先评估并收录的候选 {remoteCoverage.recommendedCount}{" "}
                  个。
                </p>
              ) : null}
              <div className="pill-row">
                {remoteSnapshot.featured.slice(0, 4).map((item) => (
                  <span key={item.id} className="pill">
                    {item.name}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {helpQueues.length > 0 ? (
            <section className="help-queue-grid">
              {helpQueues.map((item) => (
                <Link
                  key={item.title}
                  className="panel docs-mini-card"
                  href={item.href}
                >
                  <div className="eyebrow">Action Queue</div>
                  <h3 className="section-title">{item.title}</h3>
                  <p className="fine">{item.copy}</p>
                </Link>
              ))}
            </section>
          ) : null}

          <div className="docs-overview-grid">
            {featuredDocs.map((item) => (
              <Link
                key={item.path}
                className="panel docs-mini-card"
                href={getDocPageHref(item.path)}
              >
                <div className="eyebrow">Help Entry</div>
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
