import { Link } from 'react-router-dom';
import { SITE } from '../data/siteData';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">

          {/* ── Brand ── */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo-link">
              <img src="/assets/logo.png" alt="Rise & Shine Academy logo" className="footer-logo-img" />
              <div className="footer-logo-text">
                <span className="footer-logo-name">Rise &amp; Shine Academy</span>
                <span className="footer-logo-tag">Excellence in Education</span>
              </div>
            </Link>
            <p>{SITE.tagline}</p>

            <div className="footer-contact-list">
              {/* All phone numbers */}
              {SITE.phones.map((ph, i) => (
                <a key={i} href={`tel:${ph.replace(/\s/g,'')}`} className="footer-contact-item">
                  <i className="fa-solid fa-phone"></i>
                  <span>{ph}</span>
                </a>
              ))}
              <a href={`mailto:${SITE.email}`} className="footer-contact-item">
                <i className="fa-solid fa-envelope"></i>
                <span>{SITE.email}</span>
              </a>
              <div className="footer-contact-item">
                <i className="fa-solid fa-location-dot"></i>
                <span>{SITE.address}</span>
              </div>
              <div className="footer-contact-item">
                <i className="fa-solid fa-location-dot" style={{opacity:.6}}></i>
                <span>{SITE.addressKP}</span>
              </div>
            </div>

            <div className="footer-social">
              <a href={SITE.facebook}  target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href={`mailto:${SITE.email}`} aria-label="Email">
                <i className="fa-solid fa-envelope"></i>
              </a>
              <a href={`tel:${SITE.phones[0].replace(/\s/g,'')}`} aria-label="Call">
                <i className="fa-solid fa-phone"></i>
              </a>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/why-us">Why Choose RSA</Link></li>
              <li><Link to="/programs">Programs</Link></li>
              <li><Link to="/fee">Fee Structure</Link></li>
              <li><Link to="/apply">Apply Now</Link></li>
            </ul>
          </div>

          {/* ── Programs ── */}
          <div className="footer-col">
            <h4>Programs</h4>
            <ul>
              <li><Link to="/programs">eKidz (Nursery–KG)</Link></li>
              <li><Link to="/programs">eChamps (Class 1–5)</Link></li>
              <li><Link to="/programs">eTechno (Class 6–10)</Link></li>
              <li><Link to="/programs">SR. Secondary</Link></li>
              <li><Link to="/transport">Transportation</Link></li>
            </ul>
          </div>

          {/* ── Campuses & Legal ── */}
          <div className="footer-col">
            <h4>Campuses</h4>
            <ul>
              <li><a href={SITE.mapHCP} target="_blank" rel="noopener noreferrer">Harish Chandra Pur ↗</a></li>
              <li><a href={SITE.mapKSP} target="_blank" rel="noopener noreferrer">Kashim Pur ↗</a></li>
              <li><Link to="/campus">View All Maps</Link></li>
            </ul>
            <h4 style={{ marginTop:'24px' }}>Legal</h4>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/refund">Refund Policy</Link></li>
              <li><Link to="/cancellation">Cancellation</Link></li>
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="footer-bottom">
          <div className="footer-bottom-logo">
            <img src="/assets/logo.png" alt="RSA" />
            <span>© {new Date().getFullYear()} Rise &amp; Shine Academy. All rights reserved.</span>
          </div>
          <p className="footer-bottom-tagline">
            Malda, West Bengal, India &nbsp;·&nbsp; Pin 732125 &nbsp;·&nbsp;
            <a href={`mailto:${SITE.email}`} style={{color:'inherit'}}>{SITE.email}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
