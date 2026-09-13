/**
 * core/gate/Guard.jsx
 * Route guard — checks session validity and role permissions.
 * Named "Guard" not "ProtectedRoute" to avoid obvious naming.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../store/session';

export default function Guard({ children, allow }) {
  const { user, loading } = useSession();
  const location = useLocation();

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0B1F3A', flexDirection:'column', gap:'16px' }}>
      <div style={{ width:'44px', height:'44px', border:'3px solid rgba(201,168,76,0.25)', borderTopColor:'#C9A84C', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:'rgba(255,255,255,0.35)', fontFamily:'Inter,sans-serif', fontSize:'0.82rem', letterSpacing:'0.08em' }}>LOADING</p>
    </div>
  );

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allow && !allow.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
