'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Status = 'loading' | 'success' | 'error' | 'no-token';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<Status>(token ? 'loading' : 'no-token');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !email) return;

    async function verify() {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email }),
        });
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      } catch {
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    }

    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 via-pink-500 to-orange-500">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-light tracking-wide">
            <span className="text-gray-800">sp</span>
            <span className="relative inline-block">
              <span className="text-yellow-400">o</span>
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </span>
            <span className="text-gray-800">tlight</span>
          </h1>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">Email Verification</h2>

        {/* Loading */}
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
            <p className="text-gray-500 text-sm">Verifying your email address…</p>
          </div>
        )}

        {/* No token */}
        {status === 'no-token' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700 text-sm">
              No verification token found. Please use the link sent to your email.
            </div>
            <a href="/login" className="inline-block text-gray-600 hover:text-gray-800 text-sm underline">
              Back to Sign In
            </a>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="space-y-5">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700 font-medium">{message}</p>
            <a
              href="/login"
              className="inline-block bg-black hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200 uppercase tracking-wider text-sm"
            >
              Sign In
            </a>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="space-y-5">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 text-sm">{message}</p>
            <div className="space-y-2 text-sm">
              <a href="/register" className="block text-gray-600 hover:text-gray-800 underline">
                Register again
              </a>
              <a href="/login" className="block text-gray-600 hover:text-gray-800 underline">
                Back to Sign In
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 via-pink-500 to-orange-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
