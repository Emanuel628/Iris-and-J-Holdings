import { Mail, MapPin, Phone } from 'lucide-react';

function Footer() {
  return (
    <footer className="site-footer refined-footer">
      <div className="footer-main">
        <div className="footer-column footer-about">
          <h3>About</h3>
          <p>
            Iris & J Holdings helps clients move through real estate guidance, mobile notary appointments,
            and future Orlando vacation rental updates with clear next steps.
          </p>
          <a className="footer-about-link" href="/about">Learn more about Daiana</a>
          <div className="social-row" aria-label="Social links">
            <a href="/">Instagram</a>
            <a href="/">Facebook</a>
            <a href="/">LinkedIn</a>
          </div>
        </div>

        <div className="footer-column footer-contact">
          <h3>Contact</h3>
          <p><Phone size={15} /> <a href="tel:19084996320">(908) 499-6320</a></p>
          <p><Mail size={15} /> <a href="mailto:listingsbyd@gmail.com">listingsbyd@gmail.com</a></p>
          <p><MapPin size={15} /> Union, NJ<br />Serving Union, Middlesex, and Essex Counties</p>
        </div>

        <div className="footer-column brokerage">
          <h3>Brokerage</h3>
          <p>Real estate services are provided through All Star Real Estate Agency.</p>
          <p>1416B Morris Ave, Union, NJ 07083</p>
          <p>Office: <a href="tel:19089645005">(908) 964-5005</a></p>
          <p>Broker of Record: Neixa Capdevila</p>
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
