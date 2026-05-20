'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailForm() {
  const params = useSearchParams();
  const router = useRouter();

  const email = params.get('email') || '';

  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <h1 className="mb-4 text-2xl font-semibold">Verify email</h1>

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr('');

          const res = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, code }),
          });

          if (!res.ok) {
            setErr('Invalid or expired code.');
            return;
          }

          // router.push('/dashboard');
          window.location.href = '/dashboard';
        }}
      >
        <input
          className="w-full border p-2"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6-digit code"
        />

        {err && <p className="text-red-600">{err}</p>}

        <button className="w-full rounded bg-black px-4 py-2 text-white">
          Verify
        </button>
      </form>

      <button
        className="mt-3 underline"
        onClick={async () => {
          const res = await fetch('/api/auth/resend-verification', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          setMsg(
            res.ok
              ? 'Code resent.'
              : 'Please wait before requesting another code.'
          );
        }}
      >
        Resend code
      </button>

      {msg && <p>{msg}</p>}
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
