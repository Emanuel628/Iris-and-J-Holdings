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
        <a href="/contact">Contact</a>
      </nav>

      <a className="nav-cta" href="/contact?service=General%20Question#contact-form">Book a Call</a>
    </header>
  );
}

export default Header;
