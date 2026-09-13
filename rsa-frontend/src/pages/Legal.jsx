import { useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './PageCommon.css';
import './Legal.css';

const LEGAL = {
  '/privacy': {
    title:'Privacy Policy',
    seoDesc:'Privacy Policy of Rise & Shine Academy — how we collect, use, and protect your data.',
    sections:[
      { h:'Information We Collect',    b:"We collect information you provide in enquiry and admission forms including name, email, phone, and your child's academic details. We also collect basic usage analytics when you browse our website." },
      { h:'How We Use Your Information',b:'Your data is used solely for admission processing, school communications, fee notifications, and event updates. We never sell or share personal data with third parties for marketing.' },
      { h:'Data Security',             b:'We use HTTPS encryption for all data transfer and store information on secured servers. Only authorised school staff can access student and parent records.' },
      { h:'Cookies',                   b:'Our website uses essential cookies only. You may disable cookies in your browser settings; however, some features may not function correctly without them.' },
      { h:'Contact Us',                b:'For privacy-related questions, email info@riseandshineacademy.in or visit our school office during working hours.' },
    ],
  },
  '/terms': {
    title:'Terms of Service',
    seoDesc:'Terms of Service for Rise & Shine Academy website and student enrollment.',
    sections:[
      { h:'Acceptance of Terms',  b:'By accessing our website or enrolling at Rise & Shine Academy, you agree to be bound by these Terms and all applicable laws and regulations.' },
      { h:'Enrollment & Admission',b:'Admission is subject to seat availability, document submission, fee payment, and management approval. The school reserves the right to decline admission without stating reasons.' },
      { h:'Fees & Payments',       b:'All fees must be paid by specified dates. Late payments may attract a penalty. Fees once paid are non-refundable except as described in our Refund Policy.' },
      { h:'Code of Conduct',       b:"Students must maintain discipline, respect school property, and abide by the school's code of conduct. Violations may result in suspension or expulsion." },
      { h:'Website Use',           b:'Content on this website is for informational purposes only. Unauthorised reproduction or commercial use of any content is strictly prohibited.' },
    ],
  },
  '/refund': {
    title:'Refund Policy',
    seoDesc:'Refund Policy for fees paid at Rise & Shine Academy.',
    sections:[
      { h:'Admission Fee',    b:'The one-time admission fee is non-refundable once the seat has been confirmed and documents processed.' },
      { h:'Monthly Tuition',  b:'Monthly fees paid in advance are refundable on a pro-rata basis if a student withdraws before the 10th of that month. No refund applies after the 10th.' },
      { h:'Annual Charges',   b:'Annual charges such as examination fees and activity fees are non-refundable once the academic year has commenced.' },
      { h:'Transport Fee',    b:'Transport fees are refundable on a monthly pro-rata basis with a minimum 7-day written notice to the transport coordinator.' },
      { h:'Refund Process',   b:'Approved refunds will be processed within 15 working days via the original payment method. Submit a written request to the school office to initiate a refund.' },
    ],
  },
  '/cancellation': {
    title:'Cancellation Policy',
    seoDesc:'Cancellation Policy for admissions and services at Rise & Shine Academy.',
    sections:[
      { h:'Admission Cancellation',    b:"Admissions may be cancelled before the academic session starts by submitting a written request to the Principal. A cancellation fee of ₹500 applies. The remaining balance (if any) will be refunded per the Refund Policy." },
      { h:'Transport Cancellation',    b:'Transport services can be cancelled with 7 working days written notice. Cancellations after this period take effect from the following month.' },
      { h:'Activity Registration',     b:'Cancellations of registered activities must be notified 48 hours in advance. Late cancellations may not receive a refund.' },
      { h:'School-Initiated Changes',  b:'Rise & Shine Academy reserves the right to modify programs or events with due notice. Appropriate refunds will be provided for school-initiated cancellations.' },
    ],
  },
};

export function LegalPage() {
  useScrollReveal();
  const { pathname } = useLocation();
  const content = LEGAL[pathname] || LEGAL['/privacy'];
  return (
    <>
      <SEO title={content.title} description={content.seoDesc} />
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow" style={{ color:'var(--gold)' }}>Legal</div>
          <h1>{content.title}</h1>
          <p>Last updated: September 2026 &nbsp;·&nbsp; Rise &amp; Shine Academy</p>
        </div>
      </div>
      <div className="legal-section">
        <div className="legal-card reveal">
          {content.sections.map((s,i) => (
            <div className="legal-block" key={i}>
              <h3><span className="legal-num" aria-hidden="true">{i+1}</span>{s.h}</h3>
              <p>{s.b}</p>
            </div>
          ))}
          <div className="legal-contact">
            <strong>Questions?</strong>{' '}Email us at{' '}
            <a href="mailto:info@riseandshineacademy.in">riseandshineacade462@gmail.com</a>
          </div>
        </div>
      </div>
    </>
  );
}
