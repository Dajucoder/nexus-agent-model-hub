import { NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookies,
  requestBackend,
  withUserSession,
} from "../../../../lib/server/auth-session";

async function proxy(
  request: NextRequest,
  context: { params: { path: string[] } },
) {
  const path = `/${context.params.path.join("/")}${request.nextUrl.search}`;
  const method = request.method;
  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.text();

  try {
    const response = await withUserSession(async (accessToken) => {
      const upstream = await requestBackend(
        path,
        {
          method,
          headers: {
            "accept-language":
              request.headers.get("accept-language") ?? "zh-CN",
          },
          body,
        },
        accessToken,
      );

      if (upstream.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      return upstream;
    });

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (typeof payload === "string") {
      return new NextResponse(payload, {
        status: response.status,
        headers: { "content-type": contentType || "text/plain; charset=utf-8" },
      });
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    clearSessionCookies();

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
