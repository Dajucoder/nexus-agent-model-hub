import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface StoredProviderConfig {
  provider: string;
  apiKey: string;
  maskedKey: string;
  baseUrl: string;
  updatedAt: string;
}

const dataDirectory = path.join(process.cwd(), '.data');
const dataFile = path.join(dataDirectory, 'provider-settings.json');

async function ensureDataDirectory() {
  if (!existsSync(dataDirectory)) {
    await mkdir(dataDirectory, { recursive: true });
  }
}

async function readStore(): Promise<Record<string, StoredProviderConfig>> {
  try {
    const raw = await readFile(dataFile, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, StoredProviderConfig>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

async function writeStore(store: Record<string, StoredProviderConfig>) {
  await ensureDataDirectory();
  await writeFile(dataFile, JSON.stringify(store, null, 2), 'utf8');
}

export async function listProviderConfigs() {
  const store = await readStore();
  return Object.values(store).sort((left, right) => left.provider.localeCompare(right.provider));
}

export async function getProviderConfig(provider: string) {
  const store = await readStore();
  return store[provider] ?? null;
}

export async function saveProviderConfig(input: { provider: string; apiKey: string; baseUrl: string }) {
  const store = await readStore();
  const next: StoredProviderConfig = {
    provider: input.provider,
    apiKey: input.apiKey,
    maskedKey: input.apiKey.length > 8 ? `${input.apiKey.slice(0, 4)}...${input.apiKey.slice(-4)}` : '****',
    baseUrl: input.baseUrl,
    updatedAt: new Date().toISOString()
  };

  store[input.provider] = next;
  await writeStore(store);
  return next;
}

export async function deleteProviderConfig(provider: string) {
  const store = await readStore();
  if (!store[provider]) {
    return false;
  }

  delete store[provider];
  if (Object.keys(store).length === 0) {
    await rm(dataFile, { force: true });
    return true;
  }

  await writeStore(store);
  return true;
}
