import { Mail, MapPin, Phone } from 'lucide-react';
import '../../styles/footer-position-fix.css';

function Footer() {
  return (
    <footer className="site-footer compact-footer">
      <div className="footer-main">
        <div className="footer-column brokerage">
          <h3>Brokerage</h3>
          <p>
            Real estate services are provided by Daiana Castro, REALTOR®, Licensed NJ Real Estate
            Salesperson, through All Star Real Estate Agency, a licensed New Jersey real estate brokerage.
            1416B Morris Ave, Union, NJ 07083.
          </p>
          <p>Brokerage office: <a href="tel:19089645005">(908) 964-5005</a></p>
          <img className="eho-logo" src="/equal-housing-opportunity.svg" alt="Equal Housing Opportunity" width="190" />
        </div>

        <div className="footer-column footer-contact">
          <h3>Contact</h3>
          <p>Daiana Castro, REALTOR®</p>
          <p>Licensed NJ Real Estate Salesperson</p>
          <p>NJ Real Estate License #2190570</p>
          <p><Phone size={14} /> Mobile: <a href="tel:19084996320">(908) 499-6320</a></p>
          <p><Mail size={14} /> listingsbyd@gmail.com</p>
          <p><MapPin size={14} /> Union, Middlesex &amp; Essex Counties, NJ</p>
        </div>

        <div className="footer-column footer-daiana">
          <h3>About</h3>
          <p>
            Real estate through All Star Real Estate Agency. Mobile notary and vacation rental services
            through Iris &amp; J Holdings.
          </p>
          <a className="footer-about-link" href="/about">About Daiana</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
          <a href="/accessibility#fair-housing">Fair Housing</a>
          <a href="/accessibility">Accessibility</a>
        </div>
        <p>© 2026 Iris &amp; J Holdings. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;