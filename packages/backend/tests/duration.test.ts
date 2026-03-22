import { describe, expect, it } from "vitest";
import { durationToMilliseconds } from "../src/lib/duration";

describe("durationToMilliseconds", () => {
  it("parses common duration units", () => {
    expect(durationToMilliseconds("15m")).toBe(15 * 60 * 1000);
    expect(durationToMilliseconds("7d")).toBe(7 * 24 * 60 * 60 * 1000);
    expect(durationToMilliseconds("30s")).toBe(30 * 1000);
  });

  it("rejects unsupported formats", () => {
    expect(() => durationToMilliseconds("1w")).toThrow(
      "Unsupported duration format",
    );
  });
});
