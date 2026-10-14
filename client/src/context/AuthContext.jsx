import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api.js'
import { AuthContext } from './authContext.js'

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await apiRequest('/auth/me')
        setUser(response.data.user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  async function logout() {
    await apiRequest('/auth/logout', {
      method: 'POST',
    })

    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider }