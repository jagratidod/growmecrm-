import { useState } from 'react';
import {
  ArrowDown, ArrowRight, Check, FileText, Globe2,
  Inbox, Link2, ListFilter, Radio, UsersRound,
} from 'lucide-react';

function WorkflowSection({ id, className = '', icon: Icon, label, title, summary, points, onPreview, children }) {
  return (
    <section id={id} className={`growme-container growme-workflow ${className}`} aria-labelledby={`growme-${id}-title`} data-growme-reveal>
      <div className="growme-workflow-copy">
        <span className="growme-workflow-label"><Icon size={16} />{label}</span>
        <h2 id={`growme-${id}-title`}>{title}</h2>
        <p>{summary}</p>
        <ul className="growme-workflow-points">
          {points.map(({ title, detail }) => <li key={title}><Check size={15} /><div><strong>{title}</strong><p>{detail}</p></div></li>)}
        </ul>
        <a className="growme-workflow-link" href="#workspace-preview" onClick={() => onPreview(id)}>View preview <ArrowRight size={16} /></a>
      </div>
      {children}
    </section>
  );
}

const leadTools = [
  { label: 'Leads', description: 'View enquiries, assign owners and update lead stages.' },
  { label: 'Follow-ups', description: 'Schedule calls, messages and reminders for your team.' },
  { label: 'Bookings', description: 'Manage booking details and track payments.' },
];

function LeadWorkflow() {
  const [selected, setSelected] = useState(0);
  return (
    <div className="growme-workflow-art growme-flow-crm">
      <div className="growme-flow-window">
        <div className="growme-flow-window-head"><strong><ListFilter size={16} /> Lead pipeline</strong></div>
        <div className="growme-flow-switcher" aria-label="CRM tools">
          {leadTools.map(({ label }, index) => <button type="button" key={label} aria-pressed={selected === index} onClick={() => setSelected(index)}>{label}</button>)}
        </div>
        <div className="growme-flow-lead-detail" aria-live="polite">
          <p key={selected} className="growme-flow-update">{leadTools[selected].description}</p>
        </div>
      </div>
    </div>
  );
}

const sources = [
  { label: 'Lead ads', icon: Inbox, input: 'Facebook & Instagram', event: 'Configured webhook', result: 'New lead entry' },
  { label: 'WhatsApp', icon: Radio, input: 'WhatsApp Cloud API', event: 'Inbound message', result: 'Lead or activity' },
];

function ConnectionWorkflow() {
  const [selected, setSelected] = useState(0);
  const source = sources[selected];
  const SourceIcon = source.icon;
  return (
    <div className="growme-workflow-art growme-flow-meta">
      <div className="growme-flow-window">
        <div className="growme-flow-window-head"><strong><Link2 size={16} /> Lead sources</strong></div>
        <div className="growme-flow-switcher" aria-label="Lead sources">
          {sources.map(({ label }, index) => <button type="button" key={label} aria-pressed={selected === index} onClick={() => setSelected(index)}>{label}</button>)}
        </div>
        <div className="growme-source-flow" aria-live="polite">
          <div><SourceIcon size={17} /><span key={source.input} className="growme-flow-update">{source.input}</span></div>
          <ArrowDown size={15} className="growme-flow-arrow" />
          <div><Link2 size={17} /><span key={source.event} className="growme-flow-update">{source.event}</span></div>
          <ArrowDown size={15} className="growme-flow-arrow" />
          <div><UsersRound size={17} /><span key={source.result} className="growme-flow-update">{source.result}</span></div>
        </div>
      </div>
    </div>
  );
}

function PublishingWorkflow() {
  const [published, setPublished] = useState(false);
  return (
    <div className="growme-workflow-art growme-flow-website">
      <div className="growme-flow-window">
        <div className="growme-flow-window-head"><strong><Globe2 size={16} /> Website editor</strong></div>
        <div className="growme-flow-switcher" aria-label="Website versions">
          <button type="button" aria-pressed={!published} onClick={() => setPublished(false)}>Draft</button>
          <button type="button" aria-pressed={published} onClick={() => setPublished(true)}>Published</button>
        </div>
        <div className="growme-publish-preview" aria-live="polite">
          <div><FileText size={14} /> Homepage </div>
          <strong key={published} className="growme-flow-update">{published ? 'Published content' : 'Saved changes'}</strong>
          <small>{published ? 'The connected website can display the published version.' : 'Review changes before publishing them.'}</small>
        </div>
      </div>
    </div>
  );
}

export default function FeatureDetails({ onPreview }) {
  return (
    <div className="growme-workflows">
      <WorkflowSection id="crm" icon={UsersRound} label="CRM" title="From first enquiry to the next follow-up."
        summary="See where each enquiry came from and what your team needs to do next."
        points={[
          { title: 'Leads and follow-ups', detail: 'Assign leads, update stages and record conversations.' },
          { title: 'Bookings and invoices', detail: 'Track departures, payments and invoices alongside your sales work.' },
        ]} onPreview={onPreview}>
        <LeadWorkflow />
      </WorkflowSection>

      <WorkflowSection id="meta" className="growme-workflow-reverse" icon={Link2} label="Meta Connections"
        title="Send Meta enquiries to the right workspace."
        summary="Set up lead sources for your business so inbound enquiries land in your GrowMe CRM."
        points={[
          { title: 'Facebook and Instagram lead ads', detail: 'Use a configured integration to send lead forms into GrowMe.' },
          { title: 'Incoming WhatsApp messages', detail: 'Set up a webhook to create a lead or log a message against an existing contact.' },
        ]} onPreview={onPreview}>
        <ConnectionWorkflow />
      </WorkflowSection>

      <WorkflowSection id="websites" icon={Globe2} label="Website Management" title="Make an update. Preview it. Publish it."
        summary="Manage content for connected websites from GrowMe, with each site on its own domain."
        points={[
          { title: 'Edit your site content', detail: 'Update your homepage, pages, blogs, images and SEO fields where enabled.' },
          { title: 'Publish when it is ready', detail: 'Review saved drafts before publishing updates to visitors.' },
        ]} onPreview={onPreview}>
        <PublishingWorkflow />
      </WorkflowSection>
    </div>
  );
}
