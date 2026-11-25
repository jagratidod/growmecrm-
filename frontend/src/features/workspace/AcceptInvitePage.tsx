import { useState } from 'react'
import { useRouter } from '../../context/RouterContext'
import { apiBase } from './workspaceApi'

export function AcceptInvitePage() {
  const { navigate } = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const token = new URLSearchParams(window.location.search).get('token')
  return <div className="growme-auth">
    <main className="growme-auth-stage">
    <form className="growme-auth-card gm-form" onSubmit={async (event) => {
      event.preventDefault()
      const fields = Object.fromEntries(new FormData(event.currentTarget))
      setBusy(true); setError('')
      try {
        const response = await fetch(`${apiBase}/auth/accept-invite`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, ...fields }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Could not accept invitation.')
        navigate('/login', { replace: true })
      } catch (error) { setError((error as Error).message) }
      finally { setBusy(false) }
    }}>
      <h1 className="text-2xl font-bold">Join your GrowMe workspace</h1>
      {error && <p className="gm-error" role="alert">{error}</p>}
      {!token && <p className="gm-error" role="alert">Use the invitation link provided by your workspace admin.</p>}
      <label>Full name<input name="name" required /></label>
      <label>Password<input type="password" name="password" required minLength={12} autoComplete="new-password" /></label>
      <button className="gm-button" disabled={busy || !token}>Accept invitation</button>
    </form>
    </main>
  </div>
}
