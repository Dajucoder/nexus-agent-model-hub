'use client';

import { useEffect, useState } from 'react';
import { providerConfigs } from '../../lib/model-data';

type ConfigState = Record<string, { apiKey: string; baseUrl: string }>;
type StoredState = Record<string, { maskedKey: string; baseUrl: string; updatedAt: string }>;

export default function SettingsPage() {
  const [configs, setConfigs] = useState<ConfigState>({});
  const [stored, setStored] = useState<StoredState>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/settings/api-key')
      .then((response) => response.json())
      .then((payload) => {
        const next: StoredState = {};
        for (const item of payload.configs ?? []) {
          next[item.provider] = {
            maskedKey: item.maskedKey ?? '',
            baseUrl: item.baseUrl ?? '',
            updatedAt: item.updatedAt ?? ''
          };
        }
        setStored(next);
      })
      .catch(() => {});
  }, []);

  async function save(provider: string) {
    const config = configs[provider];
    if (!config?.apiKey) return;

    const response = await fetch('/api/settings/api-key', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        provider,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl
      })
    });

    if (response.ok) {
      setSaved((current) => ({ ...current, [provider]: true }));
      setStored((current) => ({
        ...current,
        [provider]: {
          maskedKey: config.apiKey.length > 8 ? `${config.apiKey.slice(0, 4)}...${config.apiKey.slice(-4)}` : '****',
          baseUrl: config.baseUrl,
          updatedAt: new Date().toISOString()
        }
      }));
      setConfigs((current) => ({
        ...current,
        [provider]: {
          ...current[provider],
          apiKey: ''
        }
      }));
      setTimeout(() => setSaved((current) => ({ ...current, [provider]: false })), 2500);
    }
  }

  return (
    <main className="shell stack">
      <section className="panel stack">
        <div className="eyebrow">Provider Settings</div>
        <h1 className="page-title">API Key 设置</h1>
        <p className="fine">这里保留了原项目的多供应商密钥配置思路，并融合到当前统一前端里作为演示层。</p>
      </section>
      {providerConfigs.map((provider) => (
        <section key={provider.id} className="panel stack">
          <div className="topbar card-top">
            <div>
              <h2 className="section-title">{provider.name}</h2>
              <div className="fine">{provider.defaultBaseUrl}</div>
            </div>
            <div className="toolbar">
              <a className="ghost" href={provider.docsUrl} target="_blank" rel="noreferrer">
                文档
              </a>
              <a className="ghost" href={provider.keyUrl} target="_blank" rel="noreferrer">
                获取 Key
              </a>
            </div>
          </div>
          <div className="field">
            <label>API Key</label>
            <input
              value={configs[provider.id]?.apiKey ?? ''}
              onChange={(event) =>
                setConfigs((current) => ({
                  ...current,
                  [provider.id]: {
                    apiKey: event.target.value,
                    baseUrl: current[provider.id]?.baseUrl ?? provider.defaultBaseUrl
                  }
                }))
              }
              placeholder={stored[provider.id]?.maskedKey ? `已保存: ${stored[provider.id]?.maskedKey}，输入新值可覆盖` : `输入 ${provider.name} API Key`}
            />
          </div>
          <div className="field">
            <label>Base URL</label>
            <input
              value={configs[provider.id]?.baseUrl ?? stored[provider.id]?.baseUrl ?? provider.defaultBaseUrl}
              onChange={(event) =>
                setConfigs((current) => ({
                  ...current,
                  [provider.id]: {
                    apiKey: current[provider.id]?.apiKey ?? '',
                    baseUrl: event.target.value
                  }
                }))
              }
            />
          </div>
          {stored[provider.id]?.updatedAt ? (
            <div className="fine">最近保存时间：{new Date(stored[provider.id].updatedAt).toLocaleString('zh-CN')}</div>
          ) : null}
          <div className="toolbar">
            <button className="btn" type="button" onClick={() => save(provider.id)}>
              {saved[provider.id] ? '已保存' : '保存配置'}
            </button>
          </div>
        </section>
      ))}
    </main>
  );
}
