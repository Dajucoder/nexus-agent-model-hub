import Link from 'next/link';

const links = [
  { href: '/', label: 'Home 首页' },
  { href: '/docs', label: 'Docs 文档' },
  { href: '/models', label: 'Models 模型库' },
  { href: '/leaderboard', label: 'Leaderboard 排行榜' },
  { href: '/compare', label: 'Compare 模型对比' },
  { href: '/chat', label: 'Chat 对话演示' },
  { href: '/settings', label: 'API Key' },
  { href: '/dashboard', label: 'Dashboard 控制台' }
];

export function SiteHeader() {
  return (
    <header className="shell shell-header">
      <div className="masthead panel">
        <div>
          <Link href="/" className="brand-link">
            Nexus Agent Model Hub
          </Link>
          <div className="fine">Multi-tenant Agent platform, model hub, chat demo, and bilingual docs</div>
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
