import React, { useState } from 'react'
import { User as UserIcon, Lock } from 'lucide-react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Checkbox } from '../../../components/ui/Checkbox'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../components/ui/Toast'

interface LoginFormProps {
  onSuccess?: () => void
  onNavigateForgotPassword?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onNavigateForgotPassword,
}) => {
  const { login, isLoading } = useAuth()
  const { toast } = useToast()

  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})

  const validate = (): boolean => {
    const newErrors: { username?: string; password?: string } = {}
    if (!username.trim()) {
      newErrors.username = 'Please enter your username'
    }
    if (!password) {
      newErrors.password = 'Please enter your password'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await login({ username, password, rememberMe })
      toast({
        type: 'success',
        title: 'Signed in successfully!',
        description: `Welcome back, ${username}! Redirecting to CRM dashboard...`,
      })
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials'
      toast({
        type: 'error',
        title: 'Authentication Failed',
        description: msg,
      })
    }
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto py-8">
      {/* Form Header matching reference image */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
          Sign in
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-normal">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* User Name input */}
        <div>
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="User Name"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }))
            }}
            leftIcon={<UserIcon className="w-5 h-5 text-slate-700 stroke-[2.2]" />}
            error={errors.username}
          />
        </div>

        {/* Password input */}
        <div>
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            leftIcon={<Lock className="w-5 h-5 text-slate-700 stroke-[2.2]" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-bold text-slate-600 hover:text-blue-600 tracking-wider uppercase py-1 px-1.5 transition-colors focus:outline-none"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            }
            error={errors.password}
          />
        </div>

        {/* Remember me & Forgot Password row */}
        <div className="flex items-center justify-between pt-1">
          <Checkbox
            id="remember-me"
            name="remember"
            label="Remember me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />

          <button
            type="button"
            onClick={onNavigateForgotPassword}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors focus:outline-none"
          >
            Forgot Password?
          </button>
        </div>

        {/* Primary Action Button: Sign in */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="bg-[#0b54b8] hover:bg-[#09479e] py-3.5 text-sm font-semibold rounded-xl tracking-wide shadow-md shadow-blue-800/20 active:scale-[0.99]"
          >
            Sign in
          </Button>
        </div>
      </form>

      {/* Demo helper pill */}
      <div className="mt-8 p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
        <p className="text-[11px] text-slate-500">
          <strong className="text-slate-700">Demo CRM Credentials:</strong> Username:{' '}
          <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded">admin</code> | Password:{' '}
          <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded">password123</code>
        </p>
      </div>
    </div>
  )
}
