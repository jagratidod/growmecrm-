import React, { useState, useEffect } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { uploadService } from '../../services/uploadService'
import {
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  Image as ImageIcon,
  Menu,
  Check,
} from 'lucide-react'

interface OrganizationPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const OrganizationPage: React.FC<OrganizationPageProps> = ({ onNavigateMenu }) => {
  const { organization, updateOrganization } = useSettings()
  const { user, updateUser } = useAuth()
  const { toast } = useToast()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Local form state
  const defaultOrgName =
    user?.organizationName
      ? user.organizationName
      : organization.agencyName
      ? organization.agencyName
      : 'GrowMe CRM'
  const [agencyName, setAgencyName] = useState(defaultOrgName)
  const [logoUrl, setLogoUrl] = useState(organization.logoUrl || '')
  const [primaryColor, setPrimaryColor] = useState(organization.primaryColor || '#4F46E5')
  const [secondaryColor, setSecondaryColor] = useState(organization.secondaryColor || '#0D9488')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const validOrg =
      user?.organizationName
        ? user.organizationName
        : organization.agencyName
        ? organization.agencyName
        : 'GrowMe CRM'
    setAgencyName(validOrg)
    setLogoUrl(organization.logoUrl || '')
    setPrimaryColor(organization.primaryColor || '#4F46E5')
    setSecondaryColor(organization.secondaryColor || '#0D9488')
  }, [organization, user])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast({ title: 'Uploading logo to Cloudinary...', type: 'info' })
      try {
        const cdnUrl = await uploadService.uploadImage(file, 'branding')
        setLogoUrl(cdnUrl)
        toast({ title: 'Logo uploaded and stored in Cloudinary', type: 'success' })
      } catch (err) {
        toast({ title: 'Failed to process logo image', type: 'error' })
      }
    }
  }

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return
    setLogoUrl(urlInput.trim())
    setUrlInput('')
    setShowUrlInput(false)
    toast({ title: 'Logo URL applied', type: 'success' })
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agencyName.trim()) {
      toast({ title: 'Please enter an agency name', type: 'error' })
      return
    }

    setIsSaving(true)
    try {
      await updateOrganization({
        agencyName: agencyName.trim(),
        logoUrl: logoUrl.trim(),
        primaryColor,
        secondaryColor,
      })

      if (updateUser) {
        updateUser({ organizationName: agencyName.trim() })
      }

      setIsSaved(true)
      toast({
        type: 'success',
        title: 'Organization Updated',
        description: 'Your agency branding has been saved across the workspace.',
      })
      setTimeout(() => setIsSaved(false), 2500)
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Update Failed',
        description: err.message || 'Could not update organization settings.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const initials = agencyName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'TT'

  return (
    <div className="min-h-screen bg-canvas flex text-slate-800 font-sans">
      {/* Sidebar with active Organization cutout under SETTINGS */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Organization"
        onSelectMenu={onNavigateMenu}
      />

      {/* Main CRM Application Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">
              TT
            </div>
            <span className="font-bold text-sm text-slate-900">Organization</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Bar matching screenshot */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Organization
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Your agency's identity and branding.
            </p>
          </div>

          {/* Two-Column Grid matching screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: General Form (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <form onSubmit={handleSaveChanges} className="space-y-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    General
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                    These details appear across your workspace.
                  </p>
                </div>

                {/* Agency Name */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                    Agency name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="GrowMe CRM"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all bg-white"
                  />
                </div>

                {/* Logo Upload Dropzone */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                    Logo
                  </label>

                  {logoUrl ? (
                    <div className="w-48 h-32 rounded-2xl border border-slate-200 relative group overflow-hidden bg-slate-50 flex items-center justify-center p-3 shadow-2xs">
                      <img
                        src={logoUrl}
                        alt="Agency Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="p-2 rounded-xl bg-white text-slate-800 hover:bg-slate-100 cursor-pointer shadow-xs">
                          <ImageIcon className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
                          title="Remove logo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 hover:border-purple-300 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-colors bg-slate-50/40 relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-brand border border-purple-100 flex items-center justify-center mb-3 shadow-2xs pointer-events-none">
                        <UploadCloud className="w-6 h-6 stroke-[1.75]" />
                      </div>
                      <p className="text-sm font-bold text-slate-900 pointer-events-none">
                        Upload image
                      </p>
                      <p className="text-xs text-slate-400 mt-1 pointer-events-none">
                        Drag & drop or click · PNG/JPG/WEBP · max 5 MB
                      </p>
                    </div>
                  )}

                  {/* URL / Paste link option */}
                  <div className="pt-1">
                    {showUrlInput ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="url"

                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                        <button
                          type="button"
                          onClick={handleApplyUrl}
                          className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold"
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(true)}
                        className="text-xs text-brand hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>or paste an image URL</span>
                      </button>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      Upload a square image, or paste a link.
                    </p>
                  </div>
                </div>

                {/* Primary & Secondary Color Pickers matching screenshot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Primary Color */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                      Primary color
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative shrink-0">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white overflow-hidden"
                        />
                      </div>
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                      Secondary color
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative shrink-0">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white overflow-hidden"
                        />
                      </div>
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Changes Button */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <span>{isSaving ? 'Saving...' : 'Save changes'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Live preview Card (4 cols) matching screenshot */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden relative">
              {/* Top accent line matching screenshot */}
              <div
                className="h-1.5 w-full transition-colors duration-300"
                style={{
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                }}
              />

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Live preview
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    How your brand looks in the app.
                  </p>
                </div>

                {/* Brand Preview matching sidebar header */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div
                    className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black text-sm tracking-wide shadow-xs shrink-0 overflow-hidden transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
                      {agencyName}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Travel CRM
                    </p>
                  </div>
                </div>

                {/* Buttons and Badges Preview matching screenshot */}
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    style={{ backgroundColor: primaryColor }}
                    className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition-colors pointer-events-none"
                  >
                    Primary button
                  </button>

                  <span
                    style={{ backgroundColor: secondaryColor }}
                    className="px-3 py-1 rounded-lg text-white text-xs font-bold shadow-2xs transition-colors pointer-events-none"
                  >
                    Confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
