import { useEffect, useRef, useState } from 'react';
import PublicLayout from '../../components/layout/PublicLayout';
import FormStatus from '../../components/ui/FormStatus';
import { useContactForm } from '../../lib/useContactForm';
import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';
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
  const template = getSiteContentTemplate('book');
  const { content, heroImageUrl } = usePublicSiteContent('book', template?.defaults || {});

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
            <p className="eyebrow">{content.heroEyebrow}</p>
            <h1>{content.heroTitle}</h1>
            <p>{content.heroDescription}</p>
          </div>
          <div className="page-hero-visual page-hero-image-frame contact-hero-visual" aria-label="Contact and appointment request visual">
            <img src={heroImageUrl || '/images/site/contact-hero.jpg'} alt="Elegant consultation table for appointment planning" />
          </div>
        </section>

        <section className="page-content" id="appointment-types">
          <div className="page-intro">
            <p className="eyebrow">Start here</p>
            <h2>Calls, questions, and appointment requests.</h2>
            <p>
              Choose a request type, then send the details directly to Daiana by email.
            </p>
          </div>

          <div className="content-grid">
            {appointmentTypes.map((type) => (
              <a className="content-card contact-select-card"
                href="#contact-form"
                key={type.title}
                onClick={(event) => {
                  event.preventDefault();
                  setSelectedService(type.title);
                  window.requestAnimationFrame(() => {
                    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  });
                }}
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
                Not ready to schedule? Send a question — about buying, selling, a home value, or a notary visit —
                and Daiana will help you figure out the right next step.
              </p>
              <div className="notice-box">
                Submitting this form starts a request only. It does not create a brokerage relationship,
                listing agreement, buyer agency agreement, notary appointment, or vacation rental booking.
                Real estate services are provided through All Star Real Estate Agency only after the required
                New Jersey disclosures and written agreements are completed. Please do not submit confidential
                legal, financial, or medical information through this form.
              </div>
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
