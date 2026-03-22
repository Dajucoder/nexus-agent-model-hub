import Link from "next/link";
import type { LeaderboardEntry, LeaderboardFeed } from "../lib/model-types";
import { formatNumber, formatPrice } from "../lib/model-utils";

export function LeaderboardTable(props: {
  entries: LeaderboardEntry[];
  feed: LeaderboardFeed;
}) {
  if (props.entries.length === 0) {
    return (
      <div className="panel empty-state">
        <h2 className="section-title">排行榜数据暂不可用</h2>
        <p className="fine">
          当前还没有可展示的数据，稍后重试或切换其他榜单来源。
        </p>
      </div>
    );
  }

  return (
    <div className="panel stack">
      <div className="leaderboard-meta">
        <div>
          <div className="section-title">{props.feed.title}</div>
          <p className="fine">{props.feed.note}</p>
        </div>
        <div className="pill-row">
          <span className="pill">模式 {props.feed.mode}</span>
          <span className="pill">覆盖 {props.feed.coverage}</span>
          <span className="pill">
            导入 {new Date(props.feed.importedAt).toLocaleDateString("zh-CN")}
          </span>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>模型</th>
              <th>供应商</th>
              <th>标签</th>
              <th>上下文</th>
              <th>输入价格</th>
              <th>推理</th>
              <th>分数</th>
            </tr>
          </thead>
          <tbody>
            {props.entries.map((entry) => (
              <tr key={`${entry.source}-${entry.modelId}`}>
                <td>
                  <span className="rank-badge">{entry.rank}</span>
                </td>
                <td>
                  <Link href={`/models/${entry.modelSlug}`}>
                    {entry.modelName}
                  </Link>
                </td>
                <td>{entry.provider}</td>
                <td>{entry.category}</td>
                <td>{formatNumber(entry.contextWindow)}</td>
                <td>{formatPrice(entry.inputPrice)}</td>
                <td>{entry.reasoningScore}</td>
                <td>{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
