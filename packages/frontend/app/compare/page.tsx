'use client';

import { useMemo, useState } from 'react';
import { modelCatalog } from '../../lib/model-data';
import { capabilityLabels, formatNumber, formatPrice, scoreColor } from '../../lib/model-utils';

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>(['gpt-4o', 'claude-3-5-sonnet']);
  const picks = useMemo(() => modelCatalog.filter((model) => selected.includes(model.id)), [selected]);

  function toggle(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) return current;
      return [...current, id];
    });
  }

  return (
    <main className="shell stack">
      <section className="panel stack">
        <div className="eyebrow">Compare</div>
        <h1 className="page-title">模型对比</h1>
        <p className="fine">选择 2 到 4 个模型，快速查看价格、上下文和能力差异。</p>
        <div className="pill-row">
          {modelCatalog.map((model) => (
            <button
              key={model.id}
              type="button"
              className={selected.includes(model.id) ? 'btn' : 'ghost'}
              onClick={() => toggle(model.id)}
            >
              {model.name}
            </button>
          ))}
        </div>
      </section>

      <section className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>维度</th>
              {picks.map((model) => (
                <th key={model.id}>{model.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>供应商</td>
              {picks.map((model) => (
                <td key={model.id}>{model.provider.name}</td>
              ))}
            </tr>
            <tr>
              <td>上下文窗口</td>
              {picks.map((model) => (
                <td key={model.id}>{formatNumber(model.contextWindow)}</td>
              ))}
            </tr>
            <tr>
              <td>输入价格</td>
              {picks.map((model) => (
                <td key={model.id}>{formatPrice(model.pricing.inputPer1M)}</td>
              ))}
            </tr>
            <tr>
              <td>输出价格</td>
              {picks.map((model) => (
                <td key={model.id}>{formatPrice(model.pricing.outputPer1M)}</td>
              ))}
            </tr>
            {Object.entries(capabilityLabels).map(([key, label]) => (
              <tr key={key}>
                <td>{label}</td>
                {picks.map((model) => {
                  const score = model.capabilities[key as keyof typeof model.capabilities];
                  return (
                    <td key={model.id}>
                      <div className="compare-score">
                        <div className="score-track">
                          <div className={`score-bar ${scoreColor(score)}`} style={{ width: `${score}%` }} />
                        </div>
                        <strong>{score}</strong>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
