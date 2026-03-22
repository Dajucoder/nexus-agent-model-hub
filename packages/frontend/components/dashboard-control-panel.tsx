import Link from "next/link";
import type { DashboardOverview } from "../lib/dashboard-types";
import type { Dictionary } from "../lib/dictionary";
import type { SessionState } from "../lib/session";

export function DashboardControlPanel(props: {
  agentInput: string;
  agentType: string;
  dict: Dictionary;
  onAgentInputChange: (value: string) => void;
  onAgentTypeChange: (value: string) => void;
  onCallAgent: () => void;
  onRun: (path: string, init?: RequestInit) => void;
  overview: DashboardOverview;
  session: SessionState;
}) {
  return (
    <div className="panel stack">
      <h2 className="section-title">{props.dict.quickStart}</h2>
      <div className="mini-list">
        <div className="status-item">
          <span>租户</span>
          <strong>
            {props.overview.tenant?.name ?? props.session.tenantSlug}
          </strong>
        </div>
        <div className="status-item">
          <span>账号</span>
          <strong>
            {props.overview.me?.email ?? props.session.user.email}
          </strong>
        </div>
        <div className="status-item">
          <span>后端版本</span>
          <strong>{props.overview.platform?.app.version ?? "0.1.0"}</strong>
        </div>
      </div>
      <div className="toolbar">
        <Link className="ghost" href="/models">
          模型库
        </Link>
        <Link className="ghost" href="/leaderboard">
          排行榜
        </Link>
        <Link className="ghost" href="/settings">
          供应商配置
        </Link>
        <Link className="ghost" href="/docs">
          文档中心
        </Link>
      </div>
      <div className="toolbar">
        <button
          className="ghost"
          onClick={() => props.onRun("/tenants/current")}
          type="button"
        >
          {props.dict.loadTenant}
        </button>
        <button
          className="ghost"
          onClick={() => props.onRun("/users")}
          type="button"
        >
          {props.dict.loadUsers}
        </button>
        <button
          className="ghost"
          onClick={() => props.onRun("/agents")}
          type="button"
        >
          {props.dict.loadAgents}
        </button>
        <button
          className="ghost"
          onClick={() => props.onRun("/agents/runs")}
          type="button"
        >
          {props.dict.loadRuns}
        </button>
      </div>
      <div className="field">
        <label>Agent</label>
        <select
          value={props.agentType}
          onChange={(event) => props.onAgentTypeChange(event.target.value)}
        >
          <option value="echo">echo</option>
          <option value="calculator">calculator</option>
          <option value="file_processor">file_processor</option>
        </select>
      </div>
      <div className="field">
        <label>{props.dict.agentInput}</label>
        <textarea
          rows={10}
          value={props.agentInput}
          onChange={(event) => props.onAgentInputChange(event.target.value)}
        />
      </div>
      <button className="btn" onClick={props.onCallAgent} type="button">
        {props.dict.callAgent}
      </button>
    </div>
  );
}
