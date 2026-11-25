import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowUpRight, Globe, LayoutGrid, Menu, Save, Upload } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useRouter } from '../../context/RouterContext'
import { request } from '../../services/api'
import { useWorkspace } from './WorkspaceAccess'
import { apiBase, moduleNames, save } from './workspaceApi'
import type { Entry, Section, Site, SiteEditor } from './workspaceApi'
import './workspace.css'

const homeCards = [
  { title: 'Websites', detail: 'Edit content and publish updates to your connected domains.', path: '/websites', module: 'websites', icon: Globe },
  { title: 'Leads', detail: 'Review website enquiries and manage your sales pipeline.', path: '/leads', module: 'leads', icon: LayoutGrid },
  { title: 'Bookings', detail: 'Track departures, reservations and customer payments.', path: '/bookings', module: 'bookings', icon: LayoutGrid },
  { title: 'Travel catalog', detail: 'Manage your packages, itineraries and inventory.', path: '/packages', module: 'catalog', icon: LayoutGrid },
]
const emptySection: Section = { title: '', body: '', image: '' }
const label = (name: string) => moduleNames[name] || name.replace(/-/g, ' ').replace(/^./, (letter) => letter.toUpperCase())

function Shell({ current, children }: { current: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return <div className="gm-shell">
    <LeadsSidebar currentPath={current} isOpen={open} onClose={() => setOpen(false)} />
    <div className="gm-main">
      <header className="gm-topbar">
        <button className="gm-mobile gm-icon-button" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={19} /></button>
        <span>Workspace <span className="gm-muted">/</span> {current}</span>
      </header>
      <main className="gm-content">{children}</main>
    </div>
  </div>
}

export function WorkspaceHome() {
  const { access, error } = useWorkspace()
  const { user } = useAuth()
  const { navigate } = useRouter()
  return <Shell current="Dashboard">
    <section className="gm-hero">
      <div><div className="gm-kicker">GrowMe Workspace</div><h1>{user?.organizationName || 'Your workspace'}</h1><p>Manage your websites and client enquiries from one place.</p></div>
      {access?.plan && <span className="gm-tag">{access.plan.toLowerCase()} plan</span>}
    </section>
    {error && <p role="alert" className="gm-error">{error}</p>}
    <div className="gm-grid">
      {homeCards.filter((card) => access?.modules.includes(card.module)).map(({ title, detail, path, icon: Icon }) =>
        <button className="gm-card gm-tile" key={path} onClick={() => navigate(path)}>
          <div className="gm-tile-head"><span className="gm-card-icon"><Icon size={21} /></span><ArrowUpRight size={19} /></div>
          <h2>{title}</h2><p>{detail}</p>
        </button>
      )}
    </div>
    {access && <section className="gm-card gm-row">
      <div><h2>GrowMe subscription</h2><p>{access.billing.paidThrough ? `Paid through ${new Date(access.billing.paidThrough).toLocaleDateString('en-IN')}` : `${access.modules.length} modules enabled`}</p></div>
      {access.billing.checkoutUrl && (user?.role === 'owner' || user?.role === 'admin') &&
        <a className="gm-button" href={access.billing.checkoutUrl} target="_blank" rel="noreferrer">Open GrowMe checkout <ArrowUpRight size={16} /></a>}
    </section>}
  </Shell>
}

export function WebsitesPage() {
  const { navigate, path } = useRouter()
  const siteId = path.split('/')[2]
  const [sites, setSites] = useState<Site[]>()
  const [error, setError] = useState('')
  useEffect(() => {
    if (siteId) return
    let active = true
    request<{ sites: Site[] }>('/workspace/websites').then(
      ({ sites }) => { if (active) setSites(sites) },
      (error: Error) => { if (active) setError(error.message) },
    )
    return () => { active = false }
  }, [siteId])
  return <Shell current="Websites">
    {siteId ? <WebsiteEditor key={siteId} siteId={siteId} /> : <>
      <div className="gm-heading"><h1>Websites</h1><p>Manage content for your connected websites.</p></div>
      {error && <p role="alert" className="gm-error">{error}</p>}
      {!error && !sites && <p>Loading websites…</p>}
      {sites?.length === 0 && <div className="gm-card"><h2>No websites connected</h2><p>Your websites will appear here after GrowMe connects them.</p></div>}
      <div className="gm-grid">{sites?.map((site) => <button key={site._id} className="gm-card gm-tile" onClick={() => navigate(`/websites/${site._id}`)}>
        <div className="gm-tile-head"><span className="gm-card-icon"><Globe size={21} /></span><ArrowUpRight size={19} /></div>
        <h2>{site.name}</h2><p>{site.domain}</p>
      </button>)}</div>
    </>}
  </Shell>
}

function WebsiteEditor({ siteId }: { siteId: string }) {
  const { navigate } = useRouter()
  const { user } = useAuth()
  const { access } = useWorkspace()
  const [editor, setEditor] = useState<SiteEditor>()
  const [section, setSection] = useState('')
  const [draft, setDraft] = useState<Section>(emptySection)
  const [dirty, setDirty] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const base = `/workspace/websites/${siteId}`
  const canPublish = user?.role === 'owner' || user?.role === 'admin'
  const canEdit = canPublish || user?.role === 'manager'

  useEffect(() => {
    let active = true
    request<SiteEditor>(base).then((data) => {
      if (!active) return
      const first = data.site.sections[0] || ''
      setEditor(data); setSection(first); setDraft(data.draft[first] || emptySection)
    }, (error: Error) => { if (active) setError(error.message) })
    return () => { active = false }
  }, [base])

  const perform = async (action: () => Promise<void>) => {
    setBusy(true); setError(''); setNotice('')
    try { await action() } catch (error) { setError((error as Error).message) }
    finally { setBusy(false) }
  }
  const replaceEntry = (index: number, values: Partial<Entry>) =>
    edit({ entries: (draft.entries || []).map((entry, current) => current === index ? { ...entry, ...values } : entry) })
  const supportsEntries = ['pages', 'blog', 'packages', 'reviews'].includes(section)
  const edit = (updates: Partial<Section>) => { setDraft({ ...draft, ...updates }); setDirty(true); setPreviewUrl('') }
  const saveDraft = async () => {
    await save(`${base}/sections/${section}`, draft)
    setEditor((previous) => previous && ({ ...previous, draft: { ...previous.draft, [section]: draft } }))
    setDirty(false)
    setNotice('Draft saved.')
  }
  const uploadImage = async (file: File) => {
    const form = new FormData()
    form.set('file', file)
    const token = localStorage.getItem('crm_auth_token') || sessionStorage.getItem('crm_auth_token')
    const response = await fetch(`${apiBase}${base}/media`, { method: 'POST', body: form, headers: { Authorization: `Bearer ${token}` } })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Upload failed.')
    edit({ image: data.url })
    setNotice('Image uploaded. Save the draft to keep it.')
  }

  if (!editor) return <p role={error ? 'alert' : 'status'}>{error || 'Loading site…'}</p>
  return <>
    <button className="gm-text-button" onClick={() => { if (!dirty || window.confirm('Discard unsaved changes?')) navigate('/websites') }}>← Websites</button>
    <div className="gm-row gm-heading"><div><h1>{editor.site.name}</h1><p>{editor.site.domain}</p></div>
      {canPublish && <button className="gm-button" disabled={busy || !section} onClick={() => perform(async () => {
        if (dirty) await saveDraft()
        await save(`${base}/publish`, {}, 'POST')
        setEditor(await request<SiteEditor>(base))
        setNotice('Website content published.')
      })}>Publish <ArrowUpRight size={17} /></button>}
    </div>
    {error && <p role="alert" className="gm-error">{error}</p>}{notice && <p role="status" className="gm-notice">{notice}</p>}
    <div className="gm-tabs">{editor.site.sections.map((item) => <button key={item} className={section === item ? 'active' : ''} disabled={busy} onClick={() => {
      if (item === section || (dirty && !window.confirm('Discard unsaved changes?'))) return
      setSection(item); setDraft(editor.draft[item] || emptySection); setDirty(false); setNotice('')
    }}>{label(item)}</button>)}</div>
    {section ? <div className="gm-editor-grid">
      <form className="gm-card gm-form" onSubmit={(event) => { event.preventDefault(); void perform(saveDraft) }}>
        <h2>{label(section)}</h2>
        <fieldset disabled={!canEdit || busy}>
          <label>{section === 'seo' ? 'Meta title' : 'Title'}<input value={draft.title} maxLength={180} onChange={(e) => edit({ title: e.target.value })} /></label>
          <label>{section === 'seo' ? 'Meta description' : 'Content'}<textarea rows={7} value={draft.body} maxLength={40000} onChange={(e) => edit({ body: e.target.value })} /></label>
          <label>Image URL<input type="url" value={draft.image} onChange={(e) => edit({ image: e.target.value })} /></label>
          {access?.modules.includes('media') && <label className="gm-upload"><Upload size={16} /> Upload image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void perform(() => uploadImage(file))
          }} /></label>}
          {supportsEntries && <>
            <h3>Entries</h3>
            {draft.entries?.map((entry, index) => <details className="gm-card gm-form" key={index}>
              <summary>{entry.title || `Entry ${index + 1}`}</summary>
              <label>URL slug<input value={entry.slug} onChange={(e) => replaceEntry(index, { slug: e.target.value })} /></label>
              <label>Title<input value={entry.title} onChange={(e) => replaceEntry(index, { title: e.target.value })} /></label>
              <label>Content<textarea rows={3} value={entry.body} onChange={(e) => replaceEntry(index, { body: e.target.value })} /></label>
              <label>Image URL<input type="url" value={entry.image} onChange={(e) => replaceEntry(index, { image: e.target.value })} /></label>
              <div className="gm-actions">
                <button type="button" className="gm-text-button" disabled={index === 0} onClick={() => {
                  const entries = [...(draft.entries || [])]
                  ;[entries[index - 1], entries[index]] = [entries[index], entries[index - 1]]
                  edit({ entries })
                }}>Move up</button>
                <button type="button" className="gm-text-button" onClick={() => edit({ entries: draft.entries?.filter((_, current) => current !== index) })}>Remove</button>
              </div>
            </details>)}
            <button type="button" className="gm-button secondary" onClick={() => edit({ entries: [...(draft.entries || []), { slug: '', ...emptySection }] })}>Add entry</button>
          </>}
        </fieldset>
        {canEdit && <div className="gm-actions">
          <button className="gm-button secondary" disabled={busy || !dirty}><Save size={16} /> Save draft</button>
          <button type="button" className="gm-button secondary" disabled={busy || dirty} onClick={() => perform(async () => {
            const { url } = await save<{ url: string }>(`${base}/preview`, {}, 'POST')
            setPreviewUrl(url)
          })}>Create site preview link</button>
          {previewUrl && <a className="gm-text-button" href={previewUrl} target="_blank" rel="noreferrer">Open site preview ↗</a>}
        </div>}
      </form>
      <section className="gm-card gm-preview">
        <div className="gm-row"><h2>Content preview</h2><span className="gm-tag">{editor.publishedAt ? 'Published version exists' : 'Unpublished'}</span></div>
        {draft.image && /^https:\/\//i.test(draft.image) && <img src={draft.image} alt="" />}
        <h3>{draft.title || 'Untitled section'}</h3><p>{draft.body || 'Content will appear here as you edit.'}</p>
        {draft.entries?.map((entry, index) => <div key={index}><strong>{entry.title || entry.slug}</strong><p>{entry.body}</p></div>)}
        {editor.publishedAt && <a className="gm-text-button" href={`https://${editor.site.domain}`} target="_blank" rel="noreferrer">Open public website ↗</a>}
      </section>
    </div> : <div className="gm-card">No editor sections are available on this plan.</div>}
  </>
}
