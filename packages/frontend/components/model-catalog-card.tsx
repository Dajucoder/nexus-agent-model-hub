import Link from "next/link";
import type { ModelCard } from "../lib/model-types";
import { formatNumber, formatPrice } from "../lib/model-utils";

export function ModelCatalogCard({ model }: { model: ModelCard }) {
  const capabilityAverage = Math.round(
    (model.capabilities.reasoning +
      model.capabilities.coding +
      model.capabilities.instructionFollowing +
      model.capabilities.multilingual) /
      4,
  );

  return (
    <article className="panel stack model-card">
      <div className="topbar card-top">
        <div>
          <h3 className="card-title">{model.name}</h3>
          <div className="fine">
            {model.provider.name} · {model.family}
          </div>
        </div>
        <span className="pill">
          {model.openSource ? "Open Source" : "Closed"}
        </span>
      </div>
      <p className="fine">{model.description}</p>
      <div className="pill-row">
        {model.modalities.map((modality) => (
          <span key={modality} className="pill">
            {modality}
          </span>
        ))}
        {model.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="pill">
            {tag}
          </span>
        ))}
      </div>
      <div className="metric-strip">
        <div>
          <span>综合能力</span>
          <strong>{capabilityAverage}</strong>
        </div>
        <div>
          <span>推理</span>
          <strong>{model.capabilities.reasoning}</strong>
        </div>
        <div>
          <span>代码</span>
          <strong>{model.capabilities.coding}</strong>
        </div>
      </div>
      <div className="meta-row">
        <span>{formatNumber(model.contextWindow)} tokens</span>
        <span>{formatPrice(model.pricing.inputPer1M)}/1M input</span>
      </div>
      <div className="meta-row">
        <span>{model.useCases.slice(0, 2).join(" / ")}</span>
        <span>发布于 {model.releaseDate}</span>
      </div>
      <div className="toolbar" style={{ marginTop: "16px" }}>
        <Link className="btn" href={`/models/${model.slug}`}>
          查看详情
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
    </article>
  );
}
