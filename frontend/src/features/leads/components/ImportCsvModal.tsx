import React, { useState } from 'react'
import { X, UploadCloud, CheckCircle2, AlertCircle, Download } from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'
import { useToast } from '../../../components/ui/Toast'
import type { Lead, LeadStage, CustomerType, LeadTemperature } from '../../../types/lead.types'

export const ImportCsvModal: React.FC = () => {
  const { isImportModalOpen, setIsImportModalOpen, importLeads } = useLeads()
  const { toast } = useToast()

  const [parsedRows, setParsedRows] = useState<Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities'>[]>([])
  const [errorCount, setErrorCount] = useState(0)

  if (!isImportModalOpen) return null

  const sampleCsv = `Name,Phone,Email,Destination,Budget,Travelers,CustomerType,Status,Temperature
Rohan Kapoor,+91 9988776655,rohan@example.com,Maldives,250000,2,B2C,New,Hot
Ananya Sharma,+91 9876543210,ananya@travel.org,Switzerland,450000,3,B2C,Contacted,Warm
Zenith Tech Outings,+91 9811223344,admin@zenithtech.com,Manali,350000,15,B2B,Qualified,Hot`

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'treki_leads_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      parseCsvContent(content)
    }
    reader.readAsText(file)
  }

  const parseCsvContent = (text: string) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) {
      setParsedRows([])
      return
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const rows: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities'>[] = []
    let errors = 0

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',').map((v) => v.trim())
      const rowObj: Record<string, string> = {}
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || ''
      })

      const name = rowObj['name'] || rowObj['customer name'] || rowObj['fullname']
      const phone = rowObj['phone'] || rowObj['phone number'] || rowObj['mobile']

      if (!name || !phone) {
        errors++
        continue
      }

      rows.push({
        name,
        phone,
        email: rowObj['email'] || undefined,
        destination: rowObj['destination'] || 'Flexible',
        budget: Number(rowObj['budget']) || 2500,
        currency: 'INR',
        travelers: Number(rowObj['travelers']) || 2,
        customerType: (rowObj['customertype'] as CustomerType) || 'B2C',
        status: (rowObj['status'] as LeadStage) || 'New',
        temperature: (rowObj['temperature'] as LeadTemperature) || 'Warm',
        source: 'Website',
        assignedTo: 'Unassigned',
        tags: ['imported_csv'],
        notes: 'Bulk imported via CSV file',
      })
    }

    setParsedRows(rows)
    setErrorCount(errors)
  }

  const handleImportSubmit = () => {
    if (parsedRows.length === 0) return

    const count = importLeads(parsedRows)
    toast({
      type: 'success',
      title: 'CSV Import Completed',
      description: `Successfully added ${count} new leads to your pipeline.`,
    })

    setParsedRows([])
    setIsImportModalOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Import CSV Leads</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload multiple enquiries at once via CSV file.
            </p>
          </div>
          <button
            onClick={() => setIsImportModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* File Upload Zone */}
          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/50 transition">
            <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">
              Drag & drop your CSV file here, or{' '}
              <label className="text-indigo-600 hover:underline cursor-pointer">
                browse files
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-slate-400 mt-1">Accepts UTF-8 formatted CSV files</p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  parseCsvContent(sampleCsv)
                }}
                className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
              >
                Load Sample CSV
              </button>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Template
              </button>
            </div>
          </div>

          {/* Validation & Preview Summary */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <strong>{parsedRows.length}</strong> valid leads ready to import
                </span>
                {errorCount > 0 && (
                  <span className="text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errorCount} rows skipped (missing name/phone)
                  </span>
                )}
              </div>

              {/* Preview Table */}
              <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Phone</th>
                      <th className="py-2 px-3">Destination</th>
                      <th className="py-2 px-3">Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium text-slate-800">{row.name}</td>
                        <td className="py-2 px-3 text-slate-600">{row.phone}</td>
                        <td className="py-2 px-3 text-slate-600">{row.destination}</td>
                        <td className="py-2 px-3 text-slate-600">
                          {row.currency} {row.budget}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(false)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0}
            onClick={handleImportSubmit}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Import {parsedRows.length > 0 ? `(${parsedRows.length})` : ''} Leads
          </button>
        </div>
      </div>
    </div>
  )
}
