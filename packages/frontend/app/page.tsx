import Link from 'next/link';
import { AuthPanel } from '../components/auth-panel';
import { ModelCatalogCard } from '../components/model-catalog-card';
import { modelCatalog } from '../lib/model-data';

export default function HomePage() {
  const featuredModels = modelCatalog.slice(0, 3);

  return (
    <main className="shell">
      <div className="hero">
        <section className="panel stack">
          <div className="eyebrow">Root-integrated · Docker-ready · bilingual docs</div>
          <h1>Nexus Agent Model Hub</h1>
          <p>
            A merged root-level project that combines multi-tenant authentication, Agent tooling, model encyclopedia
            pages, leaderboards, provider settings, and a chat demo under one repository.
          </p>
          <div className="pill-row">
            <Link className="btn" href="/login">
              Open Auth Demo
            </Link>
            <Link className="ghost" href="/models">Browse Models</Link>
            <Link className="ghost" href="/leaderboard">View Leaderboard</Link>
            <Link className="ghost" href="/chat">Try Chat Demo</Link>
          </div>
        </section>

        <section className="panel grid">
          <div className="kpi">
            <div>Tenant-aware auth</div>
            <strong>JWT / refresh / TOTP</strong>
          </div>
          <div className="kpi">
            <div>Deployment</div>
            <strong>Docker / K8s / Helm</strong>
          </div>
          <div className="kpi">
            <div>Docs</div>
            <strong>English + Chinese</strong>
          </div>
          <div className="kpi">
            <div>Compliance</div>
            <strong>PolyForm NC</strong>
          </div>
        </section>
      </div>

      <section className="cards section-gap">
        {featuredModels.map((model) => (
          <ModelCatalogCard key={model.id} model={model} />
        ))}
      </section>

      <AuthPanel />
    </main>
  );
}
