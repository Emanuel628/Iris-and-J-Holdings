import PublicLayout from '../../components/layout/PublicLayout';
import { sendWebsiteRequest as sendMailRequest } from '../../lib/formSubmitEmail';

function HomeValue() {
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
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
          <div className="page-hero-visual" aria-label="Home value visual placeholder" />
        </section>

        <section className="page-content split-section" id="home-value-form">
          <div>
            <div className="page-intro">
              <p className="eyebrow">Property details</p>
              <h2>A simple request for a thoughtful local review.</h2>
              <p>
                The form keeps the first step light: address, timing, property type, and anything that may affect value.
              </p>
            </div>
            <div className="notice-box">
              Home value reviews are estimates based on available market information and are not appraisals.
            </div>
          </div>

          <form className="info-panel form-shell" onSubmit={(event) => sendMailRequest(event, 'Home Value Review Request')}>
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
            <button className="button button-primary" type="submit">Submit Request</button>
          </form>
        </section>
      </main>
    </PublicLayout>
  );
}

export default HomeValue;
