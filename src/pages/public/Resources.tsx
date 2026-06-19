import PublicLayout from '../../components/layout/PublicLayout';
import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';
import { usePageMeta } from '../../lib/usePageMeta';

function Resources() {
  usePageMeta(
    'Real Estate Resources for NJ Buyers & Sellers',
    'Plain-language New Jersey buyer guides, seller guides, and local market updates for people preparing to buy, sell, or request a home value review.',
  );
  const template = getSiteContentTemplate('resources');
  const { content } = usePublicSiteContent('resources', template?.defaults || {});

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
          <div className="page-hero-visual" aria-label="Resources visual placeholder" />
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
            <article className="content-card"><h3>Market Updates</h3><p>Occasional, plain-language notes on local prices and inventory — and what they mean if you’re thinking about buying or selling.</p><a className="card-link" href="/book?service=Market%20Updates%20Request&message=I%20would%20like%20to%20request%20local%20market%20updates.#contact-form">Request Updates</a></article>
          </div>

          <section className="quiet-band">
            <p className="eyebrow">Stay informed</p>
            <h2>Useful info, whenever you’re ready.</h2>
            <p>Good information should make your next step easier — not add to the pile.</p>
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default Resources;

