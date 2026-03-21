'use client';

import { useMemo, useRef, useState } from 'react';
import { modelCatalog } from '../../lib/model-data';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [modelId, setModelId] = useState(modelCatalog[0]?.id ?? 'gpt-4o');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const currentModel = useMemo(() => modelCatalog.find((model) => model.id === modelId), [modelId]);

  async function sendMessage() {
    const content = input.trim();
    if (!content || loading) return;

    setLoading(true);
    setInput('');
    setMessages((current) => [...current, { role: 'user', content }, { role: 'assistant', content: '' }]);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          modelId,
          prompt: content
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let output = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        output += decoder.decode(value, { stream: true });
        setMessages((current) => {
          const next = [...current];
          next[next.length - 1] = { role: 'assistant', content: output };
          return next;
        });
      }
    } catch (error) {
      setMessages((current) => {
        const next = [...current];
        next[next.length - 1] = {
          role: 'assistant',
          content: error instanceof Error ? `错误: ${error.message}` : '请求失败'
        };
        return next;
      });
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  return (
    <main className="shell stack">
      <section className="panel stack">
        <div className="topbar">
          <div>
            <div className="eyebrow">Chat Demo</div>
            <h1 className="page-title">模型对话演示</h1>
            <p className="fine">这里融合了原有模型站的聊天入口与当前项目的统一界面。可先用模拟回复体验，后续再接真实供应商密钥。</p>
          </div>
          <select className="select-input" value={modelId} onChange={(event) => setModelId(event.target.value)}>
            {modelCatalog.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        <div className="fine">当前模型：{currentModel?.name}</div>
      </section>

      <section className="panel stack">
        <div className="chat-log">
          {messages.length === 0 ? <div className="fine">还没有消息，先发一条试试看。</div> : null}
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
              <strong>{message.role === 'user' ? 'You' : 'Assistant'}</strong>
              <div>{message.content}</div>
            </div>
          ))}
        </div>
        <div className="toolbar">
          <textarea
            className="chat-input"
            rows={3}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="输入消息，体验融合后的模型聊天入口"
          />
          <button className="btn" type="button" onClick={sendMessage} disabled={loading}>
            {loading ? '发送中...' : '发送'}
          </button>
        </div>
      </section>
    </main>
  );
}
