import React from 'react'
import {
  Phone,
  PhoneCall,
  User,
  Clock,
  Trash2,
  PhoneOutgoing,
  PhoneMissed,
  PhoneForwarded,
} from 'lucide-react'
import { useCallLog } from '../../../context/CallLogContext'
import { useToast } from '../../../components/ui/Toast'
import type { CallLogEntry } from '../../../types/callLog.types'

const outcomeStyles: Record<
  string,
  { bg: string; text: string; dot: string; icon: React.FC<{ className?: string }> }
> = {
  Connected: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    icon: PhoneOutgoing,
  },
  'No answer': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    icon: PhoneMissed,
  },
  Voicemail: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    icon: PhoneForwarded,
  },
  Busy: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    icon: PhoneMissed,
  },
  'Wrong number': {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
    icon: PhoneCall,
  },
}

export const CallLogTable: React.FC = () => {
  const { filteredCallLogs, deleteCallLog } = useCallLog()
  const { toast } = useToast()

  const handleDelete = (id: string, leadName: string) => {
    if (window.confirm(`Delete call log for ${leadName}?`)) {
      deleteCallLog(id)
      toast({ title: 'Call log removed', type: 'info' })
    }
  }

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString()
    } catch {
      return isoString
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-5">Lead</th>
              <th className="py-3.5 px-4">Caller</th>
              <th className="py-3.5 px-4">Outcome</th>
              <th className="py-3.5 px-4">Notes / Discussion</th>
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredCallLogs.map((log: CallLogEntry) => {
              const style = outcomeStyles[log.outcome] || {
                bg: 'bg-purple-50',
                text: 'text-brand',
                dot: 'bg-brand',
                icon: PhoneCall,
              }
              const Icon = style.icon

              return (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Lead Name & Phone */}
                  <td className="py-4 px-5">
                    <div>
                      <div className="font-bold text-slate-900">{log.leadName}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{log.leadPhone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Caller Agent */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 text-brand border border-purple-100 flex items-center justify-center font-bold text-xs shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-xs text-slate-700">{log.userName}</span>
                    </div>
                  </td>

                  {/* Outcome Badge */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{log.outcome}</span>
                    </span>
                  </td>

                  {/* Notes / Discussion */}
                  <td className="py-4 px-4 max-w-md">
                    {log.notes ? (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {log.notes}
                      </p>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No notes recorded</span>
                    )}
                  </td>

                  {/* Timestamp */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTime(log.createdAt)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => handleDelete(log.id, log.leadName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete log entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="lg:hidden divide-y divide-slate-100">
        {filteredCallLogs.map((log: CallLogEntry) => {
          const style = outcomeStyles[log.outcome] || {
            bg: 'bg-purple-50',
            text: 'text-brand',
            dot: 'bg-brand',
            icon: PhoneCall,
          }
          const Icon = style.icon

          return (
            <div key={log.id} className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{log.leadName}</h4>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{log.leadPhone}</div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{log.outcome}</span>
                </span>
              </div>

              {log.notes && (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl">
                  {log.notes}
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{log.userName}</span>
                  <span>•</span>
                  <span>{formatTime(log.createdAt)}</span>
                </div>

                <button
                  onClick={() => handleDelete(log.id, log.leadName)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
