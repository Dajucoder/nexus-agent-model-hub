const durationPattern = /^(\d+)(ms|s|m|h|d)$/;

const unitToMs = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
} as const;

export function durationToMilliseconds(input: string) {
  const match = durationPattern.exec(input.trim());
  if (!match) {
    throw new Error(`Unsupported duration format: ${input}`);
  }

  const [, rawValue, rawUnit] = match;
  const value = Number(rawValue);
  const unit = rawUnit as keyof typeof unitToMs;
  const multiplier = unitToMs[unit];

  return value * multiplier;
}
