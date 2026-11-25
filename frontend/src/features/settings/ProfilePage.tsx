import React, { useState, useEffect } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { profileService } from '../../services/profileService'
import { organizationService } from '../../services/organizationService'
import { Menu, Check } from 'lucide-react'

interface ProfilePageProps {
  onNavigateMenu?: (menu: string) => void
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigateMenu }) => {
  const { user, updateUser } = useAuth()
  const { profile, updateProfile, organization, updateOrganization } = useSettings()
  const { toast } = useToast()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const storedAgency = typeof window !== 'undefined' ? localStorage.getItem('crm_current_agency') : null
  const activeOrg =
    user?.organizationName && user.organizationName !== 'Treki Travels'
      ? user.organizationName
      : storedAgency && storedAgency !== 'Treki Travels'
      ? storedAgency
      : organization?.agencyName && organization.agencyName !== 'Treki Travels'
      ? organization.agencyName
      : 'GrowMe CRM'

  // Derive active display values with priority to logged-in user
  const activeFullName = user?.name || profile.fullName || 'User'
  const activeEmail = user?.email || profile.email || 'user@agency.com'
  const activeRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : (profile.role || 'Owner')
  const activeMemberSince = user?.memberSince || profile.memberSince || 'Today'
  const activeLastSignIn = user?.lastSignIn || profile.lastSignIn || 'Just now'

  // Personal details state
  const [fullName, setFullName] = useState(activeFullName)
  const [email, setEmail] = useState(activeEmail)
  const [savedPersonal, setSavedPersonal] = useState(false)

  useEffect(() => {
    if (user?.name) setFullName(user.name)
    if (user?.email) setEmail(user.email)
  }, [user])

  useEffect(() => {
    profileService
      .getProfile()
      .then((data) => {
        if (data) {
          if (data.fullName) setFullName(data.fullName)
          if (data.email) setEmail(data.email)
          if (data.organization && data.organization !== 'Treki Travels') {
            updateOrganization({ agencyName: data.organization })
            if (updateUser) {
              updateUser({ organizationName: data.organization })
            }
          }
        }
      })
      .catch(() => {})

    organizationService
      .getOrganization()
      .then((org) => {
        const orgName = org?.agencyName || org?.name
        if (orgName && orgName !== 'Treki Travels') {
          updateOrganization({ agencyName: orgName })
          if (updateUser) {
            updateUser({ organizationName: orgName })
          }
        }
      })
      .catch(() => {})
  }, [])

  const initials = (activeFullName || 'User')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'US'

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savedPassword, setSavedPassword] = useState(false)

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({ fullName, email })
    if (updateUser) {
      updateUser({ name: fullName, email })
    }
    setSavedPersonal(true)
    toast({
      type: 'success',
      title: 'Profile Updated',
      description: 'Your personal details have been saved successfully.',
    })
    setTimeout(() => setSavedPersonal(false), 2500)
  }

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (!currentPassword) {
      setPasswordError('Please enter your current password')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    setSavedPassword(true)
    toast({
      type: 'success',
      title: 'Password Changed',
      description: 'Your password has been updated successfully.',
    })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setSavedPassword(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      {/* Sidebar with active My profile cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="My profile"
        onSelectMenu={onNavigateMenu}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {/* Mobile Top Bar */}
          <div className="lg:hidden flex items-center justify-between mb-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-slate-800">My Profile</h1>
            <div className="w-8" />
          </div>

          {/* Grid Layout matching Screenshot 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            {/* LEFT COLUMN: Identity Profile Card (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between">
              <div>
                {/* Top Gradient Banner */}
                <div className="h-28 bg-gradient-to-r from-[#453372] via-[#543b8c] to-[#6366f1] relative">
                  {/* Avatar centered on banner bottom border */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-[#453372] text-white ring-4 ring-white flex items-center justify-center font-black text-lg tracking-wide shadow-md">
                    {initials}
                  </div>
                </div>

                {/* User Info */}
                <div className="pt-11 pb-5 px-6 text-center">
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">
                    {activeFullName}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {activeEmail}
                  </p>

                  <div className="mt-3">
                    <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-purple-50 text-[#453372] border border-purple-200">
                      {activeRole}
                    </span>
                  </div>
                </div>

                {/* Meta details list */}
                <div className="px-6 py-4 border-t border-slate-100 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Organization</span>
                    <span className="font-bold text-slate-800">{activeOrg}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Member since</span>
                    <span className="font-bold text-slate-800">{activeMemberSince}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Last sign-in</span>
                    <span className="font-bold text-slate-800">{activeLastSignIn}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Forms (8 cols) */}
            <div className="lg:col-span-8 space-y-5 sm:space-y-6">
              {/* Card 1: Personal Details */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs">
                <div className="mb-5">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">
                    Personal details
                  </h3>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">
                    Update how your name appears across the workspace.
                  </p>
                </div>

                <form onSubmit={handleSavePersonal} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#453372] hover:bg-[#382760] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#453372]/30 transition active:scale-[0.99] flex items-center gap-1.5"
                    >
                      {savedPersonal ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <span>Save changes</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 2: Password */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs">
                <div className="mb-5">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">
                    Password
                  </h3>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">
                    Choose a strong password you don't use elsewhere.
                  </p>
                </div>

                <form onSubmit={handleSavePassword} className="space-y-4">
                  {passwordError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                      {passwordError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Current password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        New password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Confirm new password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#453372] hover:bg-[#382760] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#453372]/30 transition active:scale-[0.99] flex items-center gap-1.5"
                    >
                      {savedPassword ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Password Changed!</span>
                        </>
                      ) : (
                        <span>Change password</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
