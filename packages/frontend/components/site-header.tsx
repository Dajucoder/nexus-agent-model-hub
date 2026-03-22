import Link from 'next/link';

const links = [
  { href: '/docs', label: '文档' },
  { href: '/models', label: '模型库' },
  { href: '/compare', label: '对比' },
  { href: '/leaderboard', label: '排行榜' },
  { href: '/chat', label: '会话工作区' },
  { href: '/settings', label: 'API Key' },
  { href: '/dashboard', label: '控制台', cta: true }
];

export function SiteHeader() {
  return (
    <header className="shell shell-header">
      <div className="masthead panel">
        <div className="brand-lockup">
          <Link href="/" className="brand-link brand-mark">
            Nexus Agent Model Hub
          </Link>
          <div className="fine">多租户 Agent 平台、模型资料站、排行榜、文档中心与会话工作区</div>
        </div>
        <nav className="site-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={link.cta ? 'ghost nav-link nav-cta' : 'ghost nav-link'}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
