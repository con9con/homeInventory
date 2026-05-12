import { useState } from 'react';
import { useAppAuth } from '../context/AuthContext';

export default function AuthForm() {
  const { signIn } = useAppAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      signIn(data.token);
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-5xl">🏠</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Inventory+</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
              {mode === 'register' && (
                <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
              )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={switchMode} className="text-blue-600 hover:underline font-medium">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
