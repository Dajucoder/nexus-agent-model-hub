import type {
  ProviderFormState,
  ProviderStoredState,
} from "../lib/hooks/use-provider-settings";
import { providerConfigs } from "../lib/model-data";

type ProviderConfigItem = (typeof providerConfigs)[number];

export function ProviderSettingsCard(props: {
  configs: ProviderFormState;
  onApiKeyChange: (provider: string, apiKey: string) => void;
  onBaseUrlChange: (provider: string, baseUrl: string) => void;
  onClear: (provider: string) => void;
  onResetBaseUrl: (provider: string) => void;
  onSave: (provider: string) => void;
  provider: ProviderConfigItem;
  saved: Record<string, boolean>;
  stored: ProviderStoredState;
}) {
  const config = props.configs[props.provider.id];
  const storedConfig = props.stored[props.provider.id];

  return (
    <section className="panel stack">
      <div className="topbar card-top">
        <div>
          <h2 className="section-title">{props.provider.name}</h2>
          <div className="fine">{props.provider.defaultBaseUrl}</div>
        </div>
        <div className="toolbar">
          <a
            className="ghost"
            href={props.provider.docsUrl}
            target="_blank"
            rel="noreferrer"
          >
            文档
          </a>
          <a
            className="ghost"
            href={props.provider.keyUrl}
            target="_blank"
            rel="noreferrer"
          >
            获取 Key
          </a>
        </div>
      </div>
      <div className="field">
        <label>API Key</label>
        <input
          value={config?.apiKey ?? ""}
          onChange={(event) =>
            props.onApiKeyChange(props.provider.id, event.target.value)
          }
          placeholder={
            storedConfig?.maskedKey
              ? `已保存: ${storedConfig.maskedKey}，输入新值可覆盖`
              : `输入 ${props.provider.name} API Key`
          }
        />
      </div>
      <div className="field">
        <label>Base URL</label>
        <input
          value={
            config?.baseUrl ??
            storedConfig?.baseUrl ??
            props.provider.defaultBaseUrl
          }
          onChange={(event) =>
            props.onBaseUrlChange(props.provider.id, event.target.value)
          }
        />
      </div>
      {storedConfig?.updatedAt ? (
        <div className="fine">
          最近保存时间：
          {new Date(storedConfig.updatedAt).toLocaleString("zh-CN")}
        </div>
      ) : (
        <div className="fine">尚未保存该供应商配置。</div>
      )}
      <div className="toolbar">
        <button
          className="btn"
          type="button"
          onClick={() => props.onSave(props.provider.id)}
        >
          {props.saved[props.provider.id] ? "已保存" : "保存配置"}
        </button>
        <button
          className="ghost"
          type="button"
          onClick={() => props.onResetBaseUrl(props.provider.id)}
        >
          恢复默认地址
        </button>
        <button
          className="ghost"
          type="button"
          onClick={() => props.onClear(props.provider.id)}
        >
          清除配置
        </button>
      </div>
    </section>
  );
}
