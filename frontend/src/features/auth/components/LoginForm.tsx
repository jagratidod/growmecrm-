import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Checkbox } from '../../../components/ui/Checkbox'
import { useAuth } from '../../../context/AuthContext'
import { AuthPasswordField } from './AuthPasswordField'

interface LoginFormProps {
  onNavigateForgotPassword: () => void
  onNavigateRegister: () => void
}

export function LoginForm({ onNavigateForgotPassword, onNavigateRegister }: LoginFormProps) {
  const { login, isLoading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [errors, setErrors] = useState<{ username?: string; password?: string; form?: string }>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const issues: typeof errors = {}
    if (!username.trim()) issues.username = 'Enter your email or username.'
    if (!password) issues.password = 'Enter your password.'
    setErrors(issues)
    if (Object.keys(issues).length) return

    try {
      await login({ username: username.trim(), password, rememberMe })
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Could not sign in. Try again.' })
    }
  }

  return (
    <>
      <div className="growme-auth-heading">
        <h1>Sign in</h1>
        <p>Open your GrowMe workspace.</p>
      </div>

      <form onSubmit={handleSubmit} className="growme-auth-form" noValidate>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          label="Email or username"

          value={username}
          required
          aria-invalid={Boolean(errors.username)}
          containerClassName="growme-auth-field"
          onChange={(event) => {
            setUsername(event.target.value)
            setErrors((previous) => ({ ...previous, username: undefined, form: undefined }))
          }}
          error={errors.username}
        />

        <AuthPasswordField
          id="password"
          name="password"
          autoComplete="current-password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          required
          onChange={(event) => {
            setPassword(event.target.value)
            setErrors((previous) => ({ ...previous, password: undefined, form: undefined }))
          }}
          error={errors.password}
        />

        <div className="growme-auth-form-options">
          <Checkbox id="remember-me" name="remember" label="Remember me" checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)} />
          <button type="button" className="growme-auth-link" onClick={onNavigateForgotPassword}>Forgot password?</button>
        </div>

        {errors.form && <p className="growme-auth-error" role="alert">{errors.form}</p>}
        <Button type="submit" fullWidth isLoading={isLoading} className="growme-auth-submit" rightIcon={<ArrowRight size={17} />}>
          Sign in
        </Button>
      </form>

      <div className="growme-auth-switch">
        <span>New to GrowMe?</span>
        <button type="button" className="growme-auth-secondary" onClick={onNavigateRegister}>Create an account</button>
      </div>
    </>
  )
}
