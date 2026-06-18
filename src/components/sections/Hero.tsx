import { ArrowRight } from 'lucide-react';

function Hero() {
  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <h1 id="hero-heading">Your Next Move, Made Clear.</h1>
        <span className="gold-line" aria-hidden="true" />
        <p>
          Buying, selling, or signing important documents can feel like a lot. I’ll help you understand the
          next step, make a plan, and move forward with confidence — real estate throughout New Jersey, mobile
          notary service, and Orlando vacation rentals.
        </p>
        <div className="hero-actions" aria-label="Primary actions">
          <a className="button button-primary" href="#services">Find the Right Service</a>
          <a className="text-link" href="/book?service=General%20Question#contact-form">
            Book a Call <ArrowRight size={18} />
          </a>
        </div>
      </div>

      <div className="hero-visual hero-image-frame" aria-label="Iris and J Holdings brand visual">
        <img src="/images/site/home-hero.svg" alt="Elegant real estate, notary, and hospitality workspace" />
      </div>
    </section>
  );
}

export default Hero;
