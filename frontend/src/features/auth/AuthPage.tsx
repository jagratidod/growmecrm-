import React from 'react'
import { AuthHeroPanel } from './components/AuthHeroPanel'
import { LoginForm } from './components/LoginForm'
import { useToast } from '../../components/ui/Toast'

interface AuthPageProps {
  onSuccess?: () => void
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { toast } = useToast()

  const handleForgotPassword = () => {
    toast({
      type: 'info',
      title: 'Reset Password',
      description: 'A password reset link will be sent to your registered email address.',
    })
  }

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
        {/* Decorative 3D blue sphere at bottom-right corner matching reference */}
        <div
          className="absolute -bottom-24 -right-24 sm:-bottom-28 sm:-right-28 w-60 sm:w-72 h-60 sm:h-72 rounded-full pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle at 35% 32%, #1b73e5 0%, #0d54b8 50%, #05306e 90%)',
            boxShadow: '0 20px 50px rgba(1, 23, 56, 0.35)',
          }}
        />

        {/* Main interactive form */}
        <div className="w-full relative z-10">
          <LoginForm onSuccess={onSuccess} onNavigateForgotPassword={handleForgotPassword} />
        </div>
      </div>
    </div>
  )
}
