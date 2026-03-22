export interface SessionState {
  tenantSlug: string;
  locale: "zh-CN" | "en-US";
  user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  };
}

const key = "nexus-agent-model-hub-session";

export function loadSession(): SessionState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

export function saveSession(value: SessionState) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function clearSession() {
  window.localStorage.removeItem(key);
}
