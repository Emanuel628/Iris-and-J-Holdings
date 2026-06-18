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

      <div className="hero-visual" aria-label="Illustrated living room with neutral decor">
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
