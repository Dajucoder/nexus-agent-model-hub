import { NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookies,
  requestBackend,
  writeSessionCookies,
} from "../../../../lib/server/auth-session";

const supportedActions = new Set(["login", "register", "logout"]);

export async function POST(
  request: NextRequest,
  context: { params: { action: string } },
) {
  const action = context.params.action;

  if (!supportedActions.has(action)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "logout") {
    const body = await request.json().catch(() => ({}));
    const refreshToken =
      typeof body?.refreshToken === "string" ? body.refreshToken : null;
    if (refreshToken) {
      await requestBackend("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }).catch(() => undefined);
    }

    clearSessionCookies();
    return new NextResponse(null, { status: 204 });
  }

  const response = await requestBackend(`/auth/${action}`, {
    method: "POST",
    headers: {
      "accept-language": request.headers.get("accept-language") ?? "zh-CN",
    },
    body: await request.text(),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    return NextResponse.json(
      typeof payload === "string" ? { error: payload } : payload,
      { status: response.status },
    );
  }

  if (typeof payload === "object" && payload && "tokens" in payload) {
    writeSessionCookies(
      (payload as { tokens: { accessToken: string; refreshToken: string } })
        .tokens,
    );
  }

  if (typeof payload === "object" && payload && "tokens" in payload) {
    const { tokens: _tokens, ...safePayload } = payload as Record<
      string,
      unknown
    >;
    return NextResponse.json(safePayload);
  }

  return NextResponse.json(payload);
}
