import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useProviderSettings } from "../lib/hooks/use-provider-settings";

describe("useProviderSettings", () => {
  it("loads stored provider configs on mount", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          configs: [
            {
              provider: "openai",
              maskedKey: "sk-a...1234",
              baseUrl: "https://api.openai.com/v1",
              updatedAt: "2026-03-23T00:00:00.000Z",
            },
          ],
        }),
      }),
    );

    const { result } = renderHook(() => useProviderSettings());

    await waitFor(() => {
      expect(result.current.stored.openai?.maskedKey).toBe("sk-a...1234");
    });
    expect(result.current.error).toBe("");
  });

  it("saves a provider config and clears raw key input", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ json: async () => ({ configs: [] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) }),
    );

    const { result } = renderHook(() => useProviderSettings());

    await waitFor(() => {
      expect(result.current.error).toBe("");
    });

    act(() => {
      result.current.updateApiKey("openai", "sk-test-12345678");
      result.current.updateBaseUrl("openai", "https://api.openai.com/v1");
    });

    await act(async () => {
      await result.current.save("openai");
    });

    expect(result.current.saved.openai).toBe(true);
    expect(result.current.configs.openai?.apiKey).toBe("");
    expect(result.current.stored.openai?.baseUrl).toBe(
      "https://api.openai.com/v1",
    );
  });
});
