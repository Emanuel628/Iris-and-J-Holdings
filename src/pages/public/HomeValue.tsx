import PublicLayout from '../../components/layout/PublicLayout';

function HomeValue() {
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Home Value Review</p>
            <h1>Find out what your home may be worth.</h1>
            <p>
              Share a few property details and Daiana will review local market activity to help you understand
              your options. This is a helpful starting point, not a formal appraisal.
            </p>
            <div className="page-actions">
              <a className="button button-primary" href="#home-value-form">Send My Home Value Request</a>
            </div>
          </div>
          <div className="page-hero-visual" aria-label="Home value visual placeholder" />
        </section>

        <section className="page-content split-section" id="home-value-form">
          <div>
            <div className="page-intro">
              <p className="eyebrow">Property details</p>
              <h2>A simple request for a thoughtful local review.</h2>
              <p>
                The form keeps the first step light: address, timing, property type, and anything that may affect value.
              </p>
            </div>
            <div className="notice-box">
              Home value reviews are estimates based on available market information and are not appraisals.
            </div>
          </div>

          <form className="info-panel form-shell">
            <div className="form-row">
              <div className="input-group"><label>Full Name</label><input /></div>
              <div className="input-group"><label>Email</label><input /></div>
            </div>
            <div className="form-row">
              <div className="input-group"><label>Phone</label><input /></div>
              <div className="input-group"><label>Property Type</label><input /></div>
            </div>
            <div className="input-group"><label>Property Address</label><input /></div>
            <div className="input-group"><label>City or Town</label><input /></div>
            <div className="input-group"><label>Timeline</label><input /></div>
            <div className="input-group"><label>Updates or details</label><textarea /></div>
            <button className="button button-primary" type="button">Submit Request</button>
          </form>
        </section>
      </main>
    </PublicLayout>
  );
}

export default HomeValue;
