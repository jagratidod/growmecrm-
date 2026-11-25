import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Package as PackageIcon,
  MapPin,
  Edit3,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { usePackages } from '../../../context/PackagesContext'
import { useToast } from '../../../components/ui/Toast'
import type { TravelPackage } from '../../../types/package.types'

export const PackagesList: React.FC = () => {
  const { packages, startNewPackage, editPackage, deletePackage } = usePackages()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL')

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchSearch =
        !search ||
        pkg.name.toLowerCase().includes(search.toLowerCase()) ||
        pkg.destination.toLowerCase().includes(search.toLowerCase()) ||
        (pkg.categories && pkg.categories.some((c) => c.toLowerCase().includes(search.toLowerCase())))

      const matchStatus = statusFilter === 'ALL' || pkg.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [packages, search, statusFilter])

  const handleDelete = (e: React.MouseEvent, pkg: TravelPackage) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete ${pkg.name}?`)) {
      deletePackage(pkg.id)
      toast({ title: 'Package deleted', type: 'info' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Packages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Build brochures, manage fixed departures, and design multi-day itineraries.
          </p>
        </div>

        <button
          onClick={startNewPackage}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold text-sm shadow-sm hover:shadow transition-all active:scale-[0.98] shrink-0"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <Plus className="w-4 h-4" />
          <span>New package</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search package name, destination, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-brand text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <PackageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No packages found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            Create your first travel package or adjust your search filter.
          </p>
          <button
            onClick={startNewPackage}
            className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold"
          >
            + Create New Package
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => editPackage(pkg)}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand/30 transition-all cursor-pointer overflow-hidden flex flex-col group"
            >
              {/* Card Banner Image */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                {pkg.bannerImage ? (
                  <img
                    src={pkg.bannerImage}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-canvas text-copy-muted">
                    <PackageIcon className="w-12 h-12 stroke-[1.5]" />
                  </div>
                )}

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase backdrop-blur-md ${
                      pkg.status === 'PUBLISHED'
                        ? 'bg-emerald-900/80 text-emerald-100'
                        : 'bg-amber-900/80 text-amber-100'
                    }`}
                  >
                    {pkg.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-brand shadow-2xs">
                    {pkg.brochureDesign} design
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-xs font-bold">
                  {pkg.duration?.nights || 1}N / {pkg.duration?.days || 2}D
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{pkg.destination}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-brand transition-colors line-clamp-1">
                    {pkg.name}
                  </h3>

                  {pkg.bookingTitle && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {pkg.bookingTitle}
                    </p>
                  )}
                </div>

                {/* Categories */}
                {pkg.categories && pkg.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {pkg.categories.slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        {cat}
                      </span>
                    ))}
                    {pkg.categories.length > 3 && (
                      <span className="text-[10px] text-slate-400">
                        +{pkg.categories.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Price & Actions Row */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400">Starting from</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{pkg.price?.toLocaleString('en-IN')}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{pkg.originalPrice?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => editPackage(pkg)}
                      className="p-2 text-slate-500 hover:text-brand hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit Package"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, pkg)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
