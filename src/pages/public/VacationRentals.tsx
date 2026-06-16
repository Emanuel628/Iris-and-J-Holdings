import PublicLayout from '../../components/layout/PublicLayout';
import { sendMailRequest } from '../../lib/emailRequests';

const photoSlots = [
  'Exterior photo',
  'Living room photo',
  'Kitchen photo',
  'Bedroom photo',
  'Outdoor space photo',
  'Area photo',
];

function VacationRentals() {
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Coming Soon</p>
            <h1>Orlando vacation rentals will have their own quiet corner.</h1>
            <p>
              A simple page for future Orlando stays, photos, property details, and interest requests.
            </p>
            <div className="page-actions">
              <a className="button button-primary" href="#interest-list">Join Interest List</a>
              <a className="text-link" href="#rental-photos">View Photo Slots</a>
            </div>
          </div>
          <div className="page-hero-visual vacation-hero-visual" aria-label="Vacation rental visual placeholder" />
        </section>

        <section className="page-content" id="interest-list">
          <div className="split-section">
            <div className="page-intro">
              <p className="eyebrow">Central Florida</p>
              <h2>A coming soon page for Orlando.</h2>
              <p>
                This page will later include real photos, stay details, availability, and an interest list.
              </p>
            </div>
            <form className="info-panel form-shell" onSubmit={(event) => sendMailRequest(event, 'Orlando Vacation Rental Interest Request')}>
              <div className="input-group"><label htmlFor="rental-name">Name</label><input id="rental-name" name="name" required /></div>
              <div className="input-group"><label htmlFor="rental-email">Email</label><input id="rental-email" name="email" type="email" required /></div>
              <div className="input-group"><label htmlFor="rental-notes">Travel Notes</label><textarea id="rental-notes" name="travelNotes" /></div>
              <button className="button button-primary" type="submit">Join Interest List</button>
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

          <section className="notice-box">
            Orlando vacation rental services are offered independently through Iris & J Holdings and are not
            provided through All Star Real Estate Agency.
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default VacationRentals;
