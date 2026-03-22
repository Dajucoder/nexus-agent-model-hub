import crypto from "node:crypto";
import { providerDirectory } from "../model-data";

type KnownProviderId = keyof typeof providerDirectory;

interface EncryptedPayload {
  iv: string;
  tag: string;
  value: string;
}

function isKnownProvider(provider: string): provider is KnownProviderId {
  return provider in providerDirectory;
}

function getEncryptionKey() {
  const secret = process.env.PROVIDER_CONFIG_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("PROVIDER_CONFIG_SECRET is required in production");
    }

    return null;
  }

  return crypto.createHash("sha256").update(secret).digest();
}

export function normalizeProviderBaseUrl(provider: string, input: string) {
  if (!isKnownProvider(provider)) {
    throw new Error("Unknown provider");
  }

  const expected = providerDirectory[provider].defaultBaseUrl;
  if (!expected) {
    throw new Error("Provider does not support remote configuration");
  }

  let parsed: URL;
  let expectedUrl: URL;

  try {
    parsed = new URL(input);
    expectedUrl = new URL(expected);
  } catch {
    throw new Error("Base URL must be a valid absolute URL");
  }

  if (
    parsed.protocol !== "https:" &&
    parsed.hostname !== "localhost" &&
    parsed.hostname !== "127.0.0.1"
  ) {
    throw new Error("Base URL must use https unless it targets localhost");
  }

  if (parsed.hostname !== expectedUrl.hostname) {
    throw new Error(`Base URL host must match ${expectedUrl.hostname}`);
  }

  const normalizedPath = parsed.pathname.replace(/\/$/, "");
  const expectedPath = expectedUrl.pathname.replace(/\/$/, "");
  if (normalizedPath !== expectedPath) {
    throw new Error(`Base URL path must match ${expectedPath || "/"}`);
  }

  parsed.username = "";
  parsed.password = "";
  parsed.search = "";
  parsed.hash = "";

  return parsed.toString().replace(/\/$/, "");
}

export function encryptSecret(value: string) {
  const key = getEncryptionKey();
  if (!key) {
    return value;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  const payload: EncryptedPayload = {
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    value: encrypted.toString("base64"),
  };

  return `enc:${Buffer.from(JSON.stringify(payload), "utf8").toString("base64")}`;
}

export function decryptSecret(value: string) {
  if (!value.startsWith("enc:")) {
    return value;
  }

  const key = getEncryptionKey();
  if (!key) {
    throw new Error(
      "Encrypted provider config requires PROVIDER_CONFIG_SECRET",
    );
  }

  const payload = JSON.parse(
    Buffer.from(value.slice(4), "base64").toString("utf8"),
  ) as EncryptedPayload;
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(payload.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(payload.value, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
