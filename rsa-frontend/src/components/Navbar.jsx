import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { NAV_LINKS } from '../data/siteData';
import { useSession } from '../core/store/session';
import '../styles/Navbar.css';

export default function Navbar() {
  const { user, logout, getDashboardRoute } = useSession();
  const navigate  = useNavigate();
  const [open,     setOpen]    = useState(false);
  const [scrolled, setScrolled]= useState(false);
  const [dropdown, setDropdown]= useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 960) setOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    setDropdown(false);
    await logout();
  }

  function goToPanel() {
    setDropdown(false);
    setOpen(false);
    navigate(getDashboardRoute(user.role));
  }

  const ROLE_COLORS = {
    admin:'#EF4444', student:'#3B82F6', teacher:'#8B5CF6',
    hr:'#10B981', manager:'#F59E0B', developer:'#6366F1',
  };
  const accentColor = ROLE_COLORS[user?.role] || '#C9A84C';

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setOpen(false)}>
          <img src="/assets/logo.png" alt="Rise & Shine Academy" className="navbar-logo-img" />
          <div className="logo-text">
            <span className="logo-name">Rise &amp; Shine Academy</span>
            <span className="logo-tag">Excellence in Education</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="nav-links">
          {NAV_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
              {l.label}
            </NavLink>
          ))}

          {user ? (
            /* ── Logged-in profile dropdown ── */
            <div className="nav-profile-wrap" ref={dropRef}>
              <button
                className="nav-profile-btn"
                onClick={() => setDropdown(d => !d)}
                aria-label="Account menu"
                aria-expanded={dropdown}
              >
                <div className="nav-avatar" style={{ background: accentColor }}>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="nav-profile-info">
                  <span className="nav-profile-name">{user.firstName} {user.lastName}</span>
                  <span className="nav-profile-role" style={{ color: accentColor }}>{user.role}</span>
                </div>
                <i className={`fa-solid fa-chevron-down nav-caret ${dropdown ? 'open' : ''}`} />
              </button>

              {dropdown && (
                <div className="nav-dropdown" role="menu">
                  <div className="nav-dropdown-header">
                    <div className="nav-dd-avatar" style={{ background: accentColor }}>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                      <strong>{user.firstName} {user.lastName}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div className="nav-dropdown-divider" />

                  <button className="nav-dd-item" onClick={goToPanel} role="menuitem">
                    <i className="fa-solid fa-gauge" />My Panel
                  </button>
                  <Link to="/login?addAccount=1" className="nav-dd-item" onClick={() => setDropdown(false)} role="menuitem">
                    <i className="fa-solid fa-user-plus" />Add Another Account
                  </Link>

                  <div className="nav-dropdown-divider" />

                  <button className="nav-dd-item nav-dd-logout" onClick={handleLogout} disabled={loggingOut} role="menuitem">
                    <i className="fa-solid fa-right-from-bracket" />
                    {loggingOut ? 'Signing out…' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Not logged in ── */
            <>
              <NavLink to="/login" className="nav-login">
                <i className="fa-solid fa-right-to-bracket" /> Login
              </NavLink>
              <NavLink to="/apply" className="nav-cta">Apply Now</NavLink>
            </>
          )}
        </nav>

        {/* Hamburger */}
        <button
          className={`nav-hamburger ${open ? 'open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span /><span /><span />
        </button>
      </header>

      {/* Mobile drawer */}
      <div className={`nav-mobile ${open ? 'open' : ''}`}>
        <div className="nav-mobile-logo">
          <img src="/assets/logo.png" alt="RSA" />
          <span>Rise &amp; Shine Academy</span>
        </div>

        {user && (
          <div className="nav-mobile-user" style={{ borderLeft: `3px solid ${accentColor}` }}>
            <div className="nav-mob-avatar" style={{ background: accentColor }}>
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div>
              <strong>{user.firstName} {user.lastName}</strong>
              <span style={{ color: accentColor }}>{user.role}</span>
            </div>
          </div>
        )}

        <div className="nav-mobile-links">
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
        </div>

        <div className="nav-mobile-actions">
          {user ? (
            <>
              <button className="nav-mobile-panel" onClick={goToPanel}>
                <i className="fa-solid fa-gauge" />Go to My Panel
              </button>
              <Link to="/login?addAccount=1" className="nav-mobile-login" onClick={() => setOpen(false)}>
                <i className="fa-solid fa-user-plus" />Add Account
              </Link>
              <button className="nav-mobile-logout" onClick={handleLogout} disabled={loggingOut}>
                <i className="fa-solid fa-right-from-bracket" />
                {loggingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className="nav-mobile-login" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/apply"  className="nav-mobile-cta"   onClick={() => setOpen(false)}>Apply Now</Link>
            </>
          )}
        </div>
      </div>

      {open && <div className="nav-backdrop" onClick={() => setOpen(false)} />}
    </>
  );
}
