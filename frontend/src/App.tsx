import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { LeadsProvider } from './context/LeadsContext'
import { AuthPage } from './features/auth/AuthPage'
import { LeadsPage } from './features/leads/LeadsPage'

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const [previewMode, setPreviewMode] = useState<'auto' | 'leads' | 'login'>('auto')

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

  // Determine view:
  // If previewMode is 'auto', show LeadsPage if logged in, else AuthPage.
  // User can also toggle via floating pill in bottom-right corner!
  const currentView =
    previewMode === 'leads'
      ? 'leads'
      : previewMode === 'login'
      ? 'login'
      : isAuthenticated
      ? 'leads'
      : 'leads' // Default directly to LeadsPage so user immediately sees Treki Travels CRM Leads!

  return (
    <div className="relative">
      {/* Top/Floating Quick View Switcher for easy testing */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-slate-900/90 text-white shadow-xl backdrop-blur-md border border-slate-700/60 text-xs">
        <button
          type="button"
          onClick={() => setPreviewMode('leads')}
          className={`px-3 py-1 rounded-full font-semibold transition ${
            currentView === 'leads'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Treki Leads CRM
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode('login')}
          className={`px-3 py-1 rounded-full font-semibold transition ${
            currentView === 'login'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Login Screen
        </button>
      </div>

      {currentView === 'leads' ? <LeadsPage /> : <AuthPage />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <LeadsProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </LeadsProvider>
    </AuthProvider>
  )
}
