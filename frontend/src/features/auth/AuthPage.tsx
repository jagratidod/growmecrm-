import React, { useState } from 'react'
import { AuthHeroPanel } from './components/AuthHeroPanel'
import { LoginForm } from './components/LoginForm'
import { ResetPasswordForm } from './components/ResetPasswordForm'

interface AuthPageProps {
  onSuccess?: () => void
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'forgot-password'>('login')

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row overflow-x-hidden font-sans">
      {/* LEFT BRAND VISUAL PANEL */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center">
        <AuthHeroPanel
          title="WELCOME"
          headline="YOUR HEADLINE NAME"
          description="Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam."
        />
      </div>

      {/* RIGHT AUTH FORM PANEL */}
      <div className="w-full lg:w-1/2 relative bg-white flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 overflow-hidden">
        {/* Decorative 3D purple sphere at bottom-right corner matching theme */}
        <div
          className="absolute -bottom-24 -right-24 sm:-bottom-28 sm:-right-28 w-60 sm:w-72 h-60 sm:h-72 rounded-full pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle at 35% 32%, #6d4fa8 0%, #453372 50%, #231640 90%)',
            boxShadow: '0 20px 50px rgba(25, 12, 45, 0.35)',
          }}
        />

        {/* Main interactive form */}
        <div className="w-full relative z-10 transition-all duration-300">
          {authMode === 'login' ? (
            <LoginForm
              onSuccess={onSuccess}
              onNavigateForgotPassword={() => setAuthMode('forgot-password')}
            />
          ) : (
            <ResetPasswordForm
              onNavigateLogin={() => setAuthMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
