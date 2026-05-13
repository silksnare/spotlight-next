'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <h1 className="mb-4 text-2xl font-semibold">Register</h1>

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');

          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!res.ok) {
            setError('Unable to register.');
            return;
          }

          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }}
      >
        <input
          className="w-full border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <p className="text-sm text-gray-500">
          Minimum 8 chars, uppercase, lowercase, and number.
        </p>

        {error && <p className="text-red-600">{error}</p>}

        <button className="w-full rounded bg-black px-4 py-2 text-white">
          Create account
        </button>
      </form>
    </main>
  );
}
