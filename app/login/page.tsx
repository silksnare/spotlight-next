'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
      } else {
        router.push('/upload');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 via-pink-500 to-orange-500">
      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light tracking-wide">
            <span className="text-gray-800">sp</span>
            <span className="relative inline-block">
              <span className="text-yellow-400">o</span>
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </span>
            <span className="text-gray-800">tlight</span>
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              autoComplete="email"
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Password Field */}
          <div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-[200px] mx-auto block bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200 uppercase tracking-wider text-sm"
            >
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-8">
          <a href="/forgot-password" className="text-gray-600 hover:text-gray-800 text-sm">
            Forgot Your Password
          </a>
          <span className="text-gray-400 mx-3">|</span>
          <a href="/register" className="text-gray-600 hover:text-gray-800 text-sm">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
