"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { modelCatalog } from "../../lib/model-data";
import {
  capabilityLabels,
  formatNumber,
  formatPrice,
  scoreColor,
} from "../../lib/model-utils";

function ComparePageClient() {
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string[]>([
    "gpt-4o",
    "claude-sonnet-4-20250514",
  ]);
  const didApplyQueryRef = useRef(false);
  const picks = useMemo(
    () => modelCatalog.filter((model) => selected.includes(model.id)),
    [selected],
  );
  const cheapestInput =
    picks.length > 0
      ? [...picks].sort(
          (left, right) => left.pricing.inputPer1M - right.pricing.inputPer1M,
        )[0]
      : null;
  const maxContext =
    picks.length > 0
      ? [...picks].sort(
          (left, right) => right.contextWindow - left.contextWindow,
        )[0]
      : null;
  const bestReasoning =
    picks.length > 0
      ? [...picks].sort(
          (left, right) =>
            right.capabilities.reasoning - left.capabilities.reasoning,
        )[0]
      : null;

  useEffect(() => {
    if (didApplyQueryRef.current) {
      return;
    }

    const requested = searchParams
      .getAll("pick")
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);

    if (requested.length === 0) {
      didApplyQueryRef.current = true;
      return;
    }

    const next = requested
      .map(
        (pick) =>
          modelCatalog.find((model) => model.id === pick || model.slug === pick)
            ?.id,
      )
      .filter((value): value is string => Boolean(value))
      .slice(0, 4);

    if (next.length > 0) {
      setSelected([...new Set(next)]);
    }

    didApplyQueryRef.current = true;
  }, [searchParams]);

  function toggle(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) return current;
      return [...current, id];
    });
  }

  return (
    <main className="shell stack">
      <section className="panel stack page-hero">
        <div className="eyebrow">Compare</div>
        <h1 className="page-title">模型对比</h1>
        <p className="fine">
          选择 2 到 4 个模型，快速查看价格、上下文和能力差异。
        </p>
        <div className="stat-grid">
          <div className="stat-card">
            <span>已选择</span>
            <strong>{selected.length}</strong>
          </div>
          <div className="stat-card">
            <span>最低输入价格</span>
            <strong>
              {cheapestInput
                ? formatPrice(cheapestInput.pricing.inputPer1M)
                : "-"}
            </strong>
          </div>
          <div className="stat-card">
            <span>最大上下文</span>
            <strong>
              {maxContext ? formatNumber(maxContext.contextWindow) : "-"}
            </strong>
          </div>
          <div className="stat-card">
            <span>推荐数量</span>
            <strong>2 - 4</strong>
          </div>
        </div>
        <div className="insight-grid">
          <article className="insight-card">
            <span>最低成本</span>
            <strong>{cheapestInput?.name ?? "-"}</strong>
            <p>
              {cheapestInput
                ? `${formatPrice(cheapestInput.pricing.inputPer1M)} / 1M input`
                : "至少选择两个模型后展示"}
            </p>
          </article>
          <article className="insight-card">
            <span>最长上下文</span>
            <strong>{maxContext?.name ?? "-"}</strong>
            <p>
              {maxContext
                ? `${formatNumber(maxContext.contextWindow)} tokens`
                : "至少选择两个模型后展示"}
            </p>
          </article>
          <article className="insight-card">
            <span>推理最强</span>
            <strong>{bestReasoning?.name ?? "-"}</strong>
            <p>
              {bestReasoning
                ? `推理 ${bestReasoning.capabilities.reasoning} 分`
                : "至少选择两个模型后展示"}
            </p>
          </article>
        </div>
        <div className="toolbar">
          <button
            className="ghost"
            type="button"
            onClick={() => setSelected(["gpt-4o", "claude-sonnet-4-20250514"])}
          >
            重置默认
          </button>
          <button
            className="ghost"
            type="button"
            onClick={() => setSelected([])}
          >
            清空选择
          </button>
          <Link className="ghost" href="/leaderboard">
            查看排行榜
          </Link>
        </div>
        <div className="pill-row">
          {modelCatalog.map((model) => (
            <button
              key={model.id}
              type="button"
              className={selected.includes(model.id) ? "btn" : "ghost"}
              onClick={() => toggle(model.id)}
            >
              {model.name}
            </button>
          ))}
        </div>
      </section>

      {picks.length < 2 ? (
        <section className="panel empty-state">
          <h2 className="section-title">至少选择两个模型</h2>
          <p className="fine">
            详情页里的“加入对比”链接现在已经可生效，也可以在这里继续手动追加模型。
          </p>
        </section>
      ) : (
        <section className="panel table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>维度</th>
                {picks.map((model) => (
                  <th key={model.id}>{model.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>供应商</td>
                {picks.map((model) => (
                  <td key={model.id}>{model.provider.name}</td>
                ))}
              </tr>
              <tr>
                <td>上下文窗口</td>
                {picks.map((model) => (
                  <td key={model.id}>{formatNumber(model.contextWindow)}</td>
                ))}
              </tr>
              <tr>
                <td>输入价格</td>
                {picks.map((model) => (
                  <td key={model.id}>
                    {formatPrice(model.pricing.inputPer1M)}
                  </td>
                ))}
              </tr>
              <tr>
                <td>输出价格</td>
                {picks.map((model) => (
                  <td key={model.id}>
                    {formatPrice(model.pricing.outputPer1M)}
                  </td>
                ))}
              </tr>
              {Object.entries(capabilityLabels).map(([key, label]) => (
                <tr key={key}>
                  <td>{label}</td>
                  {picks.map((model) => {
                    const score =
                      model.capabilities[
                        key as keyof typeof model.capabilities
                      ];
                    return (
                      <td key={model.id}>
                        <div className="compare-score">
                          <div className="score-track">
                            <div
                              className={`score-bar ${scoreColor(score)}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <strong>{score}</strong>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <main className="shell stack">
          <section className="panel empty-state">
            <h1 className="page-title">模型对比</h1>
            <p className="fine">正在准备对比数据...</p>
          </section>
        </main>
      }
    >
      <ComparePageClient />
    </Suspense>
  );
}
