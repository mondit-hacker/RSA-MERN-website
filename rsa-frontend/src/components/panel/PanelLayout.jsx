import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './PanelLayout.css';

export default function PanelLayout({ children, navItems, panelName }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sideOpen, setSideOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const ACCENT = { student:'#3B82F6',teacher:'#8B5CF6',hr:'#10B981',manager:'#F59E0B',admin:'#EF4444',developer:'#6366F1' };
  const accent = ACCENT[user?.role] || '#C9A84C';

  async function handleLogout() { setLoggingOut(true); await logout(); }

  return (
    <div className="panel-shell">
      <aside className="panel-sidebar" style={{'--accent':accent, transform: sideOpen?'translateX(0)':''}}>
        <div className="panel-sidebar-logo">
          <img src="/assets/logo.png" alt="RSA"/>
          <div><span className="ps-school">Rise &amp; Shine</span><span className="ps-panel">{panelName}</span></div>
        </div>
        <div className="panel-user-chip">
          <div className="puc-avatar" style={{background:accent}}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          <div className="puc-info"><span className="puc-name">{user?.firstName} {user?.lastName}</span><span className="puc-role" style={{color:accent}}>{user?.role}</span></div>
        </div>
        <nav className="panel-nav">
          {navItems.map(item => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path+'/');
            return (
              <Link key={item.path} to={item.path} className={`panel-nav-item${active?' active':''}`}
                style={active?{background:`${accent}18`,borderLeftColor:accent,color:accent}:{}}
                onClick={()=>setSideOpen(false)}>
                <i className={`fa-solid ${item.icon}`}/><span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button className="panel-logout-btn" onClick={handleLogout} disabled={loggingOut}>
          <i className="fa-solid fa-right-from-bracket"/>{loggingOut?'Logging out…':'Logout'}
        </button>
      </aside>

      {sideOpen && <div className="panel-backdrop" onClick={()=>setSideOpen(false)}/>}

      <div className="panel-main">
        <header className="panel-topbar">
          <button className="panel-hamburger" onClick={()=>setSideOpen(s=>!s)}><i className="fa-solid fa-bars"/></button>
          <h1 className="panel-page-title">{navItems.find(n=>location.pathname===n.path||location.pathname.startsWith(n.path+'/'))?.label || panelName}</h1>
          <div className="panel-topbar-right">
            <Link to="/" className="panel-home-link" title="Back to website"><i className="fa-solid fa-globe"/></Link>
            <div className="panel-topbar-avatar" style={{background:accent}}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          </div>
        </header>
        <main className="panel-content">{children}</main>
      </div>
    </div>
  );
}
