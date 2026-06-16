function About() {
  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="page-hero-content">
          <p className="eyebrow">About Daiana</p>
          <h1>A calm, organized person in your corner.</h1>
          <p>
            The About page should build trust around Daiana as the person behind the service: professional,
            prepared, clear, and easy to talk to.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="/book">Meet With Daiana</a>
          </div>
        </div>
        <div className="page-hero-visual" aria-label="About Daiana visual placeholder" />
      </section>

      <section className="page-content split-section">
        <div className="page-intro">
          <p className="eyebrow">How she works</p>
          <h2>Clear answers, steady communication, and a plan that fits the client.</h2>
        </div>

        <div className="info-panel">
          <p>
            This page will include Daiana’s professional story, REALTOR® and Mobile Notary roles,
            New Jersey service areas, brokerage disclosure, and the way she helps clients feel prepared
            before making important decisions.
          </p>
        </div>
      </section>
    </main>
  );
}

export default About;
