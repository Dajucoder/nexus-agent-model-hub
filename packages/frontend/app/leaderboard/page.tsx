'use client';

import { useEffect, useState } from 'react';
import { LeaderboardTable } from '../../components/leaderboard-table';
import type { LeaderboardEntry } from '../../lib/model-types';

type Tab = 'arena' | 'openrouter' | 'combined';

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('arena');
  const [data, setData] = useState<Record<Tab, LeaderboardEntry[]>>({
    arena: [],
    openrouter: [],
    combined: []
  });
  const [updatedAt, setUpdatedAt] = useState('');

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((response) => response.json())
      .then((payload) => {
        setData({
          arena: payload.arena,
          openrouter: payload.openrouter,
          combined: payload.combined
        });
        setUpdatedAt(payload.updatedAt);
      });
  }, []);

  return (
    <main className="shell stack">
      <section className="panel stack">
        <div className="topbar">
          <div>
            <div className="eyebrow">Leaderboard</div>
            <h1 className="page-title">模型排行榜</h1>
            <p className="fine">聚合原模型站的排行能力与当前平台的统一前端。最近更新时间：{updatedAt || '加载中'}</p>
          </div>
          <div className="pill-row">
            {(['arena', 'openrouter', 'combined'] as const).map((item) => (
              <button key={item} className={tab === item ? 'btn' : 'ghost'} onClick={() => setTab(item)} type="button">
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>
      <LeaderboardTable entries={data[tab]} />
    </main>
  );
}
