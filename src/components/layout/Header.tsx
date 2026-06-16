const navItems = [
  { label: 'Buy', href: '/buy' },
  { label: 'Sell', href: '/sell' },
  { label: 'Home Value', href: '/home-value' },
  { label: 'Notary', href: '/mobile-notary' },
  { label: 'Rentals', href: '/vacation-rentals' },
  { label: 'About', href: '/about' },
  { label: 'Resources', href: '/resources' },
];

function Header() {
  return <header className="site-header" aria-label="Main navigation"><a className="brand" href="/" aria-label="Iris and J Holdings home"><span className="brand-mark" aria-hidden="true"><span /></span><span className="brand-copy"><strong>Iris &amp; J</strong><span>Holdings</span><small>Real Estate Guidance · Mobile Notary Services</small></span></a><nav className="mobile-nav" aria-label="Primary navigation">{navItems.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}<a className="mobile-nav-cta" href="/book">Book</a></nav></header>;
}

export default Header;
