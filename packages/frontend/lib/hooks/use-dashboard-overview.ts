"use client";

import { useEffect, useState } from "react";
import { authedRequest, request } from "../api";
import type { DashboardOverview } from "../dashboard-types";
import type { Locale } from "../dictionary";
import type { SessionState } from "../session";

const emptyOverview: DashboardOverview = {
  me: null,
  tenant: null,
  platform: null,
  agentRuns: [],
  auditLogs: [],
};

export function useDashboardOverview(
  session: SessionState | null,
  locale: Locale,
  onUnauthorized: () => void,
) {
  const [overview, setOverview] = useState<DashboardOverview>(emptyOverview);
  const [overviewError, setOverviewError] = useState("");
  const [overviewLoading, setOverviewLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;
    setOverviewLoading(true);

    Promise.allSettled([
      authedRequest("/auth/me", locale),
      authedRequest("/tenants/current", locale),
      request("/platform/summary", undefined, locale),
      authedRequest("/agents/runs", locale),
      authedRequest("/tenants/current/audit-logs?limit=5", locale),
    ])
      .then((results) => {
        if (cancelled) {
          return;
        }

        const [
          meResult,
          tenantResult,
          platformResult,
          runsResult,
          auditResult,
        ] = results;

        if (
          meResult.status !== "fulfilled" ||
          tenantResult.status !== "fulfilled"
        ) {
          const failedReason =
            meResult.status === "rejected"
              ? meResult.reason
              : tenantResult.status === "rejected"
                ? tenantResult.reason
                : new Error("加载控制台核心数据失败");
          throw failedReason instanceof Error
            ? failedReason
            : new Error("加载控制台核心数据失败");
        }

        setOverview({
          me: meResult.value.user,
          tenant: tenantResult.value.tenant,
          platform:
            platformResult.status === "fulfilled" ? platformResult.value : null,
          agentRuns:
            runsResult.status === "fulfilled"
              ? (runsResult.value.runs ?? [])
              : [],
          auditLogs:
            auditResult.status === "fulfilled"
              ? (auditResult.value.items ?? [])
              : [],
        });
        setOverviewError("");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        if (error instanceof Error && error.message === "UNAUTHORIZED") {
          onUnauthorized();
          return;
        }

        setOverviewError(
          error instanceof Error ? error.message : "加载控制台数据失败",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setOverviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [locale, onUnauthorized, session]);

  return {
    overview,
    overviewError,
    overviewLoading,
  };
}
