import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  deleteProviderConfig,
  listProviderConfigs,
  saveProviderConfig
} from '../../../../lib/server/provider-config-store';

const schema = z.object({
  provider: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().min(1)
});

export async function GET() {
  const configs = await listProviderConfigs();
  return NextResponse.json({
    configs: configs.map(({ apiKey: _apiKey, ...config }) => config)
  });
}

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { provider, apiKey, baseUrl } = parsed.data;
  const saved = await saveProviderConfig({ provider, apiKey, baseUrl });

  return NextResponse.json({
    ok: true,
    config: {
      provider: saved.provider,
      maskedKey: saved.maskedKey,
      baseUrl: saved.baseUrl,
      updatedAt: saved.updatedAt
    }
  });
}

export async function DELETE(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get('provider');
  if (!provider) {
    return NextResponse.json({ error: 'provider is required' }, { status: 400 });
  }

  const deleted = await deleteProviderConfig(provider);
  return NextResponse.json({ ok: deleted });
}
