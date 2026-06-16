function VacationRentals() {
  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="page-hero-content">
          <p className="eyebrow">Coming Soon</p>
          <h1>Orlando vacation rentals will have their own quiet corner.</h1>
          <p>
            Vacation rentals should stay separate from the real estate and notary funnel until the service is ready.
            This page keeps interest organized without confusing the main homepage.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#interest-list">Join Interest List</a>
          </div>
        </div>
        <div className="page-hero-visual" aria-label="Vacation rental visual placeholder" />
      </section>

      <section className="page-content split-section" id="interest-list">
        <div className="page-intro">
          <p className="eyebrow">Central Florida</p>
          <h2>A simple coming soon page for future guests.</h2>
          <p>
            This page will later include vacation rental photography, details, availability, and an interest list.
          </p>
        </div>
        <div className="info-panel">
          <p>
            Orlando vacation rental services are offered independently through Iris & J Holdings and are not
            provided through All Star Real Estate Agency. Vacation rental accommodations do not constitute
            real estate brokerage services.
          </p>
        </div>
      </section>
    </main>
  );
}

export default VacationRentals;
