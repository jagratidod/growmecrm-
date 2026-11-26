import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Menu, UserRound } from 'lucide-react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../components/ui/Toast'
import { profileService, type ProfileDetailsResponse } from '../../services/profileService'

export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { updateProfile } = useSettings()
  const { toast } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [details, setDetails] = useState<ProfileDetailsResponse>()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [savingDetails, setSavingDetails] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    let active = true
    profileService.getProfile().then(
      (profile) => { if (active) setDetails(profile) },
      (error: Error) => { if (active) setProfileError(error.message) },
    )
    return () => { active = false }
  }, [])

  async function saveDetails(event: FormEvent) {
    event.preventDefault()
    const fullName = name.trim()
    const updatedEmail = email.trim()
    if (savingDetails || !fullName || !updatedEmail) return
    setSavingDetails(true)
    setProfileError('')
    try {
      const saved = await profileService.updateProfile({ fullName, email: updatedEmail })
      setName(saved.fullName)
      setEmail(saved.email)
      updateProfile({ fullName: saved.fullName, email: saved.email })
      updateUser({ name: saved.fullName, email: saved.email })
      if (details) setDetails({ ...details, fullName: saved.fullName, email: saved.email })
      toast({ type: 'success', title: 'Profile saved' })
    } catch (error) {
      setProfileError((error as Error).message)
    } finally {
      setSavingDetails(false)
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault()
    if (savingPassword) return
    if (newPassword !== confirmation) {
      setPasswordError('The new passwords do not match.')
      return
    }
    setPasswordError('')
    setSavingPassword(true)
    try {
      await profileService.changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmation('')
      toast({ type: 'success', title: 'Password changed' })
    } catch (error) {
      setPasswordError((error as Error).message)
    } finally {
      setSavingPassword(false)
    }
  }

  return <div className="gm-shell">
    <LeadsSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    <main className="gm-main gm-crm-content">
      <header className="gm-heading gm-row">
        <div className="flex items-center gap-2">
          <button className="gm-mobile gm-icon-button" type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
          <h1>My profile</h1>
        </div>
      </header>
      <div className="gm-profile-layout">
        <aside className="gm-card gm-profile-card">
          <UserRound size={23} aria-hidden="true" />
          <h2>{user?.name || details?.fullName || 'Account'}</h2>
          <p>{user?.email || details?.email}</p>
          <dl>
            <div><dt>Workspace</dt><dd>{details?.organization || user?.organizationName || 'GrowMe'}</dd></div>
            <div><dt>Role</dt><dd className="capitalize">{user?.role || details?.role}</dd></div>
            {details?.memberSince && <div><dt>Member since</dt><dd>{details.memberSince}</dd></div>}
            {details?.lastSignIn && <div><dt>Last sign-in</dt><dd>{details.lastSignIn}</dd></div>}
          </dl>
        </aside>
        <div className="gm-profile-forms">
          <form className="gm-card" onSubmit={saveDetails}>
            <h2>Personal details</h2>
            <label>Full name<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label>Sign-in email<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            {profileError && <p className="gm-error" role="alert">{profileError}</p>}
            <button className="gm-button" type="submit" disabled={savingDetails || !name.trim() || !email.trim() || (name.trim() === user?.name && email.trim() === user?.email)}>{savingDetails ? 'Saving…' : 'Save changes'}</button>
          </form>
          <form className="gm-card" onSubmit={savePassword}>
            <h2>Password</h2>
            <label>Current password<input type="password" required autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
            <label>New password<input type="password" required minLength={6} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
            <label>Confirm new password<input type="password" required minLength={6} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
            {passwordError && <p className="gm-error" role="alert">{passwordError}</p>}
            <button className="gm-button" type="submit" disabled={savingPassword}>{savingPassword ? 'Updating…' : 'Change password'}</button>
          </form>
        </div>
      </div>
    </main>
  </div>
}
