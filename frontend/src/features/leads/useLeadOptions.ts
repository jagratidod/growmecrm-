import { useEffect, useState } from 'react'
import { useWorkspace } from '../workspace/WorkspaceAccess'
import { leadsService } from '../../services/leadsService'
import type { Lead } from '../../types/lead.types'

export function useLeadOptions(active: boolean, search: string, selectedId?: string) {
  const { access } = useWorkspace()
  const enabled = active && access?.modules.includes('leads')
  const [matches, setMatches] = useState<Pick<Lead, 'id' | 'name' | 'phone' | 'destination'>[]>([])
  const [selected, setSelected] = useState<Lead>()
  const [error, setError] = useState('')
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      leadsService.getOptions(search, controller.signal).then(
        ({ leads }) => { if (!controller.signal.aborted) { setMatches(leads); setError('') } },
        (error: Error) => { if (!controller.signal.aborted) setError(error.message) },
      )
    }, search ? 180 : 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [enabled, search])
  useEffect(() => {
    if (!enabled || !selectedId) return
    const controller = new AbortController()
    leadsService.getLeadById(selectedId, controller.signal).then(
      (lead) => { if (!controller.signal.aborted) setSelected(lead) },
      (error: Error) => { if (!controller.signal.aborted) setError(error.message) },
    )
    return () => controller.abort()
  }, [enabled, selectedId])

  const options = selected?.id === selectedId && selected && !matches.some(({ id }) => id === selectedId)
    ? [selected, ...matches] : matches
  return { options, error }
}
