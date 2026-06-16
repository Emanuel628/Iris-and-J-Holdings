import PublicLayout from '../../components/layout/PublicLayout';

function About() {
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">About Daiana</p>
            <h1>A calm, organized person in your corner.</h1>
            <p>
              The About page builds trust around Daiana as the person behind the service: professional,
              prepared, clear, and easy to talk to.
            </p>
            <div className="page-actions">
              <a className="button button-primary" href="/book">Meet With Daiana</a>
            </div>
          </div>
          <div className="page-hero-visual" aria-label="About Daiana visual placeholder" />
        </section>

        <section className="page-content">
          <div className="split-section">
            <div className="page-intro">
              <p className="eyebrow">How she works</p>
              <h2>Clear answers, steady communication, and a plan that fits the client.</h2>
              <p>
                Real estate decisions and important documents can feel stressful. The tone here should help visitors
                feel that Daiana is steady, prepared, and focused on what they actually need.
              </p>
            </div>

            <div className="info-panel">
              <h3>Professional focus</h3>
              <ul className="detail-list">
                <li>REALTOR® guidance through All Star Real Estate Agency</li>
                <li>Mobile notary service by appointment</li>
                <li>New Jersey service area focus</li>
                <li>Clear next steps before big decisions</li>
              </ul>
            </div>
          </div>

          <section className="quiet-band">
            <p className="eyebrow">Brand promise</p>
            <h2>You should know what comes next.</h2>
            <p>
              The About page should feel personal without becoming too casual. The message is simple: Daiana listens,
              explains clearly, and helps clients move forward with confidence.
            </p>
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default About;
