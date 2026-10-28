import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { user, login, register } = useAuth();
  const navigate = useNavigate(); const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace/>;
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      if (isRegister) await register(form); else await login({ email: form.email, password: form.password });
      navigate(location.state?.from || '/', { replace: true });
    } catch (failure) { setError(failure.response?.data?.message || 'We couldn’t complete that request. Please try again.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><div className="auth-visual"><div className="auth-visual-wash"/><div className="auth-visual-copy"><span className="eyebrow hero-eyebrow">A PLACE TO COME BACK TO</span><h1>Every stay<br/>has a <em>story.</em></h1><p>Sign in to keep your plans close, or continue as a guest whenever you like.</p></div><span className="auth-visual-caption">A MORE CONSIDERED WAY TO STAY</span></div><section className="auth-form-wrap"><div className="auth-form-box"><Link to="/" className="auth-back">← &nbsp; BACK TO HOTELPRO</Link><span className="eyebrow">{isRegister ? 'YOUR NEXT CHAPTER STARTS HERE' : 'WELCOME BACK'}</span><h2>{isRegister ? 'Create your account.' : 'Good to see you.'}</h2><p className="auth-subtitle">{isRegister ? 'Save your stays and make every booking feel effortless.' : 'Sign in to see your stays and pick up where you left off.'}</p>
      {error && <div className="auth-error" role="alert">{error}</div>}
      <form onSubmit={submit} className="auth-form">{isRegister && <><label className="form-field">FULL NAME<input autoComplete="name" required maxLength="80" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name"/></label><label className="form-field">PHONE <span className="optional-label">OPTIONAL</span><input autoComplete="tel" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Your phone number"/></label></>}<label className="form-field">EMAIL ADDRESS<input autoComplete="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com"/></label><label className="form-field">PASSWORD<input autoComplete={isRegister ? 'new-password' : 'current-password'} type="password" required minLength={isRegister ? 8 : undefined} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={isRegister ? 'At least 8 characters' : 'Your password'}/></label><button className="button button-dark auth-submit" disabled={busy}>{busy ? 'One moment…' : isRegister ? 'Create account' : 'Sign in'} <span>↗</span></button></form>
      <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to HotelPro?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p><div className="auth-guest"><span>✳</span><p>Prefer to keep it simple?</p><Link to="/">Continue browsing and book as a guest ↗</Link></div>
    </div></section></main>;
}
