import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi } from '../api/client'

const AuthContext = createContext(null)
const ROLE_KEY = 'keyfreestay:viewRole'

function readViewRole() {
  try { return localStorage.getItem(ROLE_KEY) || 'tenant' } catch { return 'tenant' }
}
function writeViewRole(r) {
  try { localStorage.setItem(ROLE_KEY, r) } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [viewRole, setViewRoleState] = useState(readViewRole)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const me = await authApi.me()
      setUser(me)
      return me
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const login = async ({ email, password }) => {
    await authApi.login({ email, password })
    return refresh()
  }

  const register = async ({ full_name, email, password, phone, role }) => {
    const body = { full_name, email, password }
    if (phone) body.phone = phone
    await authApi.register(body)
    await authApi.login({ email, password })
    if (role) {
      setViewRoleState(role)
      writeViewRole(role)
    }
    return refresh()
  }

  const updateMe = async (patch) => {
    const updated = await authApi.updateMe(patch)
    setUser(updated)
    return updated
  }

  const setViewRole = (r) => { writeViewRole(r); setViewRoleState(r) }
  const switchRole = () => setViewRole(viewRole === 'owner' ? 'tenant' : 'owner')

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  const value = {
    user, loading, viewRole,
    login, register, logout, refresh, updateMe,
    switchRole, setViewRole
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
