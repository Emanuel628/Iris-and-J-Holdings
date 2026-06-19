import PublicLayout from '../../components/layout/PublicLayout';
import VacationBookingCalendar from '../../components/booking/VacationBookingCalendar';
import Faq from '../../components/sections/Faq';
import FormStatus from '../../components/ui/FormStatus';
import { vacationHouseRules } from '../../content/vacationHouseRules';
import { useContactForm } from '../../lib/useContactForm';
import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';
import { usePageMeta } from '../../lib/usePageMeta';

const photoSlots = [
  'Exterior photo',
  'Living room photo',
  'Kitchen photo',
  'Bedroom photo',
  'Outdoor space photo',
  'Area photo',
];

const amenities = [
  'Fully equipped kitchen',
  'Fast Wi-Fi',
  'Free parking',
  'Washer & dryer',
  'Smart TV / streaming',
  'Self check-in',
  'Close to Orlando theme parks',
  'Linens & towels provided',
];

const orlandoFaqs = [
  {
    question: 'Where is the rental located?',
    answer:
      'In the Orlando / Central Florida area, close to the major theme parks. The exact address is shared after booking.',
  },
  {
    question: 'How do I book?',
    answer:
      'Pick your dates on the availability calendar above, continue to the guest intake page, review the house rules, and check out securely. A stay is confirmed after payment is completed and a booking confirmation is issued by email.',
  },
  {
    question: 'What’s included in the price?',
    answer:
      'The nightly rate plus a one-time cleaning fee is shown on the calendar before checkout. Any additional property-specific terms, fees, or house rules are confirmed before booking.',
  },
  {
    question: 'Have a question before booking?',
    answer:
      'Use the question form on this page and Daiana will get back to you by email about dates, the property, or anything else.',
  },
];

function VacationRentals() {
  usePageMeta(
    'Orlando Vacation Rental Near Theme Parks',
    'Check availability and book an Orlando vacation rental in Central Florida near major theme parks with secure checkout, amenities, FAQs, and booking questions.',
  );
  const { status, submit } = useContactForm('Orlando Vacation Rental Question');
  const template = getSiteContentTemplate('vacation-rentals');
  const { content, heroImageUrl } = usePublicSiteContent('vacation-rentals', template?.defaults || {});

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero page-hero-vacation">
          <div className="page-hero-content">
            <p className="eyebrow">{content.heroEyebrow}</p>
            <h1>{content.heroTitle}</h1>
            <p>{content.heroDescription}</p>
          </div>
          <div className="page-hero-visual page-hero-image-frame vacation-hero-visual" aria-label="Orlando vacation rental visual">
            <img src={heroImageUrl || '/images/site/vacation-hero.jpg'} alt="Sunlit Orlando vacation rental interior and patio" />
          </div>
        </section>

        <section className="page-content" id="availability">
          <div className="split-section vacation-booking">
            <div className="page-intro">
              <p className="eyebrow">{content.availabilityEyebrow}</p>
              <h2>{content.availabilityTitle}</h2>
              <p>{content.availabilityDescription}</p>
              <div className="notice-box">
                Availability and pricing may change until payment is completed and a booking confirmation is issued.
                Vacation rental accommodations are offered independently through Iris &amp; J Holdings and are not
                real estate brokerage services.
              </div>
            </div>
            <VacationBookingCalendar />
          </div>
        </section>

        <section className="page-content" id="house-rules-preview">
          <div className="page-intro">
            <p className="eyebrow">House Rules</p>
            <h2>Before checkout, review the stay expectations.</h2>
            <p>
              These are the core guest rules shown again in the intake form. The full house rules page and terms
              are linked before checkout and in the confirmation email.
            </p>
          </div>
          <ul className="detail-list">
            {vacationHouseRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>

        <section className="page-content" id="amenities">
          <div className="page-intro">
            <p className="eyebrow">Amenities</p>
            <h2>Comfortable, practical, and close to the parks.</h2>
            <p>
              This section can be updated with the property’s exact photos, amenities, house rules, and guest
              instructions once those details are finalized.
            </p>
          </div>
          <ul className="amenity-grid">
            {amenities.map((amenity) => (
              <li className="amenity-item" key={amenity}>{amenity}</li>
            ))}
          </ul>
        </section>

        <section className="page-content" id="photos">
          <div className="page-intro">
            <p className="eyebrow">Photos</p>
            <h2>Property photos coming soon.</h2>
            <p>
              Replace these placeholders with the rental’s actual photos before promoting the listing.
            </p>
          </div>
          <div className="vacation-photo-grid">
            {photoSlots.map((slot) => (
              <div className="vacation-photo-card" key={slot}>{slot}</div>
            ))}
          </div>
        </section>

        <section className="page-content" id="questions">
          <div className="split-section vacation-question-section">
            <div className="page-intro">
              <p className="eyebrow">Questions</p>
              <h2>Ask before you book.</h2>
              <p>
                Have a question about dates, the home, the area, or the booking process? Send it here and Daiana
                will follow up by email.
              </p>
            </div>
            <form className="info-panel form-shell" onSubmit={submit}>
              <input className="hp-field" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="form-row">
                <div className="input-group"><label htmlFor="vacation-name">Name</label><input id="vacation-name" name="name" required /></div>
                <div className="input-group"><label htmlFor="vacation-email">Email</label><input id="vacation-email" name="email" type="email" required /></div>
              </div>
              <div className="input-group"><label htmlFor="vacation-question">Your Question</label><textarea id="vacation-question" name="question" required /></div>
              <button className="button button-primary" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send Question'}
              </button>
              <FormStatus status={status} />
            </form>
          </div>
        </section>

        <section className="page-content">
          <Faq eyebrow="Vacation rental FAQ" heading="Before you reserve." items={orlandoFaqs} />
          <section className="vacation-legal-alert" aria-label="Vacation rental legal notice">
            Orlando vacation rental accommodations are offered independently through Iris &amp; J Holdings and are not
            provided through All Star Real Estate Agency. Vacation rental accommodations do not constitute real
            estate brokerage services. A stay is not confirmed until payment is completed and a booking confirmation
            is issued.
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default VacationRentals;

