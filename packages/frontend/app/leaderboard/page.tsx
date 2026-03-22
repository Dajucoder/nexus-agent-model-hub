'use client';

import { useEffect, useState } from 'react';
import { LeaderboardTable } from '../../components/leaderboard-table';
import type { LeaderboardBundle, LeaderboardFeedId } from '../../lib/model-types';

type Tab = LeaderboardFeedId;

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('arena');
  const [data, setData] = useState<LeaderboardBundle | null>(null);
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((response) => response.json())
      .then((payload) => {
        setData(payload);
        setUpdatedAt(payload.updatedAt);
        setError('');
      })
      .catch(() => {
        setError('排行榜数据加载失败，请稍后重试。');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const activeFeed = data?.feeds[tab];
  const activeEntries = activeFeed?.entries ?? [];
  const leader = activeEntries[0];
  const averageScore =
    activeEntries.length > 0
      ? Math.round(activeEntries.reduce((total, entry) => total + entry.score, 0) / activeEntries.length)
      : 0;

  return (
    <main className="shell stack">
      <section className="panel stack page-hero">
        <div className="topbar">
          <div>
            <div className="eyebrow">Leaderboard</div>
            <h1 className="page-title">模型排行榜</h1>
            <p className="fine">
              现在使用版本化榜单快照而不是页面内假分数，方便上线部署时保持数据来源、更新时间和方法说明一致。最近更新时间：
              {updatedAt ? new Date(updatedAt).toLocaleString('zh-CN') : '加载中'}
            </p>
          </div>
          <div className="pill-row">
            {(['arena', 'openrouter', 'combined'] as const).map((item) => (
              <button key={item} className={tab === item ? 'btn' : 'ghost'} onClick={() => setTab(item)} type="button">
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat-card">
            <span>当前榜首</span>
            <strong>{leader?.modelName ?? '加载中'}</strong>
          </div>
          <div className="stat-card">
            <span>数据条数</span>
            <strong>{activeEntries.length}</strong>
          </div>
          <div className="stat-card">
            <span>平均分</span>
            <strong>{averageScore || '-'}</strong>
          </div>
          <div className="stat-card">
            <span>当前来源</span>
            <strong>{tab}</strong>
          </div>
          <div className="stat-card">
            <span>数据模式</span>
            <strong>{activeFeed?.mode ?? '-'}</strong>
          </div>
          <div className="stat-card">
            <span>覆盖模型</span>
            <strong>{activeFeed?.coverage ?? 0}</strong>
          </div>
        </div>
        {activeFeed ? <div className="fine">{activeFeed.methodology}</div> : null}
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
              title: 'Unavailable',
              mode: 'snapshot',
              capturedAt: updatedAt,
              importedAt: updatedAt,
              coverage: 0,
              methodology: '',
              note: '',
              entries: []
            }
          }
        />
      )}
    </main>
  );
}
