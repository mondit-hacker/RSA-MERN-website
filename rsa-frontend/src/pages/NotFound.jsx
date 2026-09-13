import { Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import './NotFound.css';

export default function NotFound() {
  const { pathname } = useLocation();
  return (
    <>
      <SEO title="404 — Page Not Found" description="This page doesn't exist at Rise & Shine Academy." />
      <div className="notfound-page">
        <div className="nf-content">
          <img src="/assets/logo.png" alt="Rise & Shine Academy" className="nf-logo" />
          <div className="nf-code" aria-hidden="true">404</div>
          <h1>Page Not Found</h1>
          <p>The page <code>{pathname}</code> doesn't exist or has been moved.</p>
          <div className="nf-actions">
            <Link to="/" className="btn btn-navy">Return Home</Link>
            <Link to="/contact" className="btn btn-outline-dark">Contact Us</Link>
          </div>
          <p className="nf-hint">You might be looking for</p>
          <nav className="nf-links" aria-label="Helpful links">
            <Link to="/programs">Programs</Link>
            <Link to="/about">About Us</Link>
            <Link to="/fee">Fee Structure</Link>
            <Link to="/campus">Campuses</Link>
            <Link to="/apply">Apply Now</Link>
          </nav>
        </div>
      </div>
    </>
  );
}
