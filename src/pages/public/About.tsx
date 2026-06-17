import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function About() {
  usePageMeta(
    'About Daiana Castro',
    'Daiana Castro brings a calm, organized approach to New Jersey real estate guidance and mobile notary service.',
  );
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero page-hero-about">
          <div className="page-hero-content">
            <p className="eyebrow">About Daiana</p>
            <h1>A steady guide for real estate and next steps.</h1>
            <p>
              Daiana Castro is a New Jersey REALTOR® with All Star Real Estate Agency and a mobile notary. She
              helps buyers, sellers, and notary clients across Union, Middlesex, and Essex County understand what
              needs to happen, what can wait, and how to move forward with confidence.
            </p>
            <div className="page-actions">
              <a className="button button-primary" href="/book?service=General%20Question#contact-form">Meet With Daiana</a>
            </div>
          </div>
          <div className="page-hero-visual about-hero-visual" aria-label="Professional headshot area for Daiana" />
        </section>

        <section className="page-content">
          <div className="split-section">
            <div className="page-intro">
              <p className="eyebrow">How she works</p>
              <h2>Clear answers, steady communication, and a plan that fits the client.</h2>
              <p>
                Big decisions feel easier when someone explains the steps in plain language. Daiana responds
                promptly, keeps the paperwork and timeline organized, and makes sure you understand each option
                before you decide — whether you’re touring homes, preparing to list, or signing a document.
              </p>
            </div>

            <div className="info-panel">
              <h3>Professional focus</h3>
              <ul className="detail-list">
                <li>Real estate guidance through All Star Real Estate Agency</li>
                <li>Mobile notary service by appointment</li>
                <li>New Jersey service area focus</li>
                <li>Simple next steps before important decisions</li>
              </ul>
            </div>
          </div>

          <section className="quiet-band">
            <p className="eyebrow">How to reach her</p>
            <h2>Serving Union, Middlesex, and Essex County, NJ.</h2>
            <p>
              Real estate services run through All Star Real Estate Agency; mobile notary visits are booked
              directly. Call or text <a href="tel:19084996320">(908) 499-6320</a>, or send your details through
              the booking page and Daiana will follow up by email.
            </p>
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default About;
