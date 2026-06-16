import { Plus } from 'lucide-react';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqProps = {
  eyebrow?: string;
  heading?: string;
  items: FaqItem[];
};

/** Accessible FAQ accordion built on native <details>/<summary> (no JS needed). */
function Faq({ eyebrow = 'Good to know', heading = 'Common questions', items }: FaqProps) {
  return (
    <section className="faq-section" aria-labelledby="faq-heading">
      <div className="page-intro">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id="faq-heading">{heading}</h2>
      </div>
      <div className="faq-list">
        {items.map((item) => (
          <details className="faq-item" key={item.question}>
            <summary>
              <span>{item.question}</span>
              <Plus className="faq-icon" size={18} aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default Faq;
