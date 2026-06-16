function BookContact() {
  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="page-hero-content">
          <p className="eyebrow">Book or Contact</p>
          <h1>Choose the conversation that fits where you are.</h1>
          <p>
            The booking page should route visitors into the right form or appointment type instead of making
            them guess which service to ask about.
          </p>
          <div className="hero-actions">
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
            Later, this page will connect to scheduling and lead capture. For now, it creates the structure for
            the guided booking funnel.
          </p>
        </div>

        <div className="content-grid">
          <article className="content-card"><h3>Buyer Consultation</h3><p>Discuss budget, location, pre-approval, timing, and next steps.</p></article>
          <article className="content-card"><h3>Seller Strategy Call</h3><p>Discuss home value, preparation, timing, and selling options.</p></article>
          <article className="content-card"><h3>Mobile Notary Appointment</h3><p>Request appointment details, location, document type, and signer information.</p></article>
        </div>
      </section>
    </main>
  );
}

export default BookContact;
