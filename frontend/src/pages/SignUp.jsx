import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-[140px] pb-20">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-[0_10px_50px_rgba(244,215,212,0.3)] dark:shadow-none border border-rose-100 dark:border-zinc-800">
        <div className="text-center mb-8">
          <h1 className="font-headline-sm text-3xl text-zinc-900 dark:text-rose-100 mb-2">Create Account</h1>
          <p className="font-body-sm text-zinc-500">Join Beautify for a radiant experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-2 ml-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Jane"
                required
                className="w-full px-5 py-4 bg-rose-50/30 dark:bg-zinc-800/50 border border-rose-100/50 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-zinc-900 dark:text-rose-100"
              />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-2 ml-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
                className="w-full px-5 py-4 bg-rose-50/30 dark:bg-zinc-800/50 border border-rose-100/50 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-zinc-900 dark:text-rose-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-2 ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              required
              className="w-full px-5 py-4 bg-rose-50/30 dark:bg-zinc-800/50 border border-rose-100/50 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-zinc-900 dark:text-rose-100"
            />
          </div>

          <div>
            <label className="block font-label-caps text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-2 ml-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
              minLength="6"
              className="w-full px-5 py-4 bg-rose-50/30 dark:bg-zinc-800/50 border border-rose-100/50 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-zinc-900 dark:text-rose-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-zinc-900 dark:bg-rose-100 text-rose-50 dark:text-zinc-900 rounded-2xl font-label-caps text-xs tracking-widest uppercase hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-rose-100 dark:border-zinc-800 text-center">
          <p className="font-body-sm text-zinc-500">
            Already have an account? <Link to="/signin" className="text-rose-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
