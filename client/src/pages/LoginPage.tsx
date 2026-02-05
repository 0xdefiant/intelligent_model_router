import { useState } from 'react';
import { api } from '../api/client';
import { Lock, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onAuthenticated: () => void;
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await api.authenticate(password);
      if (result.authenticated) {
        sessionStorage.setItem('ramp_auth', 'true');
        onAuthenticated();
      }
    } catch {
      setError('Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ramp-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-ramp-gray-900 tracking-tight">
            <span className="text-ramp-green">Ramp</span> Intelligence
          </h1>
          <p className="text-sm text-ramp-gray-500 mt-2">Multi-Model Expense Intelligence System</p>
        </div>

        <div className="bg-white rounded-ramp shadow-ramp-lg border border-ramp-gray-200 p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-ramp-green/10 flex items-center justify-center">
              <Lock size={22} className="text-ramp-green" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ramp-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                className="w-full border border-ramp-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-ramp-green focus:border-transparent placeholder:text-ramp-gray-400"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full flex items-center justify-center gap-2 bg-ramp-green text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-ramp-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  Enter
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ramp-gray-400 mt-6">
          Powered by Anthropic, OpenAI, Groq & Cerebras
        </p>
      </div>
    </div>
  );
}
