import React, { useState, useEffect } from 'react'
import { AuthHeroPanel } from './components/AuthHeroPanel'
import { LoginForm } from './components/LoginForm'
import { SignUpForm } from './components/SignUpForm'
import { ResetPasswordForm } from './components/ResetPasswordForm'
import { useRouter } from '../../context/RouterContext'

interface AuthPageProps {
  onSuccess?: () => void
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { path, navigate } = useRouter()

  const getInitialMode = (): 'login' | 'register' | 'forgot-password' => {
    if (path === '/signup' || path === '/register') return 'register'
    if (path === '/forgot-password') return 'forgot-password'
    return 'login'
  }

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>(getInitialMode)

  useEffect(() => {
    if (path === '/signup' || path === '/register') {
      setAuthMode('register')
    } else if (path === '/forgot-password') {
      setAuthMode('forgot-password')
    } else if (path === '/login') {
      setAuthMode('login')
    }
  }, [path])

  const switchTo = (mode: 'login' | 'register' | 'forgot-password') => {
    setAuthMode(mode)
    if (mode === 'login') navigate('/login')
    else if (mode === 'register') navigate('/signup')
    else if (mode === 'forgot-password') navigate('/forgot-password')
  }

  const heroDetails = {
    login: {
      title: 'WELCOME',
      headline: 'GROWME CRM WORKSPACE',
      description:
        'Track and manage every travel enquiry in one place — connect WhatsApp, Instagram, and website forms with automated follow-ups.',
    },
    register: {
      title: 'GET STARTED',
      headline: 'CREATE YOUR WORKSPACE',
      description:
        'Launch your travel agency workspace in seconds. Automatically capture leads from Meta Ads, WhatsApp chats, and landing page forms.',
    },
    'forgot-password': {
      title: 'RECOVER',
      headline: 'PASSWORD ASSISTANCE',
      description:
        'Enter your registered email address to receive an instant verification code and regain secure access to your CRM.',
    },
  }[authMode]

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row overflow-x-hidden font-sans">
      {/* LEFT BRAND VISUAL PANEL */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center">
        <AuthHeroPanel
          title={heroDetails.title}
          headline={heroDetails.headline}
          description={heroDetails.description}
        />
      </div>

      {/* RIGHT AUTH FORM PANEL */}
      <div className="w-full lg:w-1/2 relative bg-white flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 overflow-hidden min-h-screen">
        {/* Decorative 3D purple sphere at bottom-right corner matching theme */}
        <div
          className="absolute -bottom-24 -right-24 sm:-bottom-28 sm:-right-28 w-60 sm:w-72 h-60 sm:h-72 rounded-full pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle at 35% 32%, #6d4fa8 0%, #453372 50%, #231640 90%)',
            boxShadow: '0 20px 50px rgba(25, 12, 45, 0.35)',
          }}
        />

        {/* Top Mode Segmented Switcher (Login vs Sign Up) */}
        {authMode !== 'forgot-password' && (
          <div className="w-full max-w-sm sm:max-w-md mx-auto mb-2 relative z-10 flex p-1 bg-[#f3f4f8] rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => switchTo('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'login'
                  ? 'bg-white text-[#453372] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In (Login)
            </button>
            <button
              type="button"
              onClick={() => switchTo('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'register'
                  ? 'bg-white text-[#453372] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up (Register)
            </button>
          </div>
        )}

        {/* Main interactive form */}
        <div className="w-full relative z-10 transition-all duration-300">
          {authMode === 'login' && (
            <LoginForm
              onSuccess={onSuccess}
              onNavigateForgotPassword={() => switchTo('forgot-password')}
              onNavigateRegister={() => switchTo('register')}
            />
          )}

          {authMode === 'register' && (
            <SignUpForm
              onSuccess={onSuccess}
              onNavigateLogin={() => switchTo('login')}
            />
          )}

          {authMode === 'forgot-password' && (
            <ResetPasswordForm
              onNavigateLogin={() => switchTo('login')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
