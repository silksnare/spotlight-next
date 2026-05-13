'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <h1 className="mb-4 text-2xl font-semibold">Forgot password</h1>

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();

          await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          setMsg('If the account exists, a reset code has been sent.');
        }}
      >
        <input
          className="w-full border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <button className="w-full rounded bg-black px-4 py-2 text-white">
          Send reset code
        </button>
      </form>

      {msg && <p className="mt-2">{msg}</p>}
    </main>
  );
}
