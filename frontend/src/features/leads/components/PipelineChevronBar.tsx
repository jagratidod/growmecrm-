import { useLeads } from '../../../context/LeadsContext'
import { leadStages } from '../../../types/lead.types'

export function PipelineChevronBar() {
  const { stats, filters, updateFilter } = useLeads()

  return <div className="gm-stage-filters" role="group" aria-label="Pipeline stage">
    {(['All', ...leadStages] as const).map((stage) => <button
      type="button" key={stage} aria-pressed={filters.stage === stage}
      onClick={() => updateFilter('stage', stage)}
    >
      {stage === 'All' ? 'All stages' : stage}
      {stage !== 'All' && filters.view !== 'archived' && <span>{stats.stages[stage] ?? 0}</span>}
    </button>)}
  </div>
}
