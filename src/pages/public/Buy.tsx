import PublicLayout from '../../components/layout/PublicLayout';
import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';
import { usePageMeta } from '../../lib/usePageMeta';

const buyJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': 'https://www.irisjholdings.com/buy#service',
      'name': 'New Jersey Home Buyer Consultation',
      'description': 'Buyer consultation and home search guidance in New Jersey, covering budget review, pre-approval, home search strategy, offers, inspections, attorney review, and closing.',
      'serviceType': 'Real Estate Buyer Consultation',
      'provider': { '@id': 'https://www.irisjholdings.com/#daiana-castro' },
      'areaServed': { '@type': 'State', 'name': 'New Jersey' },
      'url': 'https://www.irisjholdings.com/buy',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
        'description': 'Free initial buyer consultation',
      },
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.irisjholdings.com/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Buy a Home in NJ', 'item': 'https://www.irisjholdings.com/buy' },
      ],
    },
  ],
};

function Buy() {
  usePageMeta(
    'Buy a Home in New Jersey',
    'Looking to buy a home in NJ? REALTOR® Daiana Castro guides buyers through budget review, pre-approval, home search, offers, inspections, and closing. Book a free consultation.',
    { jsonLd: buyJsonLd },
  );
  const template = getSiteContentTemplate('buy');
  const { content, heroImageUrl } = usePublicSiteContent('buy', template?.defaults || {});

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">{content.heroEyebrow}</p>
            <h1>{content.heroTitle}</h1>
            <p>{content.heroDescription}</p>
          </div>
          <div className="page-hero-visual page-hero-image-frame" aria-label="Buyer guidance visual">
            <img src={heroImageUrl || '/images/site/buy-hero.jpg'} alt="Bright modern home interior with a model of new homes" />
          </div>
        </section>

        <section className="page-content">
          <div className="page-intro">
            <p className="eyebrow">{content.introEyebrow}</p>
            <h2>{content.introTitle}</h2>
            <p>{content.introDescription}</p>
          </div>

          <div className="notice-box">
            Initial questions and conversations do not create a buyer agency relationship. New Jersey brokerage
            disclosures, the Consumer Information Statement, and a written brokerage services agreement are handled
            through All Star Real Estate Agency before buyer brokerage services begin. Broker compensation is
            negotiable and not set by law.
          </div>

          <div className="content-grid">
            <article className="content-card">
              <h3>Prepare</h3>
              <p>Review budget, timing, locations, pre-approval needs, and the kind of home that actually fits.</p>
            </article>
            <article className="content-card">
              <h3>Search</h3>
              <p>Focus the home search around your goals instead of chasing every listing that appears online.</p>
            </article>
            <article className="content-card">
              <h3>Move forward</h3>
              <p>Understand offers, negotiations, inspections, attorney review, and the closing timeline.</p>
            </article>
          </div>

          <section className="split-section">
            <div className="info-panel">
              <h2>Buyer consultation topics</h2>
              <ul className="detail-list">
                <li>Budget and location review</li>
                <li>Pre-approval guidance</li>
                <li>Home search strategy</li>
                <li>Offer preparation support</li>
                <li>Inspection and closing guidance</li>
              </ul>
            </div>
            <div className="quiet-band">
              <p className="eyebrow">Next step</p>
              <h2>Start with a conversation.</h2>
              <p>
                You do not need to have everything figured out. Bring your questions, timing, and concerns.
                Daiana will help you understand where to begin.
              </p>
              <div className="page-actions">
                <a className="button button-primary" href="/book?service=Buyer%20Consultation#contact-form">Schedule Buyer Consultation</a>
              </div>
            </div>
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default Buy;

