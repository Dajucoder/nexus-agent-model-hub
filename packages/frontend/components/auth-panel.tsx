'use client';

import { startTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDictionary, type Locale } from '../lib/dictionary';
import { request } from '../lib/api';
import { loadSession, saveSession } from '../lib/session';
import { LanguageSwitcher } from './language-switcher';

type Mode = 'register' | 'login';

export function AuthPanel() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>('zh-CN');
  const [mode, setMode] = useState<Mode>('login');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    tenantSlug: 'primary',
    tenantName: 'Primary Workspace',
    displayName: 'Bootstrap Admin',
    email: 'owner@primary.local',
    password: 'ChangeMe123!'
  });

  useEffect(() => {
    const existing = loadSession();
    if (existing) {
      setLocale(existing.locale);
    }
  }, []);

  const dict = getDictionary(locale);

  async function submit() {
    setBusy(true);
    setStatus('');
    try {
      const path = mode === 'register' ? '/auth/register' : '/auth/login';
      const payload =
        mode === 'register'
          ? {
              tenantSlug: form.tenantSlug,
              tenantName: form.tenantName,
              displayName: form.displayName,
              email: form.email,
              password: form.password,
              locale
            }
          : {
              tenantSlug: form.tenantSlug,
              email: form.email,
              password: form.password
            };

      const response = await request(path, { method: 'POST', body: JSON.stringify(payload) }, locale);
      saveSession({
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
        tenantSlug: form.tenantSlug,
        locale,
        user: response.user
      });
      startTransition(() => router.push('/dashboard'));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel stack">
      <div className="topbar">
        <div>
          <div className="brand">{dict.brand}</div>
          <div className="fine">{dict.tagline}</div>
        </div>
        <LanguageSwitcher locale={locale} onChange={setLocale} />
      </div>

      <div className="pill-row">
        <button className={mode === 'login' ? 'btn' : 'ghost'} onClick={() => setMode('login')} type="button">
          {dict.login}
        </button>
        <button className={mode === 'register' ? 'btn' : 'ghost'} onClick={() => setMode('register')} type="button">
          {dict.register}
        </button>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>{dict.tenantSlug}</label>
          <input value={form.tenantSlug} onChange={(event) => setForm({ ...form, tenantSlug: event.target.value })} />
        </div>
        {mode === 'register' ? (
          <>
            <div className="field">
              <label>{dict.tenantName}</label>
              <input value={form.tenantName} onChange={(event) => setForm({ ...form, tenantName: event.target.value })} />
            </div>
            <div className="field">
              <label>{dict.displayName}</label>
              <input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} />
            </div>
          </>
        ) : null}
        <div className="field">
          <label>{dict.email}</label>
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </div>
        <div className="field">
          <label>{dict.password}</label>
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </div>
      </div>

      <button className="btn" disabled={busy} onClick={submit} type="button" style={{ minHeight: '48px' }}>
        {busy ? <div className="spinner"></div> : mode === 'login' ? dict.login : dict.register}
      </button>

      <div className="fine">{dict.sessionReady}</div>
      <div className="fine">{dict.licenseWarning}</div>
      <div className="fine">
        {dict.bootstrapAccount}: `primary / owner@primary.local / ChangeMe123!`
      </div>
      {status ? <div className="fine danger">{status}</div> : null}
    </div>
  );
}
