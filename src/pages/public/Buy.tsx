function Buy() {
  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="page-hero-content">
          <p className="eyebrow">Buyer Guidance</p>
          <h1>Buying a home starts with a clear plan.</h1>
          <p>
            Whether this is your first home or your next move, Daiana helps you understand your budget,
            narrow your search, prepare your offer, and know what to expect before closing.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="/book">Schedule Buyer Consultation</a>
          </div>
        </div>
        <div className="page-hero-visual" aria-label="Buyer consultation visual placeholder" />
      </section>

      <section className="page-content">
        <div className="page-intro">
          <p className="eyebrow">What to expect</p>
          <h2>Guidance before the search gets overwhelming.</h2>
          <p>
            Buying should not feel like guessing. This page will guide buyers through preparation,
            search strategy, offers, inspection, attorney review, and closing support.
          </p>
        </div>

        <div className="content-grid">
          <article className="content-card">
            <h3>Prepare</h3>
            <p>Review budget, timing, preferred locations, and pre-approval needs before touring homes.</p>
          </article>
          <article className="content-card">
            <h3>Search</h3>
            <p>Focus the home search around real goals instead of chasing every listing online.</p>
          </article>
          <article className="content-card">
            <h3>Move forward</h3>
            <p>Understand offers, negotiations, inspections, attorney review, and closing steps.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Buy;
