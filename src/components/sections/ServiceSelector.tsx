import { ArrowRight, BarChart3, HomeIcon, MapPin, PenLine, Tag } from 'lucide-react';
import { useRef } from 'react';

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
    title: 'Vacation Rentals',
    text: 'Check availability and book an Orlando vacation stay through Iris & J Holdings.',
    href: '/vacation-rentals',
    icon: MapPin,
  },
  {
    title: 'Mobile Notary',
    text: 'Book a convenient mobile notary appointment.',
    href: '/mobile-notary',
    icon: PenLine,
  },
];

function ServiceSelector() {
  const railRef = useRef<HTMLDivElement | null>(null);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const rail = railRef.current;
    if (!rail) return;
    if (window.matchMedia('(max-width: 980px)').matches) return;

    const rect = rail.getBoundingClientRect();
    const edgeSize = Math.min(140, rect.width * 0.2);
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    if (maxScroll <= 0) return;

    let nextScrollLeft = rail.scrollLeft;
    if (event.clientX < rect.left + edgeSize) {
      const ratio = 1 - (event.clientX - rect.left) / edgeSize;
      nextScrollLeft = Math.max(0, rail.scrollLeft - ratio * 22);
    } else if (event.clientX > rect.right - edgeSize) {
      const ratio = 1 - (rect.right - event.clientX) / edgeSize;
      nextScrollLeft = Math.min(maxScroll, rail.scrollLeft + ratio * 22);
    }

    if (nextScrollLeft !== rail.scrollLeft) {
      rail.scrollLeft = nextScrollLeft;
    }
  }

  return (
    <section className="service-section section" id="services" aria-labelledby="service-heading">
      <div className="section-heading centered">
        <p className="eyebrow">Services</p>
        <h2 id="service-heading">What do you need help with?</h2>
        <span className="gold-line short" aria-hidden="true" />
      </div>

      <div className="service-grid service-grid-scroll" ref={railRef} onPointerMove={handlePointerMove}>
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
