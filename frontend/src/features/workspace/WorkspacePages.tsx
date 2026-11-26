import { lazy, Suspense, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowUpRight, Globe, Link2, Menu, PanelTop, Save, Upload } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useRouter } from '../../context/RouterContext'
import { request } from '../../services/api'
import { useWorkspace } from './WorkspaceAccess'
import { moduleNames, save, websitePaths } from './workspaceApi'
import type { Entry, Section, Site, SiteEditor } from './workspaceApi'

const LinkTreePage = lazy(() => import('../linkTree/LinkTreePage').then((page) => ({ default: page.LinkTreePage })))
const HostPage = lazy(() => import('../hostPage/HostPage').then((page) => ({ default: page.HostPage })))

const websiteSections = [
  { title: 'Connected sites', path: websitePaths.sites, icon: Globe },
  { title: 'LinkTree', path: websitePaths.linkTree, icon: Link2 },
  { title: 'Host page', path: websitePaths.hostPage, icon: PanelTop },
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

export function WebsitesPage() {
  const { navigate, path } = useRouter()
  const activeSection = path === websitePaths.linkTree || path === websitePaths.hostPage ? path : websitePaths.sites
  const siteId = activeSection === websitePaths.sites ? path.split('/')[2] : undefined

  return <Shell current="Websites">
    {siteId ? <WebsiteEditor key={siteId} siteId={siteId} /> : <>
      <div className="gm-heading gm-websites-heading">
        <h1>Websites</h1>
        <p>Manage connected sites, your link in bio, and your hosted page.</p>
      </div>
      <nav className="gm-tabs gm-websites-nav" aria-label="Website tools">
        {websiteSections.map(({ title, path: href, icon: Icon }) =>
          <a key={href} href={href} aria-current={activeSection === href ? 'page' : undefined}
            onClick={(event) => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
              event.preventDefault()
              if (href !== activeSection) navigate(href)
            }}>
            <Icon size={17} aria-hidden="true" />{title}
          </a>
        )}
      </nav>
      <Suspense fallback={<p role="status">Loading website tools…</p>}>
        {activeSection === websitePaths.linkTree ? <LinkTreePage /> :
          activeSection === websitePaths.hostPage ? <HostPage /> : <ConnectedSites />}
      </Suspense>
    </>}
  </Shell>
}

function ConnectedSites() {
  const { navigate } = useRouter()
  const [sites, setSites] = useState<Site[]>()
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    request<{ sites: Site[] }>('/workspace/websites', { signal: controller.signal }).then(
      ({ sites }) => setSites(sites),
      (error: Error) => { if (!controller.signal.aborted) setError(error.message) },
    )
    return () => controller.abort()
  }, [])

  if (error) return <p role="alert" className="gm-error">{error}</p>
  if (!sites) return <p role="status">Loading websites…</p>
  if (!sites.length) return <div className="gm-card gm-list">
    <span className="gm-card-icon"><Globe size={21} aria-hidden="true" /></span>
    <div><h2>No websites connected</h2><p>Your sites will appear here once GrowMe connects them.</p></div>
  </div>

  return <div className="gm-grid">{sites.map((site) => <button key={site._id} className="gm-card gm-tile" onClick={() => navigate(`${websitePaths.sites}/${site._id}`)}>
    <div className="gm-tile-head"><span className="gm-card-icon"><Globe size={21} /></span><ArrowUpRight size={19} /></div>
    <h2>{site.name}</h2><p>{site.domain}</p>
  </button>)}</div>
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
    const { url } = await request<{ url: string }>(`${base}/media`, { method: 'POST', body: form })
    edit({ image: url })
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
          <label>Cloudinary image URL<input type="url" value={draft.image} onChange={(e) => edit({ image: e.target.value })} /></label>
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
              <label>Cloudinary image URL<input type="url" value={entry.image} onChange={(e) => replaceEntry(index, { image: e.target.value })} /></label>
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
