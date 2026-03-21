import Link from 'next/link';
import type { LeaderboardEntry } from '../lib/model-types';

export function LeaderboardTable(props: { entries: LeaderboardEntry[] }) {
  return (
    <div className="panel table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>模型</th>
            <th>供应商</th>
            <th>分数</th>
          </tr>
        </thead>
        <tbody>
          {props.entries.map((entry) => (
            <tr key={`${entry.source}-${entry.modelId}`}>
              <td>{entry.rank}</td>
              <td>
                <Link href={`/models/${entry.modelId}`}>{entry.modelName}</Link>
              </td>
              <td>{entry.provider}</td>
              <td>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
