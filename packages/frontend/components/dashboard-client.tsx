"use client";

import { useDeferredValue, useState } from "react";
import { useRouter } from "next/navigation";
import { authedRequest } from "../lib/api";
import { getDictionary } from "../lib/dictionary";
import { useDashboardOverview } from "../lib/hooks/use-dashboard-overview";
import { useDashboardSession } from "../lib/hooks/use-dashboard-session";
import { clearSession } from "../lib/session";
import { DashboardControlPanel } from "./dashboard-control-panel";
import {
  DashboardActivityPanels,
  DashboardResultPanel,
} from "./dashboard-observability";
import { DashboardToolbar } from "./dashboard-toolbar";
import { DashboardWelcome } from "./dashboard-welcome";

const defaultAgentInput = `{
  "message": "generate an operational summary for this workspace"
}`;

export function DashboardClient() {
  const router = useRouter();
  const { session, locale, setLocale, clearAndRedirect } =
    useDashboardSession();
  const [result, setResult] = useState("No request made yet.");
  const [agentType, setAgentType] = useState("echo");
  const [agentInput, setAgentInput] = useState(defaultAgentInput);
  const deferredAgentInput = useDeferredValue(agentInput);
  const { overview, overviewError, overviewLoading } = useDashboardOverview(
    session,
    locale,
    clearAndRedirect,
  );

  const dict = getDictionary(locale);

  async function run(path: string, init?: RequestInit) {
    if (!session) return;

    try {
      const data = await authedRequest(path, locale, init);
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        clearAndRedirect();
        return;
      }

      setResult(error instanceof Error ? error.message : "Request failed");
    }
  }

  async function callAgent() {
    if (!session) return;

    try {
      const parsed = JSON.parse(deferredAgentInput);
      const data = await authedRequest("/agents/call", locale, {
        method: "POST",
        body: JSON.stringify({
          agentType,
          input: parsed,
        }),
      });
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        clearAndRedirect();
        return;
      }

      setResult(error instanceof Error ? error.message : "Agent call failed");
    }
  }

  if (!session) {
    return null;
  }

  return (
    <div className="stack">
      <DashboardWelcome
        overview={overview}
        overviewLoading={overviewLoading}
        session={session}
      />

      <div className="panel">
        <DashboardToolbar
          dict={dict}
          locale={locale}
          onLocaleChange={setLocale}
          onLogout={() => {
            fetch("/api/auth/logout", { method: "POST" }).finally(() => {
              clearSession();
              router.push("/login");
            });
          }}
          session={session}
        />
        {overviewError ? <div className="danger">{overviewError}</div> : null}
      </div>

      <div className="grid">
        <DashboardControlPanel
          agentInput={agentInput}
          agentType={agentType}
          dict={dict}
          onAgentInputChange={setAgentInput}
          onAgentTypeChange={setAgentType}
          onCallAgent={callAgent}
          onRun={run}
          overview={overview}
          session={session}
        />
        <DashboardResultPanel dict={dict} result={result} />
      </div>

      <DashboardActivityPanels
        locale={locale}
        onRun={run}
        overview={overview}
      />
    </div>
  );
}
