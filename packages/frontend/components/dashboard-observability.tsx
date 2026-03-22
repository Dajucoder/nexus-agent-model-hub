import type { DashboardOverview } from "../lib/dashboard-types";
import type { Dictionary, Locale } from "../lib/dictionary";

export function DashboardResultPanel(props: {
  dict: Dictionary;
  result: string;
}) {
  return (
    <div className="panel stack">
      <h2 className="section-title">{props.dict.apiResult}</h2>
      <div className="fine">
        这里用于查看租户、用户与 Agent
        运行结果，适合作为联调、验收和运维排查时的服务端回显窗口。
      </div>
      <div className="code-box mono">{props.result}</div>
    </div>
  );
}

export function DashboardActivityPanels(props: {
  locale: Locale;
  onRun: (path: string, init?: RequestInit) => void;
  overview: DashboardOverview;
}) {
  const latestAudit = props.overview.auditLogs[0];

  return (
    <div className="grid">
      <div className="panel stack">
        <div className="topbar">
          <div>
            <h2 className="section-title">最近 Agent 运行</h2>
            <div className="fine">
              直接读取后端 `/agents/runs`，用于查看最近执行状态与耗时。
            </div>
          </div>
          <button
            className="ghost"
            onClick={() => props.onRun("/agents/runs")}
            type="button"
          >
            刷新回显
          </button>
        </div>
        <div className="mini-list">
          {props.overview.agentRuns.length > 0 ? (
            props.overview.agentRuns.slice(0, 5).map((item) => (
              <div key={item.id} className="status-item">
                <span>
                  {item.agentType} ·{" "}
                  {new Date(item.createdAt).toLocaleString(props.locale)}
                </span>
                <strong>
                  {item.status}
                  {item.duration ? ` · ${item.duration}ms` : ""}
                </strong>
              </div>
            ))
          ) : (
            <div className="fine">
              当前租户还没有 Agent 运行记录，先执行一次调用即可在这里看到结果。
            </div>
          )}
        </div>
      </div>

      <div className="panel stack">
        <div className="topbar">
          <div>
            <h2 className="section-title">最近审计日志</h2>
            <div className="fine">
              直接读取后端
              `/tenants/current/audit-logs`，帮助确认租户内关键动作是否被记录。
            </div>
          </div>
          <button
            className="ghost"
            onClick={() => props.onRun("/tenants/current/audit-logs?limit=5")}
            type="button"
          >
            查看接口结果
          </button>
        </div>
        <div className="mini-list">
          {props.overview.auditLogs.length > 0 ? (
            props.overview.auditLogs.map((item) => (
              <div key={item.id} className="status-item">
                <span>
                  {item.action} · {item.resource ?? "system"}
                </span>
                <strong>
                  {item.user?.displayName ?? item.user?.email ?? "unknown"} ·{" "}
                  {new Date(item.createdAt).toLocaleString(props.locale)}
                </strong>
              </div>
            ))
          ) : (
            <div className="fine">
              当前还没有可展示的审计记录，注册、登录、Agent 调用后会逐步积累。
            </div>
          )}
        </div>
        {latestAudit ? (
          <div className="fine">最近动作：{latestAudit.action}</div>
        ) : null}
      </div>
    </div>
  );
}
