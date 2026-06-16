import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function Resources() {
  usePageMeta(
    'Resources',
    'Free buyer and seller guides plus local market updates — helpful next steps before you’re ready to schedule a call.',
  );
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Resources</p>
            <h1>Helpful guidance before you are ready to schedule.</h1>
            <p>
              Not everyone is ready for a call right away. Start with a buyer guide, seller guide,
              or local market update and come back when the timing feels right.
            </p>
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

          <div className="content-grid">
            <article className="content-card"><h3>Buyer Guide</h3><p>For people preparing to buy and trying to understand what happens first.</p><a className="card-link" href="/book?service=Buyer%20Guide%20Request&message=I%20would%20like%20to%20request%20the%20buyer%20guide.#contact-form">Request Guide</a></article>
            <article className="content-card"><h3>Seller Guide</h3><p>For homeowners who want to prepare before listing or scheduling a strategy call.</p><a className="card-link" href="/book?service=Seller%20Guide%20Request&message=I%20would%20like%20to%20request%20the%20seller%20guide.#contact-form">Request Guide</a></article>
            <article className="content-card"><h3>Market Updates</h3><p>For visitors who want occasional local real estate updates and guidance.</p><a className="card-link" href="/book?service=Market%20Updates%20Request&message=I%20would%20like%20to%20request%20local%20market%20updates.#contact-form">Request Updates</a></article>
          </div>

          <section className="quiet-band">
            <p className="eyebrow">Stay informed</p>
            <h2>Get guidance that matches where you are.</h2>
            <p>Useful information should make the next step feel easier, not heavier.</p>
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default Resources;
