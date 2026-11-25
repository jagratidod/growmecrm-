import { useEffect, useState } from 'react';
import {
  ArrowDown, ArrowRight, CalendarDays, Check, ChevronRight,
  Globe2, Inbox, Layers3, Link2, Radio,
  Search, UsersRound,
} from 'lucide-react';
import FeatureDetails from './FeatureDetails';
import GettingStarted from './GettingStarted';
import './home.css';
import './homepage-layout.css';

const views = [
  { id: 'crm', label: 'CRM', icon: UsersRound },
  { id: 'meta', label: 'Meta Connections', mobileLabel: 'Meta', icon: Radio },
  { id: 'websites', label: 'Websites', icon: Globe2 },
];

const featureLinks = [
  { id: 'crm', label: 'CRM', detail: 'Track leads, follow-ups and bookings.', icon: UsersRound },
  { id: 'meta', label: 'Meta Connections', detail: 'Bring enquiries in through configured lead sources.', icon: Radio },
  { id: 'websites', label: 'Website Management', detail: 'Edit, preview and publish website content.', icon: Globe2 },
];

function WorkspacePreview({ selected, select }) {
  return (
    <div className="growme-window" aria-label="GrowMe workspace preview">
      <div className="growme-window-bar">
        <div className="growme-window-controls" aria-hidden="true"><i /><i /><i /></div>
        <span><Layers3 size={13} /> Workspace preview</span>
      </div>
      <div className="growme-window-main">
        <div className="growme-window-sidebar" aria-label="Preview modules">
          <div className="growme-preview-brand"><span>G</span> GrowMe</div>
          {views.map(({ id, label, mobileLabel, icon: Icon }) => (
            <button type="button" key={id} onClick={() => select(id)} aria-pressed={selected === id} aria-label={label}>
              <Icon size={16} /><span className="growme-preview-label">{label}</span><span className="growme-preview-label-mobile">{mobileLabel || label}</span>
            </button>
          ))}
        </div>
        <div className="growme-window-content" aria-live="polite">
          <div key={selected} className="growme-preview-panel">
            {selected === 'crm' && <CrmPreview />}
            {selected === 'meta' && <MetaPreview />}
            {selected === 'websites' && <WebsitePreview />}
          </div>
        </div>
      </div>
    </div>
  );
}

function CrmPreview() {
  return (
    <>
      <div className="growme-panel-heading"><div><h2>Lead pipeline</h2></div><UsersRound size={21} /></div>
      <div className="growme-preview-list">
        <div><i className="purple"><Inbox size={19} /></i><section><strong>Leads</strong><small>Capture enquiries and assign them to your team.</small></section></div>
        <div><i className="blue"><CalendarDays size={19} /></i><section><strong>Follow-ups</strong><small>Schedule the next step for each lead.</small></section></div>
        <div><i className="green"><Check size={19} /></i><section><strong>Bookings</strong><small>Track confirmed bookings and payments.</small></section></div>
      </div>
    </>
  );
}

function MetaPreview() {
  return (
    <>
      <div className="growme-panel-heading"><div><span>Lead sources</span><h2>Meta Connections</h2></div><Radio size={21} /></div>
      <div className="growme-preview-list">
        <div><i className="blue"><Inbox size={19} /></i><section><strong>Facebook & Instagram lead ads</strong><small>Receive lead events through a configured webhook.</small></section><ChevronRight size={16} /></div>
        <div><i className="green"><Radio size={19} /></i><section><strong>WhatsApp Cloud API</strong><small>Record inbound enquiries and lead activity.</small></section><ChevronRight size={16} /></div>
        <div><i className="purple"><Link2 size={19} /></i><section><strong>Lead integrations</strong><small>Send form submissions to your organisation’s CRM.</small></section><ChevronRight size={16} /></div>
      </div>
    </>
  );
}

function WebsitePreview() {
  return (
    <>
      <div className="growme-panel-heading"><div><h2>Website editor</h2></div><Globe2 size={21} /></div>
      <div className="growme-preview-list">
        <div><i className="purple"><Layers3 size={19} /></i><section><strong>Homepage</strong><small>Headline, imagery and featured content</small></section></div>
        <div><i className="blue"><Globe2 size={19} /></i><section><strong>Pages</strong><small>Edit, preview and publish page content.</small></section></div>
        <div><i className="green"><Search size={19} /></i><section><strong>SEO settings</strong><small>Page title and meta description</small></section><ChevronRight size={16} /></div>
      </div>
    </>
  );
}

export default function HomePage() {
  const [selected, setSelected] = useState('crm');

  useEffect(() => {
    document.title = 'GrowMe — CRM & Website Management';
  }, []);

  return (
    <>
      <section className="growme-hero">
        <div className="growme-container growme-hero-layout">
          <div className="growme-hero-copy">
            <h1>Your leads<br className="growme-hero-break" /> and websites.<br /><span>One workspace.</span></h1>
            <p>Manage customer enquiries, connect Meta lead sources and publish website updates from GrowMe.</p>
            <div className="growme-hero-actions">
              <a className="growme-primary" href="/signup">Create a workspace <ArrowRight size={17} /></a>
              <a className="growme-secondary" href="#features">Explore features <ArrowDown size={16} /></a>
            </div>
          </div>
          <div id="workspace-preview" className="growme-preview-wrap">
            <WorkspacePreview selected={selected} select={setSelected} />
          </div>
        </div>
      </section>

      <section className="growme-container growme-feature-directory" id="features" aria-labelledby="growme-features-title" data-growme-reveal>
        <h2 id="growme-features-title">Explore GrowMe.</h2>
        <nav aria-label="Explore GrowMe features">
          {featureLinks.map(({ id, label, detail, icon: Icon }) => (
            <a key={id} href={`#${id}`} className={`growme-directory-link growme-directory-${id}`}>
              <span className="growme-directory-icon"><Icon size={20} /></span>
              <span><strong>{label}</strong><small>{detail}</small></span>
              <ArrowRight className="growme-directory-arrow" size={17} />
            </a>
          ))}
        </nav>
      </section>

      <FeatureDetails onPreview={setSelected} />
      <GettingStarted />
    </>
  );
}
