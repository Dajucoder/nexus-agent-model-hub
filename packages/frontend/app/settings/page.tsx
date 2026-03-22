'use client';

import { useEffect, useState } from 'react';
import { providerConfigs } from '../../lib/model-data';

type ConfigState = Record<string, { apiKey: string; baseUrl: string }>;
type StoredState = Record<string, { maskedKey: string; baseUrl: string; updatedAt: string }>;

export default function SettingsPage() {
  const [configs, setConfigs] = useState<ConfigState>({});
  const [stored, setStored] = useState<StoredState>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

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
        setError('');
      })
      .catch(() => {
        setError('当前无法读取已保存的配置。');
      });
  }, []);

  async function clear(provider: string) {
    const response = await fetch(`/api/settings/api-key?provider=${encodeURIComponent(provider)}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      setError('删除配置失败，请稍后重试。');
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
        apiKey: '',
        baseUrl: providerConfigs.find((item) => item.id === provider)?.defaultBaseUrl ?? ''
      }
    }));
    setError('');
  }

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
      setError('');
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
      return;
    }

    setError('保存失败，请检查输入内容后重试。');
  }

  return (
    <main className="shell stack">
      <section className="panel stack page-hero">
        <div className="eyebrow">Provider Settings</div>
        <h1 className="page-title">API Key 设置</h1>
        <p className="fine">这里提供多供应商密钥配置入口，方便把模型库、会话工作区和未来真实调用串成一条正式链路。</p>
        <div className="stat-grid">
          <div className="stat-card">
            <span>支持供应商</span>
            <strong>{providerConfigs.length}</strong>
          </div>
          <div className="stat-card">
            <span>存储方式</span>
            <strong>本地文件持久化</strong>
          </div>
          <div className="stat-card">
            <span>正式环境建议</span>
            <strong>服务端密钥托管</strong>
          </div>
        </div>
        <div className="fine">当前 `/api/settings/api-key` 已保存到 `packages/frontend/.data/provider-settings.json`，适合本地联调，但正式环境仍应使用专门的密钥管理方案。</div>
        {error ? <div className="danger">{error}</div> : null}
      </section>
      <section className="config-grid">
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
            ) : (
              <div className="fine">尚未保存该供应商配置。</div>
            )}
            <div className="toolbar">
              <button className="btn" type="button" onClick={() => save(provider.id)}>
                {saved[provider.id] ? '已保存' : '保存配置'}
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() =>
                  setConfigs((current) => ({
                    ...current,
                    [provider.id]: {
                      apiKey: current[provider.id]?.apiKey ?? '',
                      baseUrl: provider.defaultBaseUrl
                    }
                  }))
                }
              >
                恢复默认地址
              </button>
              <button className="ghost" type="button" onClick={() => clear(provider.id)}>
                清除配置
              </button>
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
