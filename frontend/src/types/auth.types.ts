export interface User {
  id: string
  username: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'agent'
  avatarUrl?: string
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe: boolean
}

export interface AuthResponse {
  user: User
  token: string
  expiresAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
