import { useEffect, useState, useDeferredValue } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ArrowUpRight, Building2, ChevronRight, CreditCard, Database, Globe, Plus, Search, ShieldCheck } from 'lucide-react'
import { SuperAdminLayout } from '../superAdmin/SuperAdminLayout'
import { useRouter } from '../../context/RouterContext'
import { apiBase, getClient, getClients, moduleNames, save } from './workspaceApi'
import type { Client, ClientDetail } from './workspaceApi'

type Tab = 'Access' | 'Websites' | 'Connections' | 'Billing'
const tabs: Tab[] = ['Access', 'Websites', 'Connections', 'Billing']
const icons = { Access: ShieldCheck, Websites: Globe, Connections: Database, Billing: CreditCard }
const read = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  return Object.fromEntries(new FormData(event.currentTarget))
}

export function PlatformConsole() {
  const { path, navigate } = useRouter()
  const clientId = path.split('/')[3]
  const [clients, setClients] = useState<Client[]>()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const deferredSearch = useDeferredValue(search.trim())
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    if (clientId) return
    let active = true
    getClients(deferredSearch, page).then(({ tenants, pagination }) => {
      if (active) { setClients(tenants); setTotalPages(pagination.totalPages) }
    }, (error: Error) => { if (active) setError(error.message) })
    return () => { active = false }
  }, [clientId, revision, deferredSearch, page])
  const create = async (event: FormEvent<HTMLFormElement>) => {
    const values = read(event)
    setBusy(true); setError('')
    try {
      const result = await save<{ organization: { id: string } }>('/platform/clients', values, 'POST')
      setCreating(false); setRevision(revision + 1)
      navigate(`/super-admin/clients/${result.organization.id}`)
    } catch (error) { setError((error as Error).message) }
    finally { setBusy(false) }
  }
  return <SuperAdminLayout currentPath="Clients" title="GrowMe Super Admin">
    {clientId ? <ClientConsole key={clientId} clientId={clientId} /> : <>
      <section className="gm-hero">
        <div><div className="gm-kicker">Platform administration</div><h1>Client accounts</h1><p>Manage subscriptions, websites and service connections.</p></div>
        <button className="gm-button gm-hero-button" onClick={() => setCreating(!creating)}><Plus size={17} /> Add client</button>
      </section>
      {error && <p role="alert" className="gm-error">{error}</p>}
      {creating && <form className="gm-card gm-form" onSubmit={create}>
        <h2>Create a client workspace</h2>
        <div className="gm-grid two">
          <label>Client name<input name="agencyName" required /></label>
          <label>Owner name<input name="name" required /></label>
          <label>Owner email<input name="email" type="email" required /></label>
          <label>Initial password<input name="password" type="password" minLength={12} required autoComplete="new-password" /></label>
        </div>
        <button className="gm-button" disabled={busy}>Create workspace</button>
      </form>}
      <section className="gm-card gm-list">
        <div className="gm-row"><h2>Client directory</h2><label className="gm-search"><Search size={17} /><input aria-label="Search clients" placeholder="Search clients" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></label></div>
        {!clients && !error && <p>Loading clients…</p>}
        {clients?.length === 0 && <p>{search ? 'No matching clients.' : 'Add your first client to get started.'}</p>}
        {clients?.map((client) => <button key={client.id} className="gm-list-item" onClick={() => navigate(`/super-admin/clients/${client.id}`)}>
          <span className="gm-card-icon"><Building2 size={19} /></span><span className="gm-list-label"><strong>{client.name}</strong><small>{client.owner?.email || 'No owner email'}</small></span>
          <span className="gm-tag">{client.plan}</span><span className="gm-status">{client.status.toLowerCase()}</span><ChevronRight size={17} />
        </button>)}
        {totalPages > 1 && <div className="gm-row" aria-label="Client pages">
          <button className="gm-button secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="gm-muted">Page {page} of {totalPages}</span>
          <button className="gm-button secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>}
      </section>
    </>}
  </SuperAdminLayout>
}

function ClientConsole({ clientId }: { clientId: string }) {
  const { navigate } = useRouter()
  const [tab, setTab] = useState<Tab>('Access')
  const [detail, setDetail] = useState<ClientDetail>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formKey, setFormKey] = useState<{ siteId: string; formKey: string }>()
  const base = `/platform/clients/${clientId}`
  useEffect(() => {
    let active = true
    getClient(clientId).then((data) => { if (active) setDetail(data) }, (error: Error) => { if (active) setError(error.message) })
    return () => { active = false }
  }, [clientId])

  const run = async (action: () => Promise<string>) => {
    setBusy(true); setError(''); setNotice('')
    try {
      const message = await action()
      setDetail(await getClient(clientId))
      setNotice(message)
    } catch (error) { setError((error as Error).message) }
    finally { setBusy(false) }
  }

  const connection = (provider: string, event: FormEvent<HTMLFormElement>) => {
    const values = read(event)
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const activate = submitter?.value === 'activate'
    const form = event.currentTarget
    void run(async () => {
      await save(`${base}/connections`, { ...values, provider, activate }, 'POST')
      if (activate) form.reset()
      return activate ? 'Connection activated.' : 'Connection verified.'
    })
  }

  if (!detail) return <p role={error ? 'alert' : 'status'}>{error || 'Loading client…'}</p>
  return <>
    <button className="gm-text-button" onClick={() => navigate('/super-admin/clients')}>← Client accounts</button>
    <div className="gm-heading gm-row"><div><h1>{detail.organization.name}</h1><p>Client account</p></div><span className="gm-tag">{detail.organization.status.toLowerCase()}</span></div>
    <div className="gm-tabs">{tabs.map((item) => {
      const Icon = icons[item]
      return <button key={item} disabled={busy} className={tab === item ? 'active' : ''} onClick={() => { setTab(item); setNotice(''); setError('') }}><Icon size={16} />{item}</button>
    })}</div>
    {error && <p role="alert" className="gm-error">{error}</p>}{notice && <p role="status" className="gm-notice">{notice}</p>}
    {tab === 'Access' && <form className="gm-card gm-form" onSubmit={(event) => {
      const data = new FormData(event.currentTarget)
      event.preventDefault()
      void run(async () => { await save(`${base}/plan`, { plan: data.get('plan'), addOns: data.getAll('addOns') }); return 'Client access updated.' })
    }}>
      <h2>Plan and add-ons</h2>
      <div className="gm-grid two">
        <label>Subscription plan<select name="plan" defaultValue={detail.organization.plan}>{['STARTER', 'PRO', 'ENTERPRISE', 'CUSTOM'].map((code) => <option key={code}>{code}</option>)}</select></label>
        <label>Account status<select defaultValue={detail.organization.status} onChange={(event) => {
          const status = event.target.value
          void run(async () => { await save(`/super-admin/tenants/${clientId}/status`, { status }); return 'Account status updated.' })
        }} disabled={busy}>{['ACTIVE', 'TRIAL', 'SUSPENDED'].map((status) => <option key={status}>{status}</option>)}</select></label>
      </div>
      <fieldset><legend>Additional modules</legend><div className="gm-check-grid">{detail.modules.map((item) => <label key={item}>
        <input name="addOns" type="checkbox" value={item} defaultChecked={detail.addOns.includes(item)} />{moduleNames[item]}
      </label>)}</div></fieldset>
      <button className="gm-button" disabled={busy}>Save access</button>
    </form>}
    {tab === 'Websites' && <>
      <section className="gm-card gm-list"><h2>Connected websites</h2>
        {detail.sites.length === 0 && <p>No websites connected.</p>}
        {detail.sites.map((site) => <div key={site._id} className="gm-list-item"><span className="gm-card-icon"><Globe size={18} /></span>
          <div className="gm-list-label"><strong>{site.name}</strong><small>{site.domain}</small></div>
          <code>{site._id}</code><button className="gm-text-button" disabled={busy} onClick={() => {
            if (!window.confirm('Rotate this key? The current website form key will stop working.')) return
            void run(async () => {
              setFormKey(await save(`${base}/websites/${site._id}/form-key`, {}, 'POST'))
              return 'Website form key rotated.'
            })
          }}>Rotate form key</button></div>)}
      </section>
      {formKey && <section className="gm-card gm-form">
        <h2>Website integration</h2>
        <label>Site ID<input value={formKey.siteId} readOnly /></label>
        <label>Published content endpoint<input value={`${apiBase.startsWith('/') ? window.location.origin : ''}${apiBase}/public/websites/${formKey.siteId}`} readOnly /></label>
        <label>Server-side form key<input value={formKey.formKey} readOnly /></label>
        <p>Save the form key in the website server environment. GrowMe displays it once.</p>
        <button className="gm-button secondary" onClick={() => setFormKey(undefined)}>Done</button>
      </section>}
      <form className="gm-card gm-form" onSubmit={(event) => {
        const data = read(event)
        const form = event.currentTarget
        void run(async () => {
          setFormKey(await save(`${base}/websites`, { ...data, sections: String(data.sections).split(',').map((value) => value.trim()).filter(Boolean) }, 'POST'))
          form.reset()
          return 'Website connected.'
        })
      }}>
        <h2>Connect a custom website</h2><div className="gm-grid two">
          <label>Website name<input name="name" required /></label>
          <label>Domain<input name="domain" required /></label>
        </div>
        <label>Editable section slugs<input name="sections" defaultValue="homepage, contact, pages, blog, seo" required /></label>
        <button className="gm-button" disabled={busy}><Plus size={17} /> Connect website</button>
      </form>
    </>}
    {tab === 'Connections' && <div className="gm-grid two">
      <Connection title="MongoDB Atlas" assigned={detail.connections.mongo} busy={busy} onSubmit={(event) => connection('mongo', event)}>
        <p>Connect before adding the first website.</p><label>MongoDB connection URI<input name="uri" type="password" required autoComplete="off" /></label>
      </Connection>
      <Connection title="Cloudinary" assigned={detail.connections.cloudinary} busy={busy} onSubmit={(event) => connection('cloudinary', event)}>
        <label>Cloud name<input name="cloudName" required /></label>
        <label>API key<input name="apiKey" type="password" required autoComplete="off" /></label>
        <label>API secret<input name="apiSecret" type="password" required autoComplete="off" /></label>
      </Connection>
    </div>}
    {tab === 'Billing' && <form className="gm-card gm-form" onSubmit={(event) => {
      const values = read(event)
      void run(async () => { await save(`${base}/billing`, values); return 'GrowMe billing updated.' })
    }}>
      <h2>GrowMe subscription billing</h2>
      <label>GrowMe checkout URL<input name="checkoutUrl" type="url" placeholder="https://" defaultValue={detail.billing.checkoutUrl} /></label>
      <div className="gm-grid two">
        <label>Confirmed payment reference<input name="paymentReference" placeholder="Provider or bank reference" defaultValue={detail.billing.paymentReference} /></label>
        <label>Paid through<input name="paidThrough" type="date" defaultValue={detail.billing.paidThrough?.slice(0, 10)} /></label>
      </div>
      <p>Confirm the payment in your GrowMe merchant or bank account before recording it here.</p>
      <button className="gm-button" disabled={busy}>Save billing</button>
      {detail.billing.checkoutUrl && <a className="gm-text-button" href={detail.billing.checkoutUrl} target="_blank" rel="noreferrer">Open checkout <ArrowUpRight size={15} /></a>}
    </form>}
  </>
}

function Connection({ title, assigned, busy, onSubmit, children }: { title: string; assigned: boolean; busy: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; children: ReactNode }) {
  return <form className="gm-card gm-form" onSubmit={onSubmit}>
    <div className="gm-row"><h2>{title}</h2><span className="gm-tag">{assigned ? 'Assigned' : 'Not assigned'}</span></div>
    {children}
    <div className="gm-actions"><button className="gm-button secondary" value="test" disabled={busy}>Test connection</button><button className="gm-button" value="activate" disabled={busy}>Activate</button></div>
  </form>
}
