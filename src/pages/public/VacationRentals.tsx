import PublicLayout from '../../components/layout/PublicLayout';
import AvailabilityCalendar from '../../components/booking/AvailabilityCalendar';
import Faq from '../../components/sections/Faq';
import FormStatus from '../../components/ui/FormStatus';
import { useContactForm } from '../../lib/useContactForm';
import { usePageMeta } from '../../lib/usePageMeta';

const photoSlots = [
  'Exterior photo',
  'Living room photo',
  'Kitchen photo',
  'Bedroom photo',
  'Outdoor space photo',
  'Area photo',
];

// TODO: confirm the rental's actual amenities and update this list.
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

// TODO: refine answers with the rental's real details.
const orlandoFaqs = [
  {
    question: 'Where is the rental located?',
    answer:
      'In the Orlando / Central Florida area, close to the major theme parks. The exact address is shared after booking.',
  },
  {
    question: 'How do I book?',
    answer:
      'Pick your dates on the availability calendar above and check out securely. You’ll receive a confirmation by email.',
  },
  {
    question: 'What’s included in the price?',
    answer:
      'The nightly rate plus a one-time cleaning fee, shown on the calendar before you check out. The home comes furnished with the amenities listed above.',
  },
  {
    question: 'Have a question before booking?',
    answer:
      'Use the question form on this page and Daiana will get back to you by email about dates, the property, or anything else.',
  },
];

function VacationRentals() {
  usePageMeta(
    'Orlando Vacation Rentals',
    'Check open dates for an Orlando vacation rental and book your stay with secure checkout, or send Daiana a question.',
  );
  const { status, submit } = useContactForm('Orlando Vacation Rental Question');
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero page-hero-vacation">
          <div className="page-hero-content">
            <p className="eyebrow">Vacation Rentals</p>
            <h1>Book your Orlando vacation stay.</h1>
            <p>
              Check the calendar for open dates in Orlando and Central Florida, then reserve with secure checkout.
              Prefer to ask first? Send Daiana a question and she’ll follow up by email.
            </p>
          </div>
          <div className="page-hero-visual vacation-hero-visual" aria-label="Sunny Orlando vacation rental visual" />
        </section>

        <section className="page-content" id="availability">
          <div className="split-section vacation-booking">
            <div className="page-intro">
              <p className="eyebrow">Availability</p>
              <h2>Available dates for the rental.</h2>
              <p>
                Open dates are available to book; grayed-out dates are already taken. Pick your check-in and
                check-out, see the total, and continue to secure checkout.
              </p>
            </div>
            <AvailabilityCalendar />
          </div>
        </section>

        <section className="page-content" id="amenities">
          <div className="page-intro">
            <p className="eyebrow">Amenities</p>
            <h2>What’s included in your stay.</h2>
            <p>A comfortable, fully furnished home base for your Orlando trip.</p>
          </div>
          <ul className="amenity-grid">
            {amenities.map((amenity) => (
              <li className="amenity-item" key={amenity}>{amenity}</li>
           ))}
          </ul>
        </section>

        <section className="page-content" id="interest-list">
          <div className="split-section vacation-interest-section">
            <div className="page-intro">
              <p className="eyebrow">Questions?</p>
              <h2>Have a question about the rental?</h2>
              <p>
                Ask anything about open dates, the property, or booking, and Daiana will get back to you by email.
              </p>
            </div>
            <form className="info-panel form-shell" onSubmit={submit}>
              <input className="hp-field" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="input-group"><label htmlFor="rental-name">Name</label><input id="rental-name" name="name" required /></div>
              <div className="input-group"><label htmlFor="rental-email">Email</label><input id="rental-email" name="email" type="email" required /></div>
              <div className="input-group"><label htmlFor="rental-question">Your Question</label><textarea id="rental-question" name="question" required /></div>
              <button className="button button-primary" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send Question'}
              </button>
              <FormStatus status={status} />
            </form>
          </div>

          <section className="vacation-photo-section" id="rental-photos">
            <div className="page-intro">
              <p className="eyebrow">Photo Gallery</p>
              <h2>Photos coming soon.</h2>
              <p>
                These slots are ready for the rental photos once they are available.
              </p>
            </div>
            <div className="vacation-photo-grid">
              {photoSlots.map((slot) => (
                <div className="vacation-photo-card" key={slot}>
                  <span>Photo slot</span>
                  <strong>{slot}</strong>
                </div>
              ))}
            </div>
          </section>

          <Faq eyebrow="Orlando questions" heading="Vacation rental, answered." items={orlandoFaqs} />

          <section className="vacation-legal-alert" aria-label="Vacation rental legal notice">
            Orlando vacation rental accommodations are offered independently through Iris &amp; J Holdings and are
            not provided through All Star Real Estate Agency. Vacation rental accommodations do not constitute real
            estate brokerage services.
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default VacationRentals;
