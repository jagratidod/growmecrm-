import React, { useState, useEffect, useRef } from 'react'
import { Mail, Lock, KeyRound, ArrowLeft, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { useToast } from '../../../components/ui/Toast'
import { authService } from '../../../services/authService'

interface ResetPasswordFormProps {
  onNavigateLogin: () => void
  initialEmail?: string
}

type Step = 'REQUEST_OTP' | 'VERIFY_OTP' | 'SUCCESS'

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onNavigateLogin,
  initialEmail = '',
}) => {
  const { toast } = useToast()

  const [step, setStep] = useState<Step>('REQUEST_OTP')
  const [email, setEmail] = useState(initialEmail)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    otp?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  // Resend OTP countdown timer
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (step === 'VERIFY_OTP' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [step, countdown])

  // Focus the first OTP input when navigating to step 2
  useEffect(() => {
    if (step === 'VERIFY_OTP') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 100)
    }
  }, [step])

  const validateEmail = (): boolean => {
    const errs: typeof errors = {}
    if (!email.trim()) {
      errs.email = 'Please enter your email address'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateReset = (): boolean => {
    const errs: typeof errors = {}
    const fullOtp = otpDigits.join('')

    if (fullOtp.length < 6) {
      errs.otp = 'Please enter the complete 6-digit verification code'
    }

    if (!newPassword) {
      errs.newPassword = 'New password is required'
    } else if (newPassword.length < 12) {
      errs.newPassword = 'Password must be at least 12 characters'
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm your new password'
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // 1. Handle Send OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!validateEmail()) return

    setIsLoading(true)
    try {
      const response = await authService.forgotPassword(email.trim())
      toast({
        type: 'success',
        title: 'Verification Code Sent',
        description: response.message || `A 6-digit OTP has been sent to ${email.trim()}`,
      })
      setStep('VERIFY_OTP')
      setCountdown(60)
      setCanResend(false)
      setOtpDigits(['', '', '', '', '', ''])
      setErrors({})
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Error Sending OTP',
        description: err?.message || 'Unable to send OTP. Please check your email and try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP digit entry & auto-advancing
  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '')
    if (!cleaned) {
      const newDigits = [...otpDigits]
      newDigits[index] = ''
      setOtpDigits(newDigits)
      return
    }

    // If pasted multiple digits
    if (cleaned.length > 1) {
      const pasteDigits = cleaned.slice(0, 6).split('')
      const newDigits = [...otpDigits]
      pasteDigits.forEach((digit, i) => {
        if (i < 6) newDigits[i] = digit
      })
      setOtpDigits(newDigits)
      const nextFocus = Math.min(pasteDigits.length, 5)
      otpInputRefs.current[nextFocus]?.focus()
      return
    }

    const newDigits = [...otpDigits]
    newDigits[index] = cleaned[cleaned.length - 1]
    setOtpDigits(newDigits)

    if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }))

    // Auto-focus next field
    if (index < 5 && cleaned) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  // 2. Handle Reset Password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateReset()) return

    setIsLoading(true)
    try {
      const fullOtp = otpDigits.join('')
      const response = await authService.resetPassword({
        email: email.trim(),
        otp: fullOtp,
        newPassword,
      })

      toast({
        type: 'success',
        title: 'Password Reset Successful',
        description: response.message || 'You can now sign in with your new password.',
      })

      setStep('SUCCESS')
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Reset Failed',
        description: err?.message || 'Verification failed. Please check the OTP and try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // STEP 3: SUCCESS STATE
  if (step === 'SUCCESS') {
    return (
      <div className="w-full max-w-sm sm:max-w-md mx-auto py-8 text-center animate-fade-in">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-9 h-9 text-emerald-600 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
          Password Reset Complete!
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-8 max-w-xs mx-auto">
          Your password has been securely updated. You can now log into your account using your new credentials.
        </p>

        <Button
          type="button"
          onClick={onNavigateLogin}
          variant="primary"
          size="lg"
          fullWidth
          className="bg-brand hover:bg-brand-hover py-3.5 text-sm font-semibold rounded-xl tracking-wide shadow-md shadow-brand/20"
        >
          Sign in to CRM
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto py-8">
      {/* Back button */}
      <button
        type="button"
        onClick={onNavigateLogin}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand transition-colors mb-6 focus:outline-none group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Sign in
      </button>

      {/* Header matching theme */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
          {step === 'REQUEST_OTP' ? 'Reset Password' : 'Verify Code'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-normal">
          {step === 'REQUEST_OTP'
            ? 'Enter your registered email and we will send a 6-digit verification code.'
            : `Enter the 6-digit code sent to ${email} and choose your new password.`}
        </p>
      </div>

      {step === 'REQUEST_OTP' ? (
        /* STEP 1: ENTER EMAIL TO REQUEST OTP */
        <form onSubmit={handleRequestOtp} className="space-y-5" noValidate>
          <div>
            <Input
              id="reset-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Registered Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              leftIcon={<Mail className="w-5 h-5 text-slate-700 stroke-[2.2]" />}
              error={errors.email}
              autoFocus
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="bg-brand hover:bg-brand-hover py-3.5 text-sm font-semibold rounded-xl tracking-wide shadow-md shadow-brand/20 active:scale-[0.99]"
            >
              Send Verification Code
            </Button>
          </div>

          <div className="pt-3 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand" />
              Secured with Gmail SMTP & Instant OTP Delivery
            </p>
          </div>
        </form>
      ) : (
        /* STEP 2: ENTER OTP & NEW PASSWORD */
        <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
          {/* 6 Digit OTP Input Boxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
              6-Digit Verification Code
            </label>
            <div className="flex justify-between gap-1.5 sm:gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className={`w-11 sm:w-12 h-12 text-center text-lg font-bold rounded-xl bg-[#f3f4f6] text-slate-800 transition-all border ${
                    errors.otp
                      ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                      : 'border-transparent focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20'
                  } focus:outline-none`}
                />
              ))}
            </div>
            {errors.otp && (
              <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-600 inline-block"></span>
                {errors.otp}
              </p>
            )}

            {/* Resend OTP button */}
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-xs text-slate-400">Didn't receive the email?</span>
              <button
                type="button"
                disabled={!canResend || isLoading}
                onClick={() => handleRequestOtp()}
                className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
                  canResend && !isLoading
                    ? 'text-brand hover:underline cursor-pointer'
                    : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <Input
              id="new-password"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="New Password (min 12 chars)"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }))
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
              error={errors.newPassword}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
              }}
              leftIcon={<KeyRound className="w-5 h-5 text-slate-700 stroke-[2.2]" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[11px] font-bold text-slate-600 hover:text-blue-600 tracking-wider uppercase py-1 px-1.5 transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? 'HIDE' : 'SHOW'}
                </button>
              }
              error={errors.confirmPassword}
            />
          </div>

          {/* Submit Reset Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="bg-brand hover:bg-brand-hover py-3.5 text-sm font-semibold rounded-xl tracking-wide shadow-md shadow-brand/20 active:scale-[0.99]"
            >
              Reset Password
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
