import { useContext } from 'react'
import { AuthContext } from './authContext.js'

function useAuth() {
  return useContext(AuthContext)
}

export { useAuth }