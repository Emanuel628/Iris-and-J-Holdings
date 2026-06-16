import PublicLayout from '../../components/layout/PublicLayout';

function VacationRentals() {
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Coming Soon</p>
            <h1>Orlando vacation rentals will have their own quiet corner.</h1>
            <p>
              Vacation rentals stay separate from the real estate and notary funnel until the service is ready.
              This page keeps interest organized without confusing the main homepage.
            </p>
            <div className="page-actions">
              <a className="button button-primary" href="#interest-list">Join Interest List</a>
            </div>
          </div>
          <div className="page-hero-visual" aria-label="Vacation rental visual placeholder" />
        </section>

        <section className="page-content" id="interest-list">
          <div className="split-section">
            <div className="page-intro">
              <p className="eyebrow">Central Florida</p>
              <h2>A simple coming soon page for future guests.</h2>
              <p>
                This page will later include vacation rental photography, details, availability, and an interest list.
              </p>
            </div>
            <form className="info-panel form-shell">
              <div className="input-group"><label>Name</label><input /></div>
              <div className="input-group"><label>Email</label><input /></div>
              <div className="input-group"><label>Travel Notes</label><textarea /></div>
              <button className="button button-primary" type="button">Join Interest List</button>
            </form>
          </div>

          <section className="notice-box">
            Orlando vacation rental services are offered independently through Iris & J Holdings and are not
            provided through All Star Real Estate Agency.
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default VacationRentals;
