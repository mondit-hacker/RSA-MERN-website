/**
 * core/ui/Shell.jsx
 * The panel shell (sidebar + topbar + content area).
 * Renamed from PanelLayout to Shell.
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSession } from '../store/session';
import './Shell.css';

export default function Shell({ children, nav, title }) {
  const { user, logout } = useSession();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [bye,  setBye]  = useState(false);

  const ACCENT = {
    admin:'#EF4444', student:'#3B82F6', teacher:'#8B5CF6',
    hr:'#10B981',    manager:'#F59E0B', developer:'#6366F1',
  };
  const accent = ACCENT[user?.role] || '#C9A84C';

  async function handleLogout() {
    setBye(true);
    await logout();
  }

  const currentLabel = nav.find(n =>
    location.pathname === n.to || location.pathname.startsWith(n.to + '/')
  )?.label || title;

  return (
    <div className="sh-root">
      {/* ── Sidebar ── */}
      <aside className="sh-side" style={{ '--ac': accent, transform: open ? 'translateX(0)' : '' }}>
        <div className="sh-brand">
          <img src="/assets/logo.png" alt="RSA" className="sh-logo" />
          <div>
            <span className="sh-name">Rise &amp; Shine</span>
            <span className="sh-tag" style={{ color: accent }}>{title}</span>
          </div>
        </div>

        <div className="sh-chip">
          <div className="sh-av" style={{ background: accent }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <span className="sh-uname">{user?.firstName} {user?.lastName}</span>
            <span className="sh-urole" style={{ color: accent }}>{user?.role}</span>
          </div>
        </div>

        <nav className="sh-nav" aria-label="Panel navigation">
          {nav.map(item => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <Link key={item.to} to={item.to}
                className={`sh-link ${active ? 'sh-link-active' : ''}`}
                style={active ? { background: `${accent}1A`, borderLeftColor: accent, color: accent } : {}}
                onClick={() => setOpen(false)}>
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button className="sh-logout" onClick={handleLogout} disabled={bye}>
          <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
          {bye ? 'Signing out…' : 'Sign Out'}
        </button>
      </aside>

      {open && <div className="sh-veil" onClick={() => setOpen(false)} />}

      {/* ── Main ── */}
      <div className="sh-body">
        <header className="sh-bar">
          <button className="sh-hbg" onClick={() => setOpen(s => !s)} aria-label="Toggle menu">
            <i className="fa-solid fa-bars" />
          </button>
          <h1 className="sh-title">{currentLabel}</h1>
          <div className="sh-bar-r">
            <Link to="/" className="sh-site-link" title="Back to website" aria-label="Back to website">
              <i className="fa-solid fa-globe" />
            </Link>
            <div className="sh-bar-av" style={{ background: accent }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>
        <main className="sh-main" id="panel-main">
          {children}
        </main>
      </div>
    </div>
  );
}
