import { ArrowRight } from 'lucide-react';

function FinalCTA() {
  return (
    <section className="final-cta" id="book" aria-labelledby="cta-heading">
      <div className="cta-copy">
        <h2 id="cta-heading">Not sure where to start?</h2>
        <span className="gold-line short" aria-hidden="true" />
        <p>That’s okay. Schedule a quick conversation and I’ll help you choose the right path.</p>
        <a className="button button-primary" href="/book">
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
