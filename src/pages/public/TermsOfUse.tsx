function TermsOfUse() {
  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="page-hero-content">
          <p className="eyebrow">Terms of Use</p>
          <h1>General website terms and important disclosures.</h1>
          <p>
            This page keeps the legal and brokerage language organized instead of crowding the homepage.
          </p>
        </div>
        <div className="page-hero-visual" aria-label="Terms of use visual placeholder" />
      </section>

      <section className="page-content">
        <div className="content-grid">
          <article className="content-card"><h3>Informational Use</h3><p>Website content is provided for general information only.</p></article>
          <article className="content-card"><h3>Client Relationship</h3><p>A client relationship is not created until confirmed in writing.</p></article>
          <article className="content-card"><h3>Professional Advice</h3><p>Visitors should consult the appropriate professional for legal, financial, tax, or appraisal guidance.</p></article>
        </div>
      </section>
    </main>
  );
}

export default TermsOfUse;
