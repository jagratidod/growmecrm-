import { Link } from 'react-router-dom';
import { ArrowUpRight, Layers3, Link2, Plus, UsersRound } from 'lucide-react';

const steps = [
  { icon: Layers3, title: 'Create a workspace', detail: 'Set up your business account and start organising enquiries in the CRM.' },
  { icon: Link2, title: 'Connect your tools', detail: 'Add your website or configure Meta lead sources for the modules you use.' },
  { icon: UsersRound, title: 'Invite your team', detail: 'Give teammates access to handle enquiries, edit content or publish updates.' },
];

const questions = [
  {
    question: 'Can I use GrowMe without connecting a website?',
    answer: 'Yes. You can use the CRM for leads, follow-ups and bookings. Website management is available when a site is connected and its module is enabled on your plan.',
  },
  {
    question: 'Can GrowMe manage my existing website?',
    answer: 'Yes, once the site is connected to GrowMe. Your website needs to read published content from GrowMe and route enquiries through its integration.',
  },
  {
    question: 'Which Meta enquiries can I bring in?',
    answer: 'You can configure webhook-based integrations for Facebook and Instagram lead ads and incoming WhatsApp Cloud API messages. Each source needs its own setup.',
  },
  {
    question: 'Can different teammates have different access?',
    answer: 'Yes. Your plan controls which modules are available, and team roles control actions such as editing or publishing website content.',
  },
];

export default function GettingStarted() {
  return (
    <>
      <section id="getting-started" className="growme-container growme-setup" aria-labelledby="growme-setup-title" data-growme-reveal>
        <div className="growme-setup-heading">
          <h2 id="growme-setup-title">Make GrowMe yours.</h2>
          <Link to="/services">Explore setup services <ArrowUpRight size={15} /></Link>
        </div>
        <ol className="growme-setup-steps">
          {steps.map(({ icon: Icon, title, detail }) => <li key={title}>
            <span className="growme-setup-icon"><Icon size={21} /></span>
            <h3>{title}</h3>
            <p>{detail}</p>
          </li>)}
        </ol>
      </section>

      <section className="growme-container growme-faq" aria-labelledby="growme-faq-title" data-growme-reveal>
        <h2 id="growme-faq-title">Common questions.</h2>
        <div className="growme-faq-list">
          {questions.map(({ question, answer }) => <details key={question} name="growme-faq">
            <summary>{question}<Plus size={18} aria-hidden="true" /></summary>
            <div className="growme-faq-answer"><p>{answer}</p></div>
          </details>)}
        </div>
      </section>
    </>
  );
}
