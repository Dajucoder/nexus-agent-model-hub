import Link from 'next/link';
import type { ModelCard } from '../lib/model-types';
import { formatNumber, formatPrice } from '../lib/model-utils';

export function ModelCatalogCard({ model }: { model: ModelCard }) {
  return (
    <article className="panel stack model-card">
      <div className="topbar card-top">
        <div>
          <h3 className="card-title">{model.name}</h3>
          <div className="fine">
            {model.provider.name} · {model.family}
          </div>
        </div>
        <span className="pill">{model.openSource ? 'Open Source' : 'Closed'}</span>
      </div>
      <p className="fine">{model.description}</p>
      <div className="pill-row">
        {model.modalities.map((modality) => (
          <span key={modality} className="pill">
            {modality}
          </span>
        ))}
      </div>
      <div className="meta-row">
        <span>{formatNumber(model.contextWindow)} tokens</span>
        <span>{formatPrice(model.pricing.inputPer1M)}/1M input</span>
      </div>
      <div className="meta-row">
        <span>{model.useCases.slice(0, 2).join(' / ')}</span>
        <span>发布于 {model.releaseDate}</span>
      </div>
      <div className="toolbar" style={{ marginTop: '16px' }}>
        <Link className="btn" href={`/models/${model.slug}`}>
          查看详情
        </Link>
        <a className="ghost" href={model.provider.docsUrl} target="_blank" rel="noreferrer">
          官方文档
        </a>
      </div>
    </article>
  );
}
