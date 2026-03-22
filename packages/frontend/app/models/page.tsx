import Link from "next/link";
import { ModelCatalogCard } from "../../components/model-catalog-card";
import { getCatalogHighlights, modelCatalog } from "../../lib/model-data";
import { getRemoteModelCoverage } from "../../lib/model-remote";
import { formatPrice } from "../../lib/model-utils";

export default async function ModelsPage() {
  const providers = [
    "all",
    ...new Set(modelCatalog.map((model) => model.provider.id)),
  ];
  const remoteCoverage = await getRemoteModelCoverage();
  const {
    openSourceCount,
    cheapestModel,
    bestReasoningModel,
    bestCodingModel,
    maxContextModel,
  } = getCatalogHighlights();
  const collectionBuckets = remoteCoverage
    ? [
        {
          key: "recommended",
          title: "推荐优先收录",
          copy: "高上下文或高性价比，适合尽快补充模型卡、知识卡片与对比入口。",
          items: remoteCoverage.buckets.recommended,
        },
        {
          key: "preview",
          title: "预览观察",
          copy: "处于 preview 或 beta 阶段，适合保留观察位并等待稳定后正式纳入。",
          items: remoteCoverage.buckets.preview,
        },
        {
          key: "free",
          title: "免费实验",
          copy: "适合快速试玩、验证接口打通或给演示环境提供低成本入口。",
          items: remoteCoverage.buckets.free,
        },
        {
          key: "watchlist",
          title: "待观察候选",
          copy: "已经出现在远程目录，但还没有进入当前 curated 选型优先级。",
          items: remoteCoverage.buckets.watchlist,
        },
      ]
    : [];
  const intakeChecklist = [
    "先判断模型是否补齐当前目录的能力空缺，例如超长上下文、免费实验或多模态梯度。",
    "再补结构化模型卡、供应商信息、价格与上下文映射，确保可以进入对比页。",
    "最后补 `content/models/*.mdx` 知识卡片，并决定是否进入首页、帮助中心或排行榜叙事。",
  ];

  return (
    <main className="shell stack">
      <section className="panel stack page-hero">
        <div className="eyebrow">Model Hub</div>
        <h1 className="page-title">模型库</h1>
        <p className="fine">
          把模型资料、价格、能力评分和适用场景集中到一个选择入口。页面不仅展示
          curated 模型卡，还开始展示远程发现但尚未正式收录的候选模型。
        </p>
        <div className="stat-grid">
          <div className="stat-card">
            <span>模型总数</span>
            <strong>{modelCatalog.length}</strong>
          </div>
          <div className="stat-card">
            <span>供应商</span>
            <strong>{providers.length - 1}</strong>
          </div>
          <div className="stat-card">
            <span>开源模型</span>
            <strong>{openSourceCount}</strong>
          </div>
          <div className="stat-card">
            <span>最低输入价格</span>
            <strong>
              {cheapestModel
                ? formatPrice(cheapestModel.pricing.inputPer1M)
                : "-"}
            </strong>
          </div>
        </div>
        <div className="insight-grid">
          <article className="insight-card">
            <span>推理最佳</span>
            <strong>{bestReasoningModel?.name ?? "-"}</strong>
            <p>
              {bestReasoningModel
                ? `${bestReasoningModel.capabilities.reasoning} 分 · ${bestReasoningModel.provider.name}`
                : "暂无数据"}
            </p>
          </article>
          <article className="insight-card">
            <span>代码最佳</span>
            <strong>{bestCodingModel?.name ?? "-"}</strong>
            <p>
              {bestCodingModel
                ? `${bestCodingModel.capabilities.coding} 分 · ${bestCodingModel.provider.name}`
                : "暂无数据"}
            </p>
          </article>
          <article className="insight-card">
            <span>最长上下文</span>
            <strong>{maxContextModel?.name ?? "-"}</strong>
            <p>
              {maxContextModel
                ? `${maxContextModel.contextWindow.toLocaleString("en-US")} tokens`
                : "暂无数据"}
            </p>
          </article>
        </div>
        <section className="catalog-spotlight-grid">
          <article className="panel spotlight-card compact">
            <span className="eyebrow">Reasoning Pick</span>
            <h2 className="section-title">
              {bestReasoningModel?.name ?? "等待数据"}
            </h2>
            <p>适合复杂代理、规划、多步分析与高密度推理工作流。</p>
          </article>
          <article className="panel spotlight-card compact alt">
            <span className="eyebrow">Coding Pick</span>
            <h2 className="section-title">
              {bestCodingModel?.name ?? "等待数据"}
            </h2>
            <p>适合代码生成、重构、审查以及工程内工具链调用场景。</p>
          </article>
        </section>
        <div className="pill-row">
          <span className="pill">当前 curated 模型 {modelCatalog.length}</span>
          {remoteCoverage ? (
            <span className="pill">
              远程待收录 {remoteCoverage.pendingCount}
            </span>
          ) : null}
          {remoteCoverage ? (
            <span className="pill">
              推荐收录 {remoteCoverage.recommendedCount}
            </span>
          ) : null}
          {remoteCoverage ? (
            <span className="pill">预览模型 {remoteCoverage.previewCount}</span>
          ) : null}
          {remoteCoverage ? (
            <span className="pill">免费实验 {remoteCoverage.freeCount}</span>
          ) : null}
          <Link className="ghost" href="/leaderboard">
            去看排行榜
          </Link>
          <Link className="ghost" href="/compare">
            打开模型对比
          </Link>
        </div>
      </section>

      {remoteCoverage ? (
        <section className="panel stack">
          <div className="topbar">
            <div>
              <div className="eyebrow">Collection Workflow</div>
              <h2 className="section-title">远程发现但尚未正式收录的模型</h2>
              <p className="fine">
                先按收录阶段做整理，再决定是否补模型卡、知识卡片、排行榜映射和对比入口。
              </p>
            </div>
            <div className="fine mono">{remoteCoverage.snapshot.fetchedAt}</div>
          </div>
          <div className="intake-guidance-grid">
            <article className="panel workflow-stage-card stack">
              <div className="eyebrow">Intake Rules</div>
              <h3 className="section-title">收录前先过三步检查</h3>
              <div className="stack workflow-mini-list">
                {intakeChecklist.map((item, index) => (
                  <article key={item} className="workflow-mini-card">
                    <strong>{String(index + 1).padStart(2, "0")}</strong>
                    <p className="fine">{item}</p>
                  </article>
                ))}
              </div>
            </article>
            <article className="panel workflow-stage-card stack">
              <div className="eyebrow">Coverage Signal</div>
              <h3 className="section-title">这批远程模型如何进入产品叙事</h3>
              <div className="pill-row">
                <span className="pill">
                  知识卡片 {remoteCoverage.collectedCount}
                </span>
                <span className="pill">
                  待建详情 {remoteCoverage.pendingCount}
                </span>
                <span className="pill">
                  推荐优先 {remoteCoverage.recommendedCount}
                </span>
              </div>
              <p className="fine">
                当前模型库已经不仅是静态目录，而是把远程发现、人工收录、内容补充和页面分发串成一条工作流。
              </p>
              <div className="toolbar">
                <Link className="ghost" href="/docs">
                  查看帮助中心
                </Link>
                <Link className="ghost" href="/compare">
                  去做模型对比
                </Link>
              </div>
            </article>
          </div>
          <div className="collection-stage-grid">
            {collectionBuckets.map((bucket) => (
              <section
                key={bucket.key}
                className="panel stack workflow-stage-card"
              >
                <div>
                  <div className="eyebrow">{bucket.key}</div>
                  <h3 className="section-title">{bucket.title}</h3>
                  <p className="fine">{bucket.copy}</p>
                </div>
                <div className="pill-row">
                  <span className="pill">{bucket.items.length} 个候选</span>
                </div>
                <div className="stack workflow-mini-list">
                  {bucket.items.length > 0 ? (
                    bucket.items.slice(0, 4).map((item) => (
                      <article key={item.id} className="workflow-mini-card">
                        <div>
                          <h4 className="card-title">{item.name}</h4>
                          <div className="fine">{item.id}</div>
                        </div>
                        <div className="pill-row">
                          <span className="pill">{item.providerLabel}</span>
                          <span className="pill">
                            {item.contextLength.toLocaleString("en-US")} ctx
                          </span>
                          {item.promptPricePer1M !== null ? (
                            <span className="pill">
                              ${item.promptPricePer1M}/1M
                            </span>
                          ) : null}
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="fine">当前没有落入这个阶段的候选模型。</div>
                  )}
                </div>
              </section>
            ))}
          </div>

          <div className="cards compact-cards">
            {remoteCoverage.items
              .filter((item) => !item.collected)
              .slice(0, 8)
              .map((item) => (
                <article
                  key={item.id}
                  className="panel stack compact-model-card"
                >
                  <div>
                    <h3 className="card-title">{item.name}</h3>
                    <div className="fine">{item.id}</div>
                  </div>
                  <div className="pill-row">
                    <span className="pill">{item.stage}</span>
                    <span className="pill">{item.providerLabel}</span>
                    {item.preview ? <span className="pill">预览</span> : null}
                    {item.recommended ? (
                      <span className="pill">推荐优先收录</span>
                    ) : null}
                    {item.free ? <span className="pill">免费实验</span> : null}
                  </div>
                  <div className="fine">
                    上下文 {item.contextLength.toLocaleString("en-US")} · 输入 $
                    {item.promptPricePer1M ?? "-"}/1M
                  </div>
                  <div className="fine">
                    输出 ${item.completionPricePer1M ?? "-"}/1M · 模态{" "}
                    {item.modality}
                  </div>
                </article>
              ))}
          </div>
        </section>
      ) : null}

      <section className="cards">
        {modelCatalog.map((model) => (
          <ModelCatalogCard key={model.id} model={model} />
        ))}
      </section>
    </main>
  );
}
