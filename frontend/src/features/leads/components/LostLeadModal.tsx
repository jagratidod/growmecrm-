import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLeads } from '../../../context/LeadsContext'

export function LostLeadModal() {
  const { lostLeadId, setLostLeadId, changeLeadStage } = useLeads()
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  if (!lostLeadId) return null

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!lostLeadId || !reason.trim() || saving) return
    setSaving(true)
    try {
      if (await changeLeadStage(lostLeadId, 'Lost', reason.trim())) close()
    } finally {
      setSaving(false)
    }
  }

  function close() {
    setLostLeadId(null)
    setReason('')
  }

  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4">
    <form role="dialog" aria-modal="true" aria-labelledby="lost-lead-title" onSubmit={submit} className="gm-card gm-form w-full max-w-md space-y-4">
      <h2 id="lost-lead-title">Mark lead as lost</h2>
      <label className="grid gap-2">Reason<textarea autoFocus required maxLength={500} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
      <div className="flex flex-wrap gap-2">
        <button className="gm-button secondary" type="button" disabled={saving} onClick={close}>Cancel</button>
        <button className="gm-button" type="submit" disabled={saving || !reason.trim()}>{saving ? 'Saving…' : 'Mark lost'}</button>
      </div>
    </form>
  </div>
}
