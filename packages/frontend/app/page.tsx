import Link from 'next/link';
import { AuthPanel } from '../components/auth-panel';
import { ModelCatalogCard } from '../components/model-catalog-card';
import { modelCatalog } from '../lib/model-data';

export default function HomePage() {
  const featuredModels = ['gpt-4o', 'claude-sonnet-4-20250514', 'gemini-2.5-pro']
    .map((id) => modelCatalog.find((model) => model.id === id))
    .filter((model): model is (typeof modelCatalog)[number] => Boolean(model));
  const providerCount = new Set(modelCatalog.map((model) => model.provider.id)).size;
  const maxContextWindow = Math.max(...modelCatalog.map((model) => model.contextWindow));

  const modules = [
    {
      title: '认证与租户体系',
      copy: '把注册、登录、JWT、refresh token 和多租户隔离放在统一入口，作为产品级访问与权限基础层。',
      items: ['初始管理员可直接引导入场', '面向真实 API 的租户隔离', '中英文界面可切换'],
      href: '/login'
    },
    {
      title: '模型资料与对比',
      copy: '模型卡片、能力评分、价格、上下文和适用场景集中整理，适合做内部选型入口。',
      items: ['模型详情页静态生成', '2 到 4 个模型并排对比', '适合继续接入更多供应商'],
      href: '/models'
    },
    {
      title: '排行榜与会话工作区',
      copy: '把榜单浏览和模型会话并入同一套界面，让“看数据”和“用模型”形成闭环。',
      items: ['Arena / OpenRouter / Combined', '会话页支持真实供应商配置', '后续可继续补齐组织级运营能力'],
      href: '/leaderboard'
    }
  ];

  return (
    <main className="shell home-shell">
      <section className="home-hero">
        <section className="panel stack hero-copy">
          <div className="eyebrow">Agent Platform · Model Hub · Docs</div>
          <h1 className="hero-title">
            <span className="text-gradient">从仓库入口开始</span>
            <br />
            建成可上线的产品基线
          </h1>
          <p>
            这个仓库已经具备认证、模型资料、排行榜、设置、聊天和部署文档等能力。首页现在直接承担产品入口、
            运维入口和 onboarding 入口三种角色，让团队第一次打开项目时就知道怎么启动、怎么配置、怎么继续扩展。
          </p>
          <div className="pill-row">
            <Link className="btn" href="/login">
              进入产品入口
            </Link>
            <Link className="ghost" href="/models">
              查看模型库
            </Link>
            <Link className="ghost" href="/docs">
              阅读部署文档
            </Link>
            <Link className="ghost" href="/chat">
              打开会话工作区
            </Link>
          </div>
          <div className="hero-kpi-grid">
            <div className="kpi">
              <div>模型覆盖</div>
              <strong>{modelCatalog.length} 个主力模型</strong>
            </div>
            <div className="kpi">
              <div>供应商</div>
              <strong>{providerCount} 类接入源</strong>
            </div>
            <div className="kpi">
              <div>上下文上限</div>
              <strong>{Intl.NumberFormat('en-US').format(maxContextWindow)}</strong>
            </div>
            <div className="kpi">
              <div>部署形态</div>
              <strong>Docker / K8s / Helm</strong>
            </div>
          </div>
        </section>

        <div className="hero-side">
          <section className="panel stack status-panel">
            <div className="section-title">项目现在能直接提供什么</div>
            <div className="status-list">
              <div className="status-item">
                <span>认证体系</span>
                <strong>注册 / 登录 / JWT</strong>
              </div>
              <div className="status-item">
                <span>模型站能力</span>
                <strong>详情页 / 排行榜 / 对比</strong>
              </div>
              <div className="status-item">
                <span>运营支持</span>
                <strong>中英双语文档</strong>
              </div>
              <div className="status-item">
                <span>落地方式</span>
                <strong>本地、容器、K8s</strong>
              </div>
            </div>
          </section>

          <section className="panel stack route-panel">
            <div>
              <div className="eyebrow">Quick Routes</div>
              <h2 className="section-title">最常访问的入口</h2>
            </div>
            <div className="route-grid">
              <Link className="ghost" href="/dashboard">
                控制台
              </Link>
              <Link className="ghost" href="/settings">
                API Key 设置
              </Link>
              <Link className="ghost" href="/leaderboard">
                排行榜
              </Link>
              <Link className="ghost" href="/compare">
                模型对比
              </Link>
            </div>
          </section>
        </div>
      </section>

      <section className="stack">
        <div className="section-heading">
          <div className="stack">
            <div className="eyebrow">Core Modules</div>
            <h2 className="section-title">现在的前端应该强调的三件事</h2>
            <p className="muted-copy">不是把所有功能平铺出来，而是让用户能快速建立“先看什么、再做什么”的路径感。</p>
          </div>
        </div>
        <div className="feature-grid">
          {modules.map((module) => (
            <article key={module.title} className="panel stack feature-card">
              <h3 className="section-title">{module.title}</h3>
              <p>{module.copy}</p>
              <ul className="feature-list">
                {module.items.map((item) => (
                  <li key={item}>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link className="ghost" href={module.href}>
                打开模块
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="stack">
        <div className="section-heading">
          <div className="stack">
            <div className="eyebrow">Featured Models</div>
            <h2 className="section-title">首页保留模型展示，但不再抢主叙事</h2>
          </div>
          <Link className="ghost" href="/models">
            查看全部模型
          </Link>
        </div>
        <div className="cards">
          {featuredModels.map((model) => (
            <ModelCatalogCard key={model.id} model={model} />
          ))}
        </div>
      </section>

      <section className="home-bottom-grid">
        <div className="panel stack checklist-panel">
          <div className="eyebrow">Launch Checklist</div>
          <h2 className="section-title">部署和上线入口做成明确动作</h2>
          <ul className="checklist">
            <li>
              <span>本地直接拉起前后端与依赖</span>
              <strong>docker compose up --build</strong>
            </li>
            <li>
              <span>查看中文部署与运维说明</span>
              <strong>/docs?lang=zh</strong>
            </li>
            <li>
              <span>先登录初始管理员账号，再进入控制台调用 Agent</span>
              <strong>/login -&gt; /dashboard</strong>
            </li>
          </ul>
          <div className="command-box mono">docker compose up --build</div>
          <p className="muted-copy">
            现在首页不仅是视觉入口，也承担 onboarding 角色，第一次打开项目就知道“怎么启动、怎么验收、怎么继续看文档”。
          </p>
        </div>

        <AuthPanel />
      </section>
    </main>
  );
}
