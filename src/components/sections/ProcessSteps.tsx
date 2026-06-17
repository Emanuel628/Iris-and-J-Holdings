import { CalendarCheck, ClipboardCheck, HomeIcon } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Reach out.',
    text: 'Call or send a quick note with your goal, your timing, and any questions. No preparation needed.',
    icon: ClipboardCheck,
  },
  {
    number: '02',
    title: 'Get a clear plan.',
    text: 'You’ll get straight answers about your options and the steps that matter — buying, selling, a home value, or a notary visit.',
    icon: CalendarCheck,
  },
  {
    number: '03',
    title: 'Move forward.',
    text: 'Book the consultation, listing, or appointment when you’re ready. I’ll handle the details and keep you posted by email.',
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
