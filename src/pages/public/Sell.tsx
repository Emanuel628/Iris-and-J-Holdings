import PublicLayout from '../../components/layout/PublicLayout';
import FormStatus from '../../components/ui/FormStatus';
import { useContactForm } from '../../lib/useContactForm';
import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';
import { usePageMeta } from '../../lib/usePageMeta';

function Sell() {
  usePageMeta(
    'Sell Your Home in New Jersey',
    'Seller strategy guidance in New Jersey for pricing, preparation, marketing, negotiation, attorney review, and closing through All Star Real Estate Agency.',
  );
  const { status, submit } = useContactForm('Seller Strategy Request');
  const template = getSiteContentTemplate('sell');
  const { content, heroImageUrl } = usePublicSiteContent('sell', template?.defaults || {});

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero page-hero-seller">
          <div className="page-hero-content">
            <p className="eyebrow">{content.heroEyebrow}</p>
            <h1>{content.heroTitle}</h1>
            <p>{content.heroDescription}</p>
            <div className="page-actions">
              <a className="button button-secondary" href="/home-value#home-value-form">Get Home Value Review</a>
            </div>
          </div>
          <div className="page-hero-visual page-hero-image-frame seller-hero-visual" aria-label="Seller strategy visual">
            <img src={heroImageUrl || '/images/site/sell-hero.jpg'} alt="Refined staged interior for seller strategy" />
          </div>
        </section>

        <section className="page-content split-section seller-intake" id="seller-form">
          <div>
            <div className="page-intro">
              <p className="eyebrow">{content.intakeEyebrow}</p>
              <h2>{content.intakeTitle}</h2>
              <p>{content.intakeDescription}</p>
            </div>
            <div className="notice-box">
              Submitting this form does not create a listing agreement or brokerage relationship. Required New
              Jersey disclosures, the Consumer Information Statement, agency disclosure, a written brokerage
              services agreement, compensation terms, and any required seller property condition disclosure are
              handled through All Star Real Estate Agency before listing or brokerage services move forward.
              Broker compensation is negotiable and not set by law.
            </div>
          </div>

          <form className="info-panel form-shell" onSubmit={submit}>
            <input className="hp-field" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="form-row">
              <div className="input-group"><label htmlFor="seller-name">Full Name</label><input id="seller-name" name="fullName" required /></div>
              <div className="input-group"><label htmlFor="seller-email">Email</label><input id="seller-email" name="email" type="email" required /></div>
            </div>
            <div className="form-row">
              <div className="input-group"><label htmlFor="seller-phone">Phone</label><input id="seller-phone" name="phone" type="tel" /></div>
              <div className="input-group">
                <label htmlFor="seller-timeline">Selling Timeline</label>
                <select id="seller-timeline" name="sellingTimeline" required defaultValue="">
                  <option value="" disabled>Choose timeline</option>
                  <option value="Ready now">Ready now</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="Exploring options">Exploring options</option>
                </select>
              </div>
            </div>
            <div className="input-group"><label htmlFor="seller-address">Property Address or Area</label><input id="seller-address" name="propertyAddressOrArea" /></div>
            <div className="input-group"><label htmlFor="seller-message">Questions or goals</label><textarea id="seller-message" name="questionsOrGoals" required /></div>
            <button className="button button-primary" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending...' : 'Send Seller Request'}
            </button>
            <FormStatus status={status} />
          </form>
        </section>

        <section className="page-content seller-support-content">
          <div className="page-intro">
            <p className="eyebrow">Before you list</p>
            <h2>Pricing, prep, marketing, and negotiation.</h2>
            <p>
              Selling works best when the plan is set before the listing goes live: a price based on recent
              comparable sales, a short list of prep that actually moves the needle, clear marketing, and help
              through offers, attorney review, and closing.
            </p>
          </div>
          <div className="content-grid">
            <article className="content-card"><h3>Pricing</h3><p>Review local activity, comparable homes, condition, demand, and seller goals.</p></article>
            <article className="content-card"><h3>Preparation</h3><p>Identify what should be cleaned, organized, staged, or improved before going live.</p></article>
            <article className="content-card"><h3>Negotiation</h3><p>Compare offers side by side and decide each step with straightforward advice.</p></article>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

export default Sell;

