import { useEffect, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { request } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface Announcement { _id: string; title: string; message: string; type: 'info' | 'warning' | 'success' | 'critical' }

const styles = {
  info: { box: 'bg-purple-50 border-purple-200 text-brand', Icon: Info },
  success: { box: 'bg-emerald-50 border-emerald-200 text-emerald-900', Icon: CheckCircle2 },
  warning: { box: 'bg-amber-50 border-amber-200 text-amber-900', Icon: AlertTriangle },
  critical: { box: 'bg-rose-50 border-rose-200 text-rose-900', Icon: AlertCircle },
} as const

const dismissedKey = 'growme_dismissed_announcements'
const readDismissed = (): string[] => {
  try { return JSON.parse(sessionStorage.getItem(dismissedKey) || '[]') } catch { return [] }
}

/** Platform broadcasts written by the super admin, shown to signed-in workspace users. */
export function AnnouncementBanner() {
  const { isAuthenticated, user } = useAuth()
  const [items, setItems] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<string[]>(readDismissed)
  const eligible = isAuthenticated && user?.role !== 'super_admin'

  useEffect(() => {
    if (!eligible) return
    let active = true
    request<{ announcements: Announcement[] }>('/workspace/announcements')
      .then((data) => { if (active) setItems(data.announcements) })
      .catch(() => { if (active) setItems([]) })
    return () => { active = false }
  }, [eligible])

  const visible = eligible ? items.filter((item) => !dismissed.includes(item._id)) : []
  if (!visible.length) return null

  const dismiss = (id: string) => {
    const next = [...dismissed, id]
    setDismissed(next)
    sessionStorage.setItem(dismissedKey, JSON.stringify(next))
  }

  return (
    <div className="fixed top-0 inset-x-0 z-[70] flex flex-col gap-1 p-2 pointer-events-none" aria-live="polite">
      {visible.map((item) => {
        const { box, Icon } = styles[item.type] ?? styles.info
        return (
          <div key={item._id} role="status" className={`pointer-events-auto mx-auto w-full max-w-3xl flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-md ${box}`}>
            <Icon className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs flex-1 min-w-0"><strong className="font-black">{item.title}</strong> — {item.message}</p>
            <button type="button" aria-label="Dismiss announcement" onClick={() => dismiss(item._id)} className="shrink-0 opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
