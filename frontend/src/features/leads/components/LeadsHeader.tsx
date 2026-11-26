import { Menu, Plus, UploadCloud } from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'

export function LeadsHeader({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const { setIsNewLeadModalOpen, setIsImportModalOpen } = useLeads()
  return <header className="gm-row gm-heading mb-5">
    <div className="flex items-center gap-2">
      {onOpenMobileMenu && <button type="button" className="gm-mobile gm-icon-button" aria-label="Open menu" onClick={onOpenMobileMenu}><Menu size={20} /></button>}
      <h1>Leads</h1>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="gm-button secondary" onClick={() => setIsImportModalOpen(true)}><UploadCloud size={16} /> Import CSV</button>
      <button type="button" className="gm-button" onClick={() => setIsNewLeadModalOpen(true)}><Plus size={16} /> New lead</button>
    </div>
  </header>
}
