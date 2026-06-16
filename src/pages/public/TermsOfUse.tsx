import PublicLayout from '../../components/layout/PublicLayout';

function TermsOfUse() {
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
              Real estate services are provided through All Star Real Estate Agency. Iris & J Holdings is a separate
              business brand and is not a real estate brokerage.
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
            <h2>Vacation rentals</h2>
            <p>
              Orlando vacation rental services are offered independently through Iris & J Holdings and are not
              provided through All Star Real Estate Agency.
            </p>
          </article>
        </section>
      </main>
    </PublicLayout>
  );
}

export default TermsOfUse;
