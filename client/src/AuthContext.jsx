import { createContext, useContext, useEffect, useState } from 'react';
import api from './api.js';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('hotelproUser') || 'null'); } catch { return null; } });
  const [checking, setChecking] = useState(Boolean(localStorage.getItem('hotelproToken')));
  function establishSession(payload) { localStorage.setItem('hotelproToken', payload.token); localStorage.setItem('hotelproUser', JSON.stringify(payload.user)); setUser(payload.user); }
  async function login(credentials) { const { data } = await api.post('/api/users/login', credentials); establishSession(data); return data.user; }
  async function register(details) { const { data } = await api.post('/api/users/register', details); establishSession(data); return data.user; }
  function logout() { localStorage.removeItem('hotelproToken'); localStorage.removeItem('hotelproUser'); setUser(null); }
  useEffect(() => {
    if (!localStorage.getItem('hotelproToken')) return;
    api.get('/api/users/me').then(({ data }) => { localStorage.setItem('hotelproUser', JSON.stringify(data)); setUser(data); }).catch(() => { localStorage.removeItem('hotelproToken'); localStorage.removeItem('hotelproUser'); setUser(null); }).finally(() => setChecking(false));
  }, []);
  return <AuthContext.Provider value={{ user, checking, login, register, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
