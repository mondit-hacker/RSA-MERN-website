import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, getUser, setUser, setToken, clearAuth } from '../utils/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      authAPI.me()
        .then(d => { setUserState(d.data.user); setUser(d.data.user); })
        .catch(() => { clearAuth(); setUserState(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await authAPI.login(email, password);
    setToken(d.data.accessToken);
    setUser(d.data.user);
    setUserState(d.data.user);
    return d.data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch (_) {}
    clearAuth();
    setUserState(null);
    window.location.href = '/login';
  }, []);

  const getPanelRoute = (role) => ({
    student:'/panel/student', teacher:'/panel/teacher', hr:'/panel/hr',
    manager:'/panel/manager', admin:'/panel/admin',     developer:'/panel/developer',
  }[role] || '/');

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getPanelRoute }}>
      {children}
    </AuthContext.Provider>
  );
}
