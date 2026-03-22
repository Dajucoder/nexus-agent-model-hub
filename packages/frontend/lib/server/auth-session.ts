import { cookies } from "next/headers";

const accessCookieName = "nexus_access_token";
const refreshCookieName = "nexus_refresh_token";

function isSecureCookie() {
  return process.env.NODE_ENV === "production";
}

export function getBackendApiBase() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
}

export function getSessionTokens() {
  const store = cookies();
  return {
    accessToken: store.get(accessCookieName)?.value ?? null,
    refreshToken: store.get(refreshCookieName)?.value ?? null,
  };
}

export function writeSessionCookies(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  const store = cookies();

  store.set(accessCookieName, tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    maxAge: 15 * 60,
  });

  store.set(refreshCookieName, tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearSessionCookies() {
  const store = cookies();
  store.delete(accessCookieName);
  store.delete(refreshCookieName);
}

export async function requestBackend(
  path: string,
  init?: RequestInit,
  accessToken?: string,
) {
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has("content-type") && init?.body) {
    headers.set("content-type", "application/json");
  }
  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  return fetch(`${getBackendApiBase()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await requestBackend("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Unable to refresh session");
  }

  const payload = (await response.json()) as {
    tokens: { accessToken: string; refreshToken: string };
  };
  writeSessionCookies(payload.tokens);
  return payload.tokens.accessToken;
}

export async function withUserSession<T>(
  work: (accessToken: string) => Promise<T>,
) {
  const { accessToken, refreshToken } = getSessionTokens();

  if (!accessToken) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    return await work(accessToken);
  } catch (error) {
    if (
      !(error instanceof Error) ||
      error.message !== "UNAUTHORIZED" ||
      !refreshToken
    ) {
      throw error;
    }

    const nextAccessToken = await refreshAccessToken(refreshToken);
    return work(nextAccessToken);
  }
}
