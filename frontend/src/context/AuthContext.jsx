import { createContext, useEffect, useMemo, useState } from 'react'
import {
  fetchProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from '../services/authService'

export const AuthContext = createContext(null)

function getStoredAuth() {
  return {
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    user: JSON.parse(localStorage.getItem('authUser') || 'null'),
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getStoredAuth)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (!auth.accessToken && auth.refreshToken) {
          const refreshed = await refreshAccessToken(auth.refreshToken)
          const nextToken = refreshed.accessToken
          localStorage.setItem('accessToken', nextToken)
          setAuth((prev) => ({ ...prev, accessToken: nextToken }))
        }

        if ((auth.accessToken || auth.refreshToken) && !auth.user) {
          const profile = await fetchProfile()
          const user = profile.user
          localStorage.setItem('authUser', JSON.stringify(user))
          setAuth((prev) => ({ ...prev, user }))
        }
      } catch (_error) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('authUser')
        setAuth({ accessToken: '', refreshToken: '', user: null })
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (credentials) => {
    const response = await loginUser(credentials)
    const nextAuth = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
    }
    localStorage.setItem('accessToken', nextAuth.accessToken)
    localStorage.setItem('refreshToken', nextAuth.refreshToken)
    localStorage.setItem('authUser', JSON.stringify(nextAuth.user))
    setAuth(nextAuth)
    return response
  }

  const register = async (payload) => {
    return registerUser(payload)
  }

  const logout = async () => {
    try {
      if (auth.refreshToken) {
        await logoutUser(auth.refreshToken)
      }
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('authUser')
      setAuth({ accessToken: '', refreshToken: '', user: null })
    }
  }

  const value = useMemo(
    () => ({
      user: auth.user,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      isAuthenticated: Boolean(auth.accessToken && auth.user),
      loading,
      login,
      register,
      logout,
    }),
    [auth, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
