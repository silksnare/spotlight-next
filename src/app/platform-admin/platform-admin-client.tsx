'use client'

import { useState } from 'react'

const ALLOWED_ROLES = ['uploader', 'qualifier', 'judge1', 'judge2', 'admin', 'client'] as const

type Phase = {
  id: string
  key: string
  label: string
  startsAt: string
  endsAt: string
}

function toDateTimeLocal(value: string) {
  if (!value) return ''

  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60_000)

  return localDate.toISOString().slice(0, 16)
}

function fromDateTimeLocalToIso(value: string) {
  if (!value) return ''

  return new Date(value).toISOString()
}

export default function PlatformAdminClient({ users, q, phases }: any) {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Platform Admin</h1>

      <PhaseManagement phases={phases} />

      <form className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search email or display name"
          className="w-full max-w-md border p-2"
        />
      </form>

      <div className="space-y-4">
        {users.map((u: any) => (
          <UserRow key={u.id} user={u} />
        ))}
      </div>
    </div>
  )
}

function PhaseManagement({ phases }: { phases: Phase[] }) {
  const [rows, setRows] = useState(
    phases.map((phase) => ({
      ...phase,
      startsAt: toDateTimeLocal(phase.startsAt),
      endsAt: toDateTimeLocal(phase.endsAt),
    }))
  )

  async function savePhases() {
    const res = await fetch('/api/platform-admin/phases/schedule', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        phases: rows.map((phase) => ({
          id: phase.id,
          startsAt: fromDateTimeLocalToIso(phase.startsAt),
          endsAt: fromDateTimeLocalToIso(phase.endsAt),
        })),
      }),
    })

    if (!res.ok) {
      alert((await res.json()).error || 'Failed to save phase schedule')
      return
    }

    alert('Phase schedule saved')
    location.reload()
  }

  return (
    <section className="mb-8 rounded border p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Phase Management</h2>
        <p className="text-sm text-gray-600">
          Edit the start and end dates for each phase. Site behavior is based on these date windows.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Phase</th>
              <th className="py-2 pr-4">Starts At</th>
              <th className="py-2 pr-4">Ends At</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((phase, index) => (
              <tr key={phase.id} className="border-b">
                <td className="py-3 pr-4 font-medium">{phase.label}</td>

                <td className="py-3 pr-4">
                  <input
                    type="datetime-local"
                    value={phase.startsAt}
                    onChange={(event) => {
                      const next = [...rows]
                      next[index] = {
                        ...next[index],
                        startsAt: event.target.value,
                      }
                      setRows(next)
                    }}
                    className="rounded border px-3 py-2"
                  />
                </td>

                <td className="py-3 pr-4">
                  <input
                    type="datetime-local"
                    value={phase.endsAt}
                    onChange={(event) => {
                      const next = [...rows]
                      next[index] = {
                        ...next[index],
                        endsAt: event.target.value,
                      }
                      setRows(next)
                    }}
                    className="rounded border px-3 py-2"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={savePhases}
        className="mt-4 rounded bg-black px-4 py-2 text-white"
      >
        Save Phase Schedule
      </button>
    </section>
  )
}

function UserRow({ user }: any) {
  const current = new Set((user.userRoles || []).map((r: any) => r.role))

  async function save(formData: FormData) {
    const roles = ALLOWED_ROLES.filter((r) => formData.get(r) === 'on')

    const res = await fetch(`/api/platform-admin/users/${user.id}/roles`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ roles }),
    })

    if (!res.ok) {
      alert((await res.json()).error || 'Failed to update roles')
      return
    }

    alert('Saved')
    location.reload()
  }

  return (
    <form action={save} className="rounded border p-3">
      <div className="font-medium">
        {user.displayName} ({user.email})
      </div>

      <div className="text-sm text-gray-600">
        employeeId: {user.employeeId} | active: {String(user.active)} |
        emailVerified: {String(user.localAuthCredential?.emailVerified ?? 'n/a')} |
        createdAt: {new Date(user.createdAt).toLocaleString()} |
        homeArea: {user.homeArea ?? '-'} | district: {user.district ?? '-'}
      </div>

      <div className="mt-2 flex flex-wrap gap-3">
        {ALLOWED_ROLES.map((r) => (
          <label key={r} className="text-sm">
            <input
              type="checkbox"
              name={r}
              defaultChecked={current.has(r)}
              className="mr-1"
            />
            {r}
          </label>
        ))}
      </div>

      <button className="mt-3 rounded bg-black px-3 py-1 text-white">
        Save Roles
      </button>
    </form>
  )
}