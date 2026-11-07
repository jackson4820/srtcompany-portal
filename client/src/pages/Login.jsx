import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errMsg } from "../api/axiosClient";
import Seo from "../components/Seo";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto my-12 w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
      <Seo
        title="Login | S.R. Trading Company"
        description="Log in to your S.R. Trading Company account."
        noindex
      />
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Login</h1>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <form onSubmit={submit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-600"
        />
        <input
          type="password"
          required
          placeholder="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-600"
        />
        <button
          disabled={busy}
          className="w-full rounded-lg bg-blue-700 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {busy ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        New here?{" "}
        <Link to="/register" className="font-semibold text-blue-700">
          Create an account
        </Link>
      </p>
    </div>
  );
}
