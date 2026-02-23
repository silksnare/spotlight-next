'use client'

import { FormEvent, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    const formData = new FormData(event.currentTarget)

    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        token,
        code: formData.get('code'),
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      setError(data.error ?? 'Unable to verify email.')
      return
    }

    setMessage(data.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-semibold mb-3">Verify your email</h1>
        <p className="text-sm text-gray-600 mb-6">Enter the code from your email to complete registration.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input name="code" required placeholder="Verification code" className="w-full px-4 py-3 border rounded-lg" />
          <button type="submit" className="w-full bg-black text-white py-3 rounded-lg">Verify</button>
        </form>
        {message && <p className="text-green-600 text-sm mt-4">{message}</p>}
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </div>
    </div>
  )
}
