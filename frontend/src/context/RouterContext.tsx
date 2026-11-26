import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useTransition, useMemo } from 'react'

interface RouterContextType {
  path: string
  search: string
  sidebar: { scrollTop: number }
  navigate: (to: string, options?: { replace?: boolean }) => void
}

const RouterContext = createContext<RouterContextType | undefined>(undefined)
const RoutePendingContext = createContext(false)

const readLocation = () => ({
  path: window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/',
  search: window.location.search,
})

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [{ path, search }, setLocation] = useState(() =>
    typeof window === 'undefined' ? { path: '/', search: '' } : readLocation(),
  )

  const [isPending, startTransition] = useTransition()
  const sidebar = useRef({ scrollTop: 0 })

  const commitLocation = useCallback(() => {
    const next = readLocation()
    startTransition(() => setLocation(next))
  }, [startTransition])

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const target = to.startsWith('/') ? to : `/${to}`
    const current = window.location.pathname + window.location.search + window.location.hash
    if (target === current) return
    if (options?.replace) window.history.replaceState({}, '', target)
    else window.history.pushState({}, '', target)
    commitLocation()
  }, [commitLocation])

  useEffect(() => {
    window.addEventListener('popstate', commitLocation)
    return () => window.removeEventListener('popstate', commitLocation)
  }, [commitLocation])

  const value = useMemo(() => ({ path, search, navigate, sidebar: sidebar.current }), [path, search, navigate])
  return (
    <RouterContext.Provider value={value}>
      <RoutePendingContext.Provider value={isPending}>{children}</RoutePendingContext.Provider>
    </RouterContext.Provider>
  )
}

export const useRoutePending = () => useContext(RoutePendingContext)

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext)
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider')
  }
  return context
}
