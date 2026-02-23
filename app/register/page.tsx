'use client'

import { FormEvent, useState } from 'react'

export default function RegisterPage() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      password: formData.get('password'),
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (!response.ok) {
      setError(data.error ?? 'Unable to register.')
    } else {
      setMessage(data.message)
      event.currentTarget.reset()
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 via-purple-600 via-pink-500 to-orange-500">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light tracking-wide">Register</h1>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <input name="firstName" placeholder="First name" className="w-full px-5 py-4 border border-gray-200 rounded-xl" />
          <input name="lastName" placeholder="Last name" className="w-full px-5 py-4 border border-gray-200 rounded-xl" />
          <input type="email" name="email" required placeholder="Email" className="w-full px-5 py-4 border border-gray-200 rounded-xl" />
          <input type="password" name="password" required minLength={8} placeholder="Password" className="w-full px-5 py-4 border border-gray-200 rounded-xl" />

          <div className="pt-4">
            <button disabled={loading} type="submit" className="w-full bg-black text-white font-semibold py-3 px-8 rounded-full uppercase tracking-wider text-sm disabled:opacity-60">
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        {message && <p className="text-green-600 text-sm mt-4">{message}</p>}
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

        <div className="text-center mt-8 text-sm">
          <span>Already have an account? </span>
          <a href="/login" className="underline">Sign In</a>
        </div>
      </div>
    </div>
  )
}
