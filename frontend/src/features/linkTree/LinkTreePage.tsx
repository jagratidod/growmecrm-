import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Copy, ExternalLink, Link2, Trash2 } from 'lucide-react'
import { linkTreeService } from '../../services/linkTreeService'
import type { LinkTreeData } from '../../services/linkTreeService'

export function LinkTreePage() {
  const [profile, setProfile] = useState<LinkTreeData>()
  const [bioTitle, setBioTitle] = useState('')
  const [bioTagline, setBioTagline] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [pending, setPending] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    linkTreeService.getLinkTree(controller.signal).then((data) => {
      if (controller.signal.aborted) return
      setProfile(data)
      setBioTitle(data.bioTitle)
      setBioTagline(data.bioTagline)
    }, (error: Error) => {
      if (!controller.signal.aborted) setLoadError(error.message)
    })
    return () => controller.abort()
  }, [])

  const perform = async (action: () => Promise<void>, message: string) => {
    setPending(true)
    setError('')
    setNotice('')
    try {
      await action()
      setNotice(message)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setPending(false)
    }
  }

  const updateLinks = (links: LinkTreeData['links']) =>
    setProfile((previous) => previous && { ...previous, links })

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void perform(async () => {
      const data = await linkTreeService.updateLinkTree({ bioTitle, bioTagline })
      setBioTitle(data.bioTitle)
      setBioTagline(data.bioTagline)
    }, 'Profile saved.')
  }

  const addLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void perform(async () => {
      const rawUrl = newUrl.trim()
      const href = /^[a-z][a-z\d+.-]*:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
      const url = new URL(href)
      if (!['https:', 'http:'].includes(url.protocol) || url.password || url.username) {
        throw new Error('Enter a valid web address.')
      }
      const { linkTree } = await linkTreeService.addLink({ title: newTitle.trim(), url: url.href })
      updateLinks(linkTree.links)
      setNewTitle('')
      setNewUrl('')
    }, 'Link added.')
  }

  if (loadError) return <section className="gm-card" aria-labelledby="linktree-heading">
    <h2 id="linktree-heading">LinkTree</h2>
    <p role="alert" className="gm-error">{loadError}</p>
  </section>
  if (!profile) return <p role="status">Loading LinkTree…</p>

  const publicUrl = profile.publicUrl
  const visibleLinks = profile.links.filter(({ active }) => active)

  return <section className="gm-list" aria-labelledby="linktree-heading">
    <div className="gm-row">
      <div>
        <h2 className="gm-section-title" id="linktree-heading">LinkTree</h2>
        <p className="gm-muted">Create one link in bio for your social profiles.</p>
      </div>
      {publicUrl && <div className="gm-linktree-actions">
        <button type="button" className="gm-button secondary" disabled={pending}
          onClick={() => void perform(() => navigator.clipboard.writeText(publicUrl), 'Link copied.')}>
          <Copy size={16} /> Copy link
        </button>
        <a className="gm-button" href={publicUrl} target="_blank" rel="noreferrer">
          <ExternalLink size={16} /> Open page
        </a>
      </div>}
    </div>
    {error && <p role="alert" className="gm-error">{error}</p>}
    {notice && <p role="status" className="gm-notice">{notice}</p>}
    <div className="gm-linktree-grid">
      <div className="gm-list">
        <form className="gm-card gm-form" onSubmit={saveProfile}>
          <h3>Profile</h3>
          <fieldset disabled={pending}>
            <label>Display title<input value={bioTitle} onChange={(event) => setBioTitle(event.target.value)} required /></label>
            <label>Tagline<input value={bioTagline} onChange={(event) => setBioTagline(event.target.value)} /></label>
            <button className="gm-button" type="submit">Save profile</button>
          </fieldset>
        </form>
        <div className="gm-card gm-list">
          <h3>Links</h3>
          <form className="gm-form" onSubmit={addLink}>
            <fieldset className="gm-linktree-fields" disabled={pending}>
              <label>Link title<input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} required /></label>
              <label>URL<input value={newUrl} onChange={(event) => setNewUrl(event.target.value)} inputMode="url" required /></label>
              <button className="gm-button" type="submit">Add link</button>
            </fieldset>
          </form>
          {profile.links.length ? <ul className="gm-list gm-linktree-links">
            {profile.links.map((item) => <li key={item.id}>
              <div><strong>{item.title}</strong><span className="gm-muted">{item.url}</span></div>
              <div className="gm-linktree-actions">
                <button type="button" className="gm-button secondary" disabled={pending}
                  aria-label={`${item.active ? 'Hide' : 'Show'} ${item.title}`}
                  onClick={() => void perform(async () => updateLinks((await linkTreeService.toggleLink(item.id)).links), item.active ? 'Link hidden.' : 'Link visible.')}>
                  {item.active ? 'Hide' : 'Show'}
                </button>
                <button type="button" className="gm-icon-button" disabled={pending} aria-label={`Remove ${item.title}`}
                  onClick={() => void perform(async () => updateLinks((await linkTreeService.deleteLink(item.id)).links), 'Link removed.')}>
                  <Trash2 size={16} />
                </button>
              </div>
            </li>)}
          </ul> : <p className="gm-muted">No links added yet.</p>}
        </div>
      </div>
      <aside className="gm-card gm-list gm-linktree-preview" aria-label="LinkTree preview">
        <h3>Preview</h3>
        <div className="gm-linktree-public">
          <span className="gm-card-icon"><Link2 size={21} aria-hidden="true" /></span>
          {bioTitle && <strong>{bioTitle}</strong>}
          {bioTagline && <p>{bioTagline}</p>}
          {visibleLinks.length ? <ul>{visibleLinks.map((link) => <li key={link.id}>{link.title}</li>)}</ul> :
            <p className="gm-muted">Visible links will appear here.</p>}
        </div>
      </aside>
    </div>
  </section>
}
