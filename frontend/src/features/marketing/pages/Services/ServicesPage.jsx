import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Globe2, Link2, UsersRound } from 'lucide-react';
import './services.css';

const offerings = [
  {
    title: 'Custom Website Development',
    icon: Globe2,
    color: 'violet',
    summary: 'A custom website for your brand, on your own domain.',
    deliverables: ['Responsive design and development', 'GrowMe content editor setup', 'Publishing and launch support'],
  },
  {
    title: 'CRM Setup',
    icon: UsersRound,
    color: 'blue',
    summary: 'A GrowMe workspace configured around how your team handles enquiries.',
    deliverables: ['Lead pipeline and follow-ups', 'Team roles and access', 'Workspace onboarding'],
  },
  {
    title: 'Meta & Lead Integrations',
    icon: Link2,
    color: 'green',
    summary: 'Connect your lead sources so enquiries reach the right GrowMe workspace.',
    deliverables: ['Facebook and Instagram lead ads', 'Incoming WhatsApp enquiries', 'Website forms and webhook setup'],
  },
];

export default function ServicesPage() {
  useEffect(() => {
    document.title = 'Services · GrowMe';
  }, []);

  return (
    <div className="growme-container growme-services">
      <header className="growme-services-heading">
        <h1>Services</h1>
        <p>We build custom websites and set up GrowMe for your team.</p>
      </header>

      <div className="growme-services-grid">
        {offerings.map(({ title, icon: Icon, color, summary, deliverables }) => (
          <article className={`growme-service-card growme-service-${color}`} key={title}>
            <div className="growme-service-icon"><Icon size={21} /></div>
            <h2>{title}</h2>
            <p>{summary}</p>
            <ul>
              {deliverables.map((item) => <li key={item}><Check size={15} />{item}</li>)}
            </ul>
          </article>
        ))}
      </div>

      <div className="growme-service-contact">
        <h2>Tell us what you need.</h2>
        <Link to="/contact" className="growme-primary">Discuss your project <ArrowRight size={16} /></Link>
      </div>
    </div>
  );
}
