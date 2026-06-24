import PublicLayout from '../../components/layout/PublicLayout';
import NewsletterSignup from '../../components/ui/NewsletterSignup';
import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';
import { usePageMeta } from '../../lib/usePageMeta';

const resourcesJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://www.irisjholdings.com/resources#webpage',
      'url': 'https://www.irisjholdings.com/resources',
      'name': 'Free Real Estate Resources for NJ Buyers & Sellers',
      'description': 'Free NJ real estate guides for buyers and sellers: buyer guide, seller guide, and local market updates from REALTOR® Daiana Castro.',
      'isPartOf': { '@id': 'https://www.irisjholdings.com/#website' },
      'about': { '@id': 'https://www.irisjholdings.com/#localbusiness' },
      'mainEntity': {
        '@type': 'ItemList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'NJ Buyer Guide',
            'description': 'What to do before you tour homes: setting a budget, getting pre-approved, and the New Jersey timeline from offer to closing.',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'NJ Seller Guide',
            'description': 'How to prepare, price, and time your sale, plus what to expect through offers, attorney review, and closing.',
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': 'NJ Market Updates',
            'description': "Occasional, plain-language notes on local prices and inventory and what they mean if you're thinking about buying or selling.",
          },
        ],
      },
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.irisjholdings.com/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'NJ Real Estate Resources', 'item': 'https://www.irisjholdings.com/resources' },
      ],
    },
  ],
};

function Resources() {
  usePageMeta(
    'Free Real Estate Resources for NJ Buyers & Sellers',
    'Free NJ real estate guides for buyers and sellers. Plain-language market updates, buying and selling step-by-step guides, and home value insights from REALTOR® Daiana Castro.',
    { jsonLd: resourcesJsonLd },
  );
  const template = getSiteContentTemplate('resources');
  const { content, heroImageUrl } = usePublicSiteContent('resources', template?.defaults || {});

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">{content.heroEyebrow}</p>
            <h1>{content.heroTitle}</h1>
            <p>{content.heroDescription}</p>
            <div className="page-actions">
              <a className="button button-primary" href="#resources-list">Browse Resources</a>
            </div>
          </div>
          <div className={`page-hero-visual ${heroImageUrl ? 'page-hero-image-frame' : ''}`} aria-label="Resources visual">
            {heroImageUrl ? <img src={heroImageUrl} alt="Real estate resources and planning visual" /> : null}
          </div>
        </section>

        <section className="page-content" id="resources-list">
          <div className="page-intro">
            <p className="eyebrow">Choose one</p>
            <h2>Simple resources for buyers, sellers, and homeowners.</h2>
            <p>
              Each resource path gives visitors a useful next step without forcing them into a conversation too early.
            </p>
          </div>

          <div className="notice-box">
            Resources and market updates are general information only. They are not legal, tax, lending,
            appraisal, investment, or financial advice, and requesting a guide does not create a brokerage
            relationship. Real estate services are provided through All Star Real Estate Agency after required
            New Jersey disclosures and written agreements are completed.
          </div>

          <div className="content-grid">
            <article className="content-card"><h3>Buyer Guide</h3><p>What to do before you tour homes: setting a budget, getting pre-approved, and the New Jersey timeline from offer to closing.</p><a className="card-link" href="/book?service=Buyer%20Guide%20Request&message=I%20would%20like%20to%20request%20the%20buyer%20guide.#contact-form">Request Guide</a></article>
            <article className="content-card"><h3>Seller Guide</h3><p>How to prepare, price, and time your sale, plus what to expect through offers, attorney review, and closing.</p><a className="card-link" href="/book?service=Seller%20Guide%20Request&message=I%20would%20like%20to%20request%20the%20seller%20guide.#contact-form">Request Guide</a></article>
            <article className="content-card"><h3>Market Updates</h3><p>Occasional, plain-language notes on local prices and inventory and what they mean if you’re thinking about buying or selling.</p><a className="card-link" href="/book?service=Market%20Updates%20Request&message=I%20would%20like%20to%20request%20local%20market%20updates.#contact-form">Request Updates</a></article>
          </div>

          <section className="quiet-band">
            <p className="eyebrow">Stay informed</p>
            <h2>Useful info, whenever you’re ready.</h2>
            <p>Good information should make your next step easier, not add to the pile.</p>
          </section>

          <div className="newsletter-signup-wrap" id="newsletter-signup">
            <NewsletterSignup source="resources-page" />
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

export default Resources;
