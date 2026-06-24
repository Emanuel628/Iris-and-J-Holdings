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

const notaryJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'ProfessionalService'],
      '@id': 'https://www.irisjholdings.com/mobile-notary#localbusiness',
      'name': 'Iris & J Holdings – Mobile Notary',
      'description': 'Mobile notary appointments for Union, Middlesex, and Essex Counties, NJ, including general notarizations, real estate documents, affidavits, and consent forms.',
      'url': 'https://www.irisjholdings.com/mobile-notary',
      'telephone': '+1-908-499-6320',
      'email': 'listingsbyd@gmail.com',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Union',
        'addressRegion': 'NJ',
        'postalCode': '07083',
        'addressCountry': 'US',
      },
      'areaServed': [
        { '@type': 'AdministrativeArea', 'name': 'Union County, NJ' },
        { '@type': 'AdministrativeArea', 'name': 'Middlesex County, NJ' },
        { '@type': 'AdministrativeArea', 'name': 'Essex County, NJ' },
      ],
      'serviceType': 'Mobile Notary',
      'employee': { '@id': 'https://www.irisjholdings.com/#daiana-castro' },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://www.irisjholdings.com/mobile-notary#faq',
      'mainEntity': notaryFaqs.map((faq) => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer,
        },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.irisjholdings.com/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Mobile Notary NJ', 'item': 'https://www.irisjholdings.com/mobile-notary' },
      ],
    },
  ],
};

function MobileNotary() {
  usePageMeta(
    'Mobile Notary | Union, Middlesex & Essex County NJ',
    'Need a mobile notary in NJ? Daiana Castro serves Union, Middlesex & Essex Counties for general notarizations, real estate documents, affidavits, and consent forms. Book online.',
    { jsonLd: notaryJsonLd },
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

