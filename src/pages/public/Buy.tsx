import PublicLayout from '../../components/layout/PublicLayout';
import { buildMailto } from '../../lib/emailRequests';

function Buy() {
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Buyer Guidance</p>
            <h1>Buying a home starts with a clear plan.</h1>
            <p>
              Whether this is your first home or your next move, Daiana helps you understand your budget,
              narrow your search, prepare with confidence, and know what to expect before closing.
            </p>
            <div className="page-actions">
              <a className="button button-primary" href="/book?service=Buyer%20Consultation#contact-form">Schedule Buyer Consultation</a>
              <a className="text-link" href={buildMailto('Buyer Guide Request', 'I would like to request the buyer guide.\n\nName:\nPhone:\nQuestions:')}>Request Buyer Guide</a>
            </div>
          </div>
          <div className="page-hero-visual" aria-label="Buyer consultation visual placeholder" />
        </section>

        <section className="page-content">
          <div className="page-intro">
            <p className="eyebrow">What to expect</p>
            <h2>Guidance before the search gets overwhelming.</h2>
            <p>
              Buying should not feel like guessing. Start with the basics, understand what matters most,
              and move through the process with a clear sense of what comes next.
            </p>
          </div>

          <div className="content-grid">
            <article className="content-card">
              <h3>Prepare</h3>
              <p>Review budget, timing, locations, pre-approval needs, and the kind of home that actually fits.</p>
            </article>
            <article className="content-card">
              <h3>Search</h3>
              <p>Focus the home search around your goals instead of chasing every listing that appears online.</p>
            </article>
            <article className="content-card">
              <h3>Move forward</h3>
              <p>Understand offers, negotiations, inspections, attorney review, and the closing timeline.</p>
            </article>
          </div>

          <section className="split-section">
            <div className="info-panel">
              <h2>Buyer consultation topics</h2>
              <ul className="detail-list">
                <li>Budget and location review</li>
                <li>Pre-approval guidance</li>
                <li>Home search strategy</li>
                <li>Offer preparation support</li>
                <li>Inspection and closing guidance</li>
              </ul>
            </div>
            <div className="quiet-band">
              <p className="eyebrow">Next step</p>
              <h2>Start with a conversation.</h2>
              <p>
                You do not need to have everything figured out. Bring your questions, timing, and concerns.
                Daiana will help you understand where to begin.
              </p>
              <div className="page-actions">
                <a className="button button-primary" href="/book?service=Buyer%20Consultation#contact-form">Schedule Buyer Consultation</a>
              </div>
            </div>
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default Buy;
