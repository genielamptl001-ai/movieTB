import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('mtb_token')) { setLoading(false); return; }
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('mtb_token'))
      .finally(() => setLoading(false));
  }, []);

  const acceptAuth = (data) => {
    localStorage.setItem('mtb_token', data.token);
    setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem('mtb_token');
    setUser(null);
  };
  return <AuthContext.Provider value={{ user, loading, acceptAuth, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
