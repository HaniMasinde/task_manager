
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { apiRequest } from '../services/api.js'
import { useAuth } from '../context/useAuth.js'

function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      })

      setUser(response.data.user)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
      <Link className="auth-brand" to="/" aria-label="Wuod Atieno home"><span className="brand-mark" aria-hidden="true">W</span><span>Wuod Atieno</span></Link>
      <div className="auth-layout">
      <aside className="auth-aside" aria-label="About your workspace">
        <div className="auth-aside-copy">
          <p className="auth-aside-kicker">YOUR SPACE TO FOCUS</p>
          <h2>Make room for what matters.</h2>
          <p>Keep your tasks in one calm, clear workspace and make steady progress on the things you care about.</p>
          <div className="auth-aside-note"><span aria-hidden="true">✓</span> A clearer day starts here</div>
        </div>
        <span className="auth-aside-orbit auth-aside-orbit-one" aria-hidden="true" />
        <span className="auth-aside-orbit auth-aside-orbit-two" aria-hidden="true" />
      </aside>
      <section className="auth-card">
        <p className="auth-card-kicker">YOUR WORKSPACE AWAITS</p>
        <h1 className="login-heading">Welcome back</h1>
        <p className="auth-card-intro">Sign in to see your tasks and continue making progress.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Need an account? <Link to="/register">Register</Link>
        </p>
      </section>
      </div>
      </div>
    </main>
  )
}

export default LoginPage
