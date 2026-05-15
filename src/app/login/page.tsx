'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-[#f8f8fc] px-4 py-10 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute -left-20 top-32 h-72 w-72 rounded-full bg-[#ff8f5c]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-10 h-80 w-80 rounded-full bg-[#7f56ff]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 bg-gradient-to-tr from-[#f15a2b]/25 via-[#cf6fe6]/20 to-[#7f56ff]/20 [clip-path:polygon(100%_0,0_100%,100%_100%)]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#ececf4] bg-white shadow-[0_30px_90px_rgba(78,57,154,0.16)] lg:grid-cols-2">
        <section className="relative min-h-[540px] overflow-hidden bg-white p-8 sm:p-10 lg:p-12">
          <div className="relative z-10">
            <div className="mb-16">
              <div className="text-2xl font-extrabold tracking-tight text-[#111322]">
                Spotlight Next
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-[#8b8fa3]">
                BI WORLDWIDE
              </div>
            </div>

            <h1 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              <span className="block bg-gradient-to-r from-[#ff6a13] via-[#d14fc7] to-[#7f56ff] bg-clip-text text-transparent">
                Inspiring people.
              </span>
              <span className="block bg-gradient-to-r from-[#ff6a13] via-[#d14fc7] to-[#7f56ff] bg-clip-text text-transparent">
                Delivering results.
              </span>
            </h1>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[300px]">
            <div className="absolute bottom-0 left-0 h-56 w-72 bg-gradient-to-tr from-[#ff6a13]/80 via-[#d14fc7]/50 to-[#7f56ff]/70 [clip-path:polygon(0_38%,100%_0,72%_100%,0_100%)]" />
            <div className="absolute bottom-0 right-8 h-64 w-72 bg-gradient-to-tr from-[#7f56ff]/70 via-[#d14fc7]/35 to-transparent [clip-path:polygon(0_42%,100%_8%,100%_100%,0_100%)]" />

            <div className="absolute bottom-0 left-1/2 w-[430px] -translate-x-1/2">
              <Image
                src="/images/login-main2.png"
                alt="Team collaborating"
                width={430}
                height={320}
                className="h-auto w-full object-contain"
                priority
              />
            </div>

          </div>
        </section>

        <section className="flex items-center justify-center bg-white p-8 sm:p-10 lg:p-12">
          <div className="w-full max-w-md rounded-2xl border border-[#ececf4] bg-white p-6 shadow-[0_24px_60px_rgba(22,16,47,0.12)] sm:p-8">
            <div className="mb-6 space-y-2">
              <h2 className="text-3xl font-semibold text-[#181a2a]">Welcome back</h2>
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
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8b8ea1]">OR</span>
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