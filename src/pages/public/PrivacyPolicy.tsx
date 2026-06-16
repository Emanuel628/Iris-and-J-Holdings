function PrivacyPolicy() {
  return (
    <main className="page-main">
      <section className="page-hero">
        <div className="page-hero-content">
          <p className="eyebrow">Privacy Policy</p>
          <h1>How submitted information is handled.</h1>
          <p>
            This page explains the basic privacy rules for website forms, appointment requests, resource requests,
            and contact messages.
          </p>
        </div>
        <div className="page-hero-visual" aria-label="Privacy policy visual placeholder" />
      </section>

      <section className="page-content">
        <div className="content-grid">
          <article className="content-card"><h3>What is collected</h3><p>Visitor details submitted through website forms.</p></article>
          <article className="content-card"><h3>How it is used</h3><p>Information is used to respond to the visitor’s request.</p></article>
          <article className="content-card"><h3>Not sold</h3><p>Submitted information is not sold.</p></article>
        </div>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
