import PublicLayout from '../../components/layout/PublicLayout';
import { vacationHouseRules, vacationHouseRulesIntro } from '../../content/vacationHouseRules';
import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';
import { usePageMeta } from '../../lib/usePageMeta';

function HouseRules() {
  usePageMeta(
    'Vacation Rental House Rules',
    'House rules for Orlando vacation rental bookings through Iris & J Holdings, including occupancy, noise, parking, damage, and guest list requirements.',
  );
  const template = getSiteContentTemplate('house-rules');
  const { content, heroImageUrl } = usePublicSiteContent('house-rules', template?.defaults || {});

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">{content.heroEyebrow}</p>
            <h1>{content.heroTitle}</h1>
            <p>{content.heroDescription || vacationHouseRulesIntro}</p>
            <div className="notice-box">
              Guests must review these rules together with the <a href="/terms">Terms &amp; Conditions</a> and the{' '}
              <a href="/refund-cancellation-policy#vacation-rentals">Vacation Rental Refund &amp; Cancellation Policy</a>{' '}
              before checkout.
            </div>
          </div>
          <div className={`page-hero-visual ${heroImageUrl ? 'page-hero-image-frame' : 'vacation-hero-visual'}`} aria-hidden="true">
            {heroImageUrl ? <img src={heroImageUrl} alt="" /> : null}
          </div>
        </section>

        {content.bodyHtml ? (
          <section className="page-content legal-copy" dangerouslySetInnerHTML={{ __html: content.bodyHtml }} />
        ) : (
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
        )}
      </main>
    </PublicLayout>
  );
}

export default HouseRules;
