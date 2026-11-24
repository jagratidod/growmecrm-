import React, { useState, useEffect } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../components/ui/Toast'
import { linkTreeService } from '../../services/linkTreeService'
import type { BioLinkItem } from '../../services/linkTreeService'
import {
  Copy,
  ExternalLink,
  Trash2,
  Menu,
  Check,
  Save,
} from 'lucide-react'

interface LinkTreePageProps {
  onNavigateMenu?: (menu: string) => void
}

export const LinkTreePage: React.FC<LinkTreePageProps> = ({ onNavigateMenu }) => {
  const { organization: org } = useSettings()
  const { toast } = useToast()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const bioUrl = `https://joinetra.com/bio/${org.agencyName.toLowerCase().replace(/\s+/g, '-')}`

  // Bio settings
  const [bioTitle, setBioTitle] = useState(org.agencyName || 'Treki Travels')
  const [bioTagline, setBioTagline] = useState('Curated Trips, Himalayan Treks & Luxury Getaways ✨')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const [links, setLinks] = useState<BioLinkItem[]>(() => {
    const saved = localStorage.getItem('treki_crm_linktree_items')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'l-1',
        title: '💬 Chat on WhatsApp for Instant Itinerary',
        url: 'https://wa.me/919876543210',
        icon: 'whatsapp',
        active: true,
      },
      {
        id: 'l-2',
        title: '🏔️ Kashmir Winter Wonderland 5D/4N',
        url: 'https://joinetra.com/treki-travels/kashmir-winter',
        icon: 'package',
        active: true,
      },
      {
        id: 'l-3',
        title: '🏖️ Goa Private Beach Villas',
        url: 'https://joinetra.com/treki-travels/goa-luxury',
        icon: 'package',
        active: true,
      },
      {
        id: 'l-4',
        title: '⭐ Read Google Reviews (4.9 / 5)',
        url: 'https://maps.google.com',
        icon: 'review',
        active: true,
      },
      {
        id: 'l-5',
        title: '🌐 Visit Our Official Website',
        url: 'https://joinetra.com/treki-travels',
        icon: 'web',
        active: true,
      },
    ]
  })

  // Load from server on mount
  useEffect(() => {
    const fetchLinkTree = async () => {
      try {
        const data = await linkTreeService.getLinkTree()
        if (data) {
          if (data.bioTitle) setBioTitle(data.bioTitle)
          if (data.bioTagline) setBioTagline(data.bioTagline)
          if (Array.isArray(data.links) && data.links.length > 0) {
            setLinks(data.links)
            localStorage.setItem('treki_crm_linktree_items', JSON.stringify(data.links))
          }
        }
      } catch (err) {
        console.warn('Could not load LinkTree from server, using local cache:', err)
      }
    }
    fetchLinkTree()
  }, [])

  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const saveLinks = (updated: BioLinkItem[]) => {
    setLinks(updated)
    localStorage.setItem('treki_crm_linktree_items', JSON.stringify(updated))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(bioUrl)
    setCopied(true)
    toast({
      type: 'success',
      title: 'Link Copied',
      description: 'Bio URL copied to clipboard.',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true)
      await linkTreeService.updateLinkTree({ bioTitle, bioTagline })
      toast({
        type: 'success',
        title: 'Profile Saved',
        description: 'Bio title and tagline updated successfully.',
      })
    } catch (err) {
      console.error('Failed to save bio profile:', err)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const formattedUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl || 'joinetra.com'}`
    const newLink: BioLinkItem = {
      id: `l-${Date.now()}`,
      title: newTitle.trim(),
      url: formattedUrl,
      icon: 'web',
      active: true,
    }
    const updated = [...links, newLink]
    saveLinks(updated)
    const titleToAdd = newTitle.trim()
    setNewTitle('')
    setNewUrl('')
    toast({
      type: 'success',
      title: 'Link Added',
      description: 'New link added to your bio page.',
    })

    try {
      const res = await linkTreeService.addLink({
        title: titleToAdd,
        url: formattedUrl,
        icon: 'web',
      })
      if (res.linkTree?.links) {
        saveLinks(res.linkTree.links)
      }
    } catch (err) {
      console.error('Failed to sync link addition to server:', err)
    }
  }

  const handleDeleteLink = async (id: string) => {
    const updated = links.filter((l) => l.id !== id)
    saveLinks(updated)
    toast({
      type: 'info',
      title: 'Link Removed',
      description: 'Link deleted from bio page.',
    })

    try {
      await linkTreeService.deleteLink(id)
    } catch (err) {
      console.error('Failed to delete link on server:', err)
    }
  }

  const handleToggleLink = async (id: string) => {
    const updated = links.map((l) => (l.id === id ? { ...l, active: !l.active } : l))
    saveLinks(updated)

    try {
      await linkTreeService.toggleLink(id)
    } catch (err) {
      console.error('Failed to toggle link on server:', err)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="LinkTree"
        onSelectMenu={onNavigateMenu}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  LinkTree Bio
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Your agency's all-in-one link for Instagram bio, WhatsApp status, and social cards.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs shadow-xs hover:bg-slate-50 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy link'}</span>
              </button>
              <a
                href={bioUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#453372] text-white font-semibold text-xs shadow-md hover:bg-[#382860] transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open link</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: LinkTree Builder */}
            <div className="lg:col-span-7 space-y-5">
              {/* Profile Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
                <h2 className="text-sm font-bold text-slate-800 mb-4">Bio Profile</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Display Title
                    </label>
                    <input
                      type="text"
                      value={bioTitle}
                      onChange={(e) => setBioTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#453372]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Bio Tagline
                    </label>
                    <input
                      type="text"
                      value={bioTagline}
                      onChange={(e) => setBioTagline(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#453372]"
                    />
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#453372] text-white font-semibold text-xs hover:bg-[#382860] transition disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingProfile ? 'Saving...' : 'Save Profile'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Add New Link Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
                <h2 className="text-sm font-bold text-slate-800 mb-3">Add Custom Link</h2>
                <form onSubmit={handleAddLink} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Link title (e.g. 🏝️ Book Maldives Package)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#453372]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="URL (e.g. https://... or wa.me/...)"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#453372]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#453372] text-white rounded-xl text-xs font-semibold hover:bg-[#382860] transition cursor-pointer"
                    >
                      Add Link
                    </button>
                  </div>
                </form>
              </div>

              {/* Current Links List */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
                <h2 className="text-sm font-bold text-slate-800 mb-2">Active Links</h2>
                {links.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{item.url}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleLink(item.id)}
                        className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
                          item.active ? 'bg-[#453372]' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                            item.active ? 'left-4.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Phone Mockup Preview */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-[320px] bg-slate-900 rounded-[44px] p-4 shadow-2xl border-4 border-slate-800">
                {/* Phone Speaker Notch */}
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-4" />

                {/* Phone Screen */}
                <div className="bg-gradient-to-b from-[#2b1f47] to-[#1a122c] rounded-[34px] p-5 text-white min-h-[500px] flex flex-col items-center">
                  {/* Agency Avatar */}
                  <div className="w-16 h-16 rounded-full bg-white text-[#453372] flex items-center justify-center font-black text-xl shadow-lg mb-3">
                    {bioTitle.slice(0, 2).toUpperCase()}
                  </div>

                  <h3 className="font-bold text-sm text-center mb-1">{bioTitle}</h3>
                  <p className="text-[11px] text-purple-200/80 text-center mb-5 px-3 leading-tight">
                    {bioTagline}
                  </p>

                  {/* Links on Mockup */}
                  <div className="w-full space-y-2.5">
                    {links
                      .filter((l) => l.active)
                      .map((l) => (
                        <div
                          key={l.id}
                          className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-center text-[11px] font-semibold text-white shadow-xs transition cursor-pointer"
                        >
                          {l.title}
                        </div>
                      ))}
                  </div>

                  {/* Verified Badge */}
                  <div className="mt-auto pt-6 text-center text-[10px] text-purple-300/50">
                    Powered by Treki Travels CRM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
