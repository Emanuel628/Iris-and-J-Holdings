function TrustSection() {
  return (
    <section className="trust-section" id="about" aria-labelledby="trust-heading">
      <div className="portrait-panel" aria-label="Portrait area for Daiana Castro">
        <div className="portrait-placeholder">
          <span>Daiana</span>
        </div>
      </div>

      <div className="trust-copy">
        <p className="eyebrow">How I work</p>
        <h2 id="trust-heading">I’ll keep you in the loop, start to finish.</h2>
        <span className="gold-line" aria-hidden="true" />
        <p>
          From the first conversation, you’ll know what happens next and why. I explain each step in plain
          language, respond quickly, and help you weigh your options without pressure — for buyers, sellers,
          and notary clients across Union, Middlesex, and Essex County, New Jersey.
        </p>
        <a className="button button-secondary" href="/about">Meet Daiana</a>
      </div>
    </section>
  );
}

export default TrustSection;
