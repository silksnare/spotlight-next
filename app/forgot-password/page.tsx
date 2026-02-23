'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 via-pink-500 to-orange-500">
      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light tracking-wide">
            <span className="text-gray-800">sp</span>
            <span className="relative inline-block">
              <span className="text-yellow-400">o</span>
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </span>
            <span className="text-gray-800">tlight</span>
          </h1>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Forgot Your Password?</h2>

        {success ? (
          /* Success state */
          <div className="text-center space-y-4 mt-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm text-left">
              If an account with that email exists, a password reset link has been sent. Please check your inbox.
            </div>
            <p className="text-gray-400 text-xs">
              The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
            </p>
            <a href="/login" className="inline-block text-gray-600 hover:text-gray-800 text-sm underline">
              Back to Sign In
            </a>
          </div>
        ) : (
          /* Form */
          <>
            <p className="text-gray-500 text-sm text-center mb-6 mt-2">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                autoComplete="email"
                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full max-w-[200px] mx-auto block bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200 uppercase tracking-wider text-sm"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </div>
            </form>

            <div className="text-center mt-6">
              <a href="/login" className="text-gray-600 hover:text-gray-800 text-sm">
                Back to Sign In
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
