
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <main className="auth-page">Checking session...</main>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
