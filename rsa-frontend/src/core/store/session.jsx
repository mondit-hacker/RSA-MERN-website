/**
 * core/store/session.jsx
 * Auth context — stores user session, exposes login/logout.
 * Deliberately named "session" not "auth" to avoid obvious naming.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, getUser, storeUser, storeToken, wipeSession } from '../net/client';

const SessionCtx = createContext(null);
export const useSession = () => useContext(SessionCtx);

// Role → internal route mapping (obfuscated URLs)
const ROLE_ROUTES = {
  admin:     '/workspace/ctl',
  student:   '/workspace/hub',
  teacher:   '/workspace/edu',
  hr:        '/workspace/ppl',
  manager:   '/workspace/ops',
  developer: '/workspace/sys',
};

export function SessionProvider({ children }) {
  const [user,    setUser]    = useState(() => getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      authService.me()
        .then(d  => { setUser(d.data.user); storeUser(d.data.user); })
        .catch(() => { wipeSession(); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await authService.login(email, password);
    storeToken(d.data.accessToken);
    storeUser(d.data.user);
    setUser(d.data.user);
    return d.data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch (_) {}
    wipeSession();
    setUser(null);
    window.location.replace('/login');
  }, []);

  const getDashboardRoute = (role) => ROLE_ROUTES[role] || '/';

  return (
    <SessionCtx.Provider value={{ user, loading, login, logout, getDashboardRoute, ROLE_ROUTES }}>
      {children}
    </SessionCtx.Provider>
  );
}
