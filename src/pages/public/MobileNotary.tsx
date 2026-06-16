import PublicLayout from '../../components/layout/PublicLayout';

function MobileNotary() {
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Mobile Notary</p>
            <h1>Mobile notary service, by appointment.</h1>
            <p>
              Appointment-based mobile notary help is available in Union County and Middlesex County,
              with limited Essex County availability based on distance and scheduling.
            </p>
            <div className="page-actions">
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
              This page keeps notary service information separate from the real estate pages so visitors can
              quickly understand area, timing, document details, and appointment rules.
            </p>
          </div>

          <div className="content-grid">
            <article className="content-card"><h3>Service Areas</h3><ul><li>Union County</li><li>Middlesex County</li><li>Limited Essex County appointments</li></ul></article>
            <article className="content-card"><h3>Common Documents</h3><ul><li>General notarizations</li><li>Real estate documents</li><li>Power of attorney documents</li><li>Affidavits and consent forms</li></ul></article>
            <article className="content-card"><h3>Before Booking</h3><p>Visitors should provide the city, document type, number of signers, preferred time, and appointment notes.</p></article>
          </div>

          <section className="quiet-band">
            <p className="eyebrow">Travel notice</p>
            <h2>A travel or booking fee is required before confirmation.</h2>
            <p>Notary fees are separate and depend on the document type and number of notarizations.</p>
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default MobileNotary;
