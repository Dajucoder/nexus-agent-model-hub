"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authedRequest, request } from "../lib/api";
import { getDictionary, type Locale } from "../lib/dictionary";
import {
  clearSession,
  loadSession,
  saveSession,
  type SessionState,
} from "../lib/session";
import { LanguageSwitcher } from "./language-switcher";

const defaultAgentInput = `{
  "message": "generate an operational summary for this workspace"
}`;

interface OverviewState {
  me: {
    id: string;
    email: string;
    displayName: string;
    locale: string;
    role: string;
    lastLoginAt: string | null;
  } | null;
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    _count: {
      users: number;
      agentRuns: number;
    };
  } | null;
  platform: {
    app: {
      name: string;
      version: string;
      environment: string;
    };
    agentRuntime: {
      builtinAgents: Array<{
        type: string;
        name: string;
        description: string;
      }>;
      timeoutMs: number;
      concurrencyLimit: number;
    };
  } | null;
  agentRuns: Array<{
    id: string;
    agentType: string;
    status: string;
    duration: number | null;
    createdAt: string;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    resource: string | null;
    createdAt: string;
    user?: {
      email?: string | null;
      displayName?: string | null;
    } | null;
  }>;
}

export function DashboardClient() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState | null>(null);
  const [locale, setLocale] = useState<Locale>("zh-CN");
  const [result, setResult] = useState("No request made yet.");
  const [agentType, setAgentType] = useState("echo");
  const [agentInput, setAgentInput] = useState(defaultAgentInput);
  const [overview, setOverview] = useState<OverviewState>({
    me: null,
    tenant: null,
    platform: null,
    agentRuns: [],
    auditLogs: [],
  });
  const [overviewError, setOverviewError] = useState("");
  const [overviewLoading, setOverviewLoading] = useState(true);
  const deferredAgentInput = useDeferredValue(agentInput);

  useEffect(() => {
    const current = loadSession();
    if (!current) {
      router.replace("/login");
      return;
    }
    setSession(current);
    setLocale(current.locale);
  }, [router]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;
    setOverviewLoading(true);

    Promise.all([
      authedRequest("/auth/me", { ...session, locale }),
      authedRequest("/tenants/current", { ...session, locale }),
      request("/platform/summary", undefined, locale),
      authedRequest("/agents/runs", { ...session, locale }),
      authedRequest("/tenants/current/audit-logs?limit=5", {
        ...session,
        locale,
      }),
    ])
      .then(
        ([
          mePayload,
          tenantPayload,
          platformPayload,
          runsPayload,
          auditPayload,
        ]) => {
          if (cancelled) {
            return;
          }

          setOverview({
            me: mePayload.user,
            tenant: tenantPayload.tenant,
            platform: platformPayload,
            agentRuns: runsPayload.runs ?? [],
            auditLogs: auditPayload.items ?? [],
          });
          setOverviewError("");
        },
      )
      .catch((error) => {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "加载控制台数据失败";
        setOverviewError(message);
      })
      .finally(() => {
        if (!cancelled) {
          setOverviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [locale, session]);

  const dict = getDictionary(locale);
  const latestRun = overview.agentRuns[0];
  const latestAudit = overview.auditLogs[0];

  async function run(path: string, init?: RequestInit) {
    if (!session) return;
    try {
      const data = await authedRequest(path, { ...session, locale }, init);
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Request failed");
    }
  }

  async function callAgent() {
    if (!session) return;
    try {
      const parsed = JSON.parse(deferredAgentInput);
      const data = await authedRequest(
        "/agents/call",
        { ...session, locale },
        {
          method: "POST",
          body: JSON.stringify({
            agentType,
            input: parsed,
          }),
        },
      );
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Agent call failed");
    }
  }

  if (!session) {
    return null;
  }

  return (
    <div className="stack">
      <div className="panel">
        <div className="topbar">
          <div>
            <div className="brand">{dict.dashboard}</div>
            <div className="fine">
              {session.user.displayName} · {session.user.role} ·{" "}
              {session.tenantSlug}
            </div>
          </div>
          <div className="toolbar">
            <LanguageSwitcher
              locale={locale}
              onChange={(nextLocale) => {
                setLocale(nextLocale);
                startTransition(() => {
                  const updated = { ...session, locale: nextLocale };
                  saveSession(updated);
                  setSession(updated);
                });
              }}
            />
            <button
              className="ghost"
              onClick={() => {
                clearSession();
                router.push("/login");
              }}
              type="button"
            >
              {dict.logout}
            </button>
          </div>
        </div>

        {overviewError ? <div className="danger">{overviewError}</div> : null}
        <div className="cards">
          <div className="kpi">
            <div>{dict.cardUsers}</div>
            <strong>
              {overview.tenant?._count.users ?? (overviewLoading ? "..." : 0)}
            </strong>
          </div>
          <div className="kpi">
            <div>{dict.cardIsolation}</div>
            <strong>{overview.tenant?.plan ?? "tenant scoped"}</strong>
          </div>
          <div className="kpi">
            <div>{dict.cardTools}</div>
            <strong>
              {overview.platform?.agentRuntime.builtinAgents.length ??
                (overviewLoading ? "..." : 0)}{" "}
              builtin
            </strong>
          </div>
          <div className="kpi">
            <div>最近 Agent 运行</div>
            <strong>
              {latestRun
                ? latestRun.agentType
                : overviewLoading
                  ? "..."
                  : "暂无"}
            </strong>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="panel stack">
          <h2 className="section-title">{dict.quickStart}</h2>
          <div className="mini-list">
            <div className="status-item">
              <span>租户</span>
              <strong>{overview.tenant?.name ?? session.tenantSlug}</strong>
            </div>
            <div className="status-item">
              <span>账号</span>
              <strong>{overview.me?.email ?? session.user.email}</strong>
            </div>
            <div className="status-item">
              <span>后端版本</span>
              <strong>{overview.platform?.app.version ?? "0.1.0"}</strong>
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
              onClick={() => run("/tenants/current")}
              type="button"
            >
              {dict.loadTenant}
            </button>
            <button
              className="ghost"
              onClick={() => run("/users")}
              type="button"
            >
              {dict.loadUsers}
            </button>
            <button
              className="ghost"
              onClick={() => run("/agents")}
              type="button"
            >
              {dict.loadAgents}
            </button>
            <button
              className="ghost"
              onClick={() => run("/agents/runs")}
              type="button"
            >
              {dict.loadRuns}
            </button>
          </div>

          <div className="field">
            <label>Agent</label>
            <select
              value={agentType}
              onChange={(event) => setAgentType(event.target.value)}
            >
              <option value="echo">echo</option>
              <option value="calculator">calculator</option>
              <option value="file_processor">file_processor</option>
            </select>
          </div>
          <div className="field">
            <label>{dict.agentInput}</label>
            <textarea
              rows={10}
              value={agentInput}
              onChange={(event) => setAgentInput(event.target.value)}
            />
          </div>
          <button className="btn" onClick={callAgent} type="button">
            {dict.callAgent}
          </button>
        </div>

        <div className="panel stack">
          <h2 className="section-title">{dict.apiResult}</h2>
          <div className="fine">
            这里用于查看租户、用户与 Agent
            运行结果，适合作为联调、验收和运维排查时的服务端回显窗口。
          </div>
          <div className="code-box mono">{result}</div>
        </div>
      </div>

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
              onClick={() => run("/agents/runs")}
              type="button"
            >
              刷新回显
            </button>
          </div>
          <div className="mini-list">
            {overview.agentRuns.length > 0 ? (
              overview.agentRuns.slice(0, 5).map((item) => (
                <div key={item.id} className="status-item">
                  <span>
                    {item.agentType} ·{" "}
                    {new Date(item.createdAt).toLocaleString(locale)}
                  </span>
                  <strong>
                    {item.status}
                    {item.duration ? ` · ${item.duration}ms` : ""}
                  </strong>
                </div>
              ))
            ) : (
              <div className="fine">
                当前租户还没有 Agent
                运行记录，先执行一次调用即可在这里看到结果。
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
              onClick={() => run("/tenants/current/audit-logs?limit=5")}
              type="button"
            >
              查看接口结果
            </button>
          </div>
          <div className="mini-list">
            {overview.auditLogs.length > 0 ? (
              overview.auditLogs.map((item) => (
                <div key={item.id} className="status-item">
                  <span>
                    {item.action} · {item.resource ?? "system"}
                  </span>
                  <strong>
                    {item.user?.displayName ?? item.user?.email ?? "unknown"} ·{" "}
                    {new Date(item.createdAt).toLocaleString(locale)}
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
    </div>
  );
}
