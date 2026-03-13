'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Incorrect username or password.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0f0f0f' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: '#f5f5f5' }}>VideoDash</p>
            <p className="text-xs" style={{ color: '#5a5a5a' }}>Performance Tracker</p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: '#161616', border: '1px solid #2a2a2a' }}
        >
          <h1 className="text-lg font-semibold mb-1" style={{ color: '#f5f5f5' }}>
            Sign in
          </h1>
          <p className="text-sm mb-6" style={{ color: '#5a5a5a' }}>
            Enter your credentials to access your dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#a0a0a0' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#f0f0f0' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#06b6d4' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2a2a' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#a0a0a0' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#f0f0f0' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#06b6d4' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#2a2a2a' }}
              />
            </div>

            {error && (
              <div
                className="px-3 py-2.5 rounded-xl text-sm"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all mt-2"
              style={{
                background: loading ? '#2a2a2a' : '#06b6d4',
                color: loading ? '#4a4a4a' : '#000',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
