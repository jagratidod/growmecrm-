import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface RouterContextType {
  path: string
  navigate: (to: string, options?: { replace?: boolean }) => void
}

const RouterContext = createContext<RouterContextType | undefined>(undefined)

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getCleanPath = (pathname: string): string => {
    const clean = pathname.toLowerCase().replace(/\/+$/, '')
    return clean || '/'
  }

  const [path, setPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/'
    return getCleanPath(window.location.pathname)
  })

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const target = to.startsWith('/') ? to : `/${to}`
    const cleanTarget = target.toLowerCase().replace(/\/+$/, '') || '/'
    
    if (options?.replace) {
      window.history.replaceState({}, '', target)
    } else {
      window.history.pushState({}, '', target)
    }
    setPath(cleanTarget)
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      setPath(getCleanPath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext)
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider')
  }
  return context
}
