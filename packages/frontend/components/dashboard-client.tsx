'use client';

import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authedRequest } from '../lib/api';
import { getDictionary, type Locale } from '../lib/dictionary';
import { clearSession, loadSession, saveSession, type SessionState } from '../lib/session';
import { LanguageSwitcher } from './language-switcher';

const defaultAgentInput = `{
  "message": "hello from nexus-agent-model-hub"
}`;

export function DashboardClient() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState | null>(null);
  const [locale, setLocale] = useState<Locale>('zh-CN');
  const [result, setResult] = useState('No request made yet.');
  const [agentType, setAgentType] = useState('echo');
  const [agentInput, setAgentInput] = useState(defaultAgentInput);
  const deferredAgentInput = useDeferredValue(agentInput);

  useEffect(() => {
    const current = loadSession();
    if (!current) {
      router.replace('/login');
      return;
    }
    setSession(current);
    setLocale(current.locale);
  }, [router]);

  const dict = getDictionary(locale);

  async function run(path: string, init?: RequestInit) {
    if (!session) return;
    const data = await authedRequest(path, { ...session, locale }, init);
    setResult(JSON.stringify(data, null, 2));
  }

  async function callAgent() {
    if (!session) return;
    const parsed = JSON.parse(deferredAgentInput);
    const data = await authedRequest('/agents/call', { ...session, locale }, {
      method: 'POST',
      body: JSON.stringify({
        agentType,
        input: parsed
      })
    });
    setResult(JSON.stringify(data, null, 2));
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
            <div className="fine">{session.user.displayName} · {session.user.role} · {session.tenantSlug}</div>
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
                router.push('/login');
              }}
              type="button"
            >
              {dict.logout}
            </button>
          </div>
        </div>

        <div className="cards">
          <div className="kpi">
            <div>{dict.cardUsers}</div>
            <strong>JWT + refresh</strong>
          </div>
          <div className="kpi">
            <div>{dict.cardIsolation}</div>
            <strong>tenant scoped</strong>
          </div>
          <div className="kpi">
            <div>{dict.cardTools}</div>
            <strong>echo / calculator / http / file</strong>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="panel stack">
          <h2 className="section-title">{dict.quickStart}</h2>
          <div className="toolbar">
            <button className="ghost" onClick={() => run('/tenants/current')} type="button">{dict.loadTenant}</button>
            <button className="ghost" onClick={() => run('/users')} type="button">{dict.loadUsers}</button>
            <button className="ghost" onClick={() => run('/agents')} type="button">{dict.loadAgents}</button>
            <button className="ghost" onClick={() => run('/agents/runs')} type="button">{dict.loadRuns}</button>
          </div>

          <div className="field">
            <label>Agent</label>
            <select value={agentType} onChange={(event) => setAgentType(event.target.value)}>
              <option value="echo">echo</option>
              <option value="calculator">calculator</option>
              <option value="file_processor">file_processor</option>
            </select>
          </div>
          <div className="field">
            <label>{dict.agentInput}</label>
            <textarea rows={10} value={agentInput} onChange={(event) => setAgentInput(event.target.value)} />
          </div>
          <button className="btn" onClick={callAgent} type="button">{dict.callAgent}</button>
        </div>

        <div className="panel stack">
          <h2 className="section-title">{dict.apiResult}</h2>
          <div className="code-box mono">{result}</div>
        </div>
      </div>
    </div>
  );
}
