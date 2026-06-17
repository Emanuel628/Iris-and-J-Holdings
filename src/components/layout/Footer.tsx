import { Mail, MapPin, Phone } from 'lucide-react';
import '../../styles/footer-position-fix.css';

function Footer() {
  return (
    <footer className="site-footer compact-footer">
      <div className="footer-main">
        <div className="footer-column brokerage">
          <h3>Brokerage</h3>
          <p>
            Real estate services through All Star Real Estate Agency · Licensed with NEIXA LLC ·
            1416B Morris Ave, Union, NJ 07083 · Office: <a href="tel:19089645005">(908) 964-5005</a>
          </p>
          <p className="equal-housing">Equal Housing Opportunity</p>
        </div>

        <div className="footer-column footer-contact">
          <h3>Contact</h3>
          <p><Phone size={14} /> <a href="tel:19084996320">(908) 499-6320</a></p>
          <p><Mail size={14} /> listingsbyd@gmail.com</p>
          <p><MapPin size={14} /> Union, NJ · Union, Middlesex, and Essex Counties</p>
        </div>

        <div className="footer-column footer-daiana">
          <h3>License</h3>
          <p>Daiana Castro · NJ Real Estate Salesperson. License details available upon request and broker verification.</p>
          <a className="footer-about-link" href="/about">About Daiana</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
        </div>
        <p>© 2026 Iris &amp; J Holdings. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
