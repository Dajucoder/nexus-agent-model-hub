import type { ModelCard } from "../lib/model-types";

export function ChatModelSidebar(props: {
  currentModel: ModelCard | undefined;
}) {
  return (
    <aside className="panel stack chat-sidebar">
      <div className="eyebrow">Model Context</div>
      <h2 className="section-title">{props.currentModel?.name}</h2>
      <p className="fine">{props.currentModel?.description}</p>
      <div className="mini-list">
        <div className="status-item">
          <span>供应商</span>
          <strong>{props.currentModel?.provider.name}</strong>
        </div>
        <div className="status-item">
          <span>模态</span>
          <strong>{props.currentModel?.modalities.join(", ")}</strong>
        </div>
        <div className="status-item">
          <span>擅长</span>
          <strong>
            {props.currentModel?.strengths.slice(0, 2).join(" / ")}
          </strong>
        </div>
      </div>
      <div className="fine">
        这里优先尝试真实供应商请求；若当前环境缺少可用密钥或上游暂不可达，会自动降级到本地安全回退输出。
      </div>
      <div className="fine">
        现在如果你已经在 `/settings` 中保存了对应供应商的 API
        Key，这个页面会直接接管模型推理链路，方便做联调与验收。
      </div>
    </aside>
  );
}
