import { Mail, MapPin, Phone } from 'lucide-react';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <a className="brand footer-logo" href="/" aria-label="Iris and J Holdings home">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span className="brand-copy">
              <strong>Iris &amp; J</strong>
              <span>Holdings</span>
              <small>Real Estate Guidance · Mobile Notary Services</small>
            </span>
          </a>
          <div className="social-row" aria-label="Social links">
            <a href="/">Instagram</a>
            <a href="/">Facebook</a>
            <a href="/">LinkedIn</a>
          </div>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <a href="/buy">Buy</a>
          <a href="/sell">Sell</a>
          <a href="/home-value">Home Value</a>
          <a href="/mobile-notary">Mobile Notary</a>
          <a href="/vacation-rentals">Vacation Rentals</a>
          <a href="/about">About</a>
          <a href="/resources">Resources</a>
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
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
          <a href="/">Accessibility</a>
        </div>
        <p>© 2026 Iris &amp; J Holdings. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
