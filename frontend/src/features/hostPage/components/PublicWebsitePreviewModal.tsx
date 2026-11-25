import React from 'react'
import {
  X,
  Globe,
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
} from 'lucide-react'
import { useHostPage } from '../../../context/HostPageContext'
import { usePackages } from '../../../context/PackagesContext'
import { useSettings } from '../../../context/SettingsContext'
import { useAuth } from '../../../context/AuthContext'

export const PublicWebsitePreviewModal: React.FC = () => {
  const { hostData, isPublicPreviewOpen, setIsPublicPreviewOpen } = useHostPage()
  const { packages } = usePackages()
  const { organization } = useSettings()
  const { user } = useAuth()

  const agencyName = user?.organizationName || organization?.agencyName || 'GrowMe CRM'
  const agencyInitials = agencyName.slice(0, 2).toUpperCase() || 'GM'

  if (!isPublicPreviewOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-5xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Mock Browser Header Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>

          <div className="flex-1 max-w-md mx-4">
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-1 flex items-center gap-2 text-xs text-slate-600 shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{hostData.websiteUrl}</span>
            </div>
          </div>

          <button
            onClick={() => setIsPublicPreviewOpen(false)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Website Content Area */}
        <div className="flex-1 overflow-y-auto font-sans text-slate-800 scrollbar-thin">
          {/* Public Website Navbar */}
          <header className="bg-white border-b border-slate-100 sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#453372] text-white flex items-center justify-center font-black text-sm tracking-wide shadow-xs">
                {agencyInitials}
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                  {agencyName}
                </h1>
                <p className="text-[11px] text-[#453372] font-semibold">Verified Travel Host</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hostData.contact.phone && (
                <a
                  href={`tel:${hostData.contact.phone}`}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#453372] text-xs font-semibold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Us</span>
                </a>
              )}
              <button
                onClick={() => setIsPublicPreviewOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#453372] text-white text-xs font-semibold shadow-xs hover:bg-[#37275d] transition-all"
              >
                Close Preview
              </button>
            </div>
          </header>

          {/* Hero Banner Section */}
          <section className="relative h-64 sm:h-80 bg-slate-900 flex items-center justify-center overflow-hidden">
            {hostData.bannerImage ? (
              <img
                src={hostData.bannerImage}
                alt="Banner"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-[#3e2e68] via-[#453372] to-[#60449e]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

            <div className="relative z-10 text-center px-4 max-w-2xl text-white space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-purple-200">
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                Handcrafted Journeys & Group Trips
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                {agencyName}
              </h2>
              <p className="text-xs sm:text-sm text-purple-100 max-w-xl mx-auto drop-shadow-xs">
                {hostData.aboutUs ||
                  'Your trusted travel curator for scenic getaways, group adventures, and unforgettable stays.'}
              </p>
            </div>
          </section>

          {/* Featured Packages Section */}
          <section className="p-6 sm:p-10 max-w-6xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Our Curated Packages
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Pick a trip and experience hassle-free travel planning with local experts.
              </p>
            </div>

            {packages.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200/60">
                <p className="text-sm text-slate-500">No public packages published yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative h-44 bg-slate-100">
                      {pkg.bannerImage ? (
                        <img
                          src={pkg.bannerImage}
                          alt={pkg.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-50 text-[#453372]">
                          TT
                        </div>
                      )}
                      <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {pkg.destination || 'Destination'}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                          {pkg.bookingTitle || pkg.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {pkg.duration?.nights} Nights / {pkg.duration?.days} Days
                          </span>
                        </div>
                        {pkg.description && (
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {pkg.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">
                            Starting from
                          </p>
                          <p className="text-base font-extrabold text-[#453372]">
                            ₹{(pkg.price || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <button className="px-3.5 py-1.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white text-xs font-semibold transition-all">
                          Enquire Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Customer Reviews Section */}
          {hostData.reviews.length > 0 && (
            <section className="bg-purple-50/50 py-10 px-6 sm:px-10 border-t border-purple-100/60">
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    What Travellers Say
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Real testimonials from clients who traveled with us.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {hostData.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-700 italic leading-relaxed">
                        "{rev.quote}"
                      </p>
                      <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                        <div className="w-7 h-7 rounded-full bg-purple-100 text-[#453372] flex items-center justify-center font-bold text-xs overflow-hidden">
                          {rev.avatarUrl ? (
                            <img
                              src={rev.avatarUrl}
                              alt={rev.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            rev.name.charAt(0)
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-900">{rev.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Contact Footer */}
          <footer className="bg-slate-900 text-white py-10 px-6 sm:px-10">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h4 className="text-lg font-bold">{agencyName}</h4>
                <p className="text-xs text-slate-400">
                  {hostData.contact.address || 'Certified Tour & Travel Partner'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-slate-300">
                {hostData.contact.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-purple-400" />
                    {hostData.contact.phone}
                  </span>
                )}
                {hostData.contact.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    {hostData.contact.email}
                  </span>
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
