import { CalendarCheck, ClipboardCheck, HomeIcon } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Tell me where you are.',
    text: 'Share your goals and what you need help with.',
    icon: ClipboardCheck,
  },
  {
    number: '02',
    title: 'Get a clear plan.',
    text: 'I’ll review your options and outline the best next steps.',
    icon: CalendarCheck,
  },
  {
    number: '03',
    title: 'Take the next step.',
    text: 'Move forward with confidence. I’ll be with you along the way.',
    icon: HomeIcon,
  },
];

function ProcessSteps() {
  return (
    <section className="process-section section" aria-labelledby="process-heading">
      <div className="section-heading centered compact">
        <p className="eyebrow">How it works</p>
        <h2 id="process-heading" className="sr-only">How it works</h2>
      </div>

      <div className="step-grid">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article className="process-step" key={step.number}>
              <span className="icon-badge muted" aria-hidden="true">
                <Icon size={30} strokeWidth={1.5} />
              </span>
              <div>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ProcessSteps;
