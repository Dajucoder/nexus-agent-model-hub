"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { ModelCatalogCard } from "../../components/model-catalog-card";
import {
  getCatalogHighlights,
  modelCatalog,
  providerDirectory,
  searchModels,
} from "../../lib/model-data";
import { formatPrice } from "../../lib/model-utils";

export default function ModelsPage() {
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("all");
  const deferredQuery = useDeferredValue(query);

  const providers = [
    "all",
    ...new Set(modelCatalog.map((model) => model.provider.id)),
  ];
  const models = searchModels(deferredQuery, provider);
  const {
    openSourceCount,
    cheapestModel,
    bestReasoningModel,
    bestCodingModel,
    maxContextModel,
  } = getCatalogHighlights();

  return (
    <main className="shell stack">
      <section className="panel stack page-hero">
        <div className="eyebrow">Model Hub</div>
        <h1 className="page-title">模型库</h1>
        <p className="fine">
          把模型资料、价格、能力评分和适用场景集中到一个选择入口。页面不仅展示静态模型卡，还会根据当前目录自动提炼最强推理、最强代码、最低成本和最长上下文等关键信号。
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
        <div className="toolbar">
          <input
            className="search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索模型名称、描述或标签"
          />
          <select
            className="select-input"
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
          >
            {providers.map((item) => (
              <option key={item} value={item}>
                {item === "all"
                  ? "全部供应商"
                  : (providerDirectory[item]?.name ?? item)}
              </option>
            ))}
          </select>
        </div>
        <div className="pill-row">
          <span className="pill">当前结果 {models.length}</span>
          {provider !== "all" ? (
            <span className="pill">供应商 {provider}</span>
          ) : null}
          {deferredQuery.trim() ? (
            <span className="pill">关键词 {deferredQuery.trim()}</span>
          ) : null}
          <Link className="ghost" href="/leaderboard">
            去看排行榜
          </Link>
          <Link className="ghost" href="/compare">
            打开模型对比
          </Link>
        </div>
      </section>

      {models.length > 0 ? (
        <section className="cards">
          {models.map((model) => (
            <ModelCatalogCard key={model.id} model={model} />
          ))}
        </section>
      ) : (
        <section className="panel empty-state">
          <h2 className="section-title">没有匹配的模型</h2>
          <p className="fine">
            可以尝试清空关键词，或切换回“all”查看完整模型目录。
          </p>
        </section>
      )}
    </main>
  );
}
