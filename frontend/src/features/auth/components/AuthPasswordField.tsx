import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '../../../components/ui/Input'
import type { InputProps } from '../../../components/ui/Input'

export function AuthPasswordField({ label, error, ...props }: InputProps) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye

  return (
    <Input
      {...props}
      label={label}
      error={error}
      aria-invalid={Boolean(error)}
      containerClassName="growme-auth-field"
      type={visible ? 'text' : 'password'}
      rightElement={
        <button
          type="button"
          className="growme-auth-password-toggle"
          aria-label={`${visible ? 'Hide' : 'Show'} ${label?.toLowerCase() || 'password'}`}
          onClick={() => setVisible(!visible)}
        >
          <Icon size={18} aria-hidden="true" />
        </button>
      }
    />
  )
}
