import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteFooter, SiteHeader } from './SiteNavigation';
import ScrollToTop from '../../utils/ScrollToTop';

export default function MainLayout() {
  const site = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== '/' || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('growme-revealed');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });

    site.current?.querySelectorAll('[data-growme-reveal]').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div className="growme-home" ref={site}>
      <ScrollToTop />
      <a className="growme-skip" href="#product">Skip to content</a>
      <SiteHeader />
      <main id="product">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
