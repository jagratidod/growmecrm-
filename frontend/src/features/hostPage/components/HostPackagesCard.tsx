import React from 'react'
import { Plus, Package as PackageIcon, ArrowRight, MapPin, Clock } from 'lucide-react'
import { usePackages } from '../../../context/PackagesContext'
import type { TravelPackage } from '../../../types/package.types'

interface HostPackagesCardProps {
  onNavigatePackages?: () => void
}

export const HostPackagesCard: React.FC<HostPackagesCardProps> = ({ onNavigatePackages }) => {
  const { packages, startNewPackage, editPackage } = usePackages()

  const isEmpty = packages.length === 0

  const handleAddPackage = () => {
    startNewPackage()
    if (onNavigatePackages) onNavigatePackages()
  }

  const handleEditPackage = (pkg: TravelPackage) => {
    editPackage(pkg)
    if (onNavigatePackages) onNavigatePackages()
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Packages
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
          All of your packages appear on your website automatically.
        </p>
      </div>

      {isEmpty ? (
        <div className="border border-dashed border-slate-200 rounded-2xl p-10 sm:p-14 flex flex-col items-center justify-center text-center bg-slate-50/30">
          {/* Box icon in rounded badge matching screenshot 2 */}
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3 shadow-2xs">
            <PackageIcon className="w-6 h-6 stroke-[1.75]" />
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            You don't have any packages yet
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
            Add one to show it on your website.
          </p>

          <button
            type="button"
            onClick={handleAddPackage}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Package</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => handleEditPackage(pkg)}
              className="group border border-slate-200/90 hover:border-brand/30 rounded-2xl overflow-hidden bg-white shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="relative h-36 bg-slate-100 overflow-hidden">
                {pkg.bannerImage ? (
                  <img
                    src={pkg.bannerImage}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-50 text-brand">
                    <PackageIcon className="w-10 h-10 stroke-[1.5]" />
                  </div>
                )}
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/90 backdrop-blur-xs text-brand shadow-xs">
                  {pkg.status}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-brand transition-colors">
                    {pkg.bookingTitle || pkg.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {pkg.destination || 'Destination'}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-400" />
                      {pkg.duration?.nights}N / {pkg.duration?.days}D
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{(pkg.price || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-semibold text-brand group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Manage <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
