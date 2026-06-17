import PublicLayout from '../../components/layout/PublicLayout';
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
    'Orlando vacation rentals coming soon. Join the interest list for photos, stay details, and availability when they’re ready.',
  );
  const { status, submit } = useContactForm('Orlando Vacation Rental Interest Request');
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero page-hero-vacation">
          <div className="page-hero-content">
            <p className="eyebrow">Coming Soon</p>
            <h1>Orlando vacation rentals will have their own quiet corner.</h1>
            <p>
              Short-term vacation stays in Orlando and Central Florida are on the way. Join the interest list and
              you’ll be the first to see photos, nightly details, and availability.
            </p>
            <div className="page-actions">
              <a className="button button-primary" href="#interest-list">Join Interest List</a>
              <a className="text-link" href="#rental-photos">View Photo Slots</a>
            </div>
          </div>
          <div className="page-hero-visual vacation-hero-visual" aria-label="Sunny Orlando vacation rental visual" />
        </section>

        <section className="page-content" id="interest-list">
          <div className="split-section vacation-interest-section">
            <div className="page-intro">
              <p className="eyebrow">Central Florida</p>
              <h2>A coming soon page for Orlando.</h2>
              <p>
                Tell Daiana when you’re hoping to travel and what you’re looking for, and you’ll get an email as
                soon as photos, stay details, and booking are ready.
              </p>
            </div>
            <form className="info-panel form-shell" onSubmit={submit}>
              <input className="hp-field" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="input-group"><label htmlFor="rental-name">Name</label><input id="rental-name" name="name" required /></div>
              <div className="input-group"><label htmlFor="rental-email">Email</label><input id="rental-email" name="email" type="email" required /></div>
              <div className="input-group"><label htmlFor="rental-notes">Travel Notes</label><textarea id="rental-notes" name="travelNotes" /></div>
              <button className="button button-primary" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Join Interest List'}
              </button>
              <FormStatus status={status} />
            </form>
          </div>

          <section className="vacation-photo-section" id="rental-photos">
            <div className="page-intro">
              <p className="eyebrow">Photo Gallery</p>
              <h2>Photos will be uploaded here.</h2>
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
            provided through All Star Real Estate Agency.
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default VacationRentals;
