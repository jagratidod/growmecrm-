import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, type }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, title, description, type }])

      setTimeout(() => {
        removeToast(id)
      }, 4000)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-2 ${
              t.type === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-700/60'
                : t.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-700/60'
                : 'bg-slate-900/90 text-white border-slate-700/60'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold">{t.title}</h4>
              {t.description && (
                <p className="text-xs text-slate-200/80 mt-0.5">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-slate-300 hover:text-white p-0.5 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return {
      toast: () => {},
      toasts: [],
      removeToast: () => {},
    }
  }
  return context
}
