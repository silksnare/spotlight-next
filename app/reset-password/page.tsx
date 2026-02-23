'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...formData }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Password reset failed. Please try again.');
      } else {
        setSuccess(true);
        // Redirect to login after a short delay
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  /* Invalid / missing token */
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 via-pink-500 to-orange-500">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-gray-600">Invalid or missing reset link.</p>
          <a
            href="/forgot-password"
            className="inline-block text-gray-600 hover:text-gray-800 text-sm underline"
          >
            Request a new reset link
          </a>
        </div>
      </div>
    );
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

        <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">Set New Password</h2>

        {success ? (
          /* Success state */
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700 font-medium">Password reset successfully!</p>
            <p className="text-gray-400 text-sm">Redirecting you to Sign In…</p>
            <a
              href="/login"
              className="inline-block bg-black hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200 uppercase tracking-wider text-sm"
            >
              Sign In Now
            </a>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="New Password (min. 8 characters)"
              required
              autoComplete="new-password"
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm New Password"
              required
              autoComplete="new-password"
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
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center mt-2">
              <a href="/forgot-password" className="text-gray-500 hover:text-gray-700 text-xs underline">
                Request a new link
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 via-pink-500 to-orange-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
