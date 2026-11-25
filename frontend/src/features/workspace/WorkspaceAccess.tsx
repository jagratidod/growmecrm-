import { Fragment, createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getWorkspace } from './workspaceApi'
import type { Access } from './workspaceApi'

const Context = createContext<{ access?: Access; loading: boolean; error?: string }>({ loading: true })

export function WorkspaceAccess({ children }: { children: ReactNode }) {
  const { token, user } = useAuth()
  const [result, setResult] = useState<{ token: string; access?: Access; error?: string }>()
  const shouldLoad = Boolean(token && user?.role !== 'super_admin')
  useEffect(() => {
    if (!token || !shouldLoad) return
    let active = true
    const load = () => getWorkspace().then(
      (access) => { if (active) setResult({ token, access }) },
      (error: Error) => { if (active) setResult({ token, error: error.message }) },
    )
    void load()
    window.addEventListener('focus', load)
    return () => { active = false; window.removeEventListener('focus', load) }
  }, [token, shouldLoad])
  const current = result?.token === token ? result : undefined
  return <Context.Provider value={{ ...current, loading: shouldLoad && !current }}><Fragment key={token || 'signed-out'}>{children}</Fragment></Context.Provider>
}

export const useWorkspace = () => useContext(Context)
