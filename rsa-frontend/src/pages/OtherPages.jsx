import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import EnquiryForm from '../components/EnquiryForm';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { WHY_CARDS, PROGRAMS, FEE_TABLE, SITE } from '../data/siteData';
import './PageCommon.css';

const WHY_ICONS = ['fa-book-open','fa-shield-halved','fa-chalkboard-user','fa-user-graduate','fa-seedling','fa-trophy'];
const PROG_BG   = ['#EEF2FF','#F0FDF4','#FFF7ED','#F9FAFB'];
const PROG_BULLETS = [
  ['Play-based, hands-on learning','Phonics & early reading','Numeracy foundations','Social & emotional growth'],
  ['CBSE-aligned curriculum','Technology integration','Arts & character education','Competitive exam foundations'],
  ['Advanced STEM modules','Critical thinking workshops','Olympiad coaching available','Project-based learning'],
  ['Science & Arts streams (planned)','University counselling (planned)','Career guidance (planned)','Board exam preparation (planned)'],
];

/* ════ WHY US ════ */
export function WhyUs() {
  useScrollReveal();
  return (
    <>
      <SEO title="Why Choose RSA" description="Six compelling reasons why parents choose Rise & Shine Academy in Malda, WB." />
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow" style={{ color:'var(--gold)' }}>Why RSA</div>
          <h1>Why Parents Choose <span>Rise &amp; Shine</span></h1>
          <p>A proven system where learners grow with consistency, discipline, and measurable results.</p>
        </div>
      </div>
      <section className="page-section">
        <div className="why-page-grid">
          {WHY_CARDS.map((c,i) => (
            <div className="why-big-card reveal" key={i}>
              <div className="big-icon" aria-hidden="true"><i className={`fa-solid ${WHY_ICONS[i]}`} /></div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <EnquiryForm />
    </>
  );
}

/* ════ PROGRAMS ════ */
export function Programs() {
  useScrollReveal();
  return (
    <>
      <SEO title="Programs" description="Explore eKidz, eChamps, eTechno, and upcoming SR. Secondary programs at Rise & Shine Academy, Malda." />
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow" style={{ color:'var(--gold)' }}>Our Programs</div>
          <h1>The Right Program for <span>Every Stage</span></h1>
          <p>From nursery to secondary — a structured, enriching curriculum at every level.</p>
        </div>
      </div>
      <section className="page-section">
        <div className="prog-page-grid">
          {PROGRAMS.map((p,i) => (
            <article className={`prog-big-card reveal ${p.status === 'coming_soon' ? 'prog-coming-soon' : ''}`} key={i}>
              <div className="prog-big-head" style={{ background: PROG_BG[i] }}>
                <div className="big-emoji" aria-hidden="true">{p.emoji}</div>
                <span className="prog-badge-inline">{p.badge}</span>
                <h2>{p.range}</h2>
                {p.status === 'coming_soon' && (
                  <span className="prog-dev-tag">🚧 Under Development</span>
                )}
              </div>
              <div className="prog-big-body">
                <p>{p.desc}</p>
                {p.status === 'coming_soon' ? (
                  <div className="prog-coming-banner">
                    <i className="fa-solid fa-hammer" aria-hidden="true" />
                    <div>
                      <strong>Launching Soon!</strong>
                      <p>We are actively building our Senior Secondary programme. Classes 11 &amp; 12 will be available very soon with Science and Arts streams. Register your interest below!</p>
                    </div>
                  </div>
                ) : (
                  <ul>{PROG_BULLETS[i].map((b,j) => <li key={j}>{b}</li>)}</ul>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <EnquiryForm />
    </>
  );
}

/* ════ FEE ════ */
export function Fee() {
  useScrollReveal();
  return (
    <>
      <SEO title="Fee Structure" description="Transparent, affordable fee structure for all programs at Rise & Shine Academy, Malda." />
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow" style={{ color:'var(--gold)' }}>Fees &amp; Finances</div>
          <h1>Transparent <span>Fee Structure</span></h1>
          <p>Affordable quality education for every family. No hidden charges — complete clarity.</p>
        </div>
      </div>
      <section className="page-section">
        <div className="eyebrow">2026–27 Academic Year</div>
        <h2 className="section-title" style={{ marginBottom:'8px' }}>Program-wise Fee Breakdown</h2>
        <p className="section-sub">All fees in Indian Rupees (₹). Contact us for scholarship &amp; instalment options.</p>
        <div className="fee-table-wrap reveal">
          <table className="fee-table">
            <thead>
              <tr>
                <th scope="col">Program</th>
                <th scope="col">Admission Fee</th>
                <th scope="col">Monthly Fee</th>
                <th scope="col">Annual (est.)</th>
                <th scope="col">Note</th>
              </tr>
            </thead>
            <tbody>
              {FEE_TABLE.map((r,i) => (
                <tr key={i} className={r.note.includes('Under Development') ? 'fee-row-dev' : ''}>
                  <td><strong>{r.program}</strong></td>
                  <td>{r.admission}</td>
                  <td>{r.monthly}</td>
                  <td>{r.annual}</td>
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="fee-note">* Fees are subject to revision. Contact the school office for current rates and scholarship details.</p>
        </div>
      </section>
      <EnquiryForm />
    </>
  );
}

/* ════ CONTACT ════ */
export function Contact() {
  useScrollReveal();
  return (
    <>
      <SEO title="Contact Us" description="Get in touch with Rise & Shine Academy — phone, email, campus addresses, and enquiry form." />
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow" style={{ color:'var(--gold)' }}>Get in Touch</div>
          <h1>Contact <span>Rise &amp; Shine Academy</span></h1>
          <p>We'd love to hear from you. Our team responds within 24 hours.</p>
        </div>
      </div>
      <section className="page-section">
        <div className="contact-grid">
          <div className="contact-info-card reveal-left">
            <h2>School Information</h2>
            {[
              { icon:'fa-phone',        label:'Phone (HCP)',   val: '+91 90621 41212' },
              { icon:'fa-phone',        label:'Phone',        val: '+91 77187 18586' },
              { icon:'fa-phone',        label:'Phone',        val: '+91 80167 39938' },
              { icon:'fa-phone',        label:'WhatsApp',     val: '+91 94747 94633' },
              { icon:'fa-envelope',     label:'Email',        val: SITE.email },
              { icon:'fa-location-dot', label:'Main Campus',  val: 'Station Road, Harish Chandra Pur, Malda, WB — 732125' },
              { icon:'fa-location-dot', label:'Branch Campus',val: 'Near NH-12, Kashim Pur, Malda, WB — 732125' },
              { icon:'fa-clock',        label:'Office Hours', val: 'Mon–Sat: 8:00 AM – 5:00 PM' },
            ].map(item => (
              <div className="contact-item" key={item.label}>
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                <p><strong>{item.label}</strong>{item.val}</p>
              </div>
            ))}
            <div className="map-placeholder" aria-hidden="true">
              <i className="fa-solid fa-map-location-dot" />
              <span>See full map on our <Link to="/campus" style={{ color:'var(--gold)' }}>Campuses page</Link></span>
            </div>
          </div>
          <div className="reveal-right">
            {[
              { name:'Harish Chandra Pur Campus', addr:'Station Road, Pin-732125, Malda, WB', mapsUrl:'https://www.google.com/maps/search/Harishchandrapur+Malda+West+Bengal+732125' },
              { name:'Kashim Pur Campus',         addr:'Near NH-12, Malda, West Bengal',       mapsUrl:'https://www.google.com/maps/search/Kashimpur+Harishchandrapur+Malda' },
            ].map((c,i) => (
              <div className="campus-info-box" key={i} style={{ borderLeft:'4px solid var(--gold)' }}>
                <h3>{c.name}</h3>
                <p>{c.addr}</p>
                <p style={{ marginTop:'6px', fontSize:'0.83rem', color:'var(--slate-light)' }}>
                  <i className="fa-solid fa-phone" style={{ marginRight:'6px', color:'var(--gold)' }} aria-hidden="true" />
                  {SITE.phone}
                </p>
                <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display:'inline-flex', alignItems:'center', gap:'6px', marginTop:'8px', fontSize:'0.82rem', color:'var(--gold)', fontWeight:600, textDecoration:'none' }}>
                  <i className="fa-solid fa-map-location-dot" aria-hidden="true" />View on Map
                </a>
              </div>
            ))}
            <div className="campus-info-box" style={{ background:'var(--navy)', border:'none' }}>
              <h3 style={{ color:'var(--white)', marginBottom:'10px' }}>Follow Us</h3>
              <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                {[
                  ['fa-facebook-f','Facebook','https://www.facebook.com/p/Rise-Shine-Academy-HCP-100054533256269/'],
                  ['fa-instagram','Instagram','https://www.instagram.com/riseandshine_2017'],
                  ['fa-envelope','Email',`mailto:${SITE.email}`],
                  ['fa-phone','Call',`tel:+919062141212`],
                ].map(([icon,label,href]) => (
                  <a key={icon} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    style={{ width:'38px', height:'38px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:'var(--radius-sm)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.55)', fontSize:'0.88rem', textDecoration:'none', transition:'all 0.2s' }}>
                    <i className={`fa-brands ${icon}`} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <EnquiryForm />
    </>
  );
}

/* ════ APPLY ════ */
const STEPS = [
  { title:'Fill Enquiry Form',  desc:"Complete the short enquiry form with your child's details." },
  { title:'Receive a Call',     desc:'Our admissions team contacts you within 24 hours.'           },
  { title:'Campus Visit',       desc:'Tour your preferred campus and meet our staff.'              },
  { title:'Submit Documents',   desc:'Provide birth certificate, mark sheets, and photograph.'    },
  { title:'Pay Admission Fee',  desc:'Complete the process with the one-time admission fee.'      },
  { title:'Welcome to RSA!',    desc:"Your child is now officially a Rise & Shine student!"       },
];
const DOCS = [
  "Child's birth certificate",
  'Previous school report card / TC',
  'Passport-size photographs (×4)',
  'Parent / Guardian ID proof',
  'Address proof',
  'Medical fitness certificate (optional)',
];

export function Apply() {
  useScrollReveal();
  return (
    <>
      <SEO title="Apply Now" description="Start your child's admission at Rise & Shine Academy — a simple 6-step process in Malda, WB." />
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow" style={{ color:'var(--gold)' }}>Admissions</div>
          <h1>Apply to <span>Rise &amp; Shine Academy</span></h1>
          <p>A simple, guided 6-step admission process. We're with you every step of the way.</p>
        </div>
      </div>
      <section className="page-section">
        <div className="apply-grid">
          <ol className="apply-steps" style={{ listStyle:'none' }}>
            {STEPS.map((s,i) => (
              <li className="apply-step reveal" key={i}>
                <div className="step-num" aria-hidden="true">{i+1}</div>
                <div className="step-info"><h3>{s.title}</h3><p>{s.desc}</p></div>
              </li>
            ))}
          </ol>
          <div className="docs-card reveal-right">
            <h3>Documents Required</h3>
            {DOCS.map((d,i) => (
              <div className="doc-item" key={i}>
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
                <span>{d}</span>
              </div>
            ))}
            <div style={{ marginTop:'24px', paddingTop:'20px', borderTop:'1px solid var(--border)' }}>
              <p style={{ fontSize:'0.85rem', color:'var(--slate)', marginBottom:'14px' }}>Ready to apply? Fill the enquiry form or call us directly.</p>
              <a href="tel:+919062141212" className="btn btn-navy" style={{ width:'100%', justifyContent:'center', display:'flex', alignItems:'center', gap:'8px', textDecoration:'none' }}>
                <i className="fa-solid fa-phone" aria-hidden="true" />Call Admissions
              </a>
            </div>
          </div>
        </div>
      </section>
      <EnquiryForm />
    </>
  );
}

/* ════ TRANSPORT ════ */
const TRANSPORT_FEATURES = [
  'GPS tracking on all vehicles',
  'Trained & background-verified drivers',
  'Dedicated attendant on every bus',
  'Real-time WhatsApp updates for parents',
  'Door-step pickup on select routes',
  'Monthly transport fee billed separately',
];

export function Transport() {
  useScrollReveal();
  return (
    <>
      <SEO title="Transportation" description="Safe, GPS-tracked school transportation at Rise & Shine Academy, Malda, WB." />
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow" style={{ color:'var(--gold)' }}>Transport</div>
          <h1>Safe School <span>Transportation</span></h1>
          <p>GPS-tracked, comfortable, and reliable transport for every student — every day.</p>
        </div>
      </div>
      <section className="page-section">
        <div className="about-grid">
          <div className="reveal-left">
            <div className="gold-line" />
            <div className="eyebrow">Our Fleet</div>
            <h2 className="section-title">Comfortable &amp; Safe Rides</h2>
            <p className="page-text">Dedicated school buses covering all major routes in and around Malda. Every vehicle is GPS-tracked, regularly serviced, and driven by trained, background-verified drivers.</p>
            <p className="page-text">A dedicated attendant travels on every bus. Parents receive real-time WhatsApp updates on bus location and delays.</p>
            <ul className="transport-features">
              {TRANSPORT_FEATURES.map((f,i) => (
                <li className="transport-feature" key={i}>
                  <i className="fa-solid fa-circle-check tf-check" aria-hidden="true" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/contact" className="btn btn-navy" style={{ marginTop:'8px' }}>Enquire About Routes</Link>
          </div>
          <div className="about-img-box reveal-right">
            <img src="/assets/transport.jpg" alt="School transport van" loading="lazy" />
          </div>
        </div>
      </section>
      <EnquiryForm />
    </>
  );
}
