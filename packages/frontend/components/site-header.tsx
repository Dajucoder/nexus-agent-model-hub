import Link from 'next/link';

const links = [
  { href: '/', label: '首页' },
  { href: '/models', label: '模型库' },
  { href: '/leaderboard', label: '排行榜' },
  { href: '/compare', label: '模型对比' },
  { href: '/chat', label: '对话演示' },
  { href: '/settings', label: 'API Key' },
  { href: '/dashboard', label: '租户控制台' }
];

export function SiteHeader() {
  return (
    <header className="shell shell-header">
      <div className="masthead panel">
        <div>
          <Link href="/" className="brand-link">
            Nexus Agent Model Hub
          </Link>
          <div className="fine">多租户 Agent 平台 + 大模型百科 + 对话与排行榜演示</div>
        </div>
        <nav className="toolbar">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="ghost nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
