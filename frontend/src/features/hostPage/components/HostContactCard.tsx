import React from 'react'
import { useHostPage } from '../../../context/HostPageContext'

export const HostContactCard: React.FC = () => {
  const { hostData, updateContact, saveWebsite } = useHostPage()

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Contact
        </h2>
      </div>

      <div className="space-y-4">
        {/* Phone & Email Row matching screenshot 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
              Phone
            </label>
            <input
              type="text"
              placeholder="+91 ..."
              value={hostData.contact.phone}
              onChange={(e) => updateContact({ phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
              Email
            </label>
            <input
              type="email"
              placeholder="hello@agency.com"
              value={hostData.contact.email}
              onChange={(e) => updateContact({ email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] bg-white transition-all"
            />
          </div>
        </div>

        {/* Address Row matching screenshot 3 */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
            Address
          </label>
          <input
            type="text"
            placeholder="Office address"
            value={hostData.contact.address}
            onChange={(e) => updateContact({ address: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] bg-white transition-all"
          />
        </div>
      </div>

      {/* Save website button aligned right matching screenshot 3 */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={saveWebsite}
          className="px-6 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
        >
          Save website
        </button>
      </div>
    </div>
  )
}
