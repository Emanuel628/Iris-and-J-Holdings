import { Menu } from 'lucide-react';

const navItems = [
  { label: 'Buy', href: '/buy' },
  { label: 'Sell', href: '/sell' },
  { label: 'Home Value', href: '/home-value' },
  { label: 'Notary', href: '/mobile-notary' },
  { label: 'About', href: '/about' },
  { label: 'Resources', href: '/resources' },
];

function Header() {
  return (
    <header className="site-header" aria-label="Main navigation">
      <a className="brand" href="/" aria-label="Iris and J Holdings home">
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
        {navItems.map((item) => (
          <a href={item.href} key={item.href}>{item.label}</a>
        ))}
      </nav>

      <a className="nav-cta" href="/book">Book a Call</a>
      <button className="mobile-menu" aria-label="Open menu" type="button">
        <Menu size={22} />
      </button>
    </header>
  );
}

export default Header;
