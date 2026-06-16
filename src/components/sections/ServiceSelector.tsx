import { ArrowRight, BarChart3, HomeIcon, PenLine, Tag } from 'lucide-react';

const services = [
  {
    title: 'Buying',
    text: 'Get clear guidance and support as you search for the right home.',
    href: '/buy',
    icon: HomeIcon,
  },
  {
    title: 'Selling',
    text: 'Create a smart strategy to sell your home with confidence.',
    href: '/sell',
    icon: Tag,
  },
  {
    title: 'Home Value',
    text: 'Find out what your home may be worth in today’s market.',
    href: '/home-value',
    icon: BarChart3,
  },
  {
    title: 'Mobile Notary',
    text: 'Book a convenient mobile notary appointment.',
    href: '/mobile-notary',
    icon: PenLine,
  },
];

function ServiceSelector() {
  return (
    <section className="service-section section" id="services" aria-labelledby="service-heading">
      <div className="section-heading centered">
        <p className="eyebrow">What do you need help with?</p>
        <h2 id="service-heading">Choose the path that fits you best.</h2>
        <span className="gold-line short" aria-hidden="true" />
      </div>

      <div className="service-grid">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <a className="service-card" href={service.href} key={service.title}>
              <span className="icon-badge" aria-hidden="true">
                <Icon size={34} strokeWidth={1.5} />
              </span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <span className="card-link">
                Learn More <ArrowRight size={15} />
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export default ServiceSelector;
