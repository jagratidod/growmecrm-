import React, { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { LeadsProvider } from './context/LeadsContext'
import { RouterProvider, useRouter } from './context/RouterContext'
import { AuthPage } from './features/auth/AuthPage'
import { LeadsPage } from './features/leads/LeadsPage'

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const { path, navigate } = useRouter()

  useEffect(() => {
    if (isLoading) return

    // Base route enforcement: if not logged in and not on /login, redirect to /login
    if (!isAuthenticated && path !== '/login') {
      navigate('/login', { replace: true })
    }
  }, [isLoading, isAuthenticated, path, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Initializing CRM Session...</p>
        </div>
      </div>
    )
  }

  // Base route is /login: show AuthPage if path is /login or if unauthenticated
  const isLoginPage = path === '/login' || !isAuthenticated

  return (
    <div className="relative">
      {isLoginPage ? (
        <AuthPage onSuccess={() => navigate('/leads')} />
      ) : (
        <LeadsPage />
      )}
    </div>
  )
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <LeadsProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </LeadsProvider>
      </AuthProvider>
    </RouterProvider>
  )
}
