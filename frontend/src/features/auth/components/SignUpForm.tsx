import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Checkbox } from '../../../components/ui/Checkbox'
import { useAuth } from '../../../context/AuthContext'
import { AuthPasswordField } from './AuthPasswordField'

interface SignUpFormProps {
  onNavigateLogin: () => void
}

const initialValues = {
  agencyName: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

type Field = keyof typeof initialValues
type FormErrors = Partial<Record<Field | 'terms' | 'form', string>>

export function SignUpForm({ onNavigateLogin }: SignUpFormProps) {
  const { register, isLoading } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  function fieldProps(field: Field) {
    return {
      id: field,
      name: field,
      value: values[field],
      required: field !== 'phone',
      error: errors[field],
      'aria-invalid': Boolean(errors[field]),
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setValues((previous) => ({ ...previous, [field]: value }))
        setErrors((previous) => ({ ...previous, [field]: undefined, form: undefined }))
      },
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const { agencyName, name, email, phone, password, confirmPassword } = values
    const issues: FormErrors = {}
    if (!agencyName.trim()) issues.agencyName = 'Enter a business name.'
    if (!name.trim()) issues.name = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) issues.email = 'Enter a valid email address.'
    if (password.length < 6) issues.password = 'Use at least 6 characters.'
    if (password !== confirmPassword) issues.confirmPassword = 'Passwords do not match.'
    if (!agreeTerms) issues.terms = 'Accept the Terms of Service and Privacy Policy to continue.'
    setErrors(issues)
    if (Object.keys(issues).length) return

    try {
      await register({ agencyName: agencyName.trim(), name: name.trim(), email: email.trim(), phone: phone.trim(), password })
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Could not create your workspace. Try again.' })
    }
  }

  return (
    <>
      <div className="growme-auth-heading">
        <h1>Create a workspace</h1>
        <p>Set up GrowMe for your business.</p>
      </div>

      <form onSubmit={handleSubmit} className="growme-auth-form" noValidate>
        <div className="growme-auth-grid">
          <Input {...fieldProps('agencyName')} label="Business name" placeholder="Your business" autoComplete="organization"
            containerClassName="growme-auth-field" />
          <Input {...fieldProps('name')} label="Full name" placeholder="Your name" autoComplete="name"
            containerClassName="growme-auth-field" />
          <Input {...fieldProps('email')} label="Business email" type="email" autoComplete="email"
            containerClassName="growme-auth-field" />
          <Input {...fieldProps('phone')} label="Phone (optional)" placeholder="Phone number" type="tel" autoComplete="tel"
            containerClassName="growme-auth-field" />
          <AuthPasswordField {...fieldProps('password')} label="Password" placeholder="At least 6 characters" autoComplete="new-password" />
          <AuthPasswordField {...fieldProps('confirmPassword')} label="Confirm password" placeholder="Enter it again" autoComplete="new-password" />
        </div>
        <div className="growme-auth-consent">
          <Checkbox
            id="agree-terms"
            name="agreeTerms"
            checked={agreeTerms}
            aria-invalid={Boolean(errors.terms)}
            onChange={(event) => {
              setAgreeTerms(event.target.checked)
              setErrors((previous) => ({ ...previous, terms: undefined }))
            }}
            label={<>I agree to the <a href="/terms-and-conditions" target="_blank" rel="noreferrer">Terms of Service</a> and <a href="/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>.</>}
          />
          {errors.terms && <p className="growme-auth-error" role="alert">{errors.terms}</p>}
        </div>

        {errors.form && <p className="growme-auth-error" role="alert">{errors.form}</p>}
        <Button type="submit" fullWidth isLoading={isLoading} className="growme-auth-submit" rightIcon={<ArrowRight size={17} />}>
          Create workspace
        </Button>
      </form>

      <div className="growme-auth-switch">
        <span>Already have an account?</span>
        <button type="button" className="growme-auth-secondary" onClick={onNavigateLogin}>Sign in</button>
      </div>
    </>
  )
}
