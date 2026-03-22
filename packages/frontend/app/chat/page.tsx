'use client';

import { useMemo, useRef, useState } from 'react';
import { modelCatalog } from '../../lib/model-data';
import { formatNumber, formatPrice } from '../../lib/model-utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const promptSuggestions = [
  '用一句话总结这个项目的定位',
  '比较一下这个模型更适合聊天还是代码任务',
  '如果接入真实 API Key，这个页面下一步该怎么扩展',
  '帮我生成一个生产上线前的验收清单'
] as const;

export default function ChatPage() {
  const [modelId, setModelId] = useState(modelCatalog[0]?.id ?? 'gpt-4o');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const currentModel = useMemo(() => modelCatalog.find((model) => model.id === modelId), [modelId]);

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
          content:
            error instanceof Error && error.name === 'AbortError'
              ? '已停止生成。你可以继续编辑问题，或重新发送。'
              : error instanceof Error
                ? `错误: ${error.message}`
                : '请求失败'
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
      <section className="panel stack page-hero">
        <div className="topbar">
          <div>
            <div className="eyebrow">Workspace Chat</div>
            <h1 className="page-title">模型会话工作区</h1>
            <p className="fine">这里不是展示性聊天窗口，而是面向真实供应商接入、模型切换和提示验证的工作区入口。</p>
          </div>
          <select className="select-input" value={modelId} onChange={(event) => setModelId(event.target.value)}>
            {modelCatalog.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        <div className="stat-grid">
          <div className="stat-card">
            <span>当前模型</span>
            <strong>{currentModel?.name ?? '-'}</strong>
          </div>
          <div className="stat-card">
            <span>上下文窗口</span>
            <strong>{currentModel ? formatNumber(currentModel.contextWindow) : '-'}</strong>
          </div>
          <div className="stat-card">
            <span>输入价格</span>
            <strong>{currentModel ? formatPrice(currentModel.pricing.inputPer1M) : '-'}</strong>
          </div>
          <div className="stat-card">
            <span>消息数</span>
            <strong>{messages.length}</strong>
          </div>
        </div>
      </section>

      <section className="chat-layout">
        <section className="panel stack">
          <div className="toolbar">
            <button className="ghost" type="button" onClick={clearConversation}>
              清空对话
            </button>
            <button className="ghost" type="button" onClick={stopGeneration} disabled={!loading}>
              停止生成
            </button>
          </div>
          <div className="chat-log">
            {messages.length === 0 ? <div className="fine">还没有消息，先点一条建议 prompt，或者直接输入问题试试看。</div> : null}
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
                <strong>{message.role === 'user' ? 'You' : 'Assistant'}</strong>
                <div>{message.content}</div>
              </div>
            ))}
          </div>
          <div className="toolbar prompt-grid">
            {promptSuggestions.map((suggestion) => (
              <button key={suggestion} className="ghost prompt-chip" type="button" onClick={() => setInput(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
          <div className="toolbar chat-composer">
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

        <aside className="panel stack chat-sidebar">
          <div className="eyebrow">Model Context</div>
          <h2 className="section-title">{currentModel?.name}</h2>
          <p className="fine">{currentModel?.description}</p>
          <div className="mini-list">
            <div className="status-item">
              <span>供应商</span>
              <strong>{currentModel?.provider.name}</strong>
            </div>
            <div className="status-item">
              <span>模态</span>
              <strong>{currentModel?.modalities.join(', ')}</strong>
            </div>
            <div className="status-item">
              <span>擅长</span>
              <strong>{currentModel?.strengths.slice(0, 2).join(' / ')}</strong>
            </div>
          </div>
          <div className="fine">这里优先尝试真实供应商请求；若当前环境缺少可用密钥或上游暂不可达，会自动降级到本地安全回退输出。</div>
          <div className="fine">现在如果你已经在 `/settings` 中保存了对应供应商的 API Key，这个页面会直接接管模型推理链路，方便做联调与验收。</div>
        </aside>
      </section>
    </main>
  );
}
