import { useState } from 'react'
import { Download, UploadCloud, X } from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'
import { useToast } from '../../../components/ui/Toast'
import type { CsvLeadRow } from '../../../types/lead.types'

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  const input = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
  for (let index = 0; index < input.length; index++) {
    const char = input[index]
    if (char === '"') {
      if (quoted && input[index + 1] === '"') { field += '"'; index++ }
      else if (quoted || !field) quoted = !quoted
      else field += char
    } else if (!quoted && (char === ',' || char === '\n')) {
      row.push(field.trim())
      field = ''
      if (char === '\n') {
        rows.push(row)
        row = []
      }
    } else field += char
  }
  if (quoted) throw new Error('An opening quote has no closing quote.')
  if (row.length || field) rows.push([...row, field.trim()])
  return rows
}

function readRows(text: string): CsvLeadRow[] {
  const [header, ...rows] = parseCsv(text)
  const keys = header?.map((field) => field.toLowerCase().replace(/[^a-z]/g, '')) || []
  const fields: Record<string, string> = {
    name: 'name', customername: 'name', fullname: 'name', phone: 'phone', phonenumber: 'phone', mobile: 'phone',
    email: 'email', destination: 'destination', budget: 'budget', currency: 'currency', travelers: 'travelers',
    travellers: 'travelers', customertype: 'customerType', status: 'status', temperature: 'temperature', lostreason: 'lostReason',
  }
  if (!keys.some((key) => fields[key] === 'name') || !keys.some((key) => fields[key] === 'phone')) {
    throw new Error('Include Name and Phone columns.')
  }
  const records = rows.map((cells, index) => ({
    ...Object.fromEntries(keys.flatMap((key, cell) => fields[key] ? [[fields[key], cells[cell] || '']] : [])),
    rowNumber: index + 2,
    ...(cells.length !== keys.length ? { parseError: 'This record has the wrong number of columns.' } : {}),
  })).filter((_, index) => rows[index].some(Boolean))
  if (!records.length || records.length > 500) throw new Error('Include 1–500 data rows per file.')
  return records
}

export function ImportCsvModal() {
  const { isImportModalOpen, setIsImportModalOpen, importLeads } = useLeads()
  const { toast } = useToast()
  const [rows, setRows] = useState<CsvLeadRow[]>([])
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([])
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ count: number; skipped: number }>()
  const [saving, setSaving] = useState(false)
  if (!isImportModalOpen) return null

  async function selectFile(file?: File) {
    if (!file) return
    setRows([])
    setErrors([])
    setError('')
    setResult(undefined)
    try {
      if (file.size > 2_000_000) throw new Error('Choose a CSV file smaller than 2 MB.')
      setRows(readRows(await file.text()))
    } catch (error) { setError((error as Error).message) }
  }

  async function submit() {
    setSaving(true)
    try {
      const response = await importLeads(rows)
      if (!response) return
      setResult(response)
      setErrors(response.errors)
      if (response.count > 0) toast({ type: 'success', title: `${response.count} leads imported` })
    } finally { setSaving(false) }
  }

  function close() {
    setRows([])
    setErrors([])
    setError('')
    setResult(undefined)
    setIsImportModalOpen(false)
  }

  const template = 'data:text/csv;charset=utf-8,' + encodeURIComponent('Name,Phone,Email,Destination,Budget,Currency,Travelers,CustomerType,Status,Temperature,LostReason\n')
  return <div className="fixed inset-0 z-[65] grid place-items-center bg-slate-950/50 p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="import-leads-title" className="gm-card w-full max-w-xl max-h-[88dvh] overflow-y-auto space-y-4">
      <header className="gm-row"><h2 id="import-leads-title">Import CSV leads</h2><button type="button" className="gm-icon-button" aria-label="Close import" disabled={saving} onClick={close}><X size={18} /></button></header>
      <label className="grid gap-2 text-sm"><span className="flex items-center gap-2"><UploadCloud size={17} /> Choose a CSV file</span><input type="file" accept=".csv,text/csv" disabled={saving} onChange={(event) => void selectFile(event.target.files?.[0])} /></label>
      {error && <p role="alert" className="gm-error">{error}</p>}
      {rows.length > 0 && result === undefined && <p>{rows.length} rows ready for validation.</p>}
      {result !== undefined && <p role="status">{result.count} imported · {result.skipped} already imported · {errors.length} rows need attention</p>}
      {errors.length > 0 && <ul className="max-h-52 overflow-y-auto space-y-1 text-sm">
        {errors.map(({ row, message }) => <li key={row}>Row {row} · {message}</li>)}
      </ul>}
      <div className="gm-row">
        <a href={template} download="growme_leads_template.csv" className="gm-text-button"><Download size={16} /> Download template</a>
        <button className="gm-button" type="button" disabled={!rows.length || saving || result !== undefined} onClick={() => void submit()}>{saving ? 'Importing…' : 'Import leads'}</button>
      </div>
    </section>
  </div>
}
