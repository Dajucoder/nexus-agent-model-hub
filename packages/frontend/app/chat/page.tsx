"use client";

import { useMemo } from "react";
import { ChatConversationPanel } from "../../components/chat-conversation-panel";
import { ChatHero } from "../../components/chat-hero";
import { ChatModelSidebar } from "../../components/chat-model-sidebar";
import { useChatWorkspace } from "../../lib/hooks/use-chat-workspace";
import { modelCatalog } from "../../lib/model-data";

const promptSuggestions = [
  "用一句话总结这个项目的定位",
  "比较一下这个模型更适合聊天还是代码任务",
  "如果接入真实 API Key，这个页面下一步该怎么扩展",
  "帮我生成一个生产上线前的验收清单",
] as const;

export default function ChatPage() {
  const {
    modelId,
    setModelId,
    input,
    setInput,
    messages,
    loading,
    clearConversation,
    stopGeneration,
    sendMessage,
  } = useChatWorkspace(modelCatalog[0]?.id ?? "gpt-4o");

  const currentModel = useMemo(
    () => modelCatalog.find((model) => model.id === modelId),
    [modelId],
  );

  return (
    <main className="shell stack">
      <ChatHero
        currentModel={currentModel}
        messageCount={messages.length}
        modelId={modelId}
        modelOptions={modelCatalog}
        onModelChange={setModelId}
      />

      <section className="chat-layout">
        <ChatConversationPanel
          input={input}
          loading={loading}
          messages={messages}
          onClearConversation={clearConversation}
          onInputChange={setInput}
          onSelectSuggestion={setInput}
          onSendMessage={sendMessage}
          onStopGeneration={stopGeneration}
          promptSuggestions={promptSuggestions}
        />

        <ChatModelSidebar currentModel={currentModel} />
      </section>
    </main>
  );
}
