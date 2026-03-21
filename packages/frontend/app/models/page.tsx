'use client';

import { useDeferredValue, useState } from 'react';
import { ModelCatalogCard } from '../../components/model-catalog-card';
import { modelCatalog, searchModels } from '../../lib/model-data';

export default function ModelsPage() {
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('all');
  const deferredQuery = useDeferredValue(query);

  const providers = ['all', ...new Set(modelCatalog.map((model) => model.provider.id))];
  const models = searchModels(deferredQuery, provider);

  return (
    <main className="shell stack">
      <section className="panel stack">
        <div className="eyebrow">Model Hub</div>
        <h1 className="page-title">模型库</h1>
        <p className="fine">把原有模型百科内容并入当前平台后，这里统一展示模型资料、价格、能力与适用场景。</p>
        <div className="toolbar">
          <input
            className="search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索模型名称、描述或标签"
          />
          <select className="select-input" value={provider} onChange={(event) => setProvider(event.target.value)}>
            {providers.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="cards">
        {models.map((model) => (
          <ModelCatalogCard key={model.id} model={model} />
        ))}
      </section>
    </main>
  );
}
