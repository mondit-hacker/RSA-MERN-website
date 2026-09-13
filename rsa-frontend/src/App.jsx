import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import Navbar  from './components/Navbar';
import Footer  from './components/Footer';
import NotFound from './pages/NotFound';
import Guard from './core/gate/Guard';

// ── Public pages (lazy) ──────────────────────────────────────────
const Home      = lazy(() => import('./pages/Home'));
const About     = lazy(() => import('./pages/About'));
const Login     = lazy(() => import('./pages/Login'));
const CampusMap = lazy(() => import('./pages/CampusMap'));
const WhyUs     = lazy(() => import('./pages/OtherPages').then(m=>({default:m.WhyUs})));
const Programs  = lazy(() => import('./pages/OtherPages').then(m=>({default:m.Programs})));
const Fee       = lazy(() => import('./pages/OtherPages').then(m=>({default:m.Fee})));
const Contact   = lazy(() => import('./pages/OtherPages').then(m=>({default:m.Contact})));
const Apply     = lazy(() => import('./pages/OtherPages').then(m=>({default:m.Apply})));
const Transport = lazy(() => import('./pages/OtherPages').then(m=>({default:m.Transport})));
const LegalPage = lazy(() => import('./pages/Legal').then(m=>({default:m.LegalPage})));

// ── Workspace views (obfuscated names, single chunk in build) ────
const V1 = lazy(() => import('./views/v1')); // admin
const V2 = lazy(() => import('./views/v2')); // student
const V3 = lazy(() => import('./views/v3')); // teacher
const V4 = lazy(() => import('./views/v4')); // hr
const V5 = lazy(() => import('./views/v5')); // manager
const V6 = lazy(() => import('./views/v6')); // developer

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!pathname.startsWith('/workspace')) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function Loader() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'14px', background:'#F1F5F9' }}>
      <div style={{ width:'38px', height:'38px', border:'3px solid #E2E8F0', borderTopColor:'#C9A84C', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <p style={{ fontFamily:'Inter,sans-serif', fontSize:'.87rem', color:'#64748B' }}>Loading…</p>
    </div>
  );
}

function Site({ children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <Navbar/><main id="main" style={{ flex:1 }}>{children}</main><Footer/>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loader/>}>
      <ScrollTop/>
      <Routes>
        {/* ── Public website ── */}
        <Route path="/"             element={<Site><Home/></Site>}/>
        <Route path="/about"        element={<Site><About/></Site>}/>
        <Route path="/why-us"       element={<Site><WhyUs/></Site>}/>
        <Route path="/programs"     element={<Site><Programs/></Site>}/>
        <Route path="/fee"          element={<Site><Fee/></Site>}/>
        <Route path="/contact"      element={<Site><Contact/></Site>}/>
        <Route path="/apply"        element={<Site><Apply/></Site>}/>
        <Route path="/transport"    element={<Site><Transport/></Site>}/>
        <Route path="/campus"       element={<Site><CampusMap/></Site>}/>
        <Route path="/campus/:id"   element={<Site><CampusMap/></Site>}/>
        <Route path="/login"        element={<Site><Login/></Site>}/>
        <Route path="/privacy"      element={<Site><LegalPage/></Site>}/>
        <Route path="/terms"        element={<Site><LegalPage/></Site>}/>
        <Route path="/refund"       element={<Site><LegalPage/></Site>}/>
        <Route path="/cancellation" element={<Site><LegalPage/></Site>}/>

        {/* ── Workspace (panels) — obfuscated URLs, no Navbar/Footer ── */}
        <Route path="/workspace/ctl"         element={<Guard allow={['admin','developer']}><V1/></Guard>}/>
        <Route path="/workspace/ctl/*"       element={<Guard allow={['admin','developer']}><V1/></Guard>}/>
        <Route path="/workspace/hub"         element={<Guard allow={['student']}><V2/></Guard>}/>
        <Route path="/workspace/hub/*"       element={<Guard allow={['student']}><V2/></Guard>}/>
        <Route path="/workspace/edu"         element={<Guard allow={['teacher']}><V3/></Guard>}/>
        <Route path="/workspace/edu/*"       element={<Guard allow={['teacher']}><V3/></Guard>}/>
        <Route path="/workspace/ppl"         element={<Guard allow={['hr','admin','developer']}><V4/></Guard>}/>
        <Route path="/workspace/ppl/*"       element={<Guard allow={['hr','admin','developer']}><V4/></Guard>}/>
        <Route path="/workspace/ops"         element={<Guard allow={['manager','admin','developer']}><V5/></Guard>}/>
        <Route path="/workspace/ops/*"       element={<Guard allow={['manager','admin','developer']}><V5/></Guard>}/>
        <Route path="/workspace/sys"         element={<Guard allow={['developer']}><V6/></Guard>}/>
        <Route path="/workspace/sys/*"       element={<Guard allow={['developer']}><V6/></Guard>}/>

        <Route path="*" element={<Site><NotFound/></Site>}/>
      </Routes>
    </Suspense>
  );
}
