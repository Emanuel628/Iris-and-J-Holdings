function TrustSection() {
  return (
    <section className="trust-section" id="about" aria-labelledby="trust-heading">
      <div className="portrait-panel" aria-label="Portrait area for Daiana Castro">
        <div className="portrait-placeholder">
          <span>Daiana</span>
        </div>
      </div>

      <div className="trust-copy">
        <p className="eyebrow">A calm, organized approach</p>
        <h2 id="trust-heading">Clear guidance. Thoughtful planning. Steady communication.</h2>
        <span className="gold-line" aria-hidden="true" />
        <p>
          From the first conversation, you’ll know what comes next and why it matters.
          My goal is to make the process feel less stressful — and a lot more manageable.
        </p>
        <a className="button button-secondary" href="/about">Meet Daiana</a>
      </div>
    </section>
  );
}

export default TrustSection;
