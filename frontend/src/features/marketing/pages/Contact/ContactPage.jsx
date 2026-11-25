import { useState } from 'react';
import { submitContactForm } from '../../services/api';
import '../Home/home.css';
import '../Home/homepage-layout.css';

const contactEmail = import.meta.env.VITE_MARKETING_CONTACT_EMAIL;
const contactApi = import.meta.env.VITE_MARKETING_API_BASE_URL;

export default function ContactPage() {
  const [status, setStatus] = useState('idle');

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus('sending');
    try {
      await submitContactForm(Object.fromEntries(new FormData(form)));
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section className="growme-container growme-contact">
      <h1>Contact GrowMe</h1>
      {contactEmail && <p><a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>}
      {contactApi ? (
        <form onSubmit={submit}>
          <label>Name<input name="name" autoComplete="name" required /></label>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Subject<input name="subject" required /></label>
          <label>Message<textarea name="message" rows={5} required /></label>
          <button className="growme-primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
          {status === 'sent' && <p role="status">Message sent.</p>}
          {status === 'error' && <p role="alert">The message couldn’t be sent. Please try again.</p>}
        </form>
      ) : !contactEmail && <p>Contact enquiries are currently unavailable.</p>}
    </section>
  );
}
