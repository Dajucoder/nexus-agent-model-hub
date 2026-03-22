import Link from "next/link";
import { AuthPanel } from "../components/auth-panel";
import { ModelCatalogCard } from "../components/model-catalog-card";
import { listModelArticles } from "../lib/model-content";
import { getCatalogHighlights, modelCatalog } from "../lib/model-data";
import { getRemoteModelCoverage } from "../lib/model-remote";
import {
  getLeaderboardBundle,
  getLeaderboardMetadata,
} from "../lib/leaderboard-data";

export default async function HomePage() {
  const featuredModels = [
    "gpt-4o",
    "claude-sonnet-4-20250514",
    "gemini-2.5-pro",
  ]
    .map((id) => modelCatalog.find((model) => model.id === id))
    .filter((model): model is (typeof modelCatalog)[number] => Boolean(model));
  const providerCount = new Set(modelCatalog.map((model) => model.provider.id))
    .size;
  const maxContextWindow = Math.max(
    ...modelCatalog.map((model) => model.contextWindow),
  );
  const bundle = await getLeaderboardBundle();
  const leaderboardMeta = getLeaderboardMetadata(bundle);
  const combinedLeader = bundle.feeds.combined.entries[0];
  const { cheapestModel, bestReasoningModel } = getCatalogHighlights();
  const modelArticles = await listModelArticles();
  const remoteCoverage = await getRemoteModelCoverage();
  const remoteSnapshot = remoteCoverage?.snapshot ?? null;
  const intakeStages = remoteCoverage
    ? [
        {
          label: "已收录",
          value: remoteCoverage.collectedCount,
          copy: "已经进入 curated 模型库并能挂接详情、对比和知识卡片。",
        },
        {
          label: "推荐收录",
          value: remoteCoverage.recommendedCount,
          copy: "高上下文或高性价比候选，适合优先变成产品内可选模型。",
        },
        {
          label: "预览观察",
          value: remoteCoverage.previewCount,
          copy: "需要跟踪 beta、preview 或定价变化，避免过早承诺。",
        },
        {
          label: "免费实验",
          value: remoteCoverage.freeCount,
          copy: "适合给演示环境、验证脚本和低成本试用提供入口。",
        },
      ]
    : [];

  const modules = [
    {
      title: "认证与租户体系",
      copy: "把注册、登录、JWT、refresh token 和多租户隔离放在统一入口，作为产品级访问与权限基础层。",
      items: [
        "初始管理员可直接引导入场",
        "面向真实 API 的租户隔离",
        "中英文界面可切换",
      ],
      href: "/login",
    },
    {
      title: "模型资料与对比",
      copy: "模型卡片、能力评分、价格、上下文和适用场景集中整理，适合做内部选型入口。",
      items: [
        "模型详情页静态生成",
        "2 到 4 个模型并排对比",
        "适合继续接入更多供应商",
      ],
      href: "/models",
    },
    {
      title: "排行榜与会话工作区",
      copy: "把榜单浏览和模型会话并入同一套界面，让“看数据”和“用模型”形成闭环。",
      items: [
        "Arena / OpenRouter / Combined",
        "会话页支持真实供应商配置",
        "后续可继续补齐组织级运营能力",
      ],
      href: "/leaderboard",
    },
  ];

  return (
    <main className="shell home-shell">
      <section className="home-hero">
        <section className="panel stack hero-copy">
          <div className="hero-orbit hero-orbit-a" />
          <div className="hero-orbit hero-orbit-b" />
          <div className="eyebrow">Agent Platform · Model Hub · Docs</div>
          <h1 className="hero-title">
            <span className="text-gradient">从仓库入口开始</span>
            <br />
            建成可上线的产品基线
          </h1>
          <p>
            这个仓库已经具备认证、模型资料、排行榜、设置、聊天和部署文档等能力。首页现在直接承担产品入口、
            运维入口和 onboarding
            入口三种角色，让团队第一次打开项目时就知道怎么启动、怎么配置、怎么继续扩展。
          </p>
          <div className="pill-row">
            <Link className="btn" href="/login">
              进入产品入口
            </Link>
            <Link className="ghost" href="/models">
              查看模型库
            </Link>
            <Link className="ghost" href="/docs">
              阅读部署文档
            </Link>
            <Link className="ghost" href="/chat">
              打开会话工作区
            </Link>
          </div>
          <div className="hero-kpi-grid">
            <div className="kpi">
              <div>模型覆盖</div>
              <strong>{modelCatalog.length} 个主力模型</strong>
            </div>
            <div className="kpi">
              <div>供应商</div>
              <strong>{providerCount} 类接入源</strong>
            </div>
            <div className="kpi">
              <div>上下文上限</div>
              <strong>
                {Intl.NumberFormat("en-US").format(maxContextWindow)}
              </strong>
            </div>
            <div className="kpi">
              <div>部署形态</div>
              <strong>Docker / K8s / Helm</strong>
            </div>
            <div className="kpi">
              <div>榜单覆盖</div>
              <strong>{leaderboardMeta.totalEntries} 条快照记录</strong>
            </div>
            <div className="kpi">
              <div>当前综合榜首</div>
              <strong>
                {combinedLeader?.modelName ?? "Combined Snapshot"}
              </strong>
            </div>
            <div className="kpi">
              <div>远程模型快照</div>
              <strong>
                {remoteSnapshot
                  ? `${remoteSnapshot.totalModels} 个远程模型`
                  : "等待同步"}
              </strong>
            </div>
            <div className="kpi">
              <div>远程映射状态</div>
              <strong>
                {remoteCoverage
                  ? `${remoteCoverage.collectedCount} 已收录 / ${remoteCoverage.pendingCount} 待收录`
                  : "等待分析"}
              </strong>
            </div>
          </div>
          <div className="hero-marquee" aria-hidden="true">
            <span>Auto leaderboard synthesis</span>
            <span>Provider-aware model catalog</span>
            <span>Deployable docs center</span>
            <span>Tenant-ready product shell</span>
          </div>
        </section>

        <div className="hero-side">
          <section className="panel stack status-panel">
            <div className="section-title">项目现在能直接提供什么</div>
            <div className="status-list">
              <div className="status-item">
                <span>认证体系</span>
                <strong>注册 / 登录 / JWT</strong>
              </div>
              <div className="status-item">
                <span>模型站能力</span>
                <strong>详情页 / 排行榜 / 对比</strong>
              </div>
              <div className="status-item">
                <span>运营支持</span>
                <strong>中英双语文档</strong>
              </div>
              <div className="status-item">
                <span>落地方式</span>
                <strong>本地、容器、K8s</strong>
              </div>
            </div>
          </section>

          <section className="panel stack route-panel">
            <div>
              <div className="eyebrow">Quick Routes</div>
              <h2 className="section-title">最常访问的入口</h2>
            </div>
            <div className="route-grid">
              <Link className="ghost" href="/dashboard">
                控制台
              </Link>
              <Link className="ghost" href="/settings">
                API Key 设置
              </Link>
              <Link className="ghost" href="/leaderboard">
                排行榜
              </Link>
              <Link className="ghost" href="/compare">
                模型对比
              </Link>
            </div>
          </section>

          <section className="panel stack status-panel">
            <div>
              <div className="eyebrow">Auto Signals</div>
              <h2 className="section-title">首页直接给出选择信号</h2>
            </div>
            <div className="status-list">
              <div className="status-item">
                <span>综合榜首</span>
                <strong>{combinedLeader?.modelName ?? "等待数据"}</strong>
              </div>
              <div className="status-item">
                <span>最低成本</span>
                <strong>{cheapestModel?.name ?? "等待数据"}</strong>
              </div>
              <div className="status-item">
                <span>推理最强</span>
                <strong>{bestReasoningModel?.name ?? "等待数据"}</strong>
              </div>
              <div className="status-item">
                <span>榜单供应商覆盖</span>
                <strong>{leaderboardMeta.providerCount} 类来源</strong>
              </div>
              <div className="status-item">
                <span>知识卡片覆盖</span>
                <strong>{modelArticles.length} 篇模型文章</strong>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="signal-band">
        <article className="panel spotlight-card">
          <span className="eyebrow">Combined Leader</span>
          <h2 className="section-title">
            {combinedLeader?.modelName ?? "等待榜单数据"}
          </h2>
          <p>
            当前综合榜首会优先使用自动抓取 +
            快照回退的融合数据，并与本地模型目录联动，自动显示可比价格、上下文和能力画像。
          </p>
          <div className="pill-row">
            <Link className="btn" href="/leaderboard">
              查看当前榜单
            </Link>
            <Link
              className="ghost"
              href={`/models/${combinedLeader?.modelSlug ?? "gpt-4o"}`}
            >
              打开模型详情
            </Link>
          </div>
        </article>
        <article className="panel spotlight-card alt">
          <span className="eyebrow">Selection Flow</span>
          <h2 className="section-title">先看信号，再做选型</h2>
          <p>
            首页负责给出当前最值得看的模型、最低成本代表与推理最强候选，用户随后进入模型库和对比页完成最终判断。
          </p>
          <div className="pill-row">
            <Link className="ghost" href="/models">
              浏览模型库
            </Link>
            <Link className="ghost" href="/compare">
              直接模型对比
            </Link>
          </div>
        </article>
      </section>

      {remoteSnapshot ? (
        <section className="panel stack">
          <div className="topbar">
            <div>
              <div className="eyebrow">Remote Catalog</div>
              <h2 className="section-title">已尝试抓取最新公开模型目录</h2>
              <p className="fine">
                首页不仅展示抓取结果，也把远程目录映射成可执行的模型收录工作流。
              </p>
            </div>
            <div className="fine mono">{remoteSnapshot.fetchedAt}</div>
          </div>
          {intakeStages.length > 0 ? (
            <div className="intake-stage-grid">
              {intakeStages.map((stage) => (
                <article key={stage.label} className="intake-stage-card">
                  <span>{stage.label}</span>
                  <strong>{stage.value}</strong>
                  <p>{stage.copy}</p>
                </article>
              ))}
            </div>
          ) : null}
          <div className="cards compact-cards">
            {remoteSnapshot.featured.slice(0, 6).map((item) => (
              <article key={item.id} className="panel stack compact-model-card">
                <div>
                  <h3 className="card-title">{item.name}</h3>
                  <div className="fine">{item.id}</div>
                </div>
                <div className="pill-row">
                  <span className="pill">
                    {remoteCoverage?.items.find((entry) => entry.id === item.id)
                      ?.providerLabel ?? item.provider}
                  </span>
                  <span className="pill">{item.modality}</span>
                  <span className="pill">
                    {remoteCoverage?.items.find((entry) => entry.id === item.id)
                      ?.collected
                      ? "已收录"
                      : "待收录"}
                  </span>
                  {remoteCoverage?.items.find((entry) => entry.id === item.id)
                    ?.recommended ? (
                    <span className="pill">推荐</span>
                  ) : null}
                </div>
                <div className="fine">
                  上下文 {item.contextLength.toLocaleString("en-US")} · 输入 $
                  {item.promptPricePer1M ?? "-"}/1M
                </div>
                <div className="fine">
                  输出 ${item.completionPricePer1M ?? "-"}/1M · slug {item.slug}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="stack">
        <div className="section-heading">
          <div className="stack">
            <div className="eyebrow">Knowledge Coverage</div>
            <h2 className="section-title">模型百科内容正在逐步接入</h2>
          </div>
        </div>
        <div className="cards compact-cards">
          {modelArticles.length > 0 ? (
            modelArticles.map((article) => (
              <article
                key={article.slug}
                className="panel stack compact-model-card"
              >
                <div>
                  <h3 className="card-title">{article.title}</h3>
                  <div className="fine">{article.relativePath}</div>
                </div>
                <div className="pill-row">
                  <span className="pill">状态 {article.status}</span>
                  {article.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="pill">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link className="ghost" href={`/models/${article.slug}`}>
                  打开模型知识卡片
                </Link>
              </article>
            ))
          ) : (
            <article className="panel stack compact-model-card">
              <h3 className="card-title">等待更多内容</h3>
              <p className="fine">
                当前仓库还可以继续补充更多
                `content/models/*.mdx`，详情页会自动接入。
              </p>
            </article>
          )}
        </div>
      </section>

      <section className="stack">
        <div className="section-heading">
          <div className="stack">
            <div className="eyebrow">Core Modules</div>
            <h2 className="section-title">现在的前端应该强调的三件事</h2>
            <p className="muted-copy">
              不是把所有功能平铺出来，而是让用户能快速建立“先看什么、再做什么”的路径感。
            </p>
          </div>
        </div>
        <div className="feature-grid">
          {modules.map((module) => (
            <article key={module.title} className="panel stack feature-card">
              <h3 className="section-title">{module.title}</h3>
              <p>{module.copy}</p>
              <ul className="feature-list">
                {module.items.map((item) => (
                  <li key={item}>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link className="ghost" href={module.href}>
                打开模块
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="stack">
        <div className="section-heading">
          <div className="stack">
            <div className="eyebrow">Featured Models</div>
            <h2 className="section-title">首页保留模型展示，但不再抢主叙事</h2>
          </div>
          <Link className="ghost" href="/models">
            查看全部模型
          </Link>
        </div>
        <div className="cards">
          {featuredModels.map((model) => (
            <ModelCatalogCard key={model.id} model={model} />
          ))}
        </div>
      </section>

      <section className="home-bottom-grid">
        <div className="panel stack checklist-panel">
          <div className="eyebrow">Launch Checklist</div>
          <h2 className="section-title">部署和上线入口做成明确动作</h2>
          <ul className="checklist">
            <li>
              <span>本地直接拉起前后端与依赖</span>
              <strong>docker compose up --build</strong>
            </li>
            <li>
              <span>查看中文部署与运维说明</span>
              <strong>/docs?lang=zh</strong>
            </li>
            <li>
              <span>先登录初始管理员账号，再进入控制台调用 Agent</span>
              <strong>/login -&gt; /dashboard</strong>
            </li>
          </ul>
          <div className="command-box mono">docker compose up --build</div>
          <p className="muted-copy">
            现在首页不仅是视觉入口，也承担 onboarding
            角色，第一次打开项目就知道“怎么启动、怎么验收、怎么继续看文档”。
          </p>
        </div>

        <AuthPanel />
      </section>
    </main>
  );
}
