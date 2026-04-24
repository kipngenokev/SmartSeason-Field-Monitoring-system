import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, Loader2, CheckCircle2, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: BarChart3,    text: 'Real-time field health monitoring' },
  { icon: CheckCircle2, text: 'Agent assignment and tracking' },
  { icon: Shield,       text: 'Secure role-based access control' },
];

const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-500/15';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'Agent' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setError('');
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setForm({ name: '', email: '', password: '', confirm: '', role: 'Agent' });
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (form.password !== form.confirm) {
        setError('Passwords do not match.');
        return;
      }
      if (form.password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name.trim(), email: form.email, password: form.password, role: form.role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.errors?.length ? json.errors[0] : json.message || 'Something went wrong.';
        throw new Error(msg);
      }
      login(json.data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="flex min-h-screen">

      {/* ── Left panel ─────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:w-[52%] lg:flex-col">

        {/* Glow blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-emerald-400/8 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/8 blur-2xl" />
        </div>

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative flex flex-1 flex-col justify-between p-12">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-900/40">
              <Leaf className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SmartSeason</span>
          </div>

          {/* Hero text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">Agricultural Intelligence Platform</span>
              </div>

              <h1 className="text-balance text-4xl font-black leading-tight tracking-tight text-white lg:text-5xl">
                Smarter Fields,<br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Better Seasons.
                </span>
              </h1>

              <p className="max-w-sm text-base leading-relaxed text-slate-400">
                Monitor field health, manage agents, and stay on top of every growing season — all from one dashboard.
              </p>
            </div>

            <ul className="space-y-3">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                    <Icon className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} />
                  </div>
                  <span className="text-sm text-slate-300">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Fields Tracked', value: '500+' },
              { label: 'Active Agents',  value: '120+' },
              { label: 'Uptime',         value: '99.9%' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-sm">
                <p className="text-xl font-black text-white">{value}</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 lg:px-14">

        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-600">
            <Leaf className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-slate-900">SmartSeason</span>
        </div>

        <div className="w-full max-w-sm">

          {/* Mode toggle */}
          <div className="mb-8 flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                isLogin
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                !isLogin
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Create account
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {isLogin ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {isLogin
                ? 'Sign in to your account to continue.'
                : 'Create an agent account to access the platform.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name + Role — register only */}
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Wanjiru"
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Account type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Agent', 'Admin'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, role: r }))}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                          form.role === r
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <span className="text-base">{r === 'Agent' ? '🌱' : '🛡️'}</span>
                        <span>{r}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    {form.role === 'Admin'
                      ? 'Admins manage fields, assign agents, and view all data.'
                      : 'Agents monitor assigned fields and submit updates.'}
                  </p>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" strokeWidth={2} />
                    : <Eye className="h-4 w-4" strokeWidth={2} />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-slate-400">Minimum 8 characters.</p>
              )}
            </div>

            {/* Confirm password — register only */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label htmlFor="confirm" className="block text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={inputCls}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-green-700 hover:shadow-lg hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading
                ? (isLogin ? 'Signing in...' : 'Creating account...')
                : (isLogin ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            SmartSeason Field Monitoring &mdash; v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
