
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { apiRequest } from '../services/api.js'
import { useAuth } from '../context/useAuth.js'

function RegisterPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      setUser(response.data.user)
      setSuccess(response.message || 'Registration successful.')

      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
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
          <p className="auth-aside-kicker">A FRESH START</p>
          <h2>Bring your plans into focus.</h2>
          <p>Gather your priorities, track what’s next, and make progress one task at a time.</p>
          <div className="auth-aside-note"><span aria-hidden="true">✓</span> Your next chapter starts here</div>
        </div>
        <span className="auth-aside-orbit auth-aside-orbit-one" aria-hidden="true" />
        <span className="auth-aside-orbit auth-aside-orbit-two" aria-hidden="true" />
      </aside>
      <section className="auth-card">
        <p className="auth-card-kicker">A FRESH START</p>
        <h1>Create an account</h1>
        <p className="auth-card-intro">Create your account to bring your plans and priorities together.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={40}
            autoComplete="name"
            required
          />

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
              autoComplete="new-password"
              required
            />

            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirm password</label>
          <div className="password-field">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />

            <button
              className="password-toggle"
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              aria-label={
                showConfirmPassword
                  ? 'Hide confirmation password'
                  : 'Show confirmation password'
              }
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p role="status">
              {success}
            </p>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
      </div>
      </div>
    </main>
  )
}

export default RegisterPage
