import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import './site-navigation.css';

const setupLink = "/#getting-started";

const productLinks = [
  { label: 'CRM', hash: '#crm' },
  { label: 'Meta Connections', hash: '#meta' },
  { label: 'Website Management', hash: '#websites' },
];

function SiteLogo({ footer = false }) {
  return <Link to="/" className="growme-home-logo" aria-label="GrowMe home">
    <img src="/marketing/growme-logo.png" alt="GrowMe" width={footer ? 91 : 105} height={footer ? 33 : 38} />
  </Link>;
}

function useNavigationDisclosure() {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event) => {
      if (!container.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return { open, setOpen, container, trigger };
}

function ProductMenu() {
  const { open, setOpen, container, trigger } = useNavigationDisclosure();
  return <div ref={container} className="growme-product-menu">
    <button ref={trigger} type="button" aria-expanded={open} aria-controls="growme-product-links" onClick={() => setOpen(!open)}>
      Product <ChevronDown size={14} />
    </button>
    <ul id="growme-product-links" data-open={open} aria-hidden={!open} inert={!open}>
      {productLinks.map(({ label, hash }) => <li key={hash}><Link to={`/${hash}`} onClick={() => setOpen(false)}>{label}</Link></li>)}
    </ul>
  </div>;
}

function MobileNavigation() {
  const { open, setOpen, container, trigger } = useNavigationDisclosure();
  return <div ref={container} className="growme-mobile-navigation">
    <button ref={trigger} type="button" className="growme-mobile-trigger" aria-expanded={open}
      aria-controls="growme-mobile-links" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
      {open ? <X size={21} /> : <Menu size={21} />}
    </button>
    <nav id="growme-mobile-links" className="growme-mobile-menu" aria-label="Mobile navigation" data-open={open} aria-hidden={!open} inert={!open}>
      <div className="growme-mobile-product">
        <p>Product</p>
        {productLinks.map(({ label, hash }) => <Link key={hash} to={`/${hash}`} onClick={() => setOpen(false)}>{label}</Link>)}
      </div>
      <div className="growme-mobile-company">
        <Link to={setupLink} onClick={() => setOpen(false)}>Getting started</Link>
        <NavLink to="/services" onClick={() => setOpen(false)}>Services</NavLink>
        <NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink>
      </div>
      <div className="growme-mobile-auth">
        <a className="growme-secondary" href="/login">Log in</a>
        <a className="growme-primary" href="/signup">Sign up</a>
      </div>
    </nav>
  </div>;
}

export function SiteHeader() {
  return <header className="growme-site-header">
    <div className="growme-container growme-head-inner">
      <SiteLogo />
      <nav className="growme-header-links" aria-label="Main navigation">
        <ProductMenu />
        <Link to={setupLink}>Getting started</Link>
        <NavLink to="/services">Services</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </nav>
      <div className="growme-home-auth">
        <a className="growme-login" href="/login">Log in</a>
        <a className="growme-primary growme-small" href="/signup">Sign up</a>
      </div>
      <MobileNavigation />
    </div>
  </header>;
}

export function SiteFooter() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return <footer className={`growme-site-footer${isHome ? ' growme-site-footer-home' : ''}`}>
    <div className="growme-container">
      {isHome && <section className="growme-footer-cta" aria-labelledby="growme-footer-cta-heading" data-growme-reveal>
        <h2 id="growme-footer-cta-heading">Set up your GrowMe workspace.</h2>
        <a className="growme-primary" href="/signup">Sign up <ArrowRight size={17} /></a>
      </section>}
      <div className="growme-footer-main">
        <SiteLogo footer />
        <nav className="growme-footer-group" aria-label="Product">
          <p>Product</p>
          {productLinks.map(({ label, hash }) => <Link key={hash} to={`/${hash}`}>{label}</Link>)}
        </nav>
        <nav className="growme-footer-group" aria-label="Company">
          <p>Company</p>
          <Link to={setupLink}>Getting started</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
      <div className="growme-footer-bottom">
        <span>© {new Date().getFullYear()} GrowMe</span>
        <nav aria-label="Legal and account">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-and-conditions">Terms</Link>
          <a href="/login">Log in</a>
        </nav>
      </div>
    </div>
    {isHome && <div className="growme-footer-wordmark" aria-hidden="true" data-growme-reveal>
      <img src="/marketing/growme-logo.png" alt="" width="2172" height="724" loading="lazy" />
    </div>}
  </footer>;
}
