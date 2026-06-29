import { useState } from 'react'
import { signIn } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('Attempting login with:', username)
    console.log('Env username:', import.meta.env.VITE_LOGIN_USERNAME)
    console.log('Env password:', import.meta.env.VITE_LOGIN_PASSWORD)

    const { data, error } = await signIn(username, password)

    console.log('Login result:', { data, error })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Store session in localStorage for simple auth
      localStorage.setItem('auth_session', JSON.stringify(data.user))
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="/logo.png" 
            alt="TEV Africa Foods Logo" 
            className="mx-auto h-32 w-auto mb-4"
          />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            TEV Africa Foods
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Manufacturing Management System
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none relative block w-full px-4 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
