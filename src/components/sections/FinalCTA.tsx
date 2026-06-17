import { ArrowRight } from 'lucide-react';

function FinalCTA() {
  return (
    <section className="final-cta" id="book" aria-labelledby="cta-heading">
      <div className="cta-copy">
        <h2 id="cta-heading">Not sure where to start?</h2>
        <span className="gold-line short" aria-hidden="true" />
        <p>That’s okay. Book a quick call and I’ll help you figure out the next step.</p>
        <a className="button button-primary" href="/book?service=General%20Question#contact-form">
          Book a Call <ArrowRight size={16} />
        </a>
      </div>
      <div className="cta-visual" aria-hidden="true">
        <div className="mini-vase" />
        <div className="mini-bowl" />
      </div>
    </section>
  );
}

export default FinalCTA;
