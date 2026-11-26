import { useEffect } from 'react'
import { useHostPage } from '../../context/HostPageContext'
import { WebsiteLinkCard } from './components/WebsiteLinkCard'
import { BannerAboutCard } from './components/BannerAboutCard'
import { HostContactCard } from './components/HostContactCard'
import { HostReviewsCard } from './components/HostReviewsCard'
import { PublicWebsitePreviewModal } from './components/PublicWebsitePreviewModal'

export function HostPage() {
  const { refreshHostPage, isLoading, loadError, setIsPublicPreviewOpen } = useHostPage()

  useEffect(() => {
    void refreshHostPage()
    return () => setIsPublicPreviewOpen(false)
  }, [refreshHostPage, setIsPublicPreviewOpen])

  return <section className="gm-list" aria-labelledby="host-page-heading">
    <div>
      <h2 className="gm-section-title" id="host-page-heading">Host page</h2>
      <p className="gm-muted">Edit your banner, business information and reviews.</p>
    </div>
    {isLoading ? <p role="status">Loading host page…</p> :
      loadError ? <p role="alert" className="gm-error">{loadError}</p> :
        <>
          <WebsiteLinkCard />
          <BannerAboutCard />
          <HostContactCard />
          <HostReviewsCard />
          <PublicWebsitePreviewModal />
        </>
    }
  </section>
}
