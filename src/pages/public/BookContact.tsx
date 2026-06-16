import { useEffect, useRef, useState } from 'react';
import PublicLayout from '../../components/layout/PublicLayout';
import FormStatus from '../../components/ui/FormStatus';
import { useContactForm } from '../../lib/useContactForm';
import { usePageMeta } from '../../lib/usePageMeta';

const appointmentTypes = [
  {
    title: 'Buyer Consultation',
    text: 'Discuss budget, location, pre-approval, timing, and next steps.',
  },
  {
    title: 'Seller Strategy Call',
    text: 'Discuss home value, preparation, timing, and selling options.',
  },
  {
    title: 'Mobile Notary Appointment',
    text: 'Share location, document type, signer details, and preferred time.',
  },
];

const serviceOptions = [
  'General Question',
  'Buyer Consultation',
  'Seller Strategy Call',
  'Mobile Notary Appointment',
  'Home Value Review',
  'Buyer Guide Request',
  'Seller Guide Request',
  'Market Updates Request',
  'Vacation Rental Interest',
];

function getQueryValue(key: string) {
  return new URLSearchParams(window.location.search).get(key) ?? '';
}

function BookContact() {
  usePageMeta(
    'Book or Contact',
    'Book a buyer consultation, seller strategy call, or mobile notary appointment, or send Daiana a general question.',
  );
  const formRef = useRef<HTMLFormElement>(null);
  const { status, submit } = useContactForm('Iris & J Holdings Contact Request');
  const [selectedService, setSelectedService] = useState(() => getQueryValue('service'));
  const [messageValue, setMessageValue] = useState(() => getQueryValue('message'));

  useEffect(() => {
    if (selectedService || messageValue || window.location.hash === '#contact-form') {
      window.requestAnimationFrame(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [messageValue, selectedService]);

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero page-hero-contact">
          <div className="page-hero-content">
            <p className="eyebrow">Book or Contact</p>
            <h1>Choose the conversation that fits where you are.</h1>
            <p>
              Tell Daiana what you need help with and the site will point visitors toward the right path:
              buyer consultation, seller strategy, mobile notary, or a general question.
            </p>
            <div className="page-actions">
              <a className="button button-primary" href="#appointment-types">Choose Appointment Type</a>
            </div>
          </div>
          <div className="page-hero-visual contact-hero-visual" aria-label="Contact and appointment request visual" />
        </section>

        <section className="page-content" id="appointment-types">
          <div className="page-intro">
            <p className="eyebrow">Start here</p>
            <h2>One calm path for calls, questions, and appointment requests.</h2>
            <p>
              Choose a request type, then send the details directly to Daiana by email.
            </p>
          </div>

          <div className="content-grid">
            {appointmentTypes.map((type) => (
              <a
                className="content-card"
                href="#contact-form"
                key={type.title}
                onClick={() => setSelectedService(type.title)}
              >
                <h3>{type.title}</h3>
                <p>{type.text}</p>
                <span className="card-link">Select this request</span>
              </a>
            ))}
          </div>

          <section className="split-section">
            <div className="quiet-band">
              <p className="eyebrow">Not sure?</p>
              <h2>Ask a question first.</h2>
              <p>
                Visitors who are not ready to schedule should still have a simple way to reach out and get pointed
                in the right direction.
              </p>
            </div>
            <form
              className="info-panel form-shell"
              id="contact-form"
              onSubmit={submit}
              ref={formRef}
            >
              <input className="hp-field" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="form-row">
                <div className="input-group"><label htmlFor="contact-name">Name</label><input id="contact-name" name="name" required /></div>
                <div className="input-group"><label htmlFor="contact-email">Email</label><input id="contact-email" name="email" type="email" required /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label htmlFor="contact-phone">Phone</label><input id="contact-phone" name="phone" type="tel" /></div>
                <div className="input-group">
                  <label htmlFor="contact-service">Service</label>
                  <select
                    id="contact-service"
                    name="service"
                    onChange={(event) => setSelectedService(event.target.value)}
                    required
                    value={selectedService}
                  >
                    <option value="">Choose a service</option>
                    {serviceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  onChange={(event) => setMessageValue(event.target.value)}
                  required
                  value={messageValue}
                />
              </div>
              <button className="button button-primary" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
              <FormStatus status={status} />
            </form>
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default BookContact;
