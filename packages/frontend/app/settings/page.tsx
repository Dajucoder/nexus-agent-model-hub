"use client";

import { ProviderSettingsCard } from "../../components/provider-settings-card";
import { SettingsHero } from "../../components/settings-hero";
import { useProviderSettings } from "../../lib/hooks/use-provider-settings";
import { providerConfigs } from "../../lib/model-data";

export default function SettingsPage() {
  const {
    configs,
    stored,
    saved,
    error,
    save,
    clear,
    updateApiKey,
    updateBaseUrl,
    resetBaseUrl,
  } = useProviderSettings();

  return (
    <main className="shell stack">
      <SettingsHero error={error} providerCount={providerConfigs.length} />
      <section className="config-grid">
        {providerConfigs.map((provider) => (
          <ProviderSettingsCard
            key={provider.id}
            configs={configs}
            onApiKeyChange={updateApiKey}
            onBaseUrlChange={updateBaseUrl}
            onClear={clear}
            onResetBaseUrl={resetBaseUrl}
            onSave={save}
            provider={provider}
            saved={saved}
            stored={stored}
          />
        ))}
      </section>
    </main>
  );
}
