import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { acceptAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      acceptAuth(data); navigate(location.state?.from || '/');
    } catch (err) { setError(err.response?.data?.message || 'Unable to sign in.'); }
    finally { setBusy(false); }
  }
  return <main className="container-shell flex min-h-[70vh] items-center justify-center py-12"><form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-white/10 bg-panel p-8">
    <p className="text-sm font-bold uppercase tracking-widest text-accent">Welcome back</p><h1 className="mt-2 text-3xl font-black">Sign in</h1><p className="mt-2 text-sm text-slate-400">Sign in to manage your movie bookings.</p>
    {error && <p className="mt-5 rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>}
    <label className="mt-6 block text-sm text-slate-300">Email<input required type="email" autoComplete="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} className="field mt-2" /></label>
    <label className="mt-4 block text-sm text-slate-300">Password<input required type="password" autoComplete="current-password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} className="field mt-2" /></label>
    <button disabled={busy} className="mt-6 w-full rounded-xl bg-accent py-3 font-bold disabled:opacity-60">{busy ? 'Signing in…' : 'Sign in'}</button>
    <p className="mt-5 text-center text-sm text-slate-400">New here? <Link to="/register" className="font-semibold text-rose-300">Create an account</Link></p>
  </form></main>;
}
