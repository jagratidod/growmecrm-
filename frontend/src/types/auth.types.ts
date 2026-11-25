export interface User {
  id: string
  username: string
  name: string
  email: string
  phone?: string
  role: 'admin' | 'manager' | 'agent' | 'owner'
  avatarUrl?: string
  organizationId?: string
  organizationName?: string
  memberSince?: string
  lastSignIn?: string
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe: boolean
}

export interface RegisterData {
  agencyName: string
  name: string
  email: string
  phone?: string
  password: string
  rememberMe?: boolean
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
