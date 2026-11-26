import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { LoginForm } from './components/LoginForm'
import { SignUpForm } from './components/SignUpForm'
import { ResetPasswordForm } from './components/ResetPasswordForm'
import { useRouter } from '../../context/RouterContext'
import './auth.css'

export function AuthPage() {
  const { path, navigate } = useRouter()
  const isSignup = path === '/signup' || path === '/register'
  const superAdmin = path.startsWith('/super-admin/')
  const loginPath = superAdmin ? '/super-admin/login' : '/login'
  const isReset = path === '/forgot-password' || path === '/super-admin/forgot-password'
  const mode = isSignup ? 'signup' : isReset ? 'reset' : 'login'

  useEffect(() => {
    document.title = `${isSignup ? 'Sign up' : isReset ? 'Reset password' : superAdmin ? 'Super Admin sign in' : 'Sign in'} · GrowMe`
    window.scrollTo(0, 0)
  }, [isSignup, isReset, superAdmin])

  return (
    <div className="growme-auth">
      <header className="growme-auth-top">
        <a href="/"><ArrowLeft size={16} /> Back to GrowMe</a>
      </header>

      <main className="growme-auth-stage">
        <div className={`growme-auth-card growme-auth-card-${mode}`}>
          <a className="growme-auth-brand" href="/" aria-label="GrowMe home">
            <img src="/marketing/growme-logo.png" alt="GrowMe" width={138} height={46} />
          </a>

          <div className="growme-auth-content" key={path}>
            {isSignup ? (
              <SignUpForm onNavigateLogin={() => navigate('/login')} />
            ) : isReset ? (
              <ResetPasswordForm onNavigateLogin={() => navigate(loginPath)} />
            ) : (
              <LoginForm
                superAdmin={superAdmin}
                onNavigateForgotPassword={() => navigate(superAdmin ? '/super-admin/forgot-password' : '/forgot-password')}
                onNavigateRegister={superAdmin ? undefined : () => navigate('/signup')}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
