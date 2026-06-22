import PublicLayout from '../../components/layout/PublicLayout';
import FormStatus from '../../components/ui/FormStatus';
import NewsletterOptIn from '../../components/ui/NewsletterOptIn';
import { useContactForm } from '../../lib/useContactForm';
import { usePageMeta } from '../../lib/usePageMeta';

function HomeValue() {
  usePageMeta(
    'Home Value Review',
    'Request a local home value review based on current market activity. A helpful starting point — not a formal appraisal.',
  );
  const { status, submit } = useContactForm('Home Value Review Request');
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero page-hero-home-value">
          <div className="page-hero-content">
            <p className="eyebrow">Home Value Review</p>
            <h1>Find out what your home may be worth.</h1>
            <p>
              Share a few property details and Daiana will review local market activity to help you understand
              your options. This is a helpful starting point, not a formal appraisal.
            </p>
            <div className="page-actions">
              <a className="button button-primary" href="#home-value-form">Send My Home Value Request</a>
            </div>
          </div>
          <div className="page-hero-visual page-hero-image-frame home-value-hero-visual" aria-label="Home value review visual">
            <img src="/images/site/home-value-hero.jpg" alt="Market analysis tablet for home value review" />
          </div>
        </section>

        <section className="page-content split-section" id="home-value-form">
          <div>
            <div className="page-intro">
              <p className="eyebrow">Property details</p>
              <h2>A few details to get started.</h2>
              <p>
                Daiana reviews recent comparable sales, current nearby listings, and your home’s condition and
                updates, then follows up by email with a price range and the reasoning behind it. There’s no cost
                and no obligation.
              </p>
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
            <NewsletterOptIn />
            <button className="button button-primary" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Submit Request'}
            </button>
            <FormStatus status={status} />
          </form>
        </section>
      </main>
    </PublicLayout>
  );
}

export default HomeValue;
