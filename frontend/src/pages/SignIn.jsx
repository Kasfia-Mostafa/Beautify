import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-[140px] pb-20">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-[0_10px_50px_rgba(244,215,212,0.3)] dark:shadow-none border border-rose-100 dark:border-zinc-800">
        <div className="text-center mb-8">
          <h1 className="font-headline-sm text-3xl text-zinc-900 dark:text-rose-100 mb-2">Welcome Back</h1>
          <p className="font-body-sm text-zinc-500">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-2 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-5 py-4 bg-rose-50/30 dark:bg-zinc-800/50 border border-rose-100/50 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-zinc-900 dark:text-rose-100"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500">Password</label>
              <Link to="#" className="text-[10px] font-label-caps tracking-widest uppercase text-rose-600 hover:text-rose-700 transition-colors">Forgot?</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-5 py-4 bg-rose-50/30 dark:bg-zinc-800/50 border border-rose-100/50 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-zinc-900 dark:text-rose-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-zinc-900 dark:bg-rose-100 text-rose-50 dark:text-zinc-900 rounded-2xl font-label-caps text-xs tracking-widest uppercase hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-rose-100 dark:border-zinc-800 text-center">
          <p className="font-body-sm text-zinc-500">
            Don't have an account? <Link to="/signup" className="text-rose-600 font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
