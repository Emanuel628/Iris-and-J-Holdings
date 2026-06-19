import PublicLayout from '../../components/layout/PublicLayout';
import FormStatus from '../../components/ui/FormStatus';
import { useContactForm } from '../../lib/useContactForm';
import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';
import { usePageMeta } from '../../lib/usePageMeta';

function HomeValue() {
  usePageMeta(
    'New Jersey Home Value Review',
    'Request a New Jersey home value review using recent comparable sales, nearby listings, condition, updates, and local market activity. Not a formal appraisal.',
  );
  const { status, submit } = useContactForm('Home Value Review Request');
  const template = getSiteContentTemplate('home-value');
  const { content, heroImageUrl } = usePublicSiteContent('home-value', template?.defaults || {});

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero page-hero-home-value">
          <div className="page-hero-content">
            <p className="eyebrow">{content.heroEyebrow}</p>
            <h1>{content.heroTitle}</h1>
            <p>{content.heroDescription}</p>
            <div className="page-actions">
              <a className="button button-primary" href="#home-value-form">Send My Home Value Request</a>
            </div>
          </div>
          <div className="page-hero-visual page-hero-image-frame home-value-hero-visual" aria-label="Home value review visual">
            <img src={heroImageUrl || '/images/site/home-value-hero.jpg'} alt="Market analysis tablet for home value review" />
          </div>
        </section>

        <section className="page-content split-section" id="home-value-form">
          <div>
            <div className="page-intro">
              <p className="eyebrow">{content.introEyebrow}</p>
              <h2>{content.introTitle}</h2>
              <p>{content.introDescription}</p>
            </div>
            <div className="notice-box">
              Home value reviews are informal estimates based on available market information and details you
              choose to provide. They are not appraisals, broker price opinions for lending purposes, guarantees
              of sale price, or legal, tax, financial, or appraisal advice. Submitting a request does not create a
              brokerage relationship.
            </div>
          </div>

          <form className="info-panel form-shell" onSubmit={submit}>
            <input className="hp-field" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="form-row">
              <div className="input-group"><label htmlFor="value-name">Full Name</label><input id="value-name" name="fullName" required /></div>
              <div className="input-group"><label htmlFor="value-email">Email</label><input id="value-email" name="email" type="email" required /></div>
            </div>
            <div className="form-row">
              <div className="input-group"><label htmlFor="value-phone">Phone</label><input id="value-phone" name="phone" type="tel" /></div>
              <div className="input-group"><label htmlFor="value-property-type">Property Type</label><input id="value-property-type" name="propertyType" /></div>
            </div>
            <div className="input-group"><label htmlFor="value-address">Property Address</label><input id="value-address" name="propertyAddress" required /></div>
            <div className="input-group"><label htmlFor="value-city">City or Town</label><input id="value-city" name="cityOrTown" required /></div>
            <div className="input-group"><label htmlFor="value-timeline">Timeline</label><input id="value-timeline" name="timeline" /></div>
            <div className="input-group"><label htmlFor="value-details">Updates or details</label><textarea id="value-details" name="updatesOrDetails" /></div>
            <button className="button button-primary" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending...' : 'Submit Request'}
            </button>
            <FormStatus status={status} />
          </form>
        </section>
      </main>
    </PublicLayout>
  );
}

export default HomeValue;

