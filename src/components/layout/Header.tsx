function Header() {
  return (
    <header className="site-header clean-site-header" aria-label="Site header">
      <a className="brand" href="/" aria-label="Iris and J Holdings home">
        <span className="brand-mark" aria-hidden="true"><span /></span>
        <span className="brand-copy">
          <strong>Iris &amp; J</strong>
          <span>Holdings</span>
          <small>Real Estate Guidance · Mobile Notary Services</small>
        </span>
      </a>

      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/#services">Services</a>
        <a href="/book">Contact</a>
      </nav>

      <a className="nav-cta" href="/book?service=General%20Question#contact-form">Book a Call</a>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <a href="/">Home</a>
        <a href="/buy">Buy</a>
        <a href="/sell">Sell</a>
        <a href="/home-value">Home Value</a>
        <a href="/mobile-notary">Notary</a>
        <a href="/resources">Resources</a>
        <a href="/about">About</a>
        <a className="mobile-nav-call" href="tel:19084996320">Call</a>
      </nav>
    </header>
  );
}

export default Header;
