import type { LucideIcon } from 'lucide-react'

interface Metric {
  label: string
  values: string[]
  icon: LucideIcon
}

export function CrmMetrics({ name, metrics, loading }: { name: string; metrics: Metric[]; loading: boolean }) {
  return <section className="gm-crm-metrics" aria-label={name} aria-busy={loading}>
    {metrics.map(({ label, values, icon: Icon }) => <div key={label}>
      <span><Icon size={17} aria-hidden="true" />{label}</span>
      <strong>{loading ? '—' : values.map((value, index) => <span key={index}>{value}</span>)}</strong>
    </div>)}
  </section>
}
