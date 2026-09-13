import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useSession } from '../core/store/session';
import './Login.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const sanitise = (s) => String(s).replace(/<[^>]*>/g,'').trim();

export default function Login() {
  const { login, getDashboardRoute } = useSession();
  const navigate = useNavigate();
  const [mode, setMode]     = useState('login');
  const [form, setForm]     = useState({ email:'', password:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess]   = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  const onChange = useCallback((ev) => {
    const { name, value } = ev.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
  }, []);

  async function handleLogin(ev) {
    ev.preventDefault();
    const errs = {};
    if (!form.email)              errs.email    = 'Email is required.';
    else if (!EMAIL_RE.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password)           errs.password = 'Password is required.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await login(sanitise(form.email), form.password);
      navigate(getDashboardRoute(user.role), { replace: true });
    } catch(ex) {
      setErrors({ email: ex.message || 'Invalid credentials.' });
    } finally { setLoading(false); }
  }

  async function handleForgot(ev) {
    ev.preventDefault();
    if (!EMAIL_RE.test(forgotEmail)) { setErrors({ forgot:'Enter a valid email.' }); return; }
    setLoading(true);
    try {
      const res = await fetch('/x-api/auth/forgot-password', {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: sanitise(forgotEmail) }),
      });
      const d = await res.json();
      setSuccess(d.message || 'Reset link sent if email is registered.');
    } catch { setSuccess('If that email is registered, a reset link has been sent.'); }
    finally { setLoading(false); }
  }

  function switchMode(m) { setMode(m); setErrors({}); setSuccess(''); }

  return (
    <>
      <SEO title="Login" description="Sign in to your Rise & Shine Academy portal." />
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <img src="/assets/logo.png" alt="Rise & Shine Academy"/>
            <div className="login-logo-text">
              <span className="login-school-name">Rise &amp; Shine Academy</span>
              <span className="login-school-tag">Staff &amp; Student Portal</span>
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="login-tabs">
              <button className={`login-tab ${mode==='login'?'active':''}`} onClick={()=>switchMode('login')}>Sign In</button>
              <button className={`login-tab ${mode==='register'?'active':''}`} onClick={()=>switchMode('register')}>New Here?</button>
            </div>
          )}

          {success && <div className="login-success"><i className="fa-solid fa-circle-check"/>{success}</div>}

          {mode==='login' && !success && (
            <form className="login-form" onSubmit={handleLogin} noValidate>
              <p className="login-sub">Sign in to access your workspace.</p>
              <div className="lfield">
                <label htmlFor="l-email">Email Address</label>
                <div className="input-wrap">
                  <i className="fa-solid fa-envelope lfield-icon"/>
                  <input id="l-email" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={onChange} autoComplete="email" className={errors.email?'input-error':''} maxLength={120}/>
                </div>
                {errors.email && <span className="lerr" role="alert">{errors.email}</span>}
              </div>
              <div className="lfield">
                <div className="lfield-row">
                  <label htmlFor="l-pass">Password</label>
                  <button type="button" className="forgot-link" onClick={()=>switchMode('forgot')}>Forgot password?</button>
                </div>
                <div className="input-wrap">
                  <i className="fa-solid fa-lock lfield-icon"/>
                  <input id="l-pass" name="password" type={showPass?'text':'password'} placeholder="Your password" value={form.password} onChange={onChange} autoComplete="current-password" className={errors.password?'input-error':''} maxLength={72}/>
                  <button type="button" className="pass-toggle" onClick={()=>setShowPass(s=>!s)} aria-label={showPass?'Hide':'Show password'}>
                    <i className={`fa-solid ${showPass?'fa-eye-slash':'fa-eye'}`}/>
                  </button>
                </div>
                {errors.password && <span className="lerr" role="alert">{errors.password}</span>}
              </div>
              <button type="submit" className="login-submit" disabled={loading}>
                {loading?<><span className="lspinner"/>Signing in…</>:'Sign In'}
              </button>
            </form>
          )}

          {mode==='register' && !success && (
            <div className="login-form">
              <p className="login-sub">Accounts are created by the school administration and credentials are sent to your registered email.</p>
              <div style={{background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:'10px',padding:'14px 16px',margin:'12px 0'}}>
                <p style={{fontSize:'.86rem',color:'#15803D',fontWeight:'600',display:'flex',alignItems:'center',gap:'7px'}}><i className="fa-solid fa-circle-info"/>How to get access</p>
                <ul style={{fontSize:'.83rem',color:'#166534',marginTop:'7px',paddingLeft:'18px',lineHeight:'1.85'}}>
                  <li>Students — account created on admission day</li>
                  <li>Teachers — HR creates your account</li>
                  <li>Staff — contact the admin office</li>
                </ul>
              </div>
              <a href="/contact" className="login-submit" style={{textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginTop:'8px'}}><i className="fa-solid fa-phone"/>Contact Admissions</a>
            </div>
          )}

          {mode==='forgot' && !success && (
            <form className="login-form" onSubmit={handleForgot} noValidate>
              <button type="button" className="back-btn" onClick={()=>switchMode('login')}><i className="fa-solid fa-arrow-left"/>Back to Sign In</button>
              <h3 className="forgot-title">Reset Password</h3>
              <p className="login-sub">Enter your email to receive a reset link.</p>
              <div className="lfield">
                <label htmlFor="f-email">Email Address</label>
                <div className="input-wrap">
                  <i className="fa-solid fa-envelope lfield-icon"/>
                  <input id="f-email" type="email" placeholder="your@email.com" value={forgotEmail} onChange={ev=>{setForgotEmail(ev.target.value);setErrors({});}} autoComplete="email" className={errors.forgot?'input-error':''} maxLength={120}/>
                </div>
                {errors.forgot && <span className="lerr" role="alert">{errors.forgot}</span>}
              </div>
              <button type="submit" className="login-submit" disabled={loading}>
                {loading?<><span className="lspinner"/>Sending…</>:'Send Reset Link'}
              </button>
            </form>
          )}

          {!success && mode==='login' && (
            <p className="login-footer-note">Don't have an account? <button className="switch-link" onClick={()=>switchMode('register')}>Learn how</button></p>
          )}
        </div>
      </div>
    </>
  );
}
