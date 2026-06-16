import { ArrowRight, BarChart3, CalendarCheck, ClipboardCheck, HomeIcon, Mail, MapPin, Menu, PenLine, Phone, Tag } from 'lucide-react';

const services = [
  {
    title: 'Buying',
    text: 'Get clear guidance and support as you search for the right home.',
    icon: HomeIcon,
  },
  {
    title: 'Selling',
    text: 'Create a smart strategy to sell your home with confidence.',
    icon: Tag,
  },
  {
    title: 'Home Value',
    text: 'Find out what your home may be worth in today’s market.',
    icon: BarChart3,
  },
  {
    title: 'Mobile Notary',
    text: 'Book a convenient mobile notary appointment.',
    icon: PenLine,
  },
];

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

function Home() {
  return (
    <div className="site-shell">
      <header className="site-header" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Iris and J Holdings home">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span className="brand-copy">
            <strong>Iris &amp; J</strong>
            <span>Holdings</span>
            <small>Real Estate Guidance · Mobile Notary Services</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#buy">Buy</a>
          <a href="#sell">Sell</a>
          <a href="#home-value">Home Value</a>
          <a href="#notary">Notary</a>
          <a href="#about">About</a>
          <a href="#resources">Resources</a>
        </nav>

        <a className="nav-cta" href="#book">Book a Call</a>
        <button className="mobile-menu" aria-label="Open menu">
          <Menu size={22} />
        </button>
      </header>

      <main id="top">
        <section className="hero-section" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <h1 id="hero-heading">Your Next Move, Made Clear.</h1>
            <span className="gold-line" aria-hidden="true" />
            <p>
              Buying, selling, or booking important notary services can feel like a lot.
              I help you understand the next step, make a plan, and move forward with confidence.
            </p>
            <div className="hero-actions" aria-label="Primary actions">
              <a className="button button-primary" href="#services">Find the Right Service</a>
              <a className="text-link" href="#book">
                Book a Call <ArrowRight size={18} />
              </a>
            </div>
          </div>

          <div className="hero-visual" aria-label="Calm living room with neutral decor">
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
                <a className="service-card" href={`#${service.title.toLowerCase().replace(' ', '-')}`} key={service.title}>
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

        <section className="trust-section" id="about" aria-labelledby="trust-heading">
          <div className="portrait-panel" aria-label="Portrait area for Daiana Castro">
            <div className="portrait-placeholder">
              <span>Daiana</span>
            </div>
          </div>

          <div className="trust-copy">
            <p className="eyebrow">A calm, organized approach</p>
            <h2 id="trust-heading">Clear guidance. Thoughtful planning. Steady communication.</h2>
            <span className="gold-line" aria-hidden="true" />
            <p>
              From the first conversation, you’ll know what comes next and why it matters.
              My goal is to make the process feel less stressful — and a lot more manageable.
            </p>
            <a className="button button-secondary" href="#book">Meet Daiana</a>
          </div>
        </section>

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

        <section className="final-cta" id="book" aria-labelledby="cta-heading">
          <div className="cta-copy">
            <h2 id="cta-heading">Not sure where to start?</h2>
            <span className="gold-line short" aria-hidden="true" />
            <p>That’s okay. Schedule a quick conversation and I’ll help you choose the right path.</p>
            <a className="button button-primary" href="mailto:listingsbyd@gmail.com">Book a Call <ArrowRight size={16} /></a>
          </div>
          <div className="cta-visual" aria-hidden="true">
            <div className="mini-vase" />
            <div className="mini-bowl" />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <a className="brand footer-logo" href="#top" aria-label="Iris and J Holdings home">
              <span className="brand-mark" aria-hidden="true"><span /></span>
              <span className="brand-copy">
                <strong>Iris &amp; J</strong>
                <span>Holdings</span>
                <small>Real Estate Guidance · Mobile Notary Services</small>
              </span>
            </a>
            <div className="social-row" aria-label="Social links">
              <a href="#instagram">Instagram</a>
              <a href="#facebook">Facebook</a>
              <a href="#linkedin">LinkedIn</a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Quick Links</h3>
            <a href="#buy">Buy</a>
            <a href="#sell">Sell</a>
            <a href="#home-value">Home Value</a>
            <a href="#notary">Mobile Notary</a>
            <a href="#about">About</a>
            <a href="#resources">Resources</a>
          </div>

          <div className="footer-column">
            <h3>Contact</h3>
            <p><Phone size={15} /> (908) 499-6320</p>
            <p><Mail size={15} /> listingsbyd@gmail.com</p>
            <p><MapPin size={15} /> Union, NJ<br />Serving Union, Middlesex, and Essex Counties</p>
          </div>

          <div className="footer-column brokerage">
            <h3>Brokerage</h3>
            <p>
              Real estate services are provided through All Star Real Estate Agency.<br />
              1416B Morris Ave, Union, NJ 07083<br />
              Office: (908) 964-5005<br />
              Broker of Record: Neixa Capdevila
            </p>
            <p className="equal-housing">Equal Housing Opportunity</p>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Use</a>
            <a href="#accessibility">Accessibility</a>
          </div>
          <p>© 2026 Iris &amp; J Holdings. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
