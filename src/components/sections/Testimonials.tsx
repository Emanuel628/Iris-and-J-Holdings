import { CheckCircle2 } from 'lucide-react';

const trustPoints = [
  {
    title: 'Clear communication',
    text: 'Straightforward guidance, timely follow-up, and next steps that are easy to understand.',
  },
  {
    title: 'Local New Jersey focus',
    text: 'Support for buyers, sellers, and notary clients across Union, Middlesex, and Essex Counties.',
  },
  {
    title: 'Organized process',
    text: 'Help with timelines, documents, appointments, and details so nothing feels scattered.',
  },
];

function Testimonials() {
  return (
    <section className="testimonials-section section" aria-labelledby="testimonials-heading">
      <div className="section-heading centered">
        <p className="eyebrow">Client Trust</p>
        <h2 id="testimonials-heading">Guidance built around clarity.</h2>
        <span className="gold-line short" aria-hidden="true" />
      </div>

      <div className="testimonial-grid trust-grid">
        {trustPoints.map((item) => (
          <article className="testimonial-card trust-card" key={item.title}>
            <CheckCircle2 className="testimonial-quote-mark" size={26} aria-hidden="true" />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
