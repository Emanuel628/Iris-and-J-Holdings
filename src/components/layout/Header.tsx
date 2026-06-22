import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';

const navLinks = [
  { href: '/buy', label: 'Buy' },
  { href: '/sell', label: 'Sell' },
  { href: '/mobile-notary', label: 'Notary' },
  { href: '/vacation-rentals', label: 'Vacation Rentals' },
  { href: '/about', label: 'About' },
];

function isActivePath(href: string) {
  const pathname = window.location.pathname;

  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function Header() {
  const template = getSiteContentTemplate('header');
  const { content } = usePublicSiteContent('header', template?.defaults || {});
  const links = [
    { href: '/buy', label: content.buyLabel || navLinks[0].label },
    { href: '/sell', label: content.sellLabel || navLinks[1].label },
    { href: '/mobile-notary', label: content.notaryLabel || navLinks[2].label },
    { href: '/vacation-rentals', label: content.vacationLabel || navLinks[3].label },
    { href: '/about', label: content.aboutLabel || navLinks[4].label },
  ];

  return (
    <header className="site-header clean-site-header" aria-label="Site header">
      <a className="brand" href="/" aria-label="Iris and J Holdings home">
        <span className="brand-mark" aria-hidden="true"><span /></span>
        <span className="brand-copy">
          <strong>Iris &amp; J</strong>
          <span>Holdings</span>
          <small>{content.brandLine || 'Brokered by All Star Real Estate Agency'}</small>
        </span>
      </a>

      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={isActivePath(link.href) ? 'is-active' : undefined}
            aria-current={isActivePath(link.href) ? 'page' : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <a className="nav-cta" href="/book?service=General%20Question#contact-form">{content.ctaLabel || 'Book a Call'}</a>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={isActivePath(link.href) ? 'is-active' : undefined}
            aria-current={isActivePath(link.href) ? 'page' : undefined}
          >
            {link.label}
          </a>
        ))}
        <a className="mobile-nav-call" href="tel:19084996320">Call</a>
      </nav>
    </header>
  );
}

export default Header;
