import PublicLayout from '../../components/layout/PublicLayout';

function Resources() {
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Resources</p>
            <h1>Helpful guidance before you are ready to schedule.</h1>
            <p>
              Some visitors are still gathering information. This page gives them simple ways to request buyer,
              seller, and market resources while keeping the homepage clean.
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
              These are lead capture paths, but they should feel helpful first. The wording should be useful,
              calm, and direct.
            </p>
          </div>

          <div className="content-grid">
            <article className="content-card"><h3>Buyer Guide</h3><p>For people preparing to buy and trying to understand what happens first.</p><a className="card-link" href="/book">Request Guide</a></article>
            <article className="content-card"><h3>Seller Guide</h3><p>For homeowners who want to prepare before listing or scheduling a strategy call.</p><a className="card-link" href="/book">Request Guide</a></article>
            <article className="content-card"><h3>Market Updates</h3><p>For visitors who want occasional local real estate updates and guidance.</p><a className="card-link" href="/book">Request Updates</a></article>
          </div>

          <section className="quiet-band">
            <p className="eyebrow">Stay informed</p>
            <h2>Get guidance that matches where you are.</h2>
            <p>Resources should help visitors move from curiosity to confidence without forcing them into a call too early.</p>
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default Resources;
