import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function TermsOfUse() {
  usePageMeta('Terms of Use', 'General website terms and real estate disclaimers for Iris & J Holdings.');
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Terms of Use</p>
            <h1>General website terms and important disclosures.</h1>
            <p>
              This page keeps the legal, brokerage, notary, and vacation rental language organized without crowding
              the homepage.
            </p>
          </div>
          <div className="page-hero-visual" aria-label="Terms of use visual placeholder" />
        </section>

        <section className="page-content legal-copy">
          <article>
            <h2>Informational use</h2>
            <p>
              Website content is provided for general informational purposes only and does not create a client
              relationship until confirmed in writing.
            </p>
          </article>
          <article>
            <h2>Real estate services</h2>
            <p>
              Real estate services are provided through NEIXA LLC, doing business as All Star Real Estate Agency,
              a licensed New Jersey real estate brokerage. Iris & J Holdings is a personal marketing brand of
              Daiana Castro and is not itself a licensed real estate brokerage.
            </p>
          </article>
          <article>
            <h2>Home value reviews</h2>
            <p>
              Home value reviews are estimates based on available market information and are not appraisals.
              Visitors should consult the appropriate professional for legal, financial, tax, or appraisal guidance.
            </p>
          </article>
          <article>
            <h2>Mobile notary services</h2>
            <p>
              A notary public verifies identity and witnesses signatures; a notary does not provide legal advice
              or prepare documents. Every signer must be present with valid, unexpired photo identification.
              Travel or booking fees are confirmed before the appointment, and notary fees follow the maximums
              set by New Jersey law.
            </p>
          </article>
          <article>
            <h2>Vacation rentals</h2>
            <p>
              Orlando vacation rental services are offered independently through Iris & J Holdings and are not
              provided through NEIXA LLC (All Star Real Estate Agency).
            </p>
          </article>
        </section>
      </main>
    </PublicLayout>
  );
}

export default TermsOfUse;
