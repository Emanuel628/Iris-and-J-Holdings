import PublicLayout from '../../components/layout/PublicLayout';

function BookContact() {
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Book or Contact</p>
            <h1>Choose the conversation that fits where you are.</h1>
            <p>
              Tell Daiana what you need help with and the site will point visitors toward the right path:
              buyer consultation, seller strategy, mobile notary, or a general question.
            </p>
            <div className="page-actions">
              <a className="button button-primary" href="#appointment-types">Choose Appointment Type</a>
            </div>
          </div>
          <div className="page-hero-visual" aria-label="Booking visual placeholder" />
        </section>

        <section className="page-content" id="appointment-types">
          <div className="page-intro">
            <p className="eyebrow">Start here</p>
            <h2>One calm path for calls, questions, and appointment requests.</h2>
            <p>
              Scheduling will be connected later. For now, this page sets up the clean contact structure and keeps
              each visitor from guessing where to begin.
            </p>
          </div>

          <div className="content-grid">
            <article className="content-card"><h3>Buyer Consultation</h3><p>Discuss budget, location, pre-approval, timing, and next steps.</p></article>
            <article className="content-card"><h3>Seller Strategy Call</h3><p>Discuss home value, preparation, timing, and selling options.</p></article>
            <article className="content-card"><h3>Mobile Notary Appointment</h3><p>Share location, document type, signer details, and preferred time.</p></article>
          </div>

          <section className="split-section">
            <div className="quiet-band">
              <p className="eyebrow">Not sure?</p>
              <h2>Ask a question first.</h2>
              <p>
                Visitors who are not ready to schedule should still have a simple way to reach out and get pointed
                in the right direction.
              </p>
            </div>
            <form className="info-panel form-shell">
              <div className="form-row">
                <div className="input-group"><label>Name</label><input /></div>
                <div className="input-group"><label>Email</label><input /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label>Phone</label><input /></div>
                <div className="input-group"><label>Service</label><input /></div>
              </div>
              <div className="input-group"><label>Message</label><textarea /></div>
              <button className="button button-primary" type="button">Send Message</button>
            </form>
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default BookContact;
