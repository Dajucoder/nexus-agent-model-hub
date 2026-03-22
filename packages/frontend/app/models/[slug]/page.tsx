import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getModelBySlug, modelCatalog } from '../../../lib/model-data';
import { capabilityLabels, formatNumber, formatPrice, scoreColor } from '../../../lib/model-utils';

export function generateStaticParams() {
  return modelCatalog.map((model) => ({ slug: model.slug }));
}

export default function ModelDetailPage({ params }: { params: { slug: string } }) {
  const model = getModelBySlug(params.slug);
  if (!model) {
    notFound();
  }

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
          <a className="ghost" href={model.provider.docsUrl} target="_blank" rel="noreferrer">
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
          <span className="pill">{model.openSource ? model.license ?? 'Open Source' : 'Commercial'}</span>
        </div>
        <p>{model.description}</p>
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
        </div>
      </section>

      <section className="grid">
        <div className="panel stack">
          <h2 className="section-title">能力评分</h2>
          {Object.entries(model.capabilities).map(([key, value]) => (
            <div key={key} className="score-row">
              <span>{capabilityLabels[key]}</span>
              <div className="score-track">
                <div className={`score-bar ${scoreColor(value)}`} style={{ width: `${value}%` }} />
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
    </main>
  );
}
