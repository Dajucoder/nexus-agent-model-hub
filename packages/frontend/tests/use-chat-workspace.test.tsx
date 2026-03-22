import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useChatWorkspace } from "../lib/hooks/use-chat-workspace";

describe("useChatWorkspace", () => {
  it("streams assistant output into the last message", async () => {
    const reader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode("Hello"),
        })
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode(" world"),
        })
        .mockResolvedValueOnce({ done: true, value: undefined }),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: () => reader,
        },
      }),
    );

    const { result } = renderHook(() => useChatWorkspace("gpt-4o"));

    act(() => {
      result.current.setInput("Hello there");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual({
      role: "user",
      content: "Hello there",
    });
    expect(result.current.messages[1]).toEqual({
      role: "assistant",
      content: "Hello world",
    });
    expect(result.current.loading).toBe(false);
  });
});
