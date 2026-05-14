'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  return (
    <main className="relative flex min-h-screen flex-1 overflow-hidden bg-[#f8f8fc] px-4 py-10 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute -left-20 top-32 h-72 w-72 rounded-full bg-[#ff8f5c]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-10 h-80 w-80 rounded-full bg-[#7f56ff]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 bg-gradient-to-tr from-[#f15a2b]/25 via-[#cf6fe6]/20 to-[#7f56ff]/20 [clip-path:polygon(100%_0,0_100%,100%_100%)]" />
      <div className="pointer-events-none absolute right-[22%] top-32 hidden h-48 w-48 rounded-full bg-[#cf6fe6]/10 blur-2xl lg:block" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-8 lg:pr-8">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#7f56ff]">
              Welcome back
            </p>

            <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.02] tracking-tight text-[#171827] sm:text-6xl">
              <span className="block bg-gradient-to-r from-[#f2692f] via-[#d14fc7] to-[#7f56ff] bg-clip-text text-transparent">
                Inspiring people.
              </span>
              <span className="block bg-gradient-to-r from-[#f2692f] via-[#d14fc7] to-[#7f56ff] bg-clip-text text-transparent">
                Delivering results.
              </span>
            </h1>

            <p className="max-w-xl text-base leading-7 text-[#55586b]">
              Sign in to access the Spotlight Next platform and continue driving
              meaningful impact across teams.
            </p>
          </div>

          <div className="relative max-w-2xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/60 p-8 shadow-[0_30px_90px_rgba(78,57,154,0.14)] backdrop-blur-md">
            <div className="pointer-events-none absolute -right-16 -top-12 h-48 w-48 rounded-full bg-[#8e6bff]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[#ff8f5c]/25 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-64 bg-gradient-to-tr from-[#f15a2b]/25 via-[#cf6fe6]/20 to-[#7f56ff]/20 [clip-path:polygon(100%_0,15%_100%,100%_100%)]" />

            <div className="relative">
              <p className="text-xl font-bold text-[#1f2130]">Spotlight Next</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-[#7a7d8f]">
                BI WORLDWIDE
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm">
                  <div className="mb-4 h-10 w-10 rounded-full bg-[#ff6a13]/15 text-center text-2xl leading-10">
                    ▶
                  </div>
                  <p className="text-sm font-bold text-[#202235]">Participate</p>
                  <p className="mt-1 text-xs leading-5 text-[#666a7d]">
                    Submit quality videos with ease.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm">
                  <div className="mb-4 h-10 w-10 rounded-full bg-[#7f56ff]/15 text-center text-2xl leading-10">
                    ★
                  </div>
                  <p className="text-sm font-bold text-[#202235]">Judge</p>
                  <p className="mt-1 text-xs leading-5 text-[#666a7d]">
                    Score submissions across phases.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm">
                  <div className="mb-4 h-10 w-10 rounded-full bg-[#d14fc7]/15 text-center text-2xl leading-10">
                    ↑
                  </div>
                  <p className="text-sm font-bold text-[#202235]">Recognize</p>
                  <p className="mt-1 text-xs leading-5 text-[#666a7d]">
                    Surface winners and results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center lg:justify-end">
          <div className="w-full max-w-md rounded-2xl border border-[#ececf4] bg-white p-6 shadow-[0_24px_60px_rgba(22,16,47,0.14)] sm:p-8">
            <div className="mb-6 space-y-2">
              <h2 className="text-3xl font-semibold text-[#181a2a]">
                Welcome back
              </h2>
              <p className="text-sm text-[#676b80]">Sign in to your account</p>
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
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-[#43475c]">
                  Email
                </label>
                <input
                  id="email"
                  className="w-full rounded-xl border border-[#dcddeb] bg-white px-4 py-3 text-[#1b1d2c] outline-none transition focus:border-[#8e6bff] focus:ring-2 focus:ring-[#8e6bff]/20"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-[#43475c]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    className="w-full rounded-xl border border-[#dcddeb] bg-white px-4 py-3 pr-12 text-[#1b1d2c] outline-none transition focus:border-[#8e6bff] focus:ring-2 focus:ring-[#8e6bff]/20"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#6c7083] transition hover:text-[#1f2234]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <a href="/forgot-password" className="text-sm font-medium text-[#6d3df5] hover:underline">
                  Forgot password?
                </a>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button className="w-full rounded-xl bg-[linear-gradient(90deg,#0c1021_0%,#131b3f_100%)] px-4 py-3.5 font-semibold text-white shadow-[0_10px_24px_rgba(9,13,29,0.28)] transition hover:opacity-95">
                Sign In
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[#696c80]">
              Don&apos;t have an account?{' '}
              <a href="/register" className="font-semibold text-[#6d3df5] hover:underline">
                Register now
              </a>
            </p>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#e4e5ef]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b8ea1]">
                OR
              </span>
              <div className="h-px flex-1 bg-[#e4e5ef]" />
            </div>

            <form action="/api/auth/saml/login" method="get" className="w-full">
              <button className="w-full rounded-xl border border-[#d6d8e5] bg-white px-4 py-3 font-semibold text-[#1a1d2d] transition hover:bg-[#f8f8fc]">
                Sign in with SSO
              </button>
            </form>

            <p className="mt-6 text-center text-xs font-medium uppercase tracking-[0.12em] text-[#9a9dad]">
              Powered by BI WORLDWIDE
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}