function Sell() {
  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="page-hero-content">
          <p className="eyebrow">Seller Strategy</p>
          <h1>Selling your home takes more than a listing.</h1>
          <p>
            A strong sale starts with pricing, preparation, timing, and a plan. Daiana helps homeowners
            understand the local market and choose the next step with confidence.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="/book">Request Seller Strategy Call</a>
            <a className="text-link" href="/home-value">Get Home Value Review</a>
          </div>
        </div>
        <div className="page-hero-visual" aria-label="Seller strategy visual placeholder" />
      </section>

      <section className="page-content">
        <div className="page-intro">
          <p className="eyebrow">Listing with intention</p>
          <h2>A calm plan for pricing, prep, marketing, and negotiation.</h2>
          <p>
            This page will walk sellers through how the home is positioned, what should be prepared,
            how timing matters, and what to expect once offers come in.
          </p>
        </div>

        <div className="content-grid">
          <article className="content-card">
            <h3>Pricing</h3>
            <p>Review local activity, comparable homes, condition, demand, and seller goals.</p>
          </article>
          <article className="content-card">
            <h3>Preparation</h3>
            <p>Identify what should be cleaned, repaired, staged, or improved before going live.</p>
          </article>
          <article className="content-card">
            <h3>Negotiation</h3>
            <p>Compare offers clearly and move through the decision process with steady guidance.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Sell;
