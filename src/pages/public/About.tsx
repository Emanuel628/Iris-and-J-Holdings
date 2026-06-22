import PublicLayout from '../../components/layout/PublicLayout';
import SocialLinks from '../../components/ui/SocialLinks';
import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';
import { usePageMeta } from '../../lib/usePageMeta';

function About() {
  usePageMeta(
    'About Daiana Castro, REALTOR®',
    'Meet Daiana Castro, REALTOR® and mobile notary serving New Jersey buyers, sellers, and notary clients through Iris & J Holdings and All Star Real Estate Agency.',
  );
  const template = getSiteContentTemplate('about');
  const { content, heroImageUrl } = usePublicSiteContent('about', template?.defaults || {});
  const portraitImageUrl = content.portraitImageUrl || heroImageUrl || '/images/site/daiana-portrait.jpg';

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero page-hero-about">
          <div className="page-hero-content">
            <p className="eyebrow">{content.heroEyebrow}</p>
            <h1>{content.heroTitle}</h1>
            <p>{content.heroDescription}</p>
            <div className="page-actions">
              <a className="button button-primary" href="/book?service=General%20Question#contact-form">Meet With Daiana</a>
            </div>
          </div>
          <figure className="about-portrait">
            <div className="page-hero-visual about-hero-visual" aria-label="Portrait of Daiana Castro">
              <img src={portraitImageUrl} alt="Portrait of Daiana Castro" />
            </div>
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
              on Union, Middlesex, and Essex Counties; mobile notary visits are booked directly. Call or text{' '}
              <a href="tel:19084996320">(908) 499-6320</a>, or send your details through the booking page and
              Daiana will follow up by email.
            </p>
            <div className="about-social">
              <span className="about-social-label">Follow along</span>
              <SocialLinks />
            </div>
          </section>

          <div className="notice-box">
            Iris &amp; J Holdings is not a licensed real estate brokerage. Real estate brokerage services are provided
            only through All Star Real Estate Agency after the required New Jersey disclosures and written agreements
            are completed. Mobile notary and vacation rental services are separate from brokerage services.
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

export default About;
