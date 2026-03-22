"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LeaderboardTable } from "../../components/leaderboard-table";
import type {
  LeaderboardBundle,
  LeaderboardFeedId,
} from "../../lib/model-types";

type Tab = LeaderboardFeedId;

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("arena");
  const [data, setData] = useState<LeaderboardBundle | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((response) => response.json())
      .then((payload) => {
        setData(payload);
        setUpdatedAt(payload.updatedAt);
        setError("");
      })
      .catch(() => {
        setError("排行榜数据加载失败，请稍后重试。");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const activeFeed = data?.feeds[tab];
  const activeEntries = activeFeed?.entries ?? [];
  const openrouterDiagnostics = data?.diagnostics?.openrouter;
  const leader = activeEntries[0];
  const lowCostLeader = [...activeEntries].sort(
    (left, right) => left.inputPrice - right.inputPrice,
  )[0];
  const strongestReasoner = [...activeEntries].sort(
    (left, right) => right.reasoningScore - left.reasoningScore,
  )[0];
  const averageScore =
    activeEntries.length > 0
      ? Math.round(
          activeEntries.reduce((total, entry) => total + entry.score, 0) /
            activeEntries.length,
        )
      : 0;

  return (
    <main className="shell stack">
      <section className="panel stack page-hero">
        <div className="topbar">
          <div>
            <div className="eyebrow">Leaderboard</div>
            <h1 className="page-title">模型排行榜</h1>
            <p className="fine">
              现在使用仓库内版本化快照自动生成排行榜，避免页面散落伪分数，同时为后续接入定时抓取和后台导入保留统一数据口。最近更新时间：
              {updatedAt
                ? new Date(updatedAt).toLocaleString("zh-CN")
                : "加载中"}
            </p>
          </div>
          <div className="pill-row">
            <span className="pill accent-pill">
              {activeFeed?.mode === "live" ? "自动抓取中" : "快照回退中"}
            </span>
            {openrouterDiagnostics ? (
              <span className="pill">
                {openrouterDiagnostics.status === "ok"
                  ? "远程可用"
                  : "使用快照"}
              </span>
            ) : null}
            {(["arena", "openrouter", "combined"] as const).map((item) => (
              <button
                key={item}
                className={tab === item ? "btn" : "ghost"}
                onClick={() => setTab(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat-card">
            <span>当前榜首</span>
            <strong>{leader?.modelName ?? "加载中"}</strong>
          </div>
          <div className="stat-card">
            <span>低成本代表</span>
            <strong>{lowCostLeader?.modelName ?? "-"}</strong>
          </div>
          <div className="stat-card">
            <span>推理最强</span>
            <strong>{strongestReasoner?.modelName ?? "-"}</strong>
          </div>
          <div className="stat-card">
            <span>数据条数</span>
            <strong>{activeEntries.length}</strong>
          </div>
          <div className="stat-card">
            <span>平均分</span>
            <strong>{averageScore || "-"}</strong>
          </div>
          <div className="stat-card">
            <span>当前来源</span>
            <strong>{tab}</strong>
          </div>
          <div className="stat-card">
            <span>数据模式</span>
            <strong>{activeFeed?.mode ?? "-"}</strong>
          </div>
          <div className="stat-card">
            <span>覆盖模型</span>
            <strong>{activeFeed?.coverage ?? 0}</strong>
          </div>
        </div>
        <div className="insight-grid">
          <article className="insight-card">
            <span>榜首解读</span>
            <strong>{leader?.modelName ?? "等待数据"}</strong>
            <p>
              {leader
                ? `${leader.provider} · ${leader.category} · 分数 ${leader.score}`
                : "正在加载当前榜单。"}
            </p>
          </article>
          <article className="insight-card">
            <span>成本观察</span>
            <strong>{lowCostLeader?.modelName ?? "等待数据"}</strong>
            <p>
              {lowCostLeader
                ? `输入价格 $${lowCostLeader.inputPrice.toFixed(2)} / 1M tokens`
                : "正在计算成本代表模型。"}
            </p>
          </article>
          <article className="insight-card">
            <span>推荐动作</span>
            <strong>继续深入验证</strong>
            <p>
              排行榜用于快速筛选方向，建议结合模型详情和对比页确认价格、上下文和能力画像。
            </p>
          </article>
        </div>
        <section className="leaderboard-banner">
          <div>
            <span className="eyebrow">Data Pipeline</span>
            <h2 className="section-title">自动抓取优先，稳定快照兜底</h2>
            <p className="fine">
              OpenRouter
              榜单会优先尝试抓取公开页面并映射到本地模型目录；如果网络受限、结构变化或抓取失败，接口会自动回退到仓库内快照，确保线上始终有一致输出。
            </p>
            {openrouterDiagnostics ? (
              <p className="fine">状态说明：{openrouterDiagnostics.message}</p>
            ) : null}
          </div>
        </section>
        <div className="pill-row">
          <Link className="ghost" href="/models">
            查看模型库
          </Link>
          <Link className="ghost" href="/compare">
            进入模型对比
          </Link>
        </div>
        {activeFeed ? (
          <div className="fine">{activeFeed.methodology}</div>
        ) : null}
        {error ? <div className="danger">{error}</div> : null}
      </section>
      {loading ? (
        <section className="panel empty-state">
          <h2 className="section-title">正在加载排行榜</h2>
          <p className="fine">榜单数据正在整理中，请稍候片刻。</p>
        </section>
      ) : (
        <LeaderboardTable
          entries={activeEntries}
          feed={
            activeFeed ?? {
              id: tab,
              title: "Unavailable",
              mode: "snapshot",
              capturedAt: updatedAt,
              importedAt: updatedAt,
              coverage: 0,
              methodology: "",
              note: "",
              entries: [],
            }
          }
        />
      )}
    </main>
  );
}
