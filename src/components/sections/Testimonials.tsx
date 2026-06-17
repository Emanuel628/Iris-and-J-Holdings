import { Quote } from 'lucide-react';

// TODO: Replace these placeholders with real, approved client testimonials.
// Keep them short, specific, and human (what the process felt like + the outcome).
const testimonials = [
  {
    quote: 'Add a short client quote here — what the process felt like and how it turned out.',
    name: 'Client name',
    detail: 'Buyer · Union County',
  },
  {
    quote: 'A second quote works well when it speaks to a different service, like a seller call.',
    name: 'Client name',
    detail: 'Seller · Middlesex County',
  },
  {
    quote: 'A notary client quote rounds out the trust this section is meant to build.',
    name: 'Client name',
    detail: 'Mobile Notary · Essex County',
  },
];

function Testimonials() {
  return (
    <section className="testimonials-section section" aria-labelledby="testimonials-heading">
      <div className="section-heading centered">
        <p className="eyebrow">Testimonials</p>
        <h2 id="testimonials-heading">What clients say.</h2>
        <span className="gold-line short" aria-hidden="true" />
      </div>

      <div className="testimonial-grid">
        {testimonials.map((item) => (
          <figure className="testimonial-card" key={`${item.name}-${item.detail}`}>
            <Quote className="testimonial-quote-mark" size={26} aria-hidden="true" />
            <blockquote>{item.quote}</blockquote>
            <figcaption>
              <strong>{item.name}</strong>
              <span>{item.detail}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
