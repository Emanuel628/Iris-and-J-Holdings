import PublicLayout from '../../components/layout/PublicLayout';
import { vacationHouseRules, vacationHouseRulesIntro } from '../../content/vacationHouseRules';
import { usePageMeta } from '../../lib/usePageMeta';

function HouseRules() {
  usePageMeta(
    'Vacation Rental House Rules',
    'House rules for Orlando vacation rental bookings through Iris & J Holdings, including occupancy, noise, parking, damage, and guest list requirements.',
  );

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Vacation Rentals</p>
            <h1>House rules for the Orlando stay.</h1>
            <p>{vacationHouseRulesIntro}</p>
            <div className="notice-box">
              Guests must review these rules together with the <a href="/terms">Terms &amp; Conditions</a> and the{' '}
              <a href="/refund-cancellation-policy#vacation-rentals">Vacation Rental Refund &amp; Cancellation Policy</a>{' '}
              before checkout.
            </div>
          </div>
          <div className="page-hero-visual vacation-hero-visual" aria-hidden="true" />
        </section>

        <section className="page-content">
          <div className="legal-copy">
            <article>
              <h2>Guest expectations</h2>
              <ul className="detail-list">
                {vacationHouseRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

export default HouseRules;
