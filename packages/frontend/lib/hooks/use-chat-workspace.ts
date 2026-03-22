"use client";

import { useRef, useState } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useChatWorkspace(initialModelId: string) {
  const [modelId, setModelId] = useState(initialModelId);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  function clearConversation() {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setMessages([]);
  }

  function stopGeneration() {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }

  async function sendMessage() {
    const content = input.trim();
    if (!content || loading) return;

    setLoading(true);
    setInput("");
    setMessages((current) => [
      ...current,
      { role: "user", content },
      { role: "assistant", content: "" },
    ]);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          modelId,
          prompt: content,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let output = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        output += decoder.decode(value, { stream: true });
        setMessages((current) => {
          const next = [...current];
          next[next.length - 1] = { role: "assistant", content: output };
          return next;
        });
      }
    } catch (error) {
      setMessages((current) => {
        const next = [...current];
        next[next.length - 1] = {
          role: "assistant",
          content:
            error instanceof Error && error.name === "AbortError"
              ? "已停止生成。你可以继续编辑问题，或重新发送。"
              : error instanceof Error
                ? `错误: ${error.message}`
                : "请求失败",
        };
        return next;
      });
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  return {
    modelId,
    setModelId,
    input,
    setInput,
    messages,
    loading,
    clearConversation,
    stopGeneration,
    sendMessage,
  };
}
