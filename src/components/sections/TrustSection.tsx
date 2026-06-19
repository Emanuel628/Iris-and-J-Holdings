import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';

function TrustSection() {
  const template = getSiteContentTemplate('home');
  const { content } = usePublicSiteContent('home', template?.defaults || {});

  return (
    <section className="trust-section" id="about" aria-labelledby="trust-heading">
      <div className="portrait-panel">
        <img
          className="portrait-photo"
          src={content.trustPortraitImageUrl || '/images/site/daiana-portrait.jpg'}
          alt="Daiana Castro, REALTOR and Mobile Notary"
        />
      </div>

      <div className="trust-copy">
        <p className="eyebrow">How I work</p>
        <h2 id="trust-heading">{content.trustTitle || "I'll keep you in the loop, start to finish."}</h2>
        <span className="gold-line" aria-hidden="true" />
        <p>
          {content.trustDescription ||
            "From the first conversation, you'll know what happens next and why. I explain each step in plain language, respond quickly, and help you weigh your options without pressure - for buyers, sellers, and notary clients throughout New Jersey, with a focus on Union, Middlesex, and Essex Counties."}
        </p>
        <a className="button button-secondary" href="/about">Meet Daiana</a>
      </div>
    </section>
  );
}

export default TrustSection;
