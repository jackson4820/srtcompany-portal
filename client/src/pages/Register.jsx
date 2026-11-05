import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/axiosClient';
import Seo from '../components/Seo';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const input = 'w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-600';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setBusy(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) { setError(errMsg(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto my-12 w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
      <Seo title="Create Account | S.R.T. Company" description="Create your S.R.T. Company account." noindex />
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Create Account</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <input required placeholder="Full name" autoComplete="name" value={form.name} onChange={set('name')} className={input} />
        <input type="email" required placeholder="Email" autoComplete="email" value={form.email} onChange={set('email')} className={input} />
        <input type="password" required minLength={8} placeholder="Password (min 8 characters)" autoComplete="new-password" value={form.password} onChange={set('password')} className={input} />
        <input type="password" required placeholder="Confirm password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} className={input} />
        <button disabled={busy} className="w-full rounded-lg bg-blue-700 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
          {busy ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account? <Link to="/login" className="font-semibold text-blue-700">Login</Link>
      </p>
    </div>
  );
}
