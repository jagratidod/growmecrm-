import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth.types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const resData = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(resData.error || resData.message || 'Registration failed')
      }

      const orgName = resData.organization?.name || data.agencyName || 'GrowMe CRM'
      const formattedUser: User = {
        id: resData.user?.id || 'usr_' + Date.now(),
        username: data.name,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: (resData.user?.role || 'owner') as any,
        organizationId: resData.organization?.id,
        organizationName: orgName,
        memberSince: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        lastSignIn: 'Just now',
        avatarUrl: resData.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      }

      const authResp: AuthResponse = {
        user: formattedUser,
        token: resData.token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }

      localStorage.setItem('crm_auth_token', authResp.token)
      localStorage.setItem('crm_auth_user', JSON.stringify(authResp.user))
      localStorage.setItem('crm_current_agency', orgName)
      // Also update settings storage keys so Profile and Organization pages reflect immediately
      try {
        localStorage.setItem('treki_crm_settings_data_profile', JSON.stringify({
          fullName: formattedUser.name,
          email: formattedUser.email,
          role: 'Owner',
          organization: orgName,
          memberSince: formattedUser.memberSince,
          lastSignIn: 'Just now',
        }))
        localStorage.setItem('treki_crm_settings_data_org', JSON.stringify({
          agencyName: orgName,
          logoUrl: '',
          primaryColor: '#453372',
          secondaryColor: '#0D9488',
        }))
      } catch {}

      return authResp
    } catch (err: any) {
      if (USE_MOCK && (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError'))) {
        await new Promise((r) => setTimeout(r, 800))
        const orgName = data.agencyName || 'GrowMe CRM'
        const mockResp: AuthResponse = {
          user: {
            id: 'usr_' + Math.random().toString(36).substring(2),
            username: data.name,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: 'owner',
            organizationName: orgName,
            memberSince: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            lastSignIn: 'Just now',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
          },
          token: 'jwt_mock_token_' + Math.random().toString(36).substring(2),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
        localStorage.setItem('crm_auth_token', mockResp.token)
        localStorage.setItem('crm_auth_user', JSON.stringify(mockResp.user))
        try {
          localStorage.setItem('treki_crm_settings_data_profile', JSON.stringify({
            fullName: mockResp.user.name,
            email: mockResp.user.email,
            role: 'Owner',
            organization: orgName,
            memberSince: mockResp.user.memberSince,
            lastSignIn: 'Just now',
          }))
          localStorage.setItem('treki_crm_settings_data_org', JSON.stringify({
            agencyName: orgName,
            logoUrl: '',
            primaryColor: '#453372',
            secondaryColor: '#0D9488',
          }))
        } catch {}
        return mockResp
      }
      throw err
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // 1. Try Real Backend API
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      const resData = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(resData.error || resData.message || 'Invalid username or password')
      }

      const orgName = resData.organization?.name || 'GrowMe CRM'
      const formattedUser: User = {
        id: resData.user?.id || 'usr_' + Date.now(),
        username: resData.user?.name || credentials.username,
        name: resData.user?.name || credentials.username,
        email: resData.user?.email || (credentials.username.includes('@') ? credentials.username : `${credentials.username}@crmsystem.com`),
        role: (resData.user?.role || 'admin') as any,
        organizationId: resData.organization?.id,
        organizationName: orgName,
        memberSince: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        lastSignIn: 'Just now',
        avatarUrl: resData.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      }

      const authResp: AuthResponse = {
        user: formattedUser,
        token: resData.token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      if (credentials.rememberMe) {
        localStorage.setItem('crm_auth_token', authResp.token)
        localStorage.setItem('crm_auth_user', JSON.stringify(authResp.user))
      } else {
        sessionStorage.setItem('crm_auth_token', authResp.token)
        sessionStorage.setItem('crm_auth_user', JSON.stringify(authResp.user))
      }

      try {
        localStorage.setItem('treki_crm_settings_data_profile', JSON.stringify({
          fullName: formattedUser.name,
          email: formattedUser.email,
          role: formattedUser.role === 'owner' ? 'Owner' : 'Admin',
          organization: orgName,
          memberSince: formattedUser.memberSince,
          lastSignIn: 'Just now',
        }))
        localStorage.setItem('treki_crm_settings_data_org', JSON.stringify({
          agencyName: orgName,
          logoUrl: '',
          primaryColor: '#453372',
          secondaryColor: '#0D9488',
        }))
      } catch {}

      return authResp
    } catch (err: any) {
      if (USE_MOCK && (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError'))) {
        await new Promise((resolve) => setTimeout(resolve, 800))

        if (!credentials.username || !credentials.password) {
          throw new Error('Please enter both username and password')
        }

        if (credentials.password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }

        const storedAgency = localStorage.getItem('crm_current_agency')
        const isKnownUser = credentials.username.toLowerCase() === 'admin'
        const displayName = isKnownUser ? 'Workspace Admin' : (credentials.username.includes('@') ? credentials.username.split('@')[0].replace(/[._]/g, ' ') : credentials.username)
        const formattedDisplayName = displayName.replace(/\b\w/g, (c) => c.toUpperCase())
        const displayEmail = isKnownUser ? 'admin@growmecrm.com' : (credentials.username.includes('@') ? credentials.username : `${credentials.username.toLowerCase()}@growmecrm.com`)
        const orgName = storedAgency || 'GrowMe CRM'

        const mockResponse: AuthResponse = {
          user: {
            id: 'usr_crm_' + Date.now(),
            username: credentials.username,
            name: formattedDisplayName,
            email: displayEmail,
            role: 'admin',
            organizationName: orgName,
            memberSince: '8 Oct 2026',
            lastSignIn: 'Just now',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
          },
          token: 'jwt_mock_token_' + Math.random().toString(36).substring(2),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }

        if (credentials.rememberMe) {
          localStorage.setItem('crm_auth_token', mockResponse.token)
          localStorage.setItem('crm_auth_user', JSON.stringify(mockResponse.user))
        } else {
          sessionStorage.setItem('crm_auth_token', mockResponse.token)
          sessionStorage.setItem('crm_auth_user', JSON.stringify(mockResponse.user))
        }

        try {
          localStorage.setItem('treki_crm_settings_data_profile', JSON.stringify({
            fullName: displayName,
            email: displayEmail,
            role: 'Admin',
            organization: orgName,
            memberSince: '8 Oct 2026',
            lastSignIn: 'Just now',
          }))
          localStorage.setItem('treki_crm_settings_data_org', JSON.stringify({
            agencyName: orgName,
            logoUrl: '',
            primaryColor: '#453372',
            secondaryColor: '#0D9488',
          }))
        } catch {}

        return mockResponse
      }
      throw err
    }
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
        const currentAgency = localStorage.getItem('crm_current_agency')
        if (currentAgency && (!user.organizationName || user.organizationName === 'Treki Travels')) {
          user.organizationName = currentAgency
        } else if (!user.organizationName || user.organizationName === 'Treki Travels') {
          user.organizationName = 'GrowMe CRM'
        }
        if (user.name === 'Kushal Pareta') {
          user.name = 'Workspace Admin'
        }
        localStorage.setItem('crm_auth_user', JSON.stringify(user))
      } catch {
        user = null
      }
    }
    return { user, token }
  },
}
