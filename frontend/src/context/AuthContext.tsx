import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User, LoginCredentials, RegisterData, AuthState } from '../types/auth.types'
import { authService } from '../services/authService'

interface AuthContextType extends AuthState {
  isRestoringSession: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  updateUser: (updates: Partial<User>) => void
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isRestoringSession, setIsRestoringSession] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const { user: storedUser, token: storedToken } = authService.getStoredSession()
    if (!storedUser || !storedToken) {
      setIsRestoringSession(false)
      return
    }

    const useSession = (verifiedUser: Partial<User>) => {
      if (controller.signal.aborted) return
      setUser({ ...storedUser, ...verifiedUser })
      setToken(storedToken)
      setIsRestoringSession(false)
    }

    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(6000)])
    authService.verifySession(storedToken, signal).then(async (verifiedUser) => {
      if (controller.signal.aborted) return
      if (verifiedUser) {
        useSession(verifiedUser)
      } else {
        await authService.logout()
        setIsRestoringSession(false)
      }
    }, () => {
      // Keep the saved session during temporary API outages.
      useSession(storedUser)
    })
    return () => controller.abort()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await authService.login(credentials)
      setUser(response.user)
      setToken(response.token)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await authService.register(data)
      setUser(response.user)
      setToken(response.token)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      setError(msg)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      try {
        localStorage.setItem('crm_auth_user', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const logout = async () => {
    setIsProcessing(true)
    try {
      await authService.logout()
      setUser(null)
      setToken(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading: isRestoringSession || isProcessing,
        isRestoringSession,
        error,
        login,
        register,
        updateUser,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
