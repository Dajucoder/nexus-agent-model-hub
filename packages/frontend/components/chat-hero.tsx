import type { ModelCard } from "../lib/model-types";
import { formatNumber, formatPrice } from "../lib/model-utils";

export function ChatHero(props: {
  currentModel: ModelCard | undefined;
  messageCount: number;
  modelId: string;
  modelOptions: ModelCard[];
  onModelChange: (modelId: string) => void;
}) {
  return (
    <section className="panel stack page-hero">
      <div className="topbar">
        <div>
          <div className="eyebrow">Workspace Chat</div>
          <h1 className="page-title">模型会话工作区</h1>
          <p className="fine">
            这里不是展示性聊天窗口，而是面向真实供应商接入、模型切换和提示验证的工作区入口。
          </p>
        </div>
        <select
          className="select-input"
          value={props.modelId}
          onChange={(event) => props.onModelChange(event.target.value)}
        >
          {props.modelOptions.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <span>当前模型</span>
          <strong>{props.currentModel?.name ?? "-"}</strong>
        </div>
        <div className="stat-card">
          <span>上下文窗口</span>
          <strong>
            {props.currentModel
              ? formatNumber(props.currentModel.contextWindow)
              : "-"}
          </strong>
        </div>
        <div className="stat-card">
          <span>输入价格</span>
          <strong>
            {props.currentModel
              ? formatPrice(props.currentModel.pricing.inputPer1M)
              : "-"}
          </strong>
        </div>
        <div className="stat-card">
          <span>消息数</span>
          <strong>{props.messageCount}</strong>
        </div>
      </div>
    </section>
  );
}
