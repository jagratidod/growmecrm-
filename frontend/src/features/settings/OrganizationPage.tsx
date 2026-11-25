import React, { useState, useEffect } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { uploadService } from '../../services/uploadService'
import { superAdminService } from '../../services/superAdminService'
import type { SubscriptionPlan } from '../../types/superAdmin.types'
import {
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  Image as ImageIcon,
  Menu,
  Check,
  Building2,
  CreditCard,
  Crown,
  ShieldCheck,
  Users,
  Database,
  ArrowRight,
} from 'lucide-react'

interface OrganizationPageProps {
  onNavigateMenu?: (menu: string) => void
  initialTab?: 'branding' | 'subscription'
}

export const OrganizationPage: React.FC<OrganizationPageProps> = ({
  onNavigateMenu,
  initialTab = 'branding',
}) => {
  const { organization, updateOrganization } = useSettings()
  const { user } = useAuth()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'branding' | 'subscription'>(initialTab)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Subscription state
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isUpgrading, setIsUpgrading] = useState(false)

  // Local branding form state
  const defaultOrgName =
    user?.organizationName && user.organizationName !== 'Treki Travels'
      ? user.organizationName
      : organization.agencyName && organization.agencyName !== 'Treki Travels'
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
      user?.organizationName && user.organizationName !== 'Treki Travels'
        ? user.organizationName
        : organization.agencyName && organization.agencyName !== 'Treki Travels'
        ? organization.agencyName
        : 'GrowMe CRM'
    setAgencyName(validOrg)
    setLogoUrl(organization.logoUrl || '')
    setPrimaryColor(organization.primaryColor || '#4F46E5')
    setSecondaryColor(organization.secondaryColor || '#0D9488')
  }, [organization, user])

  // Load created subscription models
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await superAdminService.getPlans()
        setPlans(data)
      } catch (err) {
        console.error('Failed to load subscription models:', err)
      }
    }
    loadPlans()
  }, [])

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

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agencyName.trim()) {
      toast({ title: 'Please enter an agency name', type: 'error' })
      return
    }

    updateOrganization({
      agencyName: agencyName.trim(),
      logoUrl: logoUrl.trim() || undefined,
      primaryColor,
      secondaryColor,
    })

    setIsSaved(true)
    toast({
      type: 'success',
      title: 'Organization Updated',
      description: 'Your agency branding has been saved across the workspace.',
    })
    setTimeout(() => setIsSaved(false), 2500)
  }

  const handleUpgradePlan = async (plan: SubscriptionPlan) => {
    setIsUpgrading(true)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      await fetch('/api/organization/upgrade-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ planCode: plan.code }),
      })

      updateOrganization({
        plan: plan.code as any,
        maxSeats: plan.maxSeats,
        maxLeads: plan.maxLeads,
      })

      toast({
        type: 'success',
        title: 'Plan Activated!',
        description: `Your agency is now on the ${plan.name} (${plan.code}) subscription model.`,
      })
    } catch {
      updateOrganization({
        plan: plan.code as any,
        maxSeats: plan.maxSeats,
        maxLeads: plan.maxLeads,
      })
      toast({
        type: 'success',
        title: 'Plan Updated',
        description: `Your agency plan changed to ${plan.name}.`,
      })
    } finally {
      setIsUpgrading(false)
    }
  }

  const initials =
    agencyName
      .split(' ')
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'TT'

  const currentPlanCode = organization.plan || 'STARTER'
  const activeModel = plans.find((p) => p.code === currentPlanCode) || {
    name: currentPlanCode === 'PRO' ? 'Professional Tier' : currentPlanCode === 'ENTERPRISE' ? 'Enterprise Tier' : 'Starter Tier',
    code: currentPlanCode,
    maxSeats: organization.maxSeats || (currentPlanCode === 'PRO' ? 5 : 2),
    maxLeads: organization.maxLeads || (currentPlanCode === 'PRO' ? 2500 : 500),
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
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
            <div className="w-7 h-7 rounded-full bg-[#453372] text-white flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
            <span className="font-bold text-sm text-slate-900">Organization Settings</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Bar with Navigation Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Organization & Subscriptions
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Manage your agency branding, identity, and active subscription models.
              </p>
            </div>

            {/* Pill Tabs */}
            <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('branding')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'branding'
                    ? 'bg-[#453372] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Identity & Branding</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('subscription')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'subscription'
                    ? 'bg-[#453372] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Subscription Models</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === 'subscription' ? 'bg-amber-400 text-slate-950' : 'bg-purple-100 text-[#453372]'
                }`}>
                  {plans.length || 3}
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: BRANDING & PROFILE */}
          {activeTab === 'branding' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
              {/* Left Column: General Form (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                <form onSubmit={handleSaveChanges} className="space-y-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      General Details
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                      These details appear across your quotations, invoices, and client portals.
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                    />
                  </div>

                  {/* Logo Upload Dropzone */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                      Agency Logo
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
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#453372] border border-purple-100 flex items-center justify-center mb-3 shadow-2xs pointer-events-none">
                          <UploadCloud className="w-6 h-6 stroke-[1.75]" />
                        </div>
                        <p className="text-sm font-bold text-slate-900 pointer-events-none">
                          Upload image
                        </p>
                        <p className="text-xs text-slate-400 mt-1 pointer-events-none">
                          Stored on Cloudinary · PNG/JPG/WEBP · max 5 MB
                        </p>
                      </div>
                    )}

                    {/* URL / Paste link option */}
                    <div className="pt-1">
                      {showUrlInput ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="url"
                            placeholder="https://res.cloudinary.com/..."
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#453372]/20"
                          />
                          <button
                            type="button"
                            onClick={handleApplyUrl}
                            className="px-3 py-1.5 rounded-lg bg-[#453372] text-white text-xs font-semibold"
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
                          className="text-xs text-[#453372] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>or paste an image URL</span>
                        </button>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        Upload a square logo, or paste a link.
                      </p>
                    </div>
                  </div>

                  {/* Primary & Secondary Color Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                        Primary Brand Color
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
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                        Secondary Accent Color
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
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Changes Button */}
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <span>Save changes</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Live preview Card (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden relative">
                <div
                  className="h-1.5 w-full transition-colors duration-300"
                  style={{
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  }}
                />

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Live Preview
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      How your brand identity appears to clients.
                    </p>
                  </div>

                  {/* Brand Preview */}
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
                        Active Workspace
                      </p>
                    </div>
                  </div>

                  {/* Buttons and Badges Preview */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      style={{ backgroundColor: primaryColor }}
                      className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition-colors pointer-events-none"
                    >
                      Primary Button
                    </button>

                    <span
                      style={{ backgroundColor: secondaryColor }}
                      className="px-3 py-1 rounded-lg text-white text-xs font-bold shadow-2xs transition-colors pointer-events-none"
                    >
                      Confirmed
                    </span>
                  </div>

                  {/* Sample status section */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium block">
                      Lead Pipeline Badge
                    </span>
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                      Booking Won
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBSCRIPTION MODELS & ACTIVE TIER */}
          {activeTab === 'subscription' && (
            <div className="space-y-6 animate-fade-in">
              {/* Active Plan Overview Card */}
              <div className="bg-gradient-to-r from-[#3a2864] via-[#453372] to-[#453372] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 -skew-x-12 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wide">
                        Active Plan
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                        {activeModel.name}
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
                      Your agency is entitled to all {activeModel.code} features, lead intake automation, and quota allocations.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[120px]">
                      <span className="text-[10px] uppercase font-bold text-purple-200 block mb-0.5">
                        Team Seats
                      </span>
                      <span className="text-lg font-black text-white flex items-center justify-center gap-1.5">
                        <Users className="w-4 h-4 text-amber-300" />
                        {activeModel.maxSeats} Members
                      </span>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[120px]">
                      <span className="text-[10px] uppercase font-bold text-purple-200 block mb-0.5">
                        Leads Quota
                      </span>
                      <span className="text-lg font-black text-white flex items-center justify-center gap-1.5">
                        <Database className="w-4 h-4 text-emerald-300" />
                        {activeModel.maxLeads.toLocaleString()} Leads
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Subscription Models Section Header */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Created Subscription Models & Upgrades
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Explore all subscription tiers and scale your agency's capacity limits.
                  </p>
                </div>

                {/* Toggle Billing Cycle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-[#453372] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      billingCycle === 'yearly'
                        ? 'bg-white text-[#453372] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>Annual (Save 20%)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full font-black">
                      SAVE
                    </span>
                  </button>
                </div>
              </div>

              {/* Created Subscription Models Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const isCurrent = plan.code === currentPlanCode
                  const isPro = plan.code === 'PRO' || plan.isPopular
                  const isCustom = !['STARTER', 'PRO', 'ENTERPRISE'].includes(plan.code)
                  const activePrice =
                    billingCycle === 'monthly' ? plan.priceMonthly : Math.round(plan.priceYearly / 12)

                  return (
                    <div
                      key={plan.code}
                      className={`rounded-3xl p-7 flex flex-col justify-between transition-all relative overflow-hidden bg-white border ${
                        isCurrent
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                          : isPro
                          ? 'border-purple-300 shadow-md'
                          : 'border-slate-200/80 shadow-xs hover:border-purple-200'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-purple-50 text-[#453372] text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-purple-100">
                          {plan.code}
                        </span>

                        {isCurrent ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Current Tier
                          </span>
                        ) : isPro ? (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-700" />
                            Popular
                          </span>
                        ) : isCustom ? (
                          <span className="bg-purple-100 text-[#453372] text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                            Custom Tier
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">
                          {plan.name}
                        </h4>
                        <p className="text-xs text-slate-500 min-h-[36px] mt-1">
                          {plan.tagline}
                        </p>

                        {/* Price Tag */}
                        <div className="my-5 pb-5 border-b border-slate-100">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                              ₹{activePrice.toLocaleString()}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                              / month
                            </span>
                          </div>
                          {billingCycle === 'yearly' && (
                            <p className="text-[11px] text-emerald-600 font-bold mt-1">
                              Billed annually at ₹{plan.priceYearly.toLocaleString()} / year
                            </p>
                          )}
                        </div>

                        {/* Capacity Metrics */}
                        <div className="grid grid-cols-2 gap-2 mb-6">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              Seats
                            </span>
                            <span className="text-xs font-black text-slate-800">
                              {plan.maxSeats} Members
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              Leads
                            </span>
                            <span className="text-xs font-black text-slate-800">
                              {plan.maxLeads.toLocaleString()} Leads
                            </span>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2.5 mb-8 text-xs">
                          {(plan.features || []).map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                              <span className="text-slate-600 font-medium">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Upgrade Action Button */}
                      <div>
                        {isCurrent ? (
                          <div className="w-full py-3 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-emerald-200">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Currently Active Model</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isUpgrading}
                            onClick={() => handleUpgradePlan(plan)}
                            className={`w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-[0.98] ${
                              isPro
                                ? 'bg-[#453372] hover:bg-[#38285e] text-white shadow-md'
                                : 'bg-slate-100 hover:bg-purple-100 hover:text-[#453372] text-slate-700'
                            }`}
                          >
                            <span>Switch to {plan.name}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
