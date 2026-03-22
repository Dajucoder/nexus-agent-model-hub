import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownArticle } from "../../../components/markdown-renderer";
import { getModelArticle } from "../../../lib/model-content";
import { getModelBySlug, modelCatalog } from "../../../lib/model-data";
import {
  capabilityLabels,
  formatNumber,
  formatPrice,
  scoreColor,
} from "../../../lib/model-utils";

export function generateStaticParams() {
  return modelCatalog.map((model) => ({ slug: model.slug }));
}

export default async function ModelDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const model = getModelBySlug(params.slug);
  if (!model) {
    notFound();
  }

  const article = await getModelArticle(params.slug);

  const relatedModels = modelCatalog
    .filter((candidate) => candidate.id !== model.id)
    .sort((left, right) => {
      const sameProviderDelta =
        Number(right.provider.id === model.provider.id) -
        Number(left.provider.id === model.provider.id);
      if (sameProviderDelta !== 0) {
        return sameProviderDelta;
      }

      const sameFamilyDelta =
        Number(right.family === model.family) -
        Number(left.family === model.family);
      if (sameFamilyDelta !== 0) {
        return sameFamilyDelta;
      }

      return right.capabilities.reasoning - left.capabilities.reasoning;
    })
    .slice(0, 3);

  return (
    <main className="shell stack">
      <section className="panel stack">
        <div className="toolbar">
          <Link className="ghost" href="/models">
            返回模型库
          </Link>
          <Link className="ghost" href={`/compare?pick=${model.slug}`}>
            加入对比
          </Link>
          <a
            className="ghost"
            href={model.provider.docsUrl}
            target="_blank"
            rel="noreferrer"
          >
            官方文档
          </a>
        </div>
        <div className="topbar card-top">
          <div>
            <h1 className="page-title">{model.name}</h1>
            <div className="fine">
              {model.provider.name} · {model.family} · {model.version}
            </div>
          </div>
          <span className="pill">
            {model.openSource ? (model.license ?? "Open Source") : "Commercial"}
          </span>
        </div>
        <p>{model.description}</p>
        <div className="pill-row">
          {model.tags.map((tag) => (
            <span key={tag} className="pill">
              {tag}
            </span>
          ))}
        </div>
        <div className="grid">
          <div className="kpi">
            <div>上下文</div>
            <strong>{formatNumber(model.contextWindow)}</strong>
          </div>
          <div className="kpi">
            <div>最大输出</div>
            <strong>{formatNumber(model.maxOutputTokens)}</strong>
          </div>
          <div className="kpi">
            <div>输入价格</div>
            <strong>{formatPrice(model.pricing.inputPer1M)}</strong>
          </div>
          <div className="kpi">
            <div>输出价格</div>
            <strong>{formatPrice(model.pricing.outputPer1M)}</strong>
          </div>
          <div className="kpi">
            <div>发布时间</div>
            <strong>{model.releaseDate}</strong>
          </div>
          <div className="kpi">
            <div>推理评分</div>
            <strong>{model.capabilities.reasoning}</strong>
          </div>
          <div className="kpi">
            <div>代码评分</div>
            <strong>{model.capabilities.coding}</strong>
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="panel stack">
          <h2 className="section-title">能力评分</h2>
          {Object.entries(model.capabilities).map(([key, value]) => (
            <div key={key} className="score-row">
              <span>{capabilityLabels[key]}</span>
              <div className="score-track">
                <div
                  className={`score-bar ${scoreColor(value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <div className="panel stack">
          <h2 className="section-title">基准测试</h2>
          {model.benchmarks.map((benchmark) => (
            <div key={benchmark.name} className="meta-row">
              <span>{benchmark.name}</span>
              <strong>
                {benchmark.score}
                {benchmark.unit}
              </strong>
            </div>
          ))}
          <h2 className="section-title">支持模态</h2>
          <div className="pill-row">
            {model.modalities.map((modality) => (
              <span key={modality} className="pill">
                {modality}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="cards">
        <article className="panel stack">
          <h2 className="section-title">优势</h2>
          {model.strengths.map((item) => (
            <div key={item} className="fine">
              - {item}
            </div>
          ))}
        </article>
        <article className="panel stack">
          <h2 className="section-title">局限</h2>
          {model.limitations.map((item) => (
            <div key={item} className="fine">
              - {item}
            </div>
          ))}
        </article>
        <article className="panel stack">
          <h2 className="section-title">适用场景</h2>
          {model.useCases.map((item) => (
            <div key={item} className="fine">
              - {item}
            </div>
          ))}
        </article>
      </section>

      {article ? (
        <section className="panel stack">
          <div className="topbar">
            <div>
              <div className="eyebrow">Knowledge Card</div>
              <h2 className="section-title">内容文档与模型数据联动</h2>
            </div>
            <div className="pill-row">
              {Array.isArray(article.frontmatter.tags)
                ? article.frontmatter.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="pill">
                      {tag}
                    </span>
                  ))
                : null}
            </div>
          </div>
          <div className="insight-grid">
            <article className="insight-card">
              <span>文档状态</span>
              <strong>{String(article.frontmatter.status ?? "active")}</strong>
              <p>{String(article.frontmatter.meta_title ?? model.name)}</p>
            </article>
            <article className="insight-card">
              <span>文档路径</span>
              <strong>{article.relativePath}</strong>
              <p>模型详情页现在会在存在 MDX 内容时自动展示仓库内的内容卡片。</p>
            </article>
            <article className="insight-card">
              <span>使用方式</span>
              <strong>数据 + 内容双来源</strong>
              <p>
                结构化指标来自 `model-data.ts`，长文说明来自
                `content/models/*.mdx`。
              </p>
            </article>
          </div>
          <MarkdownArticle content={article.body} />
        </section>
      ) : null}

      <section className="panel stack">
        <div className="topbar">
          <div>
            <div className="eyebrow">Related Picks</div>
            <h2 className="section-title">继续查看的相近模型</h2>
          </div>
          <Link
            className="ghost"
            href={`/compare?pick=${[model.slug, ...relatedModels.map((item) => item.slug)].join(",")}`}
          >
            一键加入对比
          </Link>
        </div>
        <div className="cards compact-cards">
          {relatedModels.map((item) => (
            <article key={item.id} className="panel stack compact-model-card">
              <div>
                <h3 className="card-title">{item.name}</h3>
                <div className="fine">
                  {item.provider.name} · {item.family}
                </div>
              </div>
              <p className="fine">{item.description}</p>
              <div className="pill-row">
                <span className="pill">推理 {item.capabilities.reasoning}</span>
                <span className="pill">代码 {item.capabilities.coding}</span>
              </div>
              <div className="toolbar">
                <Link className="ghost" href={`/models/${item.slug}`}>
                  查看详情
                </Link>
                <Link
                  className="ghost"
                  href={`/compare?pick=${model.slug},${item.slug}`}
                >
                  与当前模型对比
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
