import type { DashboardOverview } from "../lib/dashboard-types";
import type { SessionState } from "../lib/session";

export function DashboardWelcome(props: {
  overview: DashboardOverview;
  overviewLoading: boolean;
  session: SessionState;
}) {
  const latestRun = props.overview.agentRuns[0];
  const isBootstrapTenant =
    (props.overview.tenant?.slug ?? props.session.tenantSlug) === "primary";

  return (
    <>
      <section className="panel stack dashboard-welcome">
        <div className="topbar">
          <div>
            <div className="eyebrow">Workspace Onboarding</div>
            <h1 className="section-title">
              欢迎进入 {props.overview.tenant?.name ?? props.session.tenantSlug}
            </h1>
          </div>
          <div className="pill-row">
            <span className="pill">{props.session.user.role}</span>
            <span className="pill">
              {isBootstrapTenant ? "Bootstrap Tenant" : "Custom Tenant"}
            </span>
          </div>
        </div>
        <div className="insight-grid">
          <article className="insight-card">
            <span>第一步</span>
            <strong>检查工作区配置</strong>
            <p>
              先确认当前租户、用户与后端版本都能正常读取，再继续调试 Agent
              和模型能力。
            </p>
          </article>
          <article className="insight-card">
            <span>第二步</span>
            <strong>配置供应商密钥</strong>
            <p>
              如果你准备体验真实模型调用，下一步建议先到 `/settings`
              保存可用的供应商配置。
            </p>
          </article>
          <article className="insight-card">
            <span>第三步</span>
            <strong>跑一次 Agent</strong>
            <p>
              执行一次内置 Agent
              后，这个控制台里的最近运行和审计日志就会开始出现真实记录。
            </p>
          </article>
        </div>
      </section>

      <div className="panel">
        <div className="cards">
          <div className="kpi">
            <div>并发多用户</div>
            <strong>
              {props.overview.tenant?._count.users ??
                (props.overviewLoading ? "..." : 0)}
            </strong>
          </div>
          <div className="kpi">
            <div>租户隔离</div>
            <strong>{props.overview.tenant?.plan ?? "tenant scoped"}</strong>
          </div>
          <div className="kpi">
            <div>内置 Agent 工具</div>
            <strong>
              {props.overview.platform?.agentRuntime.builtinAgents.length ??
                (props.overviewLoading ? "..." : 0)}{" "}
              builtin
            </strong>
          </div>
          <div className="kpi">
            <div>最近 Agent 运行</div>
            <strong>
              {latestRun
                ? latestRun.agentType
                : props.overviewLoading
                  ? "..."
                  : "暂无"}
            </strong>
          </div>
        </div>
      </div>
    </>
  );
}
