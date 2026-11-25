import React, { useState } from 'react'
import {
  User as UserIcon,
  Lock,
  Building2,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Checkbox } from '../../../components/ui/Checkbox'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../components/ui/Toast'

interface SignUpFormProps {
  onSuccess?: () => void
  onNavigateLogin?: () => void
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSuccess,
  onNavigateLogin,
}) => {
  const { register, isLoading } = useAuth()
  const { toast } = useToast()

  const [agencyName, setAgencyName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const [errors, setErrors] = useState<{
    agencyName?: string
    name?: string
    email?: string
    phone?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})

  const validate = (): boolean => {
    const newErrors: typeof errors = {}

    if (!agencyName.trim()) {
      newErrors.agencyName = 'Please enter your agency or company name'
    }

    if (!name.trim()) {
      newErrors.name = 'Please enter your full name'
    }

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Please create a password'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!agreeTerms) {
      newErrors.terms = 'Please accept the Terms of Service & Privacy Policy to continue'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await register({
        agencyName: agencyName.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      })

      toast({
        type: 'success',
        title: 'Account created successfully!',
        description: `Welcome to GrowMe CRM, ${name}! Your workspace "${agencyName}" is ready.`,
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      toast({
        type: 'error',
        title: 'Sign Up Failed',
        description: msg,
      })
    }
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto py-4">
      {/* Form Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-[#453372] text-[11px] font-bold uppercase tracking-wider mb-2">
          <CheckCircle2 className="w-3.5 h-3.5" /> 14-Day Free Starter Trial
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Create Agency Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
          Get started with multi-channel leads tracking, team CRM, and automated workflows.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Agency / Company Name */}
        <div>
          <Input
            id="agencyName"
            name="agencyName"
            type="text"
            placeholder="Agency / Business Name"
            value={agencyName}
            onChange={(e) => {
              setAgencyName(e.target.value)
              if (errors.agencyName) setErrors((prev) => ({ ...prev, agencyName: undefined }))
            }}
            leftIcon={<Building2 className="w-5 h-5 text-slate-700 stroke-[2.2]" />}
            error={errors.agencyName}
          />
        </div>

        {/* Your Name */}
        <div>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your Full Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
            }}
            leftIcon={<UserIcon className="w-5 h-5 text-slate-700 stroke-[2.2]" />}
            error={errors.name}
          />
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Business Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              leftIcon={<Mail className="w-5 h-5 text-slate-700 stroke-[2.2]" />}
              error={errors.email}
            />
          </div>

          <div>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Phone Number (Optional)"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }))
              }}
              leftIcon={<Phone className="w-5 h-5 text-slate-700 stroke-[2.2]" />}
              error={errors.phone}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Create Password (min. 6 characters)"
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
                className="text-[11px] font-bold text-slate-600 hover:text-purple-700 tracking-wider uppercase py-1 px-1.5 transition-colors focus:outline-none"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            }
            error={errors.password}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
            }}
            leftIcon={<Lock className="w-5 h-5 text-slate-700 stroke-[2.2]" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-[11px] font-bold text-slate-600 hover:text-purple-700 tracking-wider uppercase py-1 px-1.5 transition-colors focus:outline-none"
              >
                {showConfirmPassword ? 'HIDE' : 'SHOW'}
              </button>
            }
            error={errors.confirmPassword}
          />
        </div>

        {/* Terms and Conditions */}
        <div className="pt-1">
          <Checkbox
            id="agree-terms"
            name="agreeTerms"
            label="I agree to the Terms of Service & Privacy Policy"
            checked={agreeTerms}
            onChange={(e) => {
              setAgreeTerms(e.target.checked)
              if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }))
            }}
          />
          {errors.terms && (
            <p className="text-[11px] text-red-500 mt-1 pl-1">{errors.terms}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="bg-[#453372] hover:bg-[#382760] py-3.5 text-sm font-semibold rounded-xl tracking-wide shadow-md shadow-[#453372]/20 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Create Workspace & Start</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Switch to Sign In */}
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-xs font-bold text-[#453372] hover:text-[#382760] hover:underline transition focus:outline-none"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  )
}
