'use client';

import { useState } from 'react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
      } else {
        setSuccess(data.message);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 via-pink-500 to-orange-500">
      {/* Register Card */}
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
          <p className="text-gray-500 text-sm mt-2">Create your account</p>
        </div>

        {success ? (
          /* Success state */
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm text-left">
              {success}
            </div>
            <p className="text-gray-500 text-xs">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setSuccess('')}
                className="underline text-gray-600 hover:text-gray-800"
              >
                try again
              </button>
              .
            </p>
            <a href="/login" className="inline-block text-gray-600 hover:text-gray-800 text-sm underline">
              Back to Sign In
            </a>
          </div>
        ) : (
          /* Registration form */
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First + Last Name */}
              <div className="flex gap-3">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                  className="w-1/2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  required
                  className="w-1/2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              {/* Email */}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                autoComplete="email"
                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />

              {/* Password */}
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (min. 8 characters)"
                required
                autoComplete="new-password"
                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />

              {/* Confirm Password */}
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                autoComplete="new-password"
                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
              />

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full max-w-[200px] mx-auto block bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200 uppercase tracking-wider text-sm"
                >
                  {loading ? 'Creating Account…' : 'Sign Up'}
                </button>
              </div>
            </form>

            {/* Footer Links */}
            <div className="text-center mt-6">
              <span className="text-gray-600 text-sm">Already have an account?</span>
              <span className="text-gray-400 mx-2">|</span>
              <a href="/login" className="text-gray-600 hover:text-gray-800 text-sm">
                Sign In
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
