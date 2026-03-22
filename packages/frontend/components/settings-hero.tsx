export function SettingsHero(props: { error: string; providerCount: number }) {
  return (
    <section className="panel stack page-hero">
      <div className="eyebrow">Provider Settings</div>
      <h1 className="page-title">API Key 设置</h1>
      <p className="fine">
        这里提供多供应商密钥配置入口，方便把模型库、会话工作区和未来真实调用串成一条正式链路。
      </p>
      <div className="stat-grid">
        <div className="stat-card">
          <span>支持供应商</span>
          <strong>{props.providerCount}</strong>
        </div>
        <div className="stat-card">
          <span>存储方式</span>
          <strong>服务端文件加密</strong>
        </div>
        <div className="stat-card">
          <span>正式环境建议</span>
          <strong>服务端密钥托管</strong>
        </div>
      </div>
      <div className="fine">
        当前 `/api/settings/api-key` 会在服务端持久化供应商配置，并限制为官方
        Base URL。正式环境仍建议使用专门的密钥管理方案。
      </div>
      {props.error ? <div className="danger">{props.error}</div> : null}
    </section>
  );
}
