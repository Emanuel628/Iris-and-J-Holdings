import { Mail, MapPin, Phone } from 'lucide-react';
import '../../styles/footer-position-fix.css';

function Footer() {
  return (
    <footer className="site-footer compact-footer">
      <div className="footer-main">
        <div className="footer-column brokerage">
          <h3>Brokerage</h3>
          <p>
            Real estate services are provided through NEIXA LLC, doing business as All Star Real Estate Agency,
            a licensed New Jersey real estate brokerage. 1416B Morris Ave, Union, NJ 07083.
          </p>
          <p>Brokerage office: <a href="tel:19089645005">(908) 964-5005</a></p>
          <p className="equal-housing">Equal Housing Opportunity</p>
        </div>

        <div className="footer-column footer-contact">
          <h3>Contact</h3>
          <p>Daiana Castro, Licensed NJ Real Estate Salesperson</p>
          <p>NJ Real Estate License #2190570</p>
          <p><Phone size={14} /> Mobile: <a href="tel:19084996320">(908) 499-6320</a></p>
          <p><Mail size={14} /> listingsbyd@gmail.com</p>
          <p><MapPin size={14} /> Union, Middlesex &amp; Essex Counties, NJ</p>
        </div>

        <div className="footer-column footer-daiana">
          <h3>About</h3>
          <p>Daiana Castro helps buyers, sellers, and notary clients across Union, Middlesex, and Essex County, New Jersey.</p>
          <a className="footer-about-link" href="/about">About Daiana</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
          <p>© 2026 Iris &amp; J Holdings. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
