import { Plus, Search } from 'lucide-react'
import { useTeam } from '../../../context/TeamContext'
import { useCallLog } from '../../../context/CallLogContext'

export function CallLogHeader({ onOpenLogModal }: { onOpenLogModal: () => void }) {
  const { filters, setUserFilter, setSearchLead, callLogs } = useCallLog()
  const { members } = useTeam()
  const users = [...new Set([...members.map(({ name }) => name), ...callLogs.map(({ userName }) => userName), filters.user])]
    .filter((name) => name && name !== 'All users').sort((first, second) => first.localeCompare(second))

  return <header className="space-y-4">
    <div className="gm-heading gm-row">
      <h1>Call Log</h1>
      <button type="button" className="gm-button" onClick={onOpenLogModal}><Plus size={16} /> Log a call</button>
    </div>
    <div className="gm-crm-filter-bar">
      <label>Team member
        <select value={filters.user} onChange={(event) => setUserFilter(event.target.value)}>
          <option>All users</option>
          {users.map((name) => <option key={name}>{name}</option>)}
        </select>
      </label>
      <label>Search call history
        <span className="gm-crm-search"><Search size={16} /><input type="search" placeholder="Name, phone or outcome" value={filters.searchLead} onChange={(event) => setSearchLead(event.target.value)} /></span>
      </label>
    </div>
  </header>
}
