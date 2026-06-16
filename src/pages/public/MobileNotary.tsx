import { Phone } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import Faq from '../../components/sections/Faq';
import { usePageMeta } from '../../lib/usePageMeta';

const notaryFaqs = [
  {
    question: 'Which areas do you serve?',
    answer:
      'Union County and Middlesex County, with limited Essex County availability based on distance and scheduling.',
  },
  {
    question: 'What should I have ready before the appointment?',
    answer:
      'Share the city, document type, number of signers, your preferred time, and any notes. Bring a valid, unexpired government-issued photo ID for every signer, and leave documents unsigned until we meet.',
  },
  {
    question: 'Is a fee required to book?',
    answer:
      'Yes — a travel or booking fee is confirmed before the appointment. Notary fees are separate and depend on the document type and number of notarizations. Daiana will confirm the details when you book.',
  },
  {
    question: 'What types of documents can you notarize?',
    answer:
      'General notarizations, real estate documents, affidavits, and consent forms, among others. Share the document type when booking so Daiana can confirm.',
  },
];

function MobileNotary() {
  usePageMeta(
    'Mobile Notary',
    'Mobile notary service by appointment in Union and Middlesex Counties, with limited Essex County availability.',
  );
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Mobile Notary</p>
            <h1>Mobile notary service, by appointment.</h1>
            <p>
              Mobile notary help is available by appointment in Union County and Middlesex County,
              with limited Essex County availability based on distance and scheduling.
            </p>
            <div className="page-actions">
              <a className="button button-primary" href="/book?service=Mobile%20Notary%20Appointment#contact-form">Book Mobile Notary Appointment</a>
              <a className="text-link" href="tel:19084996320"><Phone size={18} /> Call (908) 499-6320</a>
            </div>
          </div>
          <div className="page-hero-visual" aria-label="Mobile notary visual placeholder" />
        </section>
        <section className="page-content">
          <div className="page-intro">
            <p className="eyebrow">Booking details</p>
            <h2>Clear expectations before the appointment is confirmed.</h2>
            <p>The notary page keeps appointment details easy to understand: area, timing, document type, signer count, and travel fee expectations.</p>
          </div>
          <div className="content-grid">
            <article className="content-card"><h3>Service Areas</h3><ul><li>Union County</li><li>Middlesex County</li><li>Limited Essex County appointments</li></ul></article>
            <article className="content-card"><h3>Common Documents</h3><ul><li>General notarizations</li><li>Real estate documents</li><li>Affidavits</li><li>Consent forms</li></ul></article>
            <article className="content-card"><h3>Before Booking</h3><p>Share the city, document type, number of signers, preferred time, and any appointment notes.</p></article>
          </div>
          <section className="quiet-band">
            <p className="eyebrow">Travel notice</p>
            <h2>A travel or booking fee is required before confirmation.</h2>
            <p>Notary fees are separate and depend on the document type and number of notarizations.</p>
          </section>

          <Faq eyebrow="Notary questions" heading="Mobile notary, answered." items={notaryFaqs} />
        </section>
      </main>
    </PublicLayout>
  );
}

export default MobileNotary;
