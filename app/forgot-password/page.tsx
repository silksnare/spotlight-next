'use client'

import { FormEvent, useState } from 'react'

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.get('email') }),
    })

    const data = await response.json()
    setMessage(data.message ?? data.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-semibold mb-3">Forgot Password</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="email" name="email" required placeholder="Email" className="w-full px-4 py-3 border rounded-lg" />
          <button type="submit" className="w-full bg-black text-white py-3 rounded-lg">Send reset link</button>
        </form>
        {message && <p className="text-sm mt-4">{message}</p>}
      </div>
    </div>
  )
}
