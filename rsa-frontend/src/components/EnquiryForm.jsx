import { useState, useCallback } from 'react';
import './EnquiryForm.css';

function sanitise(str) { return String(str).replace(/<[^>]*>/g, '').trim(); }

const PHONE_RE = /^[+]?[\d\s\-().]{7,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(form) {
  const errors = {};
  if (!sanitise(form.name))            errors.name  = 'Full name is required.';
  if (!sanitise(form.phone))           errors.phone = 'Phone number is required.';
  else if (!PHONE_RE.test(form.phone)) errors.phone = 'Enter a valid phone number.';
  if (form.email && !EMAIL_RE.test(form.email)) errors.email = 'Enter a valid email address.';
  return errors;
}

const INITIAL = { name: '', phone: '', email: '', classInterest: '', campus: '' };

export default function EnquiryForm() {
  const [form,    setForm]    = useState(INITIAL);
  const [errors,  setErrors]  = useState({});
  const [toast,   setToast]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg,  setErrMsg]  = useState('');

  const handleChange = useCallback((ev) => {
    const { name, value } = ev.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setErrMsg('');
  }, []);

  async function handleSubmit(ev) {
    ev.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrMsg('');
    try {
      // POST to backend via Vite proxy (/x-api → http://localhost:5000/api)
      const res = await fetch('/x-api/enquiry', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:          sanitise(form.name),
          phone:         sanitise(form.phone),
          email:         sanitise(form.email),
          classInterest: form.classInterest,
          campus:        form.campus,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrMsg(data.message || 'Submission failed. Please try again.');
        setLoading(false);
        return;
      }
      setForm(INITIAL);
      setErrors({});
      setToast(true);
      setTimeout(() => setToast(false), 5000);
    } catch (_) {
      setErrMsg('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="enquiry-section" id="enquiry" aria-label="Enquiry Form">
        <div className="enquiry-inner">
          <div className="enquiry-left reveal-left">
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>Get in Touch</div>
            <h2>Begin Your Child's Journey With Us</h2>
            <p>Fill in your details and our admissions team will reach out within 24 hours to guide you through every step.</p>
            <ul className="enquiry-perks" aria-label="Enquiry benefits">
              {[
                { icon: 'fa-check',  text: 'Free counselling session' },
                { icon: 'fa-gift',   text: 'Welcome kit on enrolment' },
                { icon: 'fa-phone',  text: 'Response within 24 hours' },
                { icon: 'fa-school', text: 'Campus tour arranged for you' },
              ].map(p => (
                <li className="perk" key={p.text}>
                  <span className="perk-icon" aria-hidden="true"><i className={`fa-solid ${p.icon}`} /></span>
                  {p.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal-right">
            <div className="form-card">
              <h3>Enquiry Form</h3>
              <p className="sub">Tell us about your child and we'll be in touch shortly.</p>

              {errMsg && (
                <div style={{ background:'#FEE2E2', border:'1px solid #FECACA', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', color:'#B91C1C', fontSize:'0.86rem', fontWeight:600, display:'flex', alignItems:'center', gap:'8px' }}>
                  <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />{errMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate aria-label="School enquiry form">
                <div className="form-row2">
                  <div className="field">
                    <label htmlFor="eq-name">Full Name <span aria-hidden="true">*</span></label>
                    <input id="eq-name" name="name" type="text" placeholder="Parent / Guardian name"
                      value={form.name} onChange={handleChange} autoComplete="name"
                      aria-required="true" aria-invalid={!!errors.name}
                      className={errors.name ? 'input-error' : ''} maxLength={80} />
                    {errors.name && <span className="field-error" role="alert">{errors.name}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="eq-phone">Mobile Number <span aria-hidden="true">*</span></label>
                    <input id="eq-phone" name="phone" type="tel" placeholder="+91 00000 00000"
                      value={form.phone} onChange={handleChange} autoComplete="tel"
                      aria-required="true" aria-invalid={!!errors.phone}
                      className={errors.phone ? 'input-error' : ''} maxLength={16} />
                    {errors.phone && <span className="field-error" role="alert">{errors.phone}</span>}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="eq-email">Email Address</label>
                  <input id="eq-email" name="email" type="email" placeholder="your@email.com"
                    value={form.email} onChange={handleChange} autoComplete="email"
                    aria-invalid={!!errors.email}
                    className={errors.email ? 'input-error' : ''} maxLength={120} />
                  {errors.email && <span className="field-error" role="alert">{errors.email}</span>}
                </div>

                <div className="form-row2">
                  <div className="field">
                    <label htmlFor="eq-class">Class Interested In</label>
                    <select id="eq-class" name="classInterest" value={form.classInterest} onChange={handleChange}>
                      <option value="">Select class</option>
                      <option value="nursery">Nursery / KG (eKidz)</option>
                      <option value="1-5">Class 1–5 (eChamps)</option>
                      <option value="6-10">Class 6–10 (eTechno)</option>
                      <option value="11-12">Class 11–12 (Coming Soon)</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="eq-campus">Preferred Campus</label>
                    <select id="eq-campus" name="campus" value={form.campus} onChange={handleChange}>
                      <option value="">Select campus</option>
                      <option value="hcpur">Harish Chandra Pur</option>
                      <option value="kashimpur">Kashim Pur</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading} aria-busy={loading}>
                  {loading
                    ? <><span className="btn-spinner" aria-hidden="true" />Submitting…</>
                    : 'Submit Enquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
        <i className="fa-solid fa-circle-check" aria-hidden="true" />
        Enquiry submitted — we'll call you within 24 hours!
      </div>
    </>
  );
}
