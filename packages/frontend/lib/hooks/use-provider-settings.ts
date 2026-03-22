"use client";

import { useEffect, useState } from "react";
import { providerConfigs } from "../model-data";

export type ProviderFormState = Record<
  string,
  { apiKey: string; baseUrl: string }
>;
export type ProviderStoredState = Record<
  string,
  { maskedKey: string; baseUrl: string; updatedAt: string }
>;

function getDefaultBaseUrl(providerId: string) {
  return (
    providerConfigs.find((item) => item.id === providerId)?.defaultBaseUrl ?? ""
  );
}

export function useProviderSettings() {
  const [configs, setConfigs] = useState<ProviderFormState>({});
  const [stored, setStored] = useState<ProviderStoredState>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings/api-key")
      .then((response) => response.json())
      .then((payload) => {
        const next: ProviderStoredState = {};
        for (const item of payload.configs ?? []) {
          next[item.provider] = {
            maskedKey: item.maskedKey ?? "",
            baseUrl: item.baseUrl ?? "",
            updatedAt: item.updatedAt ?? "",
          };
        }
        setStored(next);
        setError("");
      })
      .catch(() => {
        setError("当前无法读取已保存的配置。");
      });
  }, []);

  function updateApiKey(provider: string, apiKey: string) {
    setConfigs((current) => ({
      ...current,
      [provider]: {
        apiKey,
        baseUrl: current[provider]?.baseUrl ?? getDefaultBaseUrl(provider),
      },
    }));
  }

  function updateBaseUrl(provider: string, baseUrl: string) {
    setConfigs((current) => ({
      ...current,
      [provider]: {
        apiKey: current[provider]?.apiKey ?? "",
        baseUrl,
      },
    }));
  }

  function resetBaseUrl(provider: string) {
    setConfigs((current) => ({
      ...current,
      [provider]: {
        apiKey: current[provider]?.apiKey ?? "",
        baseUrl: getDefaultBaseUrl(provider),
      },
    }));
  }

  async function clear(provider: string) {
    const response = await fetch(
      `/api/settings/api-key?provider=${encodeURIComponent(provider)}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      setError("删除配置失败，请稍后重试。");
      return;
    }

    setStored((current) => {
      const next = { ...current };
      delete next[provider];
      return next;
    });

    setConfigs((current) => ({
      ...current,
      [provider]: {
        apiKey: "",
        baseUrl: getDefaultBaseUrl(provider),
      },
    }));
    setError("");
  }

  async function save(provider: string) {
    const config = configs[provider];
    if (!config?.apiKey) {
      return;
    }

    const response = await fetch("/api/settings/api-key", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        provider,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
      }),
    });

    if (response.ok) {
      setError("");
      setSaved((current) => ({ ...current, [provider]: true }));
      setStored((current) => ({
        ...current,
        [provider]: {
          maskedKey:
            config.apiKey.length > 8
              ? `${config.apiKey.slice(0, 4)}...${config.apiKey.slice(-4)}`
              : "****",
          baseUrl: config.baseUrl,
          updatedAt: new Date().toISOString(),
        },
      }));
      setConfigs((current) => ({
        ...current,
        [provider]: {
          ...current[provider],
          apiKey: "",
        },
      }));
      setTimeout(
        () => setSaved((current) => ({ ...current, [provider]: false })),
        2500,
      );
      return;
    }

    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    setError(payload?.error ?? "保存失败，请检查输入内容后重试。");
  }

  return {
    configs,
    stored,
    saved,
    error,
    save,
    clear,
    updateApiKey,
    updateBaseUrl,
    resetBaseUrl,
  };
}
