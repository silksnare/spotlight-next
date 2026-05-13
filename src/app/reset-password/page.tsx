'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState(params.get('email') || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <h1 className="mb-4 text-2xl font-semibold">Reset password</h1>

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr('');

          const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, code, password, confirmPassword }),
          });

          if (!res.ok) {
            setErr('Invalid or expired code, or weak password.');
            return;
          }

          setMsg('Password reset successful. Redirecting to login...');
          setTimeout(() => router.push('/login?reset=1'), 800);
        }}
      >
        <input className="w-full border p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className="w-full border p-2" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Reset code" />
        <input className="w-full border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
        <input className="w-full border p-2" type="password" value={confirmPassword} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" />

        {err && <p className="text-red-600">{err}</p>}
        {msg && <p className="text-green-700">{msg}</p>}

        <button className="w-full rounded bg-black px-4 py-2 text-white">
          Reset password
        </button>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
