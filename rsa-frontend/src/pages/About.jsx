import SEO from '../components/SEO';
import EnquiryForm from '../components/EnquiryForm';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './PageCommon.css';

const VALUES = [
  { icon:'fa-star',      title:'Excellence',  desc:"High academic standards while celebrating every child's individual progress and growth." },
  { icon:'fa-handshake', title:'Integrity',   desc:'Honesty, respect, and responsibility are the cornerstones of our school culture.' },
  { icon:'fa-users',     title:'Inclusivity', desc:'Every student belongs here — regardless of background, ability, or learning style.' },
  { icon:'fa-lightbulb', title:'Innovation',  desc:'We embrace new methods and technology to make learning engaging and effective.' },
];

export default function About() {
  useScrollReveal();
  return (
    <>
      <SEO title="About Us" description="Learn about Rise & Shine Academy — our mission, vision, values and the team behind the school in Malda, WB." />
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow" style={{ color:'var(--gold)' }}>Our Story</div>
          <h1>About <span>Rise &amp; Shine Academy</span></h1>
          <p>Dedicated to excellence in education — empowering every student to reach their full potential since our founding.</p>
        </div>
      </div>
      <section className="page-section">
        <div className="about-grid">
          <div className="reveal-left">
            <div className="gold-line" />
            <div className="eyebrow">Our Mission</div>
            <h2 className="section-title">Nurturing Tomorrow's Leaders</h2>
            <p className="page-text">Rise &amp; Shine Academy was founded with a single, powerful belief: every child deserves an education that ignites curiosity, builds confidence, and prepares them for the real world.</p>
            <p className="page-text">Our holistic approach integrates modern curriculum, experienced educators, and co-curricular activities to ensure that every student — from Nursery to Class 12 — grows into a well-rounded, capable individual.</p>
          </div>
          <div className="about-img-box reveal-right">
            <img src="/assets/H.Cpur.png" alt="Rise & Shine Academy main campus" loading="lazy" />
          </div>
        </div>
        <div className="reveal">
          <div className="eyebrow">Core Values</div>
          <h2 className="section-title">What We Stand For</h2>
        </div>
        <div className="values-grid" style={{ marginTop:'28px' }}>
          {VALUES.map((v,i) => (
            <div className="value-card reveal" key={i}>
              <div className="value-icon" aria-hidden="true"><i className={`fa-solid ${v.icon}`} /></div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <EnquiryForm />
    </>
  );
}
