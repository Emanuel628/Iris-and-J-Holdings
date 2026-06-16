import { useState } from 'react';
import PublicLayout from '../../components/layout/PublicLayout';
import { sendMailRequest } from '../../lib/emailRequests';

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

function getInitialService() {
  return new URLSearchParams(window.location.search).get('service') ?? '';
}

function BookContact() {
  const [selectedService, setSelectedService] = useState(getInitialService);

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
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
          <div className="page-hero-visual" aria-label="Booking visual placeholder" />
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
              onSubmit={(event) => sendMailRequest(event, 'Iris & J Holdings Contact Request')}
            >
              <div className="form-row">
                <div className="input-group"><label htmlFor="contact-name">Name</label><input id="contact-name" name="name" required /></div>
                <div className="input-group"><label htmlFor="contact-email">Email</label><input id="contact-email" name="email" type="email" required /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label htmlFor="contact-phone">Phone</label><input id="contact-phone" name="phone" type="tel" /></div>
                <div className="input-group">
                  <label htmlFor="contact-service">Service</label>
                  <input
                    id="contact-service"
                    name="service"
                    onChange={(event) => setSelectedService(event.target.value)}
                    placeholder="Buyer, seller, notary, rental, or general"
                    value={selectedService}
                  />
                </div>
              </div>
              <div className="input-group"><label htmlFor="contact-message">Message</label><textarea id="contact-message" name="message" required /></div>
              <button className="button button-primary" type="submit">Send Message</button>
            </form>
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default BookContact;
