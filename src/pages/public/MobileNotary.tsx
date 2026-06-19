import PublicLayout from '../../components/layout/PublicLayout';
import NotaryBooking from '../../components/booking/NotaryBooking';
import Faq from '../../components/sections/Faq';
import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';
import { usePageMeta } from '../../lib/usePageMeta';

const notaryFaqs = [
  {
    question: 'Which areas do you serve?',
    answer:
      'Primarily Union, Middlesex, and Essex Counties, with additional areas available by request based on distance and scheduling.',
  },
  {
    question: 'What should I have ready before the appointment?',
    answer:
      'Share the city, document type, number of signers, your preferred time, and any notes. Bring a valid, unexpired government-issued photo ID for every signer, and leave documents unsigned until we meet.',
  },
  {
    question: 'Is a fee required to book?',
    answer:
      'Yes — the travel or booking fee is paid through secure checkout when you submit the request. Notary fees are separate and depend on the document type and number of notarizations. Daiana will confirm the details by email.',
  },
  {
    question: 'What types of documents can you notarize?',
    answer:
      'General notarizations, real estate documents, affidavits, and consent forms, among others. Share the document type when booking so Daiana can confirm.',
  },
];

function MobileNotary() {
  usePageMeta(
    'Mobile Notary in Union, Middlesex & Essex Counties',
    'Mobile notary appointments for Union County, Middlesex County, and Essex County, NJ, including general notarizations, real estate documents, affidavits, and consent forms.',
  );
  const template = getSiteContentTemplate('mobile-notary');
  const { content, heroImageUrl } = usePublicSiteContent('mobile-notary', template?.defaults || {});

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero notary-hero">
          <div className="page-hero-content">
            <p className="eyebrow">{content.heroEyebrow}</p>
            <h1>{content.heroTitle}</h1>
            <p>{content.heroDescription}</p>
          </div>
          <div className="page-hero-visual page-hero-image-frame" aria-label="Mobile notary document signing visual">
            <img src={heroImageUrl || '/images/site/notary-hero.jpg'} alt="Notary portfolio and signing pen" />
          </div>
        </section>

        <section className="page-content" id="appointment">
          <div className="split-section">
            <div className="page-intro">
              <p className="eyebrow">{content.bookingEyebrow}</p>
              <h2>{content.bookingTitle}</h2>
              <p>{content.bookingDescription}</p>
            </div>
            <NotaryBooking />
          </div>
        </section>
        <section className="page-content">
          <div className="page-intro">
            <p className="eyebrow">Booking details</p>
            <h2>What to know before booking.</h2>
            <p>The notary page keeps appointment details easy to understand: area, timing, document type, signer count, and travel fee expectations.</p>
          </div>
          <div className="content-grid">
            <article className="content-card"><h3>Service Areas</h3><ul><li>Union County</li><li>Middlesex County</li><li>Essex County</li><li>Additional areas by request</li></ul></article>
            <article className="content-card"><h3>Common Documents</h3><ul><li>General notarizations</li><li>Real estate documents</li><li>Affidavits</li><li>Consent forms</li></ul></article>
            <article className="content-card"><h3>Before Your Appointment</h3><p>Have a valid, unexpired photo ID ready for every signer, keep documents unsigned until we meet, and make sure all signers can be present.</p></article>
          </div>
          <section className="quiet-band">
            <p className="eyebrow">Travel notice</p>
            <h2>A travel or booking fee is paid before the request is submitted for confirmation.</h2>
            <p>Notary fees are separate and depend on the document type and number of notarizations.</p>
          </section>

          <Faq eyebrow="Notary questions" heading="Mobile notary, answered." items={notaryFaqs} />

          <section className="vacation-legal-alert" aria-label="Mobile notary legal notice">
            Mobile notary services are provided independently through Iris &amp; J Holdings and are not real
            estate brokerage services.
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default MobileNotary;
