'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [gmin, setGmin] = useState('')
  const [error, setError] = useState('')

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1b171c] px-6 py-12">
      <section className="w-full max-w-[440px] border border-[#3a333b] bg-[#1b171c] p-8 text-white sm:p-10">
        <div className="mb-10 text-center">
          <img
            src="/images/logo.png"
            alt="Cadillac"
            className="mx-auto mb-[3.5rem] h-auto w-[120px] sm:w-[150px] lg:w-[170px]"
          />

          <div className="font-[family:var(--font-cadillac)] text-[28px] font-bold uppercase leading-[0.95] tracking-[0.1em] sm:text-[34px]">
            <div>Choose Your</div>
            <div>EV Conquest</div>
          </div>
        </div>

        <h1 className="text-center font-[family:var(--font-cadillac)] text-[22px] font-bold uppercase tracking-[0.18em]">
          Sign In
        </h1>

        <p className="mt-3 text-center text-[14px] leading-6 text-[#c8c3cc]">
          Enter your Global Connect email and GMIN credentials to continue.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setError('')

            const res = await fetch('/api/auth/seeded-login', {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
              },
              body: JSON.stringify({
                email,
                gmin,
              }),
            })

            if (!res.ok) {
              setError('Invalid email or GMIN')
              return
            }

            window.location.href = '/dashboard'
          }}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.18em] text-[#d8d3dc]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              className="mt-2 w-full border border-[#5a525c] bg-transparent px-4 py-3 text-white outline-none transition placeholder:text-[#827982] focus:border-white"
              placeholder="GlobalConnectEmail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="gmin"
              className="font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.18em] text-[#d8d3dc]"
            >
              GMIN
            </label>

            <input
              id="gmin"
              className="mt-2 w-full border border-[#5a525c] bg-transparent px-4 py-3 text-white outline-none transition placeholder:text-[#827982] focus:border-white"
              placeholder="Your GMIN"
              value={gmin}
              onChange={(e) => setGmin(e.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <button className="mt-2 w-full bg-white px-4 py-3.5 font-[family:var(--font-cadillac)] text-[13px] font-bold uppercase tracking-[0.2em] text-[#1b171c] transition hover:bg-[#e8e4e8]">
            Sign In
          </button>
        </form>

        <div className="pt-6 text-center">
          <a
            href="mailto:CadillacEVConquestHQ@biworldwide.com?subject=Cadillac%20EV%20Conquest%20Support"
            className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#8f8791] transition hover:text-white"
          >
            Need Help?
          </a>
        </div>

        <p className="mt-8 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-[#8f8791]">
          Powered by BI WORLDWIDE
        </p>
      </section>
    </main>
  )
}