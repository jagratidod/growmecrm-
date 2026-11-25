import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth.types'

const AUTH_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

type SessionPayload = { token: string; user: Omit<User, 'username'> }

async function post<T>(path: string, payload: object, fallback: string): Promise<T> {
  const response = await fetch(`${AUTH_BASE}/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || data.message || fallback)
  return data
}

function clearSession() {
  for (const store of [localStorage, sessionStorage]) {
    store.removeItem('crm_auth_token')
    store.removeItem('crm_auth_user')
  }
  sessionStorage.removeItem('growme_support_return')
}

function saveSession(data: SessionPayload, rememberMe: boolean): AuthResponse {
  if (!data.user?.id || !data.token) throw new Error('The server did not return a valid session.')
  const user = { ...data.user, username: data.user.name }
  clearSession()
  const store = rememberMe ? localStorage : sessionStorage
  store.setItem('crm_auth_token', data.token)
  store.setItem('crm_auth_user', JSON.stringify(user))
  const payload = data.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const { exp } = JSON.parse(atob(payload)) as { exp: number }
  return { user, token: data.token, expiresAt: new Date(exp * 1000).toISOString() }
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    return saveSession(await post<SessionPayload>('register', data, 'Registration failed'), data.rememberMe ?? true)
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return saveSession(await post<SessionPayload>('login', credentials, 'Sign-in failed'), credentials.rememberMe)
  },

  async logout(): Promise<void> {
    clearSession()
  },

  forgotPassword(email: string): Promise<{ message: string }> {
    return post('forgot-password', { email }, 'Failed to send verification code')
  },

  resetPassword(payload: { email: string; otp: string; newPassword: string }): Promise<{ message: string }> {
    return post('reset-password', payload, 'Failed to reset password')
  },

  async verifySession(token: string, signal: AbortSignal): Promise<Partial<User> | null> {
    const response = await fetch(`${AUTH_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    })
    if ([401, 403, 404].includes(response.status)) return null
    if (!response.ok) throw new Error('Could not verify the saved session.')
    return (await response.json()).user
  },

  getStoredSession(): { user: User | null; token: string | null } {
    const store = localStorage.getItem('crm_auth_token') ? localStorage : sessionStorage
    const token = store.getItem('crm_auth_token')
    try {
      const user: User | null = JSON.parse(store.getItem('crm_auth_user') || 'null')
      return { user, token }
    } catch {
      return { user: null, token: null }
    }
  },
}
