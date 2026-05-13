'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <main
      className="flex min-h-screen flex-1 items-center justify-center bg-cover bg-center px-4 py-12"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="w-full max-w-xl space-y-6 p-10 text-center">
        <div className="flex justify-center">
          <Image
            src="/images/hood.png"
            alt="Cadillac Logo"
            width={360}
            height={220}
            className="h-auto w-[360px]"
          />
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');

            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
              setError('Invalid email or password');
              return;
            }

            router.push('/dashboard');
          }}
          className="space-y-3"
        >
          <input
            className="w-full rounded border p-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded border p-3"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-600">{error}</p>}

          <button className="w-full rounded bg-[#000000] px-4 py-3 font-medium text-white">
            Sign in with Email
          </button>
        </form>

        <div className="text-sm">
          <a href="/register" className="underline">
            Create account
          </a>{' '}
          ·{' '}
          <a href="/forgot-password" className="underline">
            Forgot password
          </a>
        </div>

        <form action="/api/auth/saml/login" method="get" className="w-full">
          <button className="w-full rounded bg-[#333333] px-4 py-3 text-[18px] font-medium text-white transition">
            Sign-in with SSO
          </button>
        </form>
      </div>
    </main>
  );
}
