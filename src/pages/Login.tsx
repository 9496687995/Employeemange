import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-blue-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Task Manager</h2>
          <p className="mt-2 text-sm text-slate-300">
            Sign in to your account
          </p>
        </div>
        
        <div className="bg-slate-800/90 backdrop-blur-sm py-8 px-4 shadow-xl rounded-xl border border-slate-700/50 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700/70 backdrop-blur-sm text-white placeholder-slate-400"
                placeholder="admin@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700/70 backdrop-blur-sm text-white placeholder-slate-400"
                  placeholder="admin123"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-300" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-300">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-600/50 pt-6">
            <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/50 rounded-lg p-4">
              <p className="text-sm text-blue-300 font-medium mb-2">Getting Started:</p>
              <p className="text-sm text-blue-200">
                Create an account by clicking the 'Sign up' link above. Choose your role (Admin or Employee) during registration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;