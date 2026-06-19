import { ArrowRight } from 'lucide-react';
import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';

function Hero() {
  const template = getSiteContentTemplate('home');
  const { content, heroImageUrl } = usePublicSiteContent('home', template?.defaults || {});

  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <h1 id="hero-heading">{content.heroTitle}</h1>
        <span className="gold-line" aria-hidden="true" />
        <p>{content.heroDescription}</p>
        <div className="hero-actions" aria-label="Primary actions">
          <a className="button button-primary" href="#services">{content.primaryCtaLabel}</a>
          <a className="text-link" href="/book?service=General%20Question#contact-form">
            {content.secondaryCtaLabel} <ArrowRight size={18} />
          </a>
        </div>
      </div>

      <div className="hero-visual hero-image-frame" aria-label="Iris and J Holdings brand visual">
        <img src={heroImageUrl || '/images/site/home-hero.svg'} alt="Elegant real estate, notary, and hospitality workspace" />
      </div>
    </section>
  );
}

export default Hero;
