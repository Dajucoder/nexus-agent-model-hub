import type { ChatMessage } from "../lib/hooks/use-chat-workspace";

export function ChatConversationPanel(props: {
  input: string;
  loading: boolean;
  messages: ChatMessage[];
  promptSuggestions: readonly string[];
  onClearConversation: () => void;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onSelectSuggestion: (value: string) => void;
  onStopGeneration: () => void;
}) {
  return (
    <section className="panel stack">
      <div className="toolbar">
        <button
          className="ghost"
          type="button"
          onClick={props.onClearConversation}
        >
          清空对话
        </button>
        <button
          className="ghost"
          type="button"
          onClick={props.onStopGeneration}
          disabled={!props.loading}
        >
          停止生成
        </button>
      </div>
      <div className="chat-log">
        {props.messages.length === 0 ? (
          <div className="fine">
            还没有消息，先点一条建议 prompt，或者直接输入问题试试看。
          </div>
        ) : null}
        {props.messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`chat-bubble ${message.role}`}
          >
            <strong>{message.role === "user" ? "You" : "Assistant"}</strong>
            <div>{message.content}</div>
          </div>
        ))}
      </div>
      <div className="toolbar prompt-grid">
        {props.promptSuggestions.map((suggestion) => (
          <button
            key={suggestion}
            className="ghost prompt-chip"
            type="button"
            onClick={() => props.onSelectSuggestion(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
      <div className="toolbar chat-composer">
        <textarea
          className="chat-input"
          rows={3}
          value={props.input}
          onChange={(event) => props.onInputChange(event.target.value)}
          placeholder="输入消息，体验融合后的模型聊天入口"
        />
        <button
          className="btn"
          type="button"
          onClick={props.onSendMessage}
          disabled={props.loading}
        >
          {props.loading ? "发送中..." : "发送"}
        </button>
      </div>
    </section>
  );
}
