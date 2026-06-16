function MobileNotary() {
  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="page-hero-content">
          <p className="eyebrow">Mobile Notary</p>
          <h1>Mobile notary service, by appointment.</h1>
          <p>
            Daiana provides mobile notary appointments in Union County and Middlesex County, with limited
            Essex County availability based on distance and scheduling.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="/book">Book Mobile Notary Appointment</a>
          </div>
        </div>
        <div className="page-hero-visual" aria-label="Mobile notary visual placeholder" />
      </section>

      <section className="page-content">
        <div className="page-intro">
          <p className="eyebrow">Booking details</p>
          <h2>Clear expectations before the appointment is confirmed.</h2>
          <p>
            This page separates notary information from the real estate pages so visitors can quickly understand
            service areas, document details, appointment requirements, and travel fee expectations.
          </p>
        </div>

        <div className="content-grid">
          <article className="content-card">
            <h3>Service Areas</h3>
            <ul>
              <li>Union County</li>
              <li>Middlesex County</li>
              <li>Limited Essex County appointments</li>
            </ul>
          </article>
          <article className="content-card">
            <h3>Common Documents</h3>
            <ul>
              <li>General notarizations</li>
              <li>Real estate documents</li>
              <li>Power of attorney documents</li>
              <li>Affidavits and consent forms</li>
            </ul>
          </article>
          <article className="content-card">
            <h3>Important Note</h3>
            <p>
              A travel or booking fee is required before the appointment is confirmed. Notary fees are separate
              and depend on the document type and number of notarizations.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default MobileNotary;
