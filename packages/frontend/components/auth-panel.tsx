"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDictionary, type Locale } from "../lib/dictionary";
import { request } from "../lib/api";
import { loadSession, saveSession } from "../lib/session";
import { LanguageSwitcher } from "./language-switcher";

type Mode = "register" | "login";

export function AuthPanel(props: { standalone?: boolean } = {}) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("zh-CN");
  const [mode, setMode] = useState<Mode>("login");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    tenantSlug: "primary",
    tenantName: "Primary Workspace",
    displayName: "Bootstrap Admin",
    email: "owner@primary.local",
    password: "ChangeMe123!",
  });

  useEffect(() => {
    const existing = loadSession();
    if (existing) {
      setLocale(existing.locale);
    }
  }, []);

  const dict = getDictionary(locale);
  const isLogin = mode === "login";
  const looksLikeBootstrap =
    form.tenantSlug === "primary" && form.email === "owner@primary.local";

  async function submit() {
    setBusy(true);
    setStatus("");
    try {
      const path = mode === "register" ? "/auth/register" : "/auth/login";
      const payload =
        mode === "register"
          ? {
              tenantSlug: form.tenantSlug,
              tenantName: form.tenantName,
              displayName: form.displayName,
              email: form.email,
              password: form.password,
              locale,
            }
          : {
              tenantSlug: form.tenantSlug,
              email: form.email,
              password: form.password,
            };

      const response = await request(
        path,
        { method: "POST", body: JSON.stringify(payload) },
        locale,
      );
      saveSession({
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
        tenantSlug: form.tenantSlug,
        locale,
        user: response.user,
      });
      startTransition(() => router.push("/dashboard"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={props.standalone ? "auth-shell" : "panel stack"}>
      <div className={props.standalone ? "auth-layout" : undefined}>
        {props.standalone ? (
          <section className="auth-aside panel stack">
            <div className="auth-orbit auth-orbit-a" />
            <div className="auth-orbit auth-orbit-b" />
            <div className="eyebrow">Workspace Access</div>
            <h1 className="hero-title auth-title">
              单独的登录入口，
              <br />
              为真实工作区准备
            </h1>
            <p className="fine">
              这里不再沿用普通内容页布局，而是作为独立认证界面存在。它承担租户登录、管理员引导、多语言切换和默认账号说明四个任务。
            </p>
            <div className="auth-signal-list">
              <div className="status-item">
                <span>默认租户</span>
                <strong>primary</strong>
              </div>
              <div className="status-item">
                <span>默认管理员</span>
                <strong>owner@primary.local</strong>
              </div>
              <div className="status-item">
                <span>认证策略</span>
                <strong>JWT + Refresh Token</strong>
              </div>
              <div className="status-item">
                <span>适用场景</span>
                <strong>本地联调 / 演示 / 初始引导</strong>
              </div>
            </div>
            <div className="auth-marquee" aria-hidden="true">
              <span>Tenant-aware access</span>
              <span>JWT bootstrap flow</span>
              <span>Bilingual UI</span>
              <span>Agent-ready workspace</span>
            </div>
          </section>
        ) : null}

        <section
          className={props.standalone ? "auth-card panel stack" : undefined}
        >
          <div className="topbar">
            <div>
              <div className="brand">{dict.brand}</div>
              <div className="fine">{dict.tagline}</div>
            </div>
            <LanguageSwitcher locale={locale} onChange={setLocale} />
          </div>

          <div className="pill-row">
            <button
              className={mode === "login" ? "btn" : "ghost"}
              onClick={() => setMode("login")}
              type="button"
            >
              {dict.login}
            </button>
            <button
              className={mode === "register" ? "btn" : "ghost"}
              onClick={() => setMode("register")}
              type="button"
            >
              {dict.register}
            </button>
          </div>

          {props.standalone ? (
            <div className="auth-mode-banner">
              <div>
                <span>{isLogin ? "推荐路径" : "初始化路径"}</span>
                <strong>
                  {isLogin ? "直接登录现有租户" : "创建新的工作区管理员"}
                </strong>
              </div>
              <p>
                {isLogin
                  ? "如果你只是本地演示或继续现有工作区，直接使用默认管理员账号即可。"
                  : "注册会同时创建租户、租户管理员和基础会话，适合初始化一个全新环境。"}
              </p>
            </div>
          ) : null}

          {props.standalone ? (
            <div className="auth-state-strip">
              <div className="auth-state-chip">
                <span>当前模式</span>
                <strong>{isLogin ? "登录现有租户" : "创建新租户"}</strong>
              </div>
              <div className="auth-state-chip">
                <span>租户状态</span>
                <strong>
                  {looksLikeBootstrap ? "默认引导账号" : "自定义工作区"}
                </strong>
              </div>
            </div>
          ) : null}

          <div className="form-grid">
            <div className="field">
              <label>{dict.tenantSlug}</label>
              <input
                value={form.tenantSlug}
                onChange={(event) =>
                  setForm({ ...form, tenantSlug: event.target.value })
                }
              />
            </div>
            {mode === "register" ? (
              <>
                <div className="field">
                  <label>{dict.tenantName}</label>
                  <input
                    value={form.tenantName}
                    onChange={(event) =>
                      setForm({ ...form, tenantName: event.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label>{dict.displayName}</label>
                  <input
                    value={form.displayName}
                    onChange={(event) =>
                      setForm({ ...form, displayName: event.target.value })
                    }
                  />
                </div>
              </>
            ) : null}
            <div className="field">
              <label>{dict.email}</label>
              <input
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </div>
            <div className="field">
              <label>{dict.password}</label>
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
              />
            </div>
          </div>

          <button
            className="btn"
            disabled={busy}
            onClick={submit}
            type="button"
            style={{ minHeight: "48px" }}
          >
            {busy ? (
              <div className="spinner"></div>
            ) : mode === "login" ? (
              dict.login
            ) : (
              dict.register
            )}
          </button>

          <div className="fine">{dict.sessionReady}</div>
          <div className="fine">{dict.licenseWarning}</div>
          <div className="fine">
            {dict.bootstrapAccount}: `primary / owner@primary.local /
            ChangeMe123!`
          </div>
          {props.standalone ? (
            <div className="auth-tip-grid">
              <article className="insight-card">
                <span>租户提示</span>
                <strong>先确认租户 slug</strong>
                <p>登录和注册都依赖租户标识。演示环境默认使用 `primary`。</p>
              </article>
              <article className="insight-card">
                <span>环境提示</span>
                <strong>适合本地联调</strong>
                <p>
                  当前浏览器端会保存引导式会话，生产环境建议改为更安全的服务端会话策略。
                </p>
              </article>
              <article className="insight-card">
                <span>异常提示</span>
                <strong>优先检查租户与账号</strong>
                <p>
                  如果登录失败，通常先确认
                  `tenantSlug`、邮箱和密码是否与当前环境的种子数据一致。
                </p>
              </article>
            </div>
          ) : null}
          {status ? (
            <div className="auth-feedback auth-feedback-error">
              <strong>认证失败</strong>
              <p>{status}</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
