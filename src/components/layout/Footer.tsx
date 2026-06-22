
import { Mail, MapPin, Phone } from 'lucide-react';
import SocialLinks from '../ui/SocialLinks';


import { Mail, MapPin, Phone } from 'lucide-react';
import SocialLinks from '../ui/SocialLinks';
﻿import { Mail, MapPin, Phone } from 'lucide-react';


import '../../styles/footer-position-fix.css';
import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';

function Footer() {
  const template = getSiteContentTemplate('footer');
  const { content } = usePublicSiteContent('footer', template?.defaults || {});
  const fairHousingImageUrl = content.fairHousingImageUrl || '/equal-housing-opportunity.svg';

  return (
    <footer className="site-footer compact-footer">
      <div className="footer-main">
        <div className="footer-column brokerage">
          <h3>{content.brokerageTitle || 'Brokerage'}</h3>
          <p>{content.brokerageBody || 'Real estate services are provided by Daiana Castro, REALTOR®, Licensed NJ Real Estate Salesperson, through All Star Real Estate Agency, a licensed New Jersey real estate brokerage. 1416B Morris Ave, Union, NJ 07083.'}</p>
          <p>{content.brokerageOffice || 'Brokerage office: (908) 964-5005'}</p>
          <img className="eho-logo" src={fairHousingImageUrl} alt="Equal Housing Opportunity" width="190" />
        </div>

        <div className="footer-column footer-contact">
          <h3>{content.contactTitle || 'Contact'}</h3>
          <p>{content.contactName || 'Daiana Castro, REALTOR®'}</p>
          <p>{content.contactRole || 'Licensed NJ Real Estate Salesperson'}</p>
          <p>{content.contactLicense || 'NJ Real Estate License #2190570'}</p>
          <p><Phone size={14} /> {content.contactPhone || 'Mobile: (908) 499-6320'}</p>
          <p><Mail size={14} /> {content.contactEmail || 'listingsbyd@gmail.com'}</p>
          <p><MapPin size={14} /> {content.contactLocation || 'Union, Middlesex & Essex Counties, NJ'}</p>
        </div>

        <div className="footer-column footer-daiana">
          <h3>About</h3>
          <p>
            Real estate through All Star Real Estate Agency. Mobile notary and vacation rental services
            through Iris &amp; J Holdings.
          </p>
          <a className="footer-about-link" href="/about">About Daiana</a>
          <SocialLinks className="footer-social" />
          <h3>{content.aboutTitle || 'About'}</h3>
          <p>{content.aboutBody || 'Real estate through All Star Real Estate Agency. Mobile notary and vacation rental services through Iris & J Holdings.'}</p>
          <a className="footer-about-link" href="/about">{content.aboutLinkLabel || 'About Daiana'}</a>
          <SocialLinks className="footer-social" />
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <div className="footer-bottom-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Use</a>
            <a href="/refund-cancellation-policy">Refund &amp; Cancellation Policy</a>
            <a href="/accessibility">Accessibility &amp; Fair Housing</a>
            <a href="/admin/login">Admin</a>
          </div>
          <p>{content.copyright || '© 2026 Iris & J Holdings. All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
