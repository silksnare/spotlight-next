'use client'

import { FormEvent, useState } from 'react'

export default function LoginPage() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      setError(data.error ?? 'Unable to log in.')
      return
    }

    setMessage(data.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 via-pink-500 to-orange-500">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
        <h1 className="text-3xl font-light text-center mb-8">Sign In</h1>

        <form className="space-y-5" onSubmit={onSubmit}>
          <input type="email" name="email" required placeholder="Email" className="w-full px-5 py-4 border border-gray-200 rounded-xl" />
          <input type="password" name="password" required placeholder="Password" className="w-full px-5 py-4 border border-gray-200 rounded-xl" />

          <button type="submit" className="w-full bg-black text-white font-semibold py-3 px-8 rounded-full uppercase tracking-wider text-sm">
            Sign In
          </button>
        </form>

        {message && <p className="text-green-600 text-sm mt-4">{message}</p>}
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

        <div className="text-center mt-8 text-sm space-x-2">
          <a href="/forgot-password" className="underline">Forgot Password</a>
          <span>|</span>
          <a href="/register" className="underline">Sign Up</a>
        </div>
      </div>
    </div>
  )
}
