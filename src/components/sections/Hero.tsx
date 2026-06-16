import { ArrowRight } from 'lucide-react';

function Hero() {
  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <h1 id="hero-heading">Your Next Move, Made Clear.</h1>
        <span className="gold-line" aria-hidden="true" />
        <p>
          Buying, selling, or booking important notary services can feel like a lot.
          I help you understand the next step, make a plan, and move forward with confidence.
        </p>
        <div className="hero-actions" aria-label="Primary actions">
          <a className="button button-primary" href="#services">Find the Right Service</a>
          <a className="text-link" href="/book">
            Book a Call <ArrowRight size={18} />
          </a>
        </div>
      </div>

      <div className="hero-visual" aria-label="Calm living room with neutral decor">
        <div className="sun-wash" aria-hidden="true" />
        <div className="vase" aria-hidden="true">
          <span className="branch branch-one" />
          <span className="branch branch-two" />
          <span className="branch branch-three" />
        </div>
        <div className="art-frame" aria-hidden="true" />
        <div className="soft-chair" aria-hidden="true" />
        <div className="stacked-books" aria-hidden="true">
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}

export default Hero;
