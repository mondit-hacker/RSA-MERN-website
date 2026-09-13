import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import EnquiryForm from '../components/EnquiryForm';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useStatCounter } from '../hooks/useStatCounter';
import { STATS, WHY_CARDS, PROGRAMS, TEACHERS, EVENTS, ANNOUNCEMENTS, CAMPUSES, SLIDERS } from '../data/siteData';
import './Home.css';

const SLIDE_CAPTIONS = [
  { title: 'Our Campus Life',        sub: 'A vibrant, safe learning environment' },
  { title: 'Classrooms of Tomorrow', sub: 'Modern infrastructure for modern minds' },
  { title: 'Sports & Activities',    sub: 'Holistic development beyond books' },
  { title: 'Annual Events',          sub: 'Celebrating talent and achievement' },
  { title: 'Our Students',           sub: 'Confident, curious, and ready for the world' },
];
const WHY_ICONS   = ['fa-book-open','fa-shield-halved','fa-chalkboard-user','fa-user-graduate','fa-seedling','fa-trophy'];
const PROG_COLORS = ['#1E3A5F','#1A4D2E','#2D1B4E','#4A2000'];

export default function Home() {
  useScrollReveal();
  useStatCounter();
  const [slide, setSlide] = useState(0);

  const prevSlide = useCallback(() => setSlide(s => (s - 1 + SLIDERS.length) % SLIDERS.length), []);
  const nextSlide = useCallback(() => setSlide(s => (s + 1) % SLIDERS.length), []);

  useEffect(() => {
    const t = setInterval(nextSlide, 3500);
    return () => clearInterval(t);
  }, [nextSlide]);

  return (
    <>
      <SEO
        title="Rise & Shine Academy — Best School in Malda, West Bengal"
        description="Rise & Shine Academy offers modern curriculum, experienced educators, and holistic development from Nursery to Class 12 in Malda, WB. Admissions open 2026–27."
      />

      {/* HERO */}
      <section className="hero" id="home" aria-label="Hero section">
        <div className="hero-bg-pattern" aria-hidden="true" />
        <div className="hero-left">
          <div className="hero-badge"><span className="hero-badge-dot" aria-hidden="true" />Admissions Open</div>
          <h1 className="hero-title">Shaping Tomorrow's<span className="highlight">Leaders Today</span></h1>
          <p className="hero-sub">Rise &amp; Shine Academy empowers every student with modern curriculum, experienced educators, and a nurturing environment across Malda, West Bengal.</p>
          <div className="hero-actions btn-row">
            <Link to="/apply"    className="btn btn-primary btn-lg">Apply Now</Link>
            <Link to="/programs" className="btn btn-outline btn-lg">Explore Programs</Link>
          </div>
          <div className="hero-meta">
            <div className="hero-meta-item"><strong>1000+</strong><span>Students Enrolled</span></div>
            <div className="hero-meta-item"><strong>20+</strong><span>Expert Teachers</span></div>
            <div className="hero-meta-item"><strong>2</strong><span>Campuses</span></div>
            <div className="hero-meta-item"><strong>10+</strong><span>Years of Excellence</span></div>
          </div>
        </div>
        <div className="hero-right" aria-hidden="true">
          <img src={SLIDERS[0]} alt="" />
          <div className="hero-right-overlay">
            <p>Next Batch Starts</p>
            <span>May 11 — Seats filling fast</span>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-bar" aria-label="Announcements">
        <div className="ticker-track" aria-hidden="true">
          {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((a, i) => (
            <span className="ticker-item" key={i}>{a}<span className="ticker-sep" aria-hidden="true">|</span></span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="stats-section" id="stats-bar" aria-label="School statistics">
        <div className="stats-inner">
          {STATS.map((s, i) => (
            <div className="stat-item reveal" key={i}>
              <strong className={`stat-num${i === 0 ? ' stat-gold' : ''}`}
                data-target={s.num ?? undefined} data-suffix={s.suffix ?? ''}>
                {s.num == null ? s.text : '0'}
              </strong>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SLIDESHOW */}
      <section className="slideshow-section" aria-label="Photo slideshow">
        <div className="slideshow-wrap">
          {SLIDERS.map((src, i) => (
            <div key={i} className={`slide${i === slide ? ' active' : ''}`} aria-hidden={i !== slide}>
              <img src={src} alt={`School life ${i + 1}`} loading="lazy" />
              <div className="slide-overlay" aria-hidden="true" />
              {i === slide && SLIDE_CAPTIONS[i] && (
                <div className="slide-caption">
                  <h3>{SLIDE_CAPTIONS[i].title}</h3>
                  <p>{SLIDE_CAPTIONS[i].sub}</p>
                </div>
              )}
            </div>
          ))}
          <button className="slide-btn slide-btn-prev" onClick={prevSlide} aria-label="Previous slide"><i className="fa-solid fa-chevron-left" aria-hidden="true" /></button>
          <button className="slide-btn slide-btn-next" onClick={nextSlide} aria-label="Next slide"><i className="fa-solid fa-chevron-right" aria-hidden="true" /></button>
          <div className="slide-dots" role="tablist" aria-label="Slide indicators">
            {SLIDERS.map((_, i) => (
              <button key={i} className={`slide-dot${i === slide ? ' active' : ''}`}
                onClick={() => setSlide(i)} role="tab" aria-selected={i === slide}
                aria-label={`Go to slide ${i + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="why-section section" aria-labelledby="why-heading">
        <div className="why-inner">
          <div className="reveal">
            <div className="eyebrow">Why Choose RSA</div>
            <h2 id="why-heading" className="section-title">An Education Built for the Future</h2>
            <p className="section-sub">We combine academic rigour with holistic development to create confident, capable young individuals ready for the world.</p>
          </div>
          <div className="why-grid">
            {WHY_CARDS.map((c, i) => (
              <article className="why-card reveal" key={i}>
                <div className="why-icon" aria-hidden="true"><i className={`fa-solid ${WHY_ICONS[i]}`} /></div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="programs-section section" aria-labelledby="prog-heading">
        <div className="programs-inner">
          <div className="reveal">
            <div className="eyebrow" style={{ color:'var(--gold)' }}>Our Programs</div>
            <h2 id="prog-heading" className="section-title light">The Right Program for Every Stage</h2>
            <p className="section-sub light">From nursery to senior secondary — a structured, enriching curriculum at every level.</p>
          </div>
          <div className="programs-grid">
            {PROGRAMS.map((p, i) => (
              <article className="prog-card reveal" key={i} style={p.status==='coming_soon'?{opacity:.88}:{}}>
                <div className="prog-img">
                  <div className="prog-img-placeholder" style={{ background: p.status==='coming_soon'?'#9CA3AF':PROG_COLORS[i] }} aria-hidden="true">
                    <i className={`fa-solid ${p.status==='coming_soon'?'fa-hammer':'fa-graduation-cap'}`} style={{ fontSize:'2.8rem', color:'rgba(255,255,255,0.18)' }} />
                  </div>
                  <span className="prog-tag" style={p.status==='coming_soon'?{background:'#6B7280'}:{}}>{p.badge}</span>
                  {p.status==='coming_soon'&&(
                    <span style={{position:'absolute',bottom:'10px',left:'10px',background:'#FEF9C3',color:'#92400E',fontSize:'0.68rem',fontWeight:700,padding:'2px 9px',borderRadius:'999px',border:'1px solid #FDE68A'}}>🚧 Under Development</span>
                  )}
                </div>
                <div className="prog-body">
                  <span className="prog-range">{p.range}</span>
                  <h3>{p.badge} Programme</h3>
                  <p>{p.status==='coming_soon'?'Coming soon — Senior Secondary (Classes 11 & 12) is actively being built. Register your interest today!':p.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ENQUIRY */}
      <EnquiryForm />

      {/* CAMPUS */}
      <section className="campus-section section" aria-labelledby="campus-heading">
        <div className="campus-inner">
          <div className="reveal">
            <div className="eyebrow">Our Locations</div>
            <h2 id="campus-heading" className="section-title">Two Campuses, One Vision</h2>
            <p className="section-sub">Harish Chandra Pur (Pin 732125) and Kashim Pur, near NH-31 — both equipped with modern classrooms and a safe, welcoming environment.</p>
          </div>
          <div className="campus-grid">
            {CAMPUSES.map((c, i) => (
              <Link to={c.link} className="campus-card reveal" key={i}>
                <div className="campus-img">
                  {c.img
                    ? <img src={c.img} alt={c.name} loading="lazy" />
                    : <div className="campus-placeholder" aria-hidden="true"><i className="fa-solid fa-location-dot" style={{ fontSize:'2.5rem', color:'rgba(255,255,255,0.12)' }} /></div>
                  }
                </div>
                <div className="campus-body">
                  <span className={`campus-tag ${c.tag === 'Open Now' ? 'open' : 'soon'}`}>{c.tag}</span>
                  <h3>{c.name}</h3>
                  <p>{c.address}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section className="events-section section" aria-labelledby="events-heading">
        <div className="events-inner">
          <div className="reveal">
            <div className="eyebrow">School Life</div>
            <h2 id="events-heading" className="section-title">Upcoming Events &amp; Activities</h2>
            <p className="section-sub">Learning at RSA goes beyond the classroom — we celebrate curiosity, talent, and teamwork throughout the year.</p>
          </div>
          <div className="events-grid">
            {EVENTS.map((e, i) => (
              <article className="event-card reveal" key={i}>
                <div className="event-header" style={{ background: e.bg }} aria-hidden="true" />
                <div className="event-body">
                  <div className="event-date"><i className="fa-regular fa-calendar" aria-hidden="true" />{e.date}</div>
                  <h3>{e.title}</h3>
                  <p>{e.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ADMISSIONS BANNER */}
      <div className="admission-banner">
        <div className="admission-inner">
          <div className="admission-text reveal-left">
            <h2>Admissions &amp; Joining Now Open</h2>
            <p>Apply today for 2026–27. Limited seats available across all programs.</p>
          </div>
          <div className="admission-btns reveal-right">
            <Link to="/apply"   className="btn btn-primary btn-lg">Apply Now</Link>
            <Link to="/contact" className="btn btn-outline btn-lg">Contact Us</Link>
          </div>
        </div>
      </div>

      {/* TRANSPORT */}
      <section className="transport-section" aria-labelledby="transport-heading">
        <div className="transport-inner">
          <div className="reveal-left">
            <div className="eyebrow">Transport</div>
            <h2 id="transport-heading" className="section-title">Safe, Reliable School Transport</h2>
            <p className="transport-text">GPS-tracked buses covering all major routes. Trained drivers, a dedicated attendant on every vehicle, and real-time WhatsApp updates for parents — every single day.</p>
            <Link to="/transport" className="btn btn-navy">Learn More</Link>
          </div>
          <div className="transport-img reveal-right">
            <img src="/assets/transport.jpg" alt="School transport van" loading="lazy" />
          </div>
        </div>
      </section>
    </>
  );
}
