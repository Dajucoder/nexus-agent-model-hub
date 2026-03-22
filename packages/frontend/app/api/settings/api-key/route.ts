import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withUserSession } from "../../../../lib/server/auth-session";
import {
  deleteProviderConfig,
  listProviderConfigs,
  saveProviderConfig,
} from "../../../../lib/server/provider-config-store";
import { normalizeProviderBaseUrl } from "../../../../lib/server/provider-security";

const schema = z.object({
  provider: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().min(1),
});

export async function GET() {
  try {
    await withUserSession(async () => undefined);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configs = await listProviderConfigs();
  return NextResponse.json({
    configs: configs.map(({ apiKey: _apiKey, ...config }) => config),
  });
}

export async function POST(request: NextRequest) {
  try {
    await withUserSession(async () => undefined);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { provider, apiKey, baseUrl } = parsed.data;

  try {
    const saved = await saveProviderConfig({
      provider,
      apiKey,
      baseUrl: normalizeProviderBaseUrl(provider, baseUrl),
    });

    return NextResponse.json({
      ok: true,
      config: {
        provider: saved.provider,
        maskedKey: saved.maskedKey,
        baseUrl: saved.baseUrl,
        updatedAt: saved.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid provider configuration",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await withUserSession(async () => undefined);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = request.nextUrl.searchParams.get("provider");
  if (!provider) {
    return NextResponse.json(
      { error: "provider is required" },
      { status: 400 },
    );
  }

  const deleted = await deleteProviderConfig(provider);
  return NextResponse.json({ ok: deleted });
}
