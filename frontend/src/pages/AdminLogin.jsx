import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { acceptAuth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const passedError = location.state?.error;

  async function submit(e) {
    if (e) e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.user?.role !== 'admin') {
        logout();
        setError('Access denied: This account does not have administrator privileges.');
        return;
      }
      acceptAuth(data);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid administrator credentials.');
    } finally {
      setBusy(false);
    }
  }

  const fillDemoAdmin = () => {
    setForm({ email: 'admin@example.com', password: 'admin123' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090f] px-4 py-12 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12121c] p-8 shadow-2xl">
        <div className="flex flex-col items-center justify-center">
          <Logo to={null} size="lg" isAdmin={true} />
          <p className="mt-3 text-xs text-slate-400 text-center">
            Secure administrative control panel. Authorized personnel only.
          </p>
        </div>

        {(passedError || error) && (
          <div className="mt-5 rounded-xl border border-red-800/80 bg-red-950/60 p-3.5 text-xs text-red-200">
            {error || passedError}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Admin Email
            </label>
            <div className="relative mt-1.5">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                required
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                required
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-bold text-white transition hover:bg-rose-500 disabled:opacity-60"
          >
            {busy ? 'Verifying access…' : 'Enter Admin Portal'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-4 text-center">
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="text-xs text-slate-400 hover:text-rose-300 transition underline decoration-dotted"
          >
            Fill Demo Admin Credentials (admin@example.com)
          </button>
        </div>
      </div>
    </div>
  );
}
