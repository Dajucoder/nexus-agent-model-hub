import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  provider: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().min(1)
});

const store = new Map<string, { provider: string; maskedKey: string; baseUrl: string; updatedAt: string }>();

export async function GET() {
  return NextResponse.json({
    configs: [...store.values()]
  });
}

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { provider, apiKey, baseUrl } = parsed.data;
  store.set(provider, {
    provider,
    maskedKey: apiKey.length > 8 ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : '****',
    baseUrl,
    updatedAt: new Date().toISOString()
  });

  return NextResponse.json({ ok: true });
}
