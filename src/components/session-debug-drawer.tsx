'use client'

import { useState } from 'react'

type SessionDebugDrawerProps = {
  sessionUser: {
    id: string
    name: string
    email: string
    employeeId: string
    role: string | null
    homeArea: number | null
  }
}

export function SessionDebugDrawer({
  sessionUser,
}: SessionDebugDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="session-debug-drawer"
        className="fixed left-0 top-1/2 z-[70] -translate-y-1/2 rounded-r-[10px] bg-[#161624] px-3 py-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-lg transition hover:opacity-95"
      >
        <span className="[writing-mode:vertical-rl] rotate-180">
          Auth Debug
        </span>
      </button>

      <aside
        id="session-debug-drawer"
        className={`fixed left-0 top-0 z-[69] flex h-screen w-[340px] max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-[18px] font-semibold text-[#161624]">
            Authentication Verification
          </h2>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm font-medium text-slate-500 transition hover:text-[#161624]"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <p className="mb-6 text-sm text-slate-600">
            Signed-in status: authenticated
          </p>

          <dl className="space-y-5 text-sm">
            <div>
              <dt className="mb-1 text-slate-500">Name</dt>
              <dd className="break-words font-medium text-[#161624]">
                {sessionUser.name}
              </dd>
            </div>

            <div>
              <dt className="mb-1 text-slate-500">Email</dt>
              <dd className="break-words font-medium text-[#161624]">
                {sessionUser.email}
              </dd>
            </div>

            <div>
              <dt className="mb-1 text-slate-500">Employee ID</dt>
              <dd className="break-words font-medium text-[#161624]">
                {sessionUser.employeeId}
              </dd>
            </div>

            <div>
              <dt className="mb-1 text-slate-500">Role</dt>
              <dd className="break-words font-medium text-[#161624]">
                {sessionUser.role ?? 'null'}
              </dd>
            </div>

            <div>
              <dt className="mb-1 text-slate-500">Home Area</dt>
              <dd className="break-words font-medium text-[#161624]">
                {sessionUser.homeArea ?? 'null'}
              </dd>
            </div>

            <div>
              <dt className="mb-1 text-slate-500">Internal User ID</dt>
              <dd className="break-all font-medium text-[#161624]">
                {sessionUser.id}
              </dd>
            </div>
          </dl>

          <form action="/api/auth/logout" method="post" className="pt-8">
            <button
              className="inline-flex min-h-[44px] items-center justify-center bg-[#161624] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close debug drawer overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[68] bg-black/20"
        />
      ) : null}
    </>
  )
}