import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function About() {
  usePageMeta(
    'About Daiana Castro',
    'Daiana Castro helps New Jersey buyers, sellers, and notary clients with real estate guidance and mobile notary service.',
  );
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero page-hero-about">
          <div className="page-hero-content">
            <p className="eyebrow">About Daiana</p>
            <h1>Real estate and notary help that keeps things simple.</h1>
            <p>
              Daiana Castro, REALTOR®, provides real estate services throughout New Jersey through All Star Real
              Estate Agency. She also offers mobile notary services and independently manages Orlando vacation
              rental accommodations through Iris &amp; J Holdings.
            </p>
            <div className="page-actions">
              <a className="button button-primary" href="/book?service=General%20Question#contact-form">Meet With Daiana</a>
            </div>
          </div>
          <figure className="about-portrait">
            <div className="page-hero-visual about-hero-visual" role="img" aria-label="Portrait of Daiana Castro" />
            <figcaption>Daiana Castro, REALTOR®</figcaption>
          </figure>
        </section>

        <section className="page-content">
          <div className="split-section">
            <div className="page-intro">
              <p className="eyebrow">How she works</p>
              <h2>How Daiana works with clients.</h2>
              <p>
                Big decisions feel easier when someone explains the steps in plain language. Daiana responds
                promptly, keeps the paperwork and timeline organized, and makes sure you understand each option
                before you decide — whether you’re touring homes, preparing to list, or signing a document.
              </p>
            </div>

            <div className="info-panel">
              <h3>Professional focus</h3>
              <ul className="detail-list">
                <li>REALTOR® with All Star Real Estate Agency</li>
                <li>Real estate services throughout New Jersey</li>
                <li>Mobile notary services by appointment</li>
                <li>Orlando vacation rentals through Iris &amp; J Holdings</li>
              </ul>
            </div>
          </div>

          <section className="quiet-band">
            <p className="eyebrow">How to reach her</p>
            <h2>Serving New Jersey.</h2>
            <p>
              Real estate runs through All Star Real Estate Agency, available throughout New Jersey with a focus
              on Union, Middlesex, and Essex County; mobile notary visits are booked directly. Call or text{' '}
              <a href="tel:19084996320">(908) 499-6320</a>, or send your details through the booking page and
              Daiana will follow up by email.
            </p>
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default About;
