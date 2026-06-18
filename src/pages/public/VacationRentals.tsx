import PublicLayout from '../../components/layout/PublicLayout';
import AvailabilityCalendar from '../../components/booking/AvailabilityCalendar';
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

          <section className="vacation-legal-alert" aria-label="Vacation rental legal notice">
            Orlando vacation rental services are offered independently through Iris &amp; J Holdings and are not
            provided through NEIXA LLC (All Star Real Estate Agency).
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default VacationRentals;
