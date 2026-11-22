import type { LoginCredentials, AuthResponse } from '../types/auth.types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK) {
      // Realistic simulated network latency
      await new Promise((resolve) => setTimeout(resolve, 800))

      if (!credentials.username || !credentials.password) {
        throw new Error('Please enter both username and password')
      }

      // Demo validation - allows demo credentials or non-empty login
      if (credentials.password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      const mockResponse: AuthResponse = {
        user: {
          id: 'usr_crm_001',
          username: credentials.username,
          name: credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1),
          email: `${credentials.username.toLowerCase()}@crmsystem.com`,
          role: 'admin',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        },
        token: 'jwt_mock_token_' + Math.random().toString(36).substring(2),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      // Save token depending on Remember Me
      if (credentials.rememberMe) {
        localStorage.setItem('crm_auth_token', mockResponse.token)
        localStorage.setItem('crm_auth_user', JSON.stringify(mockResponse.user))
      } else {
        sessionStorage.setItem('crm_auth_token', mockResponse.token)
        sessionStorage.setItem('crm_auth_user', JSON.stringify(mockResponse.user))
      }

      return mockResponse
    }

    // Real API call
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Login failed' }))
      throw new Error(err.message || 'Login failed')
    }

    return res.json()
  },

  async logout(): Promise<void> {
    localStorage.removeItem('crm_auth_token')
    localStorage.removeItem('crm_auth_user')
    sessionStorage.removeItem('crm_auth_token')
    sessionStorage.removeItem('crm_auth_user')
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to send verification code')
      }
      return data
    } catch (err: any) {
      if (USE_MOCK && err?.message?.includes('Failed to fetch')) {
        await new Promise((r) => setTimeout(r, 800))
        return {
          message: 'A 6-digit verification code has been simulated for ' + email + ' (Demo OTP: 123456).',
        }
      }
      throw err
    }
  },

  async resetPassword(payload: { email: string; otp: string; newPassword: string }): Promise<{ message: string }> {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to reset password')
      }
      return data
    } catch (err: any) {
      if (USE_MOCK && err?.message?.includes('Failed to fetch')) {
        await new Promise((r) => setTimeout(r, 800))
        if (payload.otp !== '123456' && payload.otp.length !== 6) {
          throw new Error('Invalid verification code.')
        }
        return {
          message: 'Your password has been reset successfully. You can now sign in with your new password.',
        }
      }
      throw err
    }
  },

  getStoredSession(): { user: AuthResponse['user'] | null; token: string | null } {
    const token = localStorage.getItem('crm_auth_token') || sessionStorage.getItem('crm_auth_token')
    const userStr = localStorage.getItem('crm_auth_user') || sessionStorage.getItem('crm_auth_user')
    let user = null
    if (userStr) {
      try {
        user = JSON.parse(userStr)
      } catch {
        user = null
      }
    }
    return { user, token }
  },
}
